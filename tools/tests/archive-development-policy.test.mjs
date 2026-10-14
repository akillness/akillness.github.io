import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  ARCHIVE_DEVELOPMENT_PROGRAM_ID,
  ARCHIVE_DEVELOPMENT_STATUSES,
  validateArchiveDevelopment,
  graduatedFrontMatterErrors,
  retiredFrontMatterErrors
} from '../lib/archive-development-policy.mjs';
import { validateArchiveRestoration } from '../lib/archive-restoration-policy.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url));
const restoration = JSON.parse(fs.readFileSync(path.join(root, '_data', 'archive_restoration.json'), 'utf8'));
const restoredSources = validateArchiveRestoration(restoration).restoredSources;
const liveLedger = JSON.parse(fs.readFileSync(path.join(root, '_data', 'archive_development.json'), 'utf8'));

const clone = (value) => JSON.parse(JSON.stringify(value));
const SURVEY = 'Re-read the arXiv v2 paper and the pinned repository README; the 2024 numbers were re-verified and the follow-up work since then is summarized.';

test('the committed ledger validates against the approved restoration set and covers every restored source', () => {
  const result = validateArchiveDevelopment(liveLedger, restoredSources);
  assert.deepEqual(result.errors, []);
  assert.equal(liveLedger.posts.length, restoredSources.size);
  assert.equal(liveLedger.program_id, ARCHIVE_DEVELOPMENT_PROGRAM_ID);
  for (const entry of liveLedger.posts) assert.ok(ARCHIVE_DEVELOPMENT_STATUSES.includes(entry.status), entry.path);
});

test('graduated entries need a dated rebuild and a survey note; valid ones are exported', () => {
  const ledger = clone(liveLedger);
  const entry = ledger.posts[0];
  entry.status = 'graduated';
  // The live entry may already be developed; construct missing-field cases explicitly.
  entry.developed_at = null;
  entry.survey_note = null;
  assert.ok(validateArchiveDevelopment(ledger, restoredSources).errors.some((e) => e.includes('developed_at')));
  entry.developed_at = '2026-10-14';
  assert.ok(validateArchiveDevelopment(ledger, restoredSources).errors.some((e) => e.includes('survey_note')));
  entry.survey_note = SURVEY;
  const ok = validateArchiveDevelopment(ledger, restoredSources);
  assert.deepEqual(ok.errors, []);
  assert.ok(ok.graduatedSources.has(entry.path));
  entry.developed_at = '2026-10-13';
  assert.ok(validateArchiveDevelopment(ledger, restoredSources).errors.some((e) => e.includes('on or after 2026-10-14')));
});

test('the ledger cannot add, drop, or duplicate restored sources', () => {
  const dropped = clone(liveLedger);
  dropped.posts.pop();
  assert.ok(validateArchiveDevelopment(dropped, restoredSources).errors.some((e) => e.includes('cover every approved restored source')));
  const duplicated = clone(liveLedger);
  duplicated.posts[1] = clone(duplicated.posts[0]);
  const errors = validateArchiveDevelopment(duplicated, restoredSources).errors;
  assert.ok(errors.some((e) => e.includes('duplicate ledger entry')));
  const foreign = clone(liveLedger);
  foreign.posts[0].path = '_posts/2026-10-13-llm-inference-parallelism-layout.md';
  assert.ok(validateArchiveDevelopment(foreign, restoredSources).errors.some((e) => e.includes('not part of the approved')));
});

test('merged entries point at another post and retire the source', () => {
  const ledger = clone(liveLedger);
  const entry = ledger.posts[0];
  entry.status = 'merged';
  entry.developed_at = '2026-10-14';
  entry.survey_note = SURVEY;
  assert.ok(validateArchiveDevelopment(ledger, restoredSources).errors.some((e) => e.includes('merged_into')));
  entry.merged_into = ledger.posts[1].path;
  const ok = validateArchiveDevelopment(ledger, restoredSources);
  assert.deepEqual(ok.errors, []);
  assert.equal(ok.mergedSources.get(entry.path), ledger.posts[1].path);
});

test('graduated front matter drops the archive marker, keeps the original date, and records the rebuild', () => {
  const entry = { path: '_posts/2024/06/2024-06-01-example.md', original_date: '2024-06-01', developed_at: '2026-10-14' };
  const good = { date: '2024-06-01 12:00:00 +0800', last_modified_at: '2026-10-14 12:00:00 +0900', archive_developed: '2026-10-14', published: 'true' };
  assert.deepEqual(graduatedFrontMatterErrors(good, entry, entry.path), []);
  assert.ok(graduatedFrontMatterErrors({ ...good, restored_archive: '2026-10-12' }, entry, entry.path).some((e) => e.includes('restored_archive marker')));
  assert.ok(graduatedFrontMatterErrors({ ...good, archive_developed: '2026-10-15' }, entry, entry.path).some((e) => e.includes('archive_developed')));
  assert.ok(graduatedFrontMatterErrors({ ...good, date: '2026-10-14 12:00:00 +0900' }, entry, entry.path).some((e) => e.includes('original publication date')));
  assert.ok(graduatedFrontMatterErrors({ ...good, robots: 'noindex, follow' }, entry, entry.path).some((e) => e.includes('indexable')));
  assert.ok(graduatedFrontMatterErrors({ ...good, last_modified_at: undefined }, entry, entry.path).some((e) => e.includes('last_modified_at')));
});

test('retired front matter must carry the full noindex triple without the archive marker', () => {
  const good = { robots: 'noindex, follow', sitemap: 'false', ads: 'false' };
  assert.deepEqual(retiredFrontMatterErrors(good, 'x'), []);
  assert.ok(retiredFrontMatterErrors({ ...good, sitemap: 'true' }, 'x').some((e) => e.includes('sitemap')));
  assert.ok(retiredFrontMatterErrors({ ...good, restored_archive: '2026-10-12' }, 'x').some((e) => e.includes('marker')));
});
