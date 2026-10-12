import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { validateArchiveRestoration } from '../lib/archive-restoration-policy.mjs';
const approved = JSON.parse(fs.readFileSync(new URL('../../_data/archive_restoration.json', import.meta.url), 'utf8'));
const altered = (change) => { const record = structuredClone(approved); change(record); return validateArchiveRestoration(record); };

test('the approved fixed historical cohort passes', () => {
  const result = validateArchiveRestoration(approved);
  assert.deepEqual(result.errors, []);
  assert.equal(result.restoredSources.size, 283);
});
test('reordering approved paths does not change their identity', () => {
  assert.deepEqual(altered(r => r.restored_posts.reverse()).errors, []);
});
test('swapping one path while retaining 283 entries fails closed', () => {
  const result = altered(r => { r.restored_posts[0] = '_posts/2024/03/2024-03-11-unapproved.md'; });
  assert.ok(result.errors.some(e => e.includes('pinned approved set')));
  assert.equal(result.restoredSources.size, 0);
});
test('a different source revision fails closed', () => {
  assert.ok(altered(r => { r.source_revision = '0'.repeat(40); }).errors.length);
});
test('changing the protected set fails closed', () => {
  assert.ok(altered(r => { r.protected_noindex_sources.pop(); }).errors.length);
});
test('absent approval, invalid identity and duplicate paths fail closed', () => {
  for (const change of [r => { r.owner_approved = false; }, r => { r.restoration_id = 'other'; }, r => { r.restored_posts[1] = r.restored_posts[0]; }]) {
    assert.ok(altered(change).errors.length);
  }
  assert.ok(validateArchiveRestoration(null).errors.length);
});
