import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ownerRevisionExceptionErrors } from '../lib/archive-development-policy.mjs';

const RUN_ID = '20261015-0042-archive-nemoclaw-manual';
const POST = '_posts/2026/03/2026-03-18-nemoclaw-safe-agents-guide.md';
const PROOF_PATH = 'review/owner-b1-revision-proof.json';
const APPROVAL_SHA = 'b23ee7b23e8d4c4783c8f457401b55dc6350e13313ac288680f59ad4956eb305';
const PRIOR_FIX_SHA = 'bd307513a3838ae2d464c08fdeb842bb28a4c6d7e3ff4dba3420e8e32fa3165f';
const DRAFT_BEFORE_SHA = '7b84c3e8c757eede9fa6032fe39a0a90bce675598546ce9079e644f9872cf574';
const CORRECTED_SHA = '3d49cb49aadc555f5d54e67600d2f8c2bb300e2ee476d97af32873878978c4c9';
const FINAL_SHA = '4'.repeat(64);
const FRESH_REVIEW_SHA = '39b07f0024f71a2f19aa4c55fe7f1e324df06aeeb2494bb70241838dd0e34ef2';
const PROTECTED_ARTIFACT_MANIFEST_SHA = 'dead63f181285ebd86cb671cbf2260fd4108c192ce26edc02a3305bab7731958';
const HISTORY_SHA = {
  'manifest.json': 'c73a82b57e3f5aeb6d12bcdcf85eeb80a1312be93ecf8ccbcf44227bf105fd4e',
  'editorial-review.json': PRIOR_FIX_SHA,
  'article.md': DRAFT_BEFORE_SHA,
  'run-summary.md': '71a713a0a5c110e0ce0ec15b7d884fab27919935f89e91e33eb814662849383b'
};

const clone = (value) => structuredClone(value);
const change = (value, mutate) => {
  const copy = clone(value);
  mutate(copy);
  return copy;
};

const validProof = () => ({
  run_id: RUN_ID,
  post: POST,
  approval_sha256: APPROVAL_SHA,
  prior_FIX_sha256: PRIOR_FIX_SHA,
  prior_regular_revision_loops: 2,
  additional_owner_approved_revision: 1,
  additional_owner_approved_revision_applied: 1,
  total_content_revisions_after_correction: 3,
  total_content_revisions: 3,
  history_sha256: clone(HISTORY_SHA),
  draft_before_sha256: DRAFT_BEFORE_SHA,
  expected_draft_after_B1_only_sha256: CORRECTED_SHA,
  actual_draft_after_sha256: CORRECTED_SHA,
  exact_B1_only_deletion_verified: true,
  protected_artifacts_unchanged: true,
  protected_artifact_manifest_sha256: PROTECTED_ARTIFACT_MANIFEST_SHA,
  approval_consumed_for_B1_only: true,
  other_gates_waived: false,
  global_policy_changed: false,
  publication_authorized_by_this_record: false,
  corrected_at: '2026-10-15T04:36:37.161441+00:00',
  independent_rereview_status: 'PASS',
  independent_rereview: {
    reviewer: 'native-independent-review',
    verdict: 'PASS',
    completed_at: '2026-10-15T04:42:00.000000+00:00',
    prior_review_sha256: PRIOR_FIX_SHA,
    corrected_draft_sha256: CORRECTED_SHA,
    review_sha256: FRESH_REVIEW_SHA
  }
});

const validManifest = (overrides = {}) => ({
  schema_version: 1,
  run_id: RUN_ID,
  article_path: POST,
  revision_loops: 3,
  owner_revision_exception_proof: PROOF_PATH,
  ...overrides
});

const validObserved = (stage, overrides = {}) => ({
  approval_sha256: APPROVAL_SHA,
  history_sha256: clone(HISTORY_SHA),
  historical_manifest: { run_id: RUN_ID, article_path: POST, revision_loops: 2 },
  derived_corrected_sha256: CORRECTED_SHA,
  derived_final_sha256: FINAL_SHA,
  b1_deletion_exact: true,
  marker_transition_exact: true,
  current_draft_sha256: stage === 'draft' ? CORRECTED_SHA : FINAL_SHA,
  review_sha256: FRESH_REVIEW_SHA,
  protected_artifact_manifest_sha256: PROTECTED_ARTIFACT_MANIFEST_SHA,
  review: { run_id: RUN_ID, reviewer: 'native-independent-review', verdict: 'PASS' },
  selected_ledger_status: stage === 'draft' ? 'in_progress' : 'graduated',
  ledger_transition_errors: stage === 'final' ? [] : undefined,
  current_source_sha256: stage === 'final' ? FINAL_SHA : undefined,
  ...overrides
});

const errorsFor = ({ manifest = validManifest(), stage = 'final', proof = validProof(), observed = validObserved(stage) } = {}) =>
  ownerRevisionExceptionErrors({ manifest, stage, proof, observed });

const assertRejected = (input, label) => {
  const errors = errorsFor(input);
  assert.ok(errors.length > 0, `${label}: expected at least one policy error`);
};

test('ordinary revision 2 remains accepted without an owner exception', () => {
  assert.deepEqual(errorsFor({
    manifest: { run_id: 'normal-run', article_path: POST, revision_loops: 2 },
    stage: 'draft',
    proof: null,
    observed: null
  }), []);
});

test('a proof reference cannot hide a third revision behind a manifest counter of 2', () => {
  assertRejected({ manifest: validManifest({ revision_loops: 2 }) }, 'hidden revision exception');
});

test('the pinned revision 3 cannot be reset to 2 by deleting its proof reference', () => {
  const manifest = validManifest({ revision_loops: 2 });
  delete manifest.owner_revision_exception_proof;
  assertRejected({ manifest, proof: null, observed: null }, 'pinned missing proof reference');
});

test('truthful revision 3 passes only for the pinned draft pre-marker run', () => {
  assert.deepEqual(errorsFor({ stage: 'draft', observed: validObserved('draft') }), []);
});

test('truthful revision 3 passes only for the pinned final two-marker derivative and graduated transition', () => {
  assert.deepEqual(errorsFor({ stage: 'final' }), []);
});

test('the owner exception is bound to the exact run, post, and proof reference', () => {
  for (const [label, mutate] of [
    ['alternate run', (manifest) => { manifest.run_id = '20261015-other-run'; }],
    ['alternate post', (manifest) => { manifest.article_path = '_posts/2026/03/other.md'; }],
    ['missing proof reference', (manifest) => { delete manifest.owner_revision_exception_proof; }],
    ['traversing proof reference', (manifest) => { manifest.owner_revision_exception_proof = '../review/owner-b1-revision-proof.json'; }]
  ]) {
    assertRejected({ manifest: change(validManifest(), mutate) }, label);
  }
});

test('proof and historical observation are bound to the same pinned run and post', () => {
  for (const [label, mutate] of [
    ['proof alternate run', (proof, observed) => { proof.run_id = '20261015-other-run'; }],
    ['proof alternate post', (proof, observed) => { proof.post = '_posts/2026/03/other.md'; }],
    ['historical manifest alternate run', (_proof, observed) => { observed.historical_manifest.run_id = '20261015-other-run'; }],
    ['historical manifest alternate post', (_proof, observed) => { observed.historical_manifest.article_path = '_posts/2026/03/other.md'; }]
  ]) {
    const proof = validProof();
    const observed = validObserved('final');
    mutate(proof, observed);
    assertRejected({ proof, observed }, label);
  }
});

test('the exception cannot authorize a fourth revision or falsify the original-2 plus approved-1 arithmetic', () => {
  for (const [label, mutate] of [
    ['fourth revision counter', (manifest, proof) => { manifest.revision_loops = 4; proof.total_content_revisions = 4; }],
    ['wrong prior revision count', (_manifest, proof) => { proof.prior_regular_revision_loops = 1; }],
    ['wrong additional approval count', (_manifest, proof) => { proof.additional_owner_approved_revision = 2; }],
    ['wrong applied approval count', (_manifest, proof) => { proof.additional_owner_approved_revision_applied = 0; }],
    ['wrong corrected total', (_manifest, proof) => { proof.total_content_revisions_after_correction = 2; }],
    ['wrong total content revisions', (_manifest, proof) => { proof.total_content_revisions = 2; }]
  ]) {
    const manifest = validManifest();
    const proof = validProof();
    mutate(manifest, proof);
    assertRejected({ manifest, proof }, label);
  }
});

test('approval, history, pre-marker, corrected-draft, and final digest mismatches are rejected', () => {
  const cases = [
    ['wrong proof approval digest', (proof) => { proof.approval_sha256 = 'a'.repeat(64); }],
    ['wrong observed approval digest', (_proof, observed) => { observed.approval_sha256 = 'a'.repeat(64); }],
    ['wrong proof history digest', (proof) => { proof.history_sha256['article.md'] = 'a'.repeat(64); }],
    ['wrong observed history digest', (_proof, observed) => { observed.history_sha256['article.md'] = 'a'.repeat(64); }],
    ['wrong pre-marker digest', (proof) => { proof.draft_before_sha256 = 'a'.repeat(64); }],
    ['wrong expected corrected digest', (proof) => { proof.expected_draft_after_B1_only_sha256 = 'a'.repeat(64); }],
    ['wrong actual corrected digest', (proof) => { proof.actual_draft_after_sha256 = 'a'.repeat(64); }],
    ['wrong derived corrected digest', (_proof, observed) => { observed.derived_corrected_sha256 = 'a'.repeat(64); }],
    ['wrong draft digest', (_proof, observed) => { observed.current_draft_sha256 = 'a'.repeat(64); }],
    ['wrong final derivative digest', (_proof, observed) => { observed.derived_final_sha256 = 'a'.repeat(64); }],
    ['wrong proof protected artifact digest', (proof) => { proof.protected_artifact_manifest_sha256 = 'a'.repeat(64); }],
    ['missing proof protected artifact digest', (proof) => { delete proof.protected_artifact_manifest_sha256; }],
    ['wrong observed protected artifact digest', (_proof, observed) => { observed.protected_artifact_manifest_sha256 = 'a'.repeat(64); }],
    ['missing observed protected artifact digest', (_proof, observed) => { delete observed.protected_artifact_manifest_sha256; }]
  ];
  for (const [label, mutate] of cases) {
    const proof = validProof();
    const observed = validObserved('final');
    mutate(proof, observed);
    assertRejected({ proof, observed }, label);
  }
});

test('false scope, waiver, protection, consumption, and B1-exactness claims cannot pass', () => {
  for (const [label, mutate] of [
    ['other gates waived', (proof) => { proof.other_gates_waived = true; }],
    ['global policy changed', (proof) => { proof.global_policy_changed = true; }],
    ['publication authorized', (proof) => { proof.publication_authorized_by_this_record = true; }],
    ['approval not consumed for B1', (proof) => { proof.approval_consumed_for_B1_only = false; }],
    ['protected artifacts changed', (proof) => { proof.protected_artifacts_unchanged = false; }],
    ['B1 deletion not exact', (_proof, observed) => { observed.b1_deletion_exact = false; }],
    ['marker transition not exact', (_proof, observed) => { observed.marker_transition_exact = false; }]
  ]) {
    const proof = validProof();
    const observed = validObserved('final');
    mutate(proof, observed);
    assertRejected({ proof, observed }, label);
  }
});

test('draft stage requires the pre-marker hash and a pending or in-progress selected ledger entry', () => {
  assertRejected({ stage: 'draft', observed: validObserved('draft', { current_draft_sha256: FINAL_SHA }) }, 'draft final hash');
  assertRejected({ stage: 'draft', observed: validObserved('draft', { selected_ledger_status: 'graduated' }) }, 'draft graduated ledger');
});

test('final stage requires the two-marker derivative, actual graduation transition, and root-source equality', () => {
  for (const [label, overrides] of [
    ['final pre-marker hash', { current_draft_sha256: CORRECTED_SHA }],
    ['final pending ledger', { selected_ledger_status: 'in_progress' }],
    ['ledger transition errors', { ledger_transition_errors: ['changed unrelated entry'] }],
    ['root source mismatch', { current_source_sha256: CORRECTED_SHA }]
  ]) {
    assertRejected({ observed: validObserved('final', overrides) }, label);
  }
});

test('fresh independent rereview is bound to the corrected run and must be a later PASS', () => {
  for (const [label, mutate] of [
    ['missing rereview', (proof) => { delete proof.independent_rereview; }],
    ['missing PASS status', (proof) => { proof.independent_rereview_status = 'not-yet-completed'; }],
    ['wrong verdict', (proof) => { proof.independent_rereview.verdict = 'FIX'; }],
    ['wrong reviewer', (proof) => { proof.independent_rereview.reviewer = ''; }],
    ['stale completed timestamp', (proof) => { proof.independent_rereview.completed_at = '2026-10-15T04:30:00.000000+00:00'; }],
    ['wrong prior review digest', (proof) => { proof.independent_rereview.prior_review_sha256 = 'a'.repeat(64); }],
    ['wrong corrected draft digest', (proof) => { proof.independent_rereview.corrected_draft_sha256 = 'a'.repeat(64); }],
    ['reused prior review digest', (proof) => { proof.independent_rereview.review_sha256 = PRIOR_FIX_SHA; }],
    ['wrong observed review digest', (_proof, observed) => { observed.review_sha256 = 'a'.repeat(64); }],
    ['wrong observed review binding', (_proof, observed) => { observed.review = { run_id: 'other', reviewer: 'native-independent-review', verdict: 'PASS' }; }],
    ['substituted same-run PASS digest pair', (proof, observed) => {
      proof.independent_rereview.review_sha256 = '6'.repeat(64);
      observed.review_sha256 = '6'.repeat(64);
    }]
  ]) {
    const proof = validProof();
    const observed = validObserved('final');
    mutate(proof, observed);
    assertRejected({ proof, observed }, label);
  }
});
