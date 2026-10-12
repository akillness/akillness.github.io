import crypto from 'node:crypto';

// Pinned to the owner's recorded 2026-10-12 approval, not a mutable count alone.
export const APPROVED_RESTORATION_ID = '2026-10-12';
export const APPROVED_RESTORATION_REVISION = '635addccb53a4a08274d5225759377956dcea653';
export const APPROVED_RESTORATION_PATHS_SHA256 = 'dc026d0a35c2b5c56937ef9269d443516fb2c3eaaaebf63f0c24a5c0c9caafdb';
export const PROTECTED_NOINDEX_SOURCES = [
  '_posts/2017/02/2017-02-20-family-life-blog-roundup.md',
  '_posts/2024/03/2024-03-31-serach-utility.md',
  '_posts/2024/04/2024-04-17-study-vae.md',
  '_posts/2024/05/2024-05-15-googleio-review.md',
  '_posts/2024/07/2024-07-12-llama-cpp-ggml-simple-matmul.md'
];

export function validateArchiveRestoration(record) {
  const errors = [];
  const require = (condition, message) => { if (!condition) errors.push('archive restoration: ' + message); };
  require(record?.schema_version === 1, 'unsupported schema');
  require(record?.restoration_id === APPROVED_RESTORATION_ID, 'unapproved restoration ID');
  require(record?.source_revision === APPROVED_RESTORATION_REVISION, 'source revision does not match the approved baseline');
  require(record?.owner_approved === true, 'recorded owner approval is missing');
  require(record?.original_publication_dates_preserved === true, 'original publication date policy is missing');
  const paths = Array.isArray(record?.restored_posts) ? record.restored_posts : [];
  const safePaths = paths.every(p => typeof p === 'string' && p.startsWith('_posts/') && p.endsWith('.md') && !p.includes('..') && !p.includes('\\'));
  require(paths.length === 283 && new Set(paths).size === 283 && safePaths, 'expected the exact 283 distinct post paths');
  const digest = safePaths ? crypto.createHash('sha256').update(JSON.stringify([...paths].sort())).digest('hex') : '';
  require(digest === APPROVED_RESTORATION_PATHS_SHA256, 'post paths do not match the independently pinned approved set');
  const protectedPaths = record?.protected_noindex_sources;
  require(Array.isArray(protectedPaths) && JSON.stringify([...protectedPaths].sort()) === JSON.stringify([...PROTECTED_NOINDEX_SOURCES].sort()), 'the original five protected sources changed');
  require(!paths.some(p => PROTECTED_NOINDEX_SOURCES.includes(p)), 'a protected source cannot join the restoration cohort');
  return { errors, restoredSources: new Set(errors.length ? [] : paths) };
}
