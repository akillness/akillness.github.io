import fs from 'node:fs/promises';
import path from 'node:path';

const POST_EXTENSIONS = new Set(['.md', '.markdown']);

function scalar(value) {
  const text = String(value ?? '').trim();
  if ((text.startsWith('"') && text.endsWith('"')) || (text.startsWith("'") && text.endsWith("'"))) {
    const inner = text.slice(1, -1);
    return text[0] === '"' ? inner.replace(/\\(["\\])/g, '$1') : inner.replace(/''/g, "'");
  }
  const comment = text.match(/^(.*?)(?:\s+#.*)?$/);
  return comment ? comment[1].trim() : text;
}

export function parsePostFrontMatter(source) {
  const text = String(source ?? '').replace(/^\uFEFF/, '');
  const match = text.match(/^---\s*\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) return { fields: {}, error: 'missing YAML front matter' };
  const fields = {};
  for (const line of match[1].split(/\r?\n/)) {
    if (!line.trim() || /^\s*#/.test(line)) continue;
    const entry = line.match(/^([A-Za-z_][\w-]*):\s*(.*?)\s*$/);
    if (!entry) continue;
    fields[entry[1]] = scalar(entry[2]);
  }
  return { fields, error: null };
}

function parseBoolean(value, fallback = false) {
  if (value === true || /^(true|yes|1)$/i.test(String(value ?? ''))) return true;
  if (value === false || /^(false|no|0)$/i.test(String(value ?? ''))) return false;
  return fallback;
}

function markerPresent(value) {
  const marker = String(value ?? '').trim();
  return marker !== '' && !/^(false|no|0)$/i.test(marker);
}

function parsePostDate(value, sourcePath) {
  const raw = String(value ?? '').trim();
  const filenameDate = path.posix.basename(sourcePath).match(/^(\d{4}-\d{2}-\d{2})-/)?.[1];
  const dateText = raw || filenameDate;
  if (!dateText) return { date: null, error: `cannot derive date from ${sourcePath}` };
  let normalized = dateText;
  if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) normalized += 'T00:00:00+09:00';
  else {
    normalized = normalized
      .replace(/^(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2}(?::\d{2})?)/, '$1T$2')
      .replace(/\s+([+-]\d{2})(\d{2})$/, '$1:$2');
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2})?$/.test(normalized)) normalized += '+09:00';
  }
  const epoch = Date.parse(normalized);
  if (!Number.isFinite(epoch)) return { date: null, error: `invalid date '${dateText}' in ${sourcePath}` };
  return { date: new Date(epoch), error: null };
}

async function collectPostFiles(directory, relative = '') {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const relativePath = relative ? `${relative}/${entry.name}` : entry.name;
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await collectPostFiles(absolutePath, relativePath));
    else if (entry.isFile() && POST_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) files.push(relativePath);
  }
  return files.sort();
}

export async function enumeratePostSources({ root, now = new Date() }) {
  const postsRoot = path.join(root, '_posts');
  const sourceFiles = await collectPostFiles(postsRoot);
  const rows = [];
  const errors = [];
  const nowEpoch = new Date(now).getTime();
  for (const relative of sourceFiles) {
    const sourcePath = `_posts/${relative}`;
    const fullPath = path.join(postsRoot, relative);
    const { fields, error } = parsePostFrontMatter(await fs.readFile(fullPath, 'utf8'));
    if (error) errors.push(`${sourcePath}: ${error}`);
    const { date, error: dateError } = parsePostDate(fields.date, sourcePath);
    if (dateError) errors.push(dateError);
    const published = parseBoolean(fields.published, true);
    const isFuture = Boolean(date && date.getTime() > nowEpoch);
    const robots = String(fields.robots ?? '').toLowerCase();
    rows.push({
      path: sourcePath,
      title: fields.title ?? '',
      published,
      future: isFuture,
      date: date?.toISOString() ?? null,
      noindex: /(?:^|[\s,])noindex(?:$|[\s,])/i.test(robots),
      hidden: parseBoolean(fields.hidden, false),
      restored_archive: markerPresent(fields.restored_archive),
      restored_archive_id: markerPresent(fields.restored_archive) ? fields.restored_archive : null
    });
  }
  return { sources: rows, errors };
}

const canonicalRoute = (route) => {
  if (typeof route !== 'string' || !route.startsWith('/') || route.includes('..') || /[?#]/.test(route)) return null;
  return route;
};
const routeSort = (set) => [...set].sort();

/** Compare two iterables as exact sets, while also rejecting duplicates. */
export function compareRouteSets(actual, expected, label = 'routes') {
  const errors = [];
  const actualList = [...(actual ?? [])];
  const expectedList = [...(expected ?? [])];
  const actualSet = new Set(actualList);
  const expectedSet = new Set(expectedList);
  const actualCounts = new Map();
  for (const route of actualList) actualCounts.set(route, (actualCounts.get(route) ?? 0) + 1);
  for (const [route, count] of actualCounts) if (count > 1) errors.push(`${label} contains duplicate route: ${route}`);
  for (const route of routeSort(expectedSet)) if (!actualSet.has(route)) errors.push(`${label} is missing expected route: ${route}`);
  for (const route of routeSort(actualSet)) if (!expectedSet.has(route)) errors.push(`${label} contains unexpected route: ${route}`);
  return { ok: errors.length === 0, errors, actual: routeSort(actualSet), expected: routeSort(expectedSet) };
}

/**
 * Validate source posts against a parsed built public-post-cohort manifest.
 * `manifest` must be the JSON object rendered by the Liquid template at
 * assets/js/data/public-post-cohort.json; routes are taken only from its map.
 */
export async function validatePublicPostCohort({ root, manifest, now = new Date() }) {
  const errors = [];
  const { sources, errors: sourceErrors } = await enumeratePostSources({ root, now });
  errors.push(...sourceErrors);
  if (!manifest || !Array.isArray(manifest.posts)) {
    errors.push('cohort manifest must contain a posts array');
    return { ok: false, errors, expectedPublishedRoutes: [], expectedVisibleRoutes: [], sourceCount: sources.length, manifestCount: 0 };
  }
  if (!manifest.built_at) errors.push('cohort manifest is missing built_at');

  const eligibleSources = sources.filter((source) => source.published && !source.future && source.date);
  const eligibleByPath = new Map(eligibleSources.map((source) => [source.path, source]));
  const entriesByPath = new Map();
  const routeCounts = new Map();
  for (const entry of manifest.posts) {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
      errors.push('cohort manifest contains a non-object post entry');
      continue;
    }
    const sourcePath = String(entry.path ?? '');
    entriesByPath.set(sourcePath, (entriesByPath.get(sourcePath) ?? 0) + 1);
    const route = canonicalRoute(entry.url);
    if (!route) errors.push(`manifest entry has an invalid route for source ${sourcePath}: ${String(entry.url)}`);
    else routeCounts.set(route, (routeCounts.get(route) ?? 0) + 1);
    const source = eligibleByPath.get(sourcePath);
    if (!source) {
      const reason = sources.find((item) => item.path === sourcePath);
      errors.push(reason ? `manifest contains unpublished or future source: ${sourcePath}` : `manifest contains an extra source path: ${sourcePath}`);
      continue;
    }
    if (typeof entry.noindex !== 'boolean') errors.push(`manifest noindex must be boolean for ${sourcePath}`);
    else if (entry.noindex !== source.noindex) errors.push(`noindex mismatch for ${sourcePath}: source=${source.noindex} manifest=${entry.noindex}`);
    if (typeof entry.hidden !== 'boolean') errors.push(`manifest hidden must be boolean for ${sourcePath}`);
    else {
      if (source.hidden && !entry.hidden) errors.push(`hidden mismatch for ${sourcePath}: source=true manifest=false`);
      if (entry.hidden && !source.noindex) errors.push(`hidden suppresses indexable published source: ${sourcePath}`);
    }
    if (typeof entry.restored_archive !== 'boolean') errors.push(`manifest restored_archive must be boolean for ${sourcePath}`);
    else if (entry.restored_archive !== source.restored_archive) errors.push(`restored_archive mismatch for ${sourcePath}: source=${source.restored_archive} manifest=${entry.restored_archive}`);
    if (!entry.title) errors.push(`manifest entry is missing title for ${sourcePath}`);
    else if (source.title && entry.title !== source.title) errors.push(`title mismatch for ${sourcePath}`);
    if (!entry.date) errors.push(`manifest entry is missing date for ${sourcePath}`);
    else if (!Number.isFinite(Date.parse(entry.date)) || Date.parse(entry.date) !== Date.parse(source.date)) errors.push(`date mismatch for ${sourcePath}: source=${source.date} manifest=${entry.date}`);

  }
  for (const source of eligibleSources) {
    const count = entriesByPath.get(source.path) ?? 0;
    if (count === 0) errors.push(`published source is missing from manifest: ${source.path}`);
    else if (count > 1) errors.push(`published source occurs ${count} times in manifest: ${source.path}`);
  }
  for (const [route, count] of routeCounts) if (count > 1) errors.push(`manifest contains duplicate route ${route} (${count} entries)`);

  const matchedEntries = manifest.posts.filter((entry) => eligibleByPath.has(String(entry?.path ?? '')));
  const expectedPublishedRoutes = routeSort(new Set(matchedEntries.map((entry) => canonicalRoute(entry.url)).filter(Boolean)));
  const expectedVisibleRoutes = routeSort(new Set(matchedEntries
    .filter((entry) => !Boolean(entry.noindex) && !Boolean(entry.hidden))
    .map((entry) => canonicalRoute(entry.url)).filter(Boolean)));
  // Jekyll's site.posts order is newest first; the Atom feed is intentionally
  // a recent-five surface, not a full-corpus discovery index.
  const expectedFeedRoutes = matchedEntries
    .filter((entry) => !Boolean(entry.noindex) && !Boolean(entry.hidden))
    .slice(0, 5)
    .map((entry) => canonicalRoute(entry.url)).filter(Boolean);
  const sourceByPath = new Map(eligibleSources.map((source) => [source.path, source]));
  const routeToSource = Object.fromEntries(matchedEntries
    .map((entry) => [canonicalRoute(entry.url), sourceByPath.get(String(entry.path))])
    .filter(([route, source]) => route && source)
    .map(([route, source]) => [route, {
      path: source.path,
      title: source.title,
      date: source.date,
      noindex: source.noindex,
      hidden: Boolean(manifest.posts.find((entry) => entry.path === source.path)?.hidden),
      restored_archive: source.restored_archive,
      restored_archive_id: source.restored_archive_id
    }]));
  return {
    ok: errors.length === 0,
    errors,
    expectedPublishedRoutes,
    expectedVisibleRoutes,
    expectedFeedRoutes,
    routeToSource,
    sourceCount: sources.length,
    eligibleSourceCount: eligibleSources.length,
    manifestCount: manifest.posts.length
  };
}
