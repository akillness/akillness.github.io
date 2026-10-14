#!/usr/bin/env node
// Per-post contract for a developed (graduated) archive article.
//
//   node tools/validate-archive-development.mjs _posts/2024/06/2024-06-01-slug.md [...]
//
// Checks the editorial standard the whole site now advertises (CLAUDE.md,
// "Low-value-content standard"): a real question, a finding the source does
// not state itself, plain finding-specific headings, pinned primary sources,
// an original explanatory visual, internal links, enough original English
// prose to be indexable and ad-eligible, and the archive-development front
// matter that ties the file to the ledger. It is deterministic; the survey
// and research judgement stays with the author and the ledger survey_note.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parsePostFrontMatter } from './lib/public-post-cohort.mjs';
import { validateArchiveRestoration } from './lib/archive-restoration-policy.mjs';
import { validateArchiveDevelopment, ARCHIVE_DEVELOPMENT_START_DATE } from './lib/archive-development-policy.mjs';

const repoRoot = fileURLToPath(new URL('../', import.meta.url));
const args = process.argv.slice(2).filter((arg) => !arg.startsWith('--'));
const strictLedger = !process.argv.includes('--pre-ledger');
if (!args.length) {
  console.error('usage: node tools/validate-archive-development.mjs <_posts/...md> [...] [--pre-ledger]');
  process.exit(2);
}

const config = fs.readFileSync(path.join(repoRoot, '_config.yml'), 'utf8');
const minimumWords = Number(config.match(/^google_index_min_post_words:\s*(\d+)/m)?.[1] || 800);
const policy = fs.readFileSync(path.join(repoRoot, '.claude', 'editorial-policy.yml'), 'utf8');
const policyList = (key) => {
  const block = policy.match(new RegExp(`^${key}:\\s*\\n((?:\\s+-\\s*[^\\n]+\\n?)*)`, 'm'))?.[1] || '';
  return block.split('\n').map((line) => line.match(/^\s+-\s*(?:"([^"]*)"|'([^']*)'|(.+))$/)).filter(Boolean).map((m) => (m[1] ?? m[2] ?? m[3]).trim());
};
const categoryAllowlist = policyList('category_allowlist');
const restoration = JSON.parse(fs.readFileSync(path.join(repoRoot, '_data', 'archive_restoration.json'), 'utf8'));
const restoredSources = validateArchiveRestoration(restoration).restoredSources;
const ledger = JSON.parse(fs.readFileSync(path.join(repoRoot, '_data', 'archive_development.json'), 'utf8'));
const development = validateArchiveDevelopment(ledger, restoredSources);

const existingPostRoutes = new Set();
const walk = (dir) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name.endsWith('.md')) {
      const stem = entry.name.replace(/^\d{4}-\d{2}-\d{2}-/, '').replace(/\.md$/, '');
      existingPostRoutes.add(`/posts/${stem}/`);
    }
  }
};
walk(path.join(repoRoot, '_posts'));

let failed = false;
for (const arg of args) {
  const relative = path.relative(repoRoot, path.resolve(repoRoot, arg)).split(path.sep).join('/');
  const failures = [];
  const pass = (condition, message) => { if (!condition) failures.push(message); };
  const text = fs.readFileSync(path.join(repoRoot, relative), 'utf8');
  const { fields, error } = parsePostFrontMatter(text);
  pass(!error, `front matter: ${error}`);
  const body = text.replace(/^---\s*\r?\n[\s\S]*?\r?\n---\s*\r?\n?/, '');
  const visible = body.replace(/```[\s\S]*?```/g, ' ').replace(/<!--[\s\S]*?-->/g, ' ');
  const plain = visible.replace(/<svg[\s\S]*?<\/svg>/gi, ' ').replace(/<[^>]+>/g, ' ');
  const entry = development.entriesByPath.get(relative);

  pass(restoredSources.has(relative), 'file is not part of the approved restoration set');
  pass(Boolean(entry), 'file has no ledger entry');
  pass(development.errors.length === 0, `ledger invalid: ${development.errors[0] || ''}`);
  if (strictLedger && entry) pass(entry.status === 'graduated', `ledger status must be graduated (found ${entry.status})`);

  // Front matter contract
  pass(!fields.restored_archive, 'restored_archive marker must be removed from a developed post');
  pass(/^\d{4}-\d{2}-\d{2}$/.test(String(fields.archive_developed || '')) && String(fields.archive_developed) >= ARCHIVE_DEVELOPMENT_START_DATE, 'archive_developed must be a YYYY-MM-DD date on or after 2026-10-14');
  if (entry) {
    pass(String(fields.date || '').slice(0, 10) === entry.original_date, `date must preserve the original publication date ${entry.original_date}`);
    if (strictLedger) pass(String(fields.archive_developed) === entry.developed_at, `archive_developed must equal ledger developed_at (${entry.developed_at})`);
  }
  pass(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2} \+0900$/.test(String(fields.last_modified_at || '')) && String(fields.last_modified_at).slice(0, 10) >= ARCHIVE_DEVELOPMENT_START_DATE, 'last_modified_at must be a +0900 timestamp on or after 2026-10-14');
  pass(typeof fields.archive_development_note === 'string' && fields.archive_development_note.trim().length >= 80, 'archive_development_note (visible survey summary) needs at least 80 characters');
  pass(!/noindex/i.test(String(fields.robots || '')), 'developed post must be indexable');
  pass(fields.sitemap !== 'false', 'developed post must stay in the sitemap');
  pass(fields.ads !== 'false', 'developed post should not keep ads: false; the word-count boundary decides advertising');
  pass(fields.published !== 'false', 'developed post must be published');
  pass(typeof fields.title === 'string' && fields.title.length >= 20 && fields.title.length <= 90, `title should be 20-90 characters (found ${String(fields.title || '').length})`);
  pass(!/[\p{Extended_Pictographic}]/u.test(String(fields.title || '')), 'title must not contain emoji');
  pass(!/^\s*(curiosity|retrieve|innovation)\s*:/i.test(String(fields.description || '')), 'description must not start with a stage label');
  pass(typeof fields.description === 'string' && fields.description.length >= 80 && fields.description.length <= 180, `description should be 80-180 characters (found ${String(fields.description || '').length})`);
  const categories = String(fields.categories || '').replace(/^\[|\]$/g, '').split(',').map((v) => v.trim().replace(/^["']|["']$/g, '')).filter(Boolean).join(', ');
  pass(categoryAllowlist.includes(categories), `categories must be one policy axis (${categoryAllowlist.join(' | ')}): ${categories}`);
  const tags = String(fields.tags || '').replace(/^\[|\]$/g, '').split(',').map((v) => v.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
  pass(tags.length >= 2 && tags.every((tag) => tag === tag.toLowerCase()), 'at least two lowercase tags are required');
  pass(!/^lang:\s*ko/m.test(text.split(/^---\s*$/m)[1] || ''), 'developed article is English; remove lang: ko (a Korean edition belongs on the Korean channels)');

  // Body contract
  const englishWords = (plain.match(/\b[A-Za-z0-9][A-Za-z0-9'’-]*\b/g) || []).length;
  const hangul = (plain.match(/[가-힣]/g) || []).length;
  const latin = (plain.match(/[A-Za-z]/g) || []).length;
  pass(englishWords >= minimumWords, `developed article needs at least ${minimumWords} English words outside code (found ${englishWords})`);
  pass(hangul <= Math.max(20, latin * 0.01), `too much Hangul for an English article (${hangul} characters)`);
  pass(!/<details[^>]*>[\s\S]*Translate to Korean/i.test(body), 'remove the appended machine-translation block');
  pass(!/\*(Curiosity|Retrieve|Innovate|Innovation)\s*:\*/i.test(visible), 'remove inline stage labels (*Curiosity:* / *Retrieve:* / *Innovate:*)');
  pass(!/Curiosity\s*→\s*Retrieve\s*→\s*Innovation/i.test(visible), 'remove the stage-arc slogan from the body');
  pass(!/Created By/i.test(visible), 'remove third-party "Created By" attribution lines; cite the source in References instead');
  pass(!/^\s*>\s*\*\*Editorial method:\*\*/m.test(body), 'per-post Editorial method boilerplate is not allowed');

  const h2 = [...visible.matchAll(/^##\s+(.+?)\s*$/gm)].map((m) => m[1]);
  pass(h2.length >= 4, `at least four H2 sections are required (found ${h2.length})`);
  const templated = /^(?:[\p{Extended_Pictographic}\uFE0F\u200D]+\s*)|^(?:Curiosity|Retrieve|Innovation)\b\s*(?:[:：-]|$)/u;
  for (const heading of h2) pass(!templated.test(heading), `templated or emoji-led H2 heading: ${heading}`);
  const opening = h2[0] || '';
  pass(/\?\s*$/.test(opening) || opening.split(/\s+/).length >= 4, `opening H2 must state the question or finding: ${opening || '(missing)'}`);
  pass(h2.filter((h) => /^Key Takeaways$/i.test(h)).length === 1, 'exactly one "Key Takeaways" H2 is required');
  pass(h2.filter((h) => /^(?:New|Open) Questions\b/i.test(h)).length === 1, 'exactly one "New Questions"/"Open Questions" H2 is required');
  pass(h2.filter((h) => /^References$/i.test(h)).length === 1, 'exactly one "References" H2 is required');
  pass(h2.some((h) => /since|changed|now|20\d\d|revisit|still|today|later/i.test(h)), 'one H2 must carry the survey: what changed since the original note (e.g. "What changed since 2024")');
  pass(new Set(h2.map((h) => h.toLowerCase())).size === h2.length, 'duplicate H2 headings are not allowed');
  pass(!/^#\s/m.test(visible), 'do not use H1 in the body; the title is the H1');
  pass(/^\|.+\|\s*$/m.test(visible) || /<svg[\s>]/i.test(body) || /```mermaid/i.test(body), 'at least one original explanatory visual (Markdown table, inline SVG, or Mermaid) is required');

  const internalLinks = [...visible.matchAll(/\]\((\/posts\/[a-z0-9-]+\/)(?:#[^)]*)?\)/g)].map((m) => m[1]);
  const liveInternal = internalLinks.filter((route) => existingPostRoutes.has(route));
  pass(new Set(liveInternal).size >= 2, `at least two internal links to existing /posts/ articles are required (found ${new Set(liveInternal).size})`);
  for (const route of internalLinks) pass(existingPostRoutes.has(route), `internal link target does not exist: ${route}`);

  const referencesIndex = visible.search(/^##\s+References\s*$/m);
  const references = referencesIndex >= 0 ? visible.slice(referencesIndex) : '';
  const referenceUrls = [...references.matchAll(/https?:\/\/[^\s)\]>"']+/g)].map((m) => m[0]);
  pass(referenceUrls.length >= 3, `References needs at least three source URLs (found ${referenceUrls.length})`);
  const pinned = /arxiv\.org\/(?:abs|pdf|html)\/\d{4}\.\d{4,5}v\d+|\/(?:blob|tree|commit)\/[0-9a-f]{7,40}\b|\/releases\/tag\/|\bv\d+\.\d+(?:\.\d+)?\b|\b(?:accessed|retrieved|read on|as of) \d{4}-\d{2}-\d{2}\b/i;
  pass(pinned.test(references), 'References must pin at least one primary source (arXiv version, commit/tag, release version, or an "as of YYYY-MM-DD" read date)');
  pass(/\b2026-\d{2}-\d{2}\b/.test(references) || /\b(?:accessed|retrieved|read on|as of) (?:October|November|December) 2026\b/i.test(references), 'References must state when the sources were re-read (a 2026 date)');
  pass(!/\{% include embed\/youtube\.html/.test(body) || /^##\s+/m.test(body), 'embedded video may stay only as evidence inside a section');

  const status = failures.length ? 'FAIL' : 'PASS';
  console.log(`${status} ${relative} (${englishWords} words, ${h2.length} H2, ${new Set(liveInternal).size} internal links, ${referenceUrls.length} reference URLs)`);
  for (const failure of failures) console.log(`  - ${failure}`);
  if (failures.length) failed = true;
}
process.exit(failed ? 1 : 0);
