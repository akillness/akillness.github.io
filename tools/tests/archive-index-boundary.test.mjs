import test from 'node:test';
import assert from 'node:assert/strict';
import { verifyIndexBoundary } from '../verify-site-quality.mjs';

const reference = { route: '/posts/reference/', words: 120, minimum: 800, eligibility: 'false', noindex: false };
test('unapproved short non-commercial post still requires noindex', () => {
  assert.equal(verifyIndexBoundary(reference).length, 2);
});
test('approved historical note can be searchable without advertising', () => {
  assert.deepEqual(verifyIndexBoundary({ ...reference, restored: true }), []);
});
test('restoration never allows advertising', () => {
  assert.match(verifyIndexBoundary({ ...reference, restored: true, eligibility: 'true' }).join(), /non-monetized/);
});
test('approved restoration must actually remove noindex', () => {
  assert.match(verifyIndexBoundary({ ...reference, restored: true, noindex: true }).join(), /still noindex/);
});
test('existing protected notes keep their original noindex boundary', () => {
  assert.deepEqual(verifyIndexBoundary({ ...reference, noindex: true }), []);
});
test('eligible new long-form posts retain the original rule', () => {
  assert.deepEqual(verifyIndexBoundary({ ...reference, words: 1400, eligibility: 'true' }), []);
});
