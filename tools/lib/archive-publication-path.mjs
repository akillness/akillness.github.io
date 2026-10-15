import fs from 'node:fs';
import path from 'node:path';
import { isDeepStrictEqual } from 'node:util';
import { APPROVED_RESTORATION_ID, validateArchiveRestoration } from './archive-restoration-policy.mjs';
import { validateArchiveDevelopment, graduatedFrontMatterErrors } from './archive-development-policy.mjs';
import { parsePostFrontMatter } from './public-post-cohort.mjs';
import { pathHasNoSymlinks } from './source-image-manifest.mjs';

export const ARCHIVE_LEDGER_PATH = '_data/archive_development.json';

// Missing publication targets are allowed; every existing ancestor must be real.
export function publicationPathErrors(target, { allowMissing = false } = {}) {
  let existing = path.resolve(target);
  if (allowMissing) {
    while (true) {
      try { fs.lstatSync(existing); break; }
      catch (error) {
        if (error.code !== 'ENOENT' || path.dirname(existing) === existing) break;
        existing = path.dirname(existing);
      }
    }
  }
  return pathHasNoSymlinks(existing) ? [] : [`Forbidden symlink or inaccessible publication path: ${target}`];
}

export function resolvePublicationPost({ repoRoot, draftRoot, draftPath, manifest }) {
  const errors = [];
  const postPath = path.relative(draftRoot, draftPath).split(path.sep).join('/');
  const basename = path.basename(draftPath);
  const stem = path.basename(draftPath, '.md');
  const result = { errors, postPath, stem, archive: null };
  const declared = manifest?.article_path;
  const safe = typeof declared === 'string' && !declared.includes('\\') && !declared.includes('\0')
    && declared.startsWith('_posts/') && path.posix.normalize(declared) === declared
    && declared.split('/').every((part) => part && part !== '.' && part !== '..');
  if (!safe || declared !== postPath) errors.push(`Manifest article_path does not match the canonical draft path: ${declared}`);
  if (!/^\d{4}-\d{2}-\d{2}-[a-z0-9][a-z0-9-]*$/.test(stem)) errors.push(`Unsafe article filename: ${basename}`);
  errors.push(...publicationPathErrors(draftPath));
  errors.push(...publicationPathErrors(path.join(repoRoot, postPath), { allowMissing: true }));
  errors.push(...publicationPathErrors(path.join(repoRoot, 'assets/img/posts', stem), { allowMissing: true }));
  if (errors.length || postPath === `_posts/${basename}`) return result;

  const restorationPath = path.join(repoRoot, '_data/archive_restoration.json');
  const ledgerPath = path.join(repoRoot, ARCHIVE_LEDGER_PATH);
  errors.push(...publicationPathErrors(restorationPath), ...publicationPathErrors(ledgerPath));
  if (errors.length) return result;
  try {
    const restoration = validateArchiveRestoration(JSON.parse(fs.readFileSync(restorationPath, 'utf8')));
    errors.push(...restoration.errors);
    const ledger = JSON.parse(fs.readFileSync(ledgerPath, 'utf8'));
    if (ledger.source_restoration_id !== APPROVED_RESTORATION_ID) errors.push('Archive ledger source_restoration_id does not match the approved restoration');
    const development = validateArchiveDevelopment(ledger, restoration.restoredSources);
    errors.push(...development.errors);
    const entry = development.entriesByPath.get(postPath);
    if (!entry || !restoration.restoredSources.has(postPath)) errors.push(`Nested publication path is not an approved archive ledger entry: ${postPath}`);
    if (entry && !['pending', 'in_progress', 'graduated'].includes(entry.status)) errors.push(`Archive entry is not eligible for graduation: ${postPath}`);
    if (entry && (entry.original_date !== manifest?.target_date || entry.original_date !== basename.slice(0, 10))) errors.push(`Archive original date does not match the selected package: ${postPath}`);
    if (!errors.length) result.archive = { ledger, entry, restoredSources: restoration.restoredSources };
  } catch (error) {
    errors.push(`Cannot bind nested publication to the archive ledger: ${error.message}`);
  }
  return result;
}

// The staged ledger may settle this one source, never alter the rest of the cohort.
export function archiveGraduationErrors({ before, after, postPath, article, restoredSources }) {
  const errors = [...validateArchiveDevelopment(before, restoredSources).errors, ...validateArchiveDevelopment(after, restoredSources).errors];
  if (before?.source_restoration_id !== APPROVED_RESTORATION_ID || after?.source_restoration_id !== APPROVED_RESTORATION_ID) errors.push('Staged archive ledger restoration identity changed');
  if (errors.length) return errors;
  const previous = before.posts.find((entry) => entry.path === postPath);
  const selected = after.posts.find((entry) => entry.path === postPath);
  if (!previous || !['pending', 'in_progress'].includes(previous.status) || selected?.status !== 'graduated') {
    errors.push(`Staged archive ledger must graduate only the selected pending/in_progress source: ${postPath}`);
    return errors;
  }
  const immutable = ({ status, developed_at, survey_note, ...fields }) => fields;
  if (!isDeepStrictEqual(immutable(previous), immutable(selected))) errors.push('Staged archive ledger changed immutable selected-entry metadata');
  const expected = { ...before, posts: before.posts.map((entry) => entry.path === postPath ? selected : entry) };
  if (!isDeepStrictEqual(expected, after)) errors.push('Staged archive ledger changed an unrelated entry or program metadata');
  const { fields, error } = parsePostFrontMatter(article);
  if (error) errors.push(`Staged archive article has invalid front matter: ${error}`);
  errors.push(...graduatedFrontMatterErrors(fields, selected, postPath));
  if (fields.ads === 'false' || fields.sitemap === 'false') errors.push('Staged graduated archive article must not retain non-commercial/no-sitemap flags');
  return errors;
}
