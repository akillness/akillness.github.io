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


const JEV_RUN_ID = '20261017-2108-jev-open-harness-update';
const JEV_POST = '_posts/2026-10-17-jev-pipeline-37-of-40-cost-estimate.md';
const JEV_PROOF_PATH = 'review/owner-jev-trueforge-revision-proof.json';
const JEV_PRIOR_APPROVAL_SHA = '0cfe718700fb661d2ce7c510bc3bf8b1302ee58469a86f781bdd0dfaee8b65f2';
const JEV_IMPLEMENTATION_APPROVAL_SHA = '7f33b161949b9c0b2575e42ae1b86f5970a0d7f616de995b782766fa44e8860f';
const JEV_PRE_MAP_SHA = '54117cbddebb490635c7a1e19a8eb5b96719a854a36715064d838cc9dea92fb1';
const JEV_POST_MAP_SHA = 'f04cc7be0e560bd3b5d328162b2994405c2b5f36ec5bce0126bd29973ffcd82e';
const JEV_ARTICLE_SHA = 'e64de966c29936b33c69493555cc95f9cd7bd014516b7c04294621e4903ec0b4';
const JEV_PROTECTED_SHA = '8962eca5991f8ce5627925633a053cfa2c8ccb05b7b0f0881306c0a1c8bbda57';
const JEV_REVIEW_SHA = '53ef1f5b94010971231bd854752a1d456199ab4d7051e69e9ea2ce3b0a07cb4b';
const JEV_HISTORY_SHA = {
  'manifest.json': 'a9b63cec6118e49e7323bc500c1afd734f7cb4fb8d85e6ab6dc3cdef773ac11c',
  'claim-map.json': JEV_PRE_MAP_SHA,
  'article.md': JEV_ARTICLE_SHA,
  'run-summary.md': '02ddb26434cc106cd19a25d7d60693e1252703107558344fea4a9d8cd546bd30',
  'final-review.md': '935a7c7da9c32817a83d7c874cbe244de193a83165bc18aeb0e44f6bbcdc22b5'
};
const JEV_CLAIM_MAP_APPEND = ' Relative to the $0.0015 Jev figure, the earlier range implies about 3.3–10× and the later range about 147–253×; both are conditional arithmetic only and do not resolve which Opus cost describes the run.';

const validJevProof = () => ({
  schema_version: 1,
  run_id: JEV_RUN_ID,
  post: JEV_POST,
  prior_regular_revision_loops: 2,
  additional_owner_approved_revision: 1,
  additional_owner_approved_revision_applied: 1,
  total_content_revisions_after_correction: 3,
  total_content_revisions: 3,
  prior_revision_approval_sha256: JEV_PRIOR_APPROVAL_SHA,
  implementation_authorization_sha256: JEV_IMPLEMENTATION_APPROVAL_SHA,
  history_sha256: clone(JEV_HISTORY_SHA),
  pre_third_revision_claim_map_sha256: JEV_PRE_MAP_SHA,
  post_third_revision_claim_map_sha256: JEV_POST_MAP_SHA,
  changed_claim_id: 'reported_cost_inputs',
  exact_appended_statement: JEV_CLAIM_MAP_APPEND,
  article_before_sha256: JEV_ARTICLE_SHA,
  article_after_sha256: JEV_ARTICLE_SHA,
  protected_artifact_manifest_sha256: JEV_PROTECTED_SHA,
  editorial_review_sha256: JEV_REVIEW_SHA,
  exact_claim_map_only_change: true,
  protected_artifacts_unchanged: true,
  other_gates_waived: false,
  global_policy_changed: false,
  publication_authorized_by_this_record: false
});
const validJevObserved = (overrides = {}) => ({
  prior_revision_approval_sha256: JEV_PRIOR_APPROVAL_SHA,
  implementation_authorization_sha256: JEV_IMPLEMENTATION_APPROVAL_SHA,
  history_sha256: clone(JEV_HISTORY_SHA),
  historical_manifest: { run_id: JEV_RUN_ID, article_path: JEV_POST, revision_loops: 2 },
  pre_third_revision_claim_map_sha256: JEV_PRE_MAP_SHA,
  current_claim_map_sha256: JEV_POST_MAP_SHA,
  claim_map_change_exact: true,
  article_before_sha256: JEV_ARTICLE_SHA,
  current_draft_sha256: JEV_ARTICLE_SHA,
  protected_artifact_manifest_sha256: JEV_PROTECTED_SHA,
  review_sha256: JEV_REVIEW_SHA,
  review: { run_id: JEV_RUN_ID, verdict: 'PASS', claim_coverage: 1, claims: Array.from({ length: 26 }, (_, index) => ({ claim_id: `claim-${index}`, supported: true })) },
  ...overrides
});
const validJevManifest = (overrides = {}) => ({
  run_id: JEV_RUN_ID,
  article_path: JEV_POST,
  revision_loops: 3,
  owner_revision_exception_proof: JEV_PROOF_PATH,
  ...overrides
});

test('the Jev run-scoped third revision passes only with the exact one-claim append and both approvals', () => {
  for (const stage of ['draft', 'final']) {
    const errors = ownerRevisionExceptionErrors({
      manifest: validJevManifest(), stage, proof: validJevProof(), observed: validJevObserved()
    });
    assert.deepEqual(errors, []);
  }
});

test('the Jev run-scoped exception rejects unrelated runs, posts, proof paths, and a fourth revision', () => {
  for (const [label, manifest] of [
    ['alternate run', validJevManifest({ run_id: 'other-run' })],
    ['alternate post', validJevManifest({ article_path: '_posts/2026-10-17-other.md' })],
    ['alternate proof', validJevManifest({ owner_revision_exception_proof: 'review/other.json' })],
    ['fourth revision', validJevManifest({ revision_loops: 4 })]
  ]) {
    assert.ok(ownerRevisionExceptionErrors({ manifest, stage: 'draft', proof: validJevProof(), observed: validJevObserved() }).length > 0, label);
  }
});

test('the Jev run-scoped exception rejects baseline drift, asset changes, stale review, or publication claims', () => {
  for (const [label, mutate] of [
    ['owner proof schema drift', (proof) => { proof.schema_version = 2; }],
    ['pre-revision map drift', (proof, observed) => { proof.pre_third_revision_claim_map_sha256 = 'a'.repeat(64); }],
    ['post-revision map drift', (proof, observed) => { observed.current_claim_map_sha256 = 'a'.repeat(64); }],
    ['non-exact claim-map change', (_proof, observed) => { observed.claim_map_change_exact = false; }],
    ['article drift', (_proof, observed) => { observed.current_draft_sha256 = 'a'.repeat(64); }],
    ['protected asset drift', (_proof, observed) => { observed.protected_artifact_manifest_sha256 = 'a'.repeat(64); }],
    ['stale review', (_proof, observed) => { observed.review = { run_id: JEV_RUN_ID, verdict: 'FIX', claim_coverage: 1, claim_count: 26 }; }],
    ['publication claim', (proof) => { proof.publication_authorized_by_this_record = true; }],
    ['global limit changed', (proof) => { proof.global_policy_changed = true; }]
  ]) {
    const proof = validJevProof();
    const observed = validJevObserved();
    mutate(proof, observed);
    assert.ok(ownerRevisionExceptionErrors({ manifest: validJevManifest(), stage: 'draft', proof, observed }).length > 0, label);
  }
});
