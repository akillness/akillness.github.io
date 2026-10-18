// Archive development program (owner instruction, 2026-10-14):
// "Do not leave the restored archive posts as they were. For each post,
// survey, research, develop, and publish." This module validates the ledger
// in _data/archive_development.json and tells the site validators which
// approved restored sources have graduated out of the archive exception
// (or been retired) so that the 2026-10-12 restoration contract and the
// editorial-cohort rules never apply to the same file at the same time.
export const ARCHIVE_DEVELOPMENT_PROGRAM_ID = 'archive-development-2026-10-14';
export const ARCHIVE_DEVELOPMENT_START_DATE = '2026-10-14';
export const ARCHIVE_DEVELOPMENT_STATUSES = ['pending', 'in_progress', 'graduated', 'retired', 'merged'];
export const MIN_SURVEY_NOTE_LENGTH = 80;
export const ARCHIVE_DEVELOPED_MARKER_FIELD = 'archive_developed';

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const POST_PATH_PATTERN = /^_posts\/[^\s\\]+\.md$/;

const isSafePath = (value) => typeof value === 'string' && POST_PATH_PATTERN.test(value) && !value.includes('..');

export function validateArchiveDevelopment(record, restoredSources) {
  const errors = [];
  const require = (condition, message) => { if (!condition) errors.push(`archive development: ${message}`); };
  const graduatedSources = new Set();
  const retiredSources = new Set();
  const mergedSources = new Map();
  const entriesByPath = new Map();

  require(record && typeof record === 'object' && !Array.isArray(record), 'ledger is missing or not an object');
  if (errors.length) return { errors, graduatedSources, retiredSources, mergedSources, entriesByPath };
  require(record.schema_version === 1, 'unsupported schema');
  require(record.program_id === ARCHIVE_DEVELOPMENT_PROGRAM_ID, 'unknown program id');
  require(record.owner_instruction_date === ARCHIVE_DEVELOPMENT_START_DATE, 'owner instruction date drifted');
  require(typeof record.owner_instruction === 'string' && record.owner_instruction.length >= 40, 'owner instruction text is missing');
  require(Array.isArray(record.statuses) && JSON.stringify(record.statuses) === JSON.stringify(ARCHIVE_DEVELOPMENT_STATUSES), 'status vocabulary drifted');

  const posts = Array.isArray(record.posts) ? record.posts : [];
  const restored = restoredSources instanceof Set ? restoredSources : new Set(restoredSources || []);
  require(posts.length === restored.size, `ledger must cover every approved restored source exactly once (${posts.length} vs ${restored.size})`);

  for (const entry of posts) {
    if (!entry || typeof entry !== 'object') { errors.push('archive development: ledger entry is not an object'); continue; }
    const where = entry.path || '(no path)';
    require(isSafePath(entry.path), `${where}: unsafe or missing post path`);
    require(restored.has(entry.path), `${where}: path is not part of the approved 2026-10-12 restoration set`);
    require(!entriesByPath.has(entry.path), `${where}: duplicate ledger entry`);
    entriesByPath.set(entry.path, entry);
    require(ARCHIVE_DEVELOPMENT_STATUSES.includes(entry.status), `${where}: unknown status ${entry.status}`);
    require(typeof entry.original_date === 'string' && DATE_PATTERN.test(entry.original_date), `${where}: original_date must be YYYY-MM-DD`);
    require(Number.isInteger(entry.priority), `${where}: priority must be an integer`);
    if (entry.status === 'graduated' || entry.status === 'retired' || entry.status === 'merged') {
      require(typeof entry.developed_at === 'string' && DATE_PATTERN.test(entry.developed_at) && entry.developed_at >= ARCHIVE_DEVELOPMENT_START_DATE, `${where}: ${entry.status} entries need a developed_at date on or after ${ARCHIVE_DEVELOPMENT_START_DATE}`);
      require(typeof entry.survey_note === 'string' && entry.survey_note.trim().length >= MIN_SURVEY_NOTE_LENGTH, `${where}: ${entry.status} entries need a survey_note of at least ${MIN_SURVEY_NOTE_LENGTH} characters`);
    }
    if (entry.status === 'graduated') graduatedSources.add(entry.path);
    if (entry.status === 'retired') retiredSources.add(entry.path);
    if (entry.status === 'merged') {
      require(isSafePath(entry.merged_into) && entry.merged_into !== entry.path, `${where}: merged entries need a merged_into post path`);
      mergedSources.set(entry.path, entry.merged_into);
    }
  }
  for (const source of restored) require(entriesByPath.has(source), `${source}: approved restored source is missing from the ledger`);

  if (errors.length) return { errors, graduatedSources: new Set(), retiredSources: new Set(), mergedSources: new Map(), entriesByPath };
  return { errors, graduatedSources, retiredSources, mergedSources, entriesByPath };
}

// Front-matter contract for a file whose ledger status is "graduated".
export function graduatedFrontMatterErrors(fields, entry, sourcePath) {
  const errors = [];
  const where = sourcePath || entry?.path || '(unknown)';
  if (fields.restored_archive) errors.push(`${where}: graduated post still carries the restored_archive marker`);
  if (fields[ARCHIVE_DEVELOPED_MARKER_FIELD] !== entry?.developed_at) errors.push(`${where}: ${ARCHIVE_DEVELOPED_MARKER_FIELD} must equal the ledger developed_at (${entry?.developed_at})`);
  if (!fields.last_modified_at || String(fields.last_modified_at).slice(0, 10) < ARCHIVE_DEVELOPMENT_START_DATE) errors.push(`${where}: graduated post needs last_modified_at on or after ${ARCHIVE_DEVELOPMENT_START_DATE}`);
  if (String(fields.date || '').slice(0, 10) !== entry?.original_date) errors.push(`${where}: original publication date must be preserved (${entry?.original_date})`);
  if (/noindex/i.test(String(fields.robots || ''))) errors.push(`${where}: graduated post must be indexable`);
  if (fields.published === 'false') errors.push(`${where}: graduated post must be published`);
  return errors;
}

// Front-matter contract for a file whose ledger status is "retired" or "merged".
export function retiredFrontMatterErrors(fields, sourcePath) {
  const errors = [];
  const where = sourcePath || '(unknown)';
  if (fields.restored_archive) errors.push(`${where}: retired post still carries the restored_archive marker`);
  if (!/^noindex, follow$/i.test(String(fields.robots || ''))) errors.push(`${where}: retired post must be robots: noindex, follow`);
  if (fields.sitemap !== 'false') errors.push(`${where}: retired post must be sitemap: false`);
  if (fields.ads !== 'false') errors.push(`${where}: retired post must be ads: false`);
  return errors;
}

// One owner-approved B1 deletion, not a reusable revision-policy override.
export const B1_REVISION_EXCEPTION = Object.freeze({
  run: '20261015-0042-archive-nemoclaw-manual',
  post: '_posts/2026/03/2026-03-18-nemoclaw-safe-agents-guide.md',
  proof: 'review/owner-b1-revision-proof.json',
  approval: 'b23ee7b23e8d4c4783c8f457401b55dc6350e13313ac288680f59ad4956eb305',
  corrected: '3d49cb49aadc555f5d54e67600d2f8c2bb300e2ee476d97af32873878978c4c9',
  review: '39b07f0024f71a2f19aa4c55fe7f1e324df06aeeb2494bb70241838dd0e34ef2',
  protectedManifest: 'dead63f181285ebd86cb671cbf2260fd4108c192ce26edc02a3305bab7731958',
  protected: Object.freeze([
    'draft/assets/img/posts/2026-03-18-nemoclaw-safe-agents-guide/nemoclaw-egress-boundary.png',
    'draft/assets/img/posts/2026-03-18-nemoclaw-safe-agents-guide/nemoclaw-egress-boundary.svg',
    'draft/claim-map.json',
    'draft/source-image-manifest.json',
    'evidence/evidence-pack.json',
    'research/authority-brief.json',
    'research/image-source-audit.md',
    'research/source-capture-manifest.json',
    'research/source-captures/nvidia-hermes-nemoclaw-article.html',
    'research/source-captures/nvidia-nemoclaw-inference-routing.html',
    'research/source-captures/nvidia-nemoclaw-overview.html',
    'research/source-captures/nvidia-nemoclaw-platform-support.html',
    'research/source-captures/nvidia-nemoclaw-prerequisites.html',
    'research/source-captures/nvidia-nemoclaw-product.html',
    'research/source-captures/nvidia-nemoclaw-quickstart.html',
    'research/source-captures/nvidia-nemoclaw-security.html',
  ]),
  history: Object.freeze({
    'manifest.json': 'c73a82b57e3f5aeb6d12bcdcf85eeb80a1312be93ecf8ccbcf44227bf105fd4e',
    'editorial-review.json': 'bd307513a3838ae2d464c08fdeb842bb28a4c6d7e3ff4dba3420e8e32fa3165f',
    'article.md': '7b84c3e8c757eede9fa6032fe39a0a90bce675598546ce9079e644f9872cf574',
    'run-summary.md': '71a713a0a5c110e0ce0ec15b7d884fab27919935f89e91e33eb814662849383b'
  })
});

// One extra claim-map-only revision for one approved manual run; the global cap remains two.
export const JEV_TRUEFORGE_REVISION_EXCEPTION = Object.freeze({
  run: '20261017-2108-jev-open-harness-update',
  post: '_posts/2026-10-17-jev-pipeline-37-of-40-cost-estimate.md',
  proof: 'review/owner-jev-trueforge-revision-proof.json',
  priorApproval: '0cfe718700fb661d2ce7c510bc3bf8b1302ee58469a86f781bdd0dfaee8b65f2',
  implementationApproval: '7f33b161949b9c0b2575e42ae1b86f5970a0d7f616de995b782766fa44e8860f',
  preClaimMap: '54117cbddebb490635c7a1e19a8eb5b96719a854a36715064d838cc9dea92fb1',
  postClaimMap: 'f04cc7be0e560bd3b5d328162b2994405c2b5f36ec5bce0126bd29973ffcd82e',
  article: 'e64de966c29936b33c69493555cc95f9cd7bd014516b7c04294621e4903ec0b4',
  protectedManifest: '8962eca5991f8ce5627925633a053cfa2c8ccb05b7b0f0881306c0a1c8bbda57',
  editorialReview: '53ef1f5b94010971231bd854752a1d456199ab4d7051e69e9ea2ce3b0a07cb4b',
  changedClaim: 'reported_cost_inputs',
  appendedStatement: ' Relative to the $0.0015 Jev figure, the earlier range implies about 3.3–10× and the later range about 147–253×; both are conditional arithmetic only and do not resolve which Opus cost describes the run.',
  protected: Object.freeze([
    'draft/_posts/2026-10-17-jev-pipeline-37-of-40-cost-estimate.md',
    'draft/assets/img/posts/2026-10-17-jev-pipeline-37-of-40-cost-estimate/pipeline-comparison.png',
    'draft/source-image-manifest.json',
    'evidence/evidence-pack.json',
    'evidence/source-map.md',
    'research/authority-brief.json',
    'research/candidate-set.json',
    'research/existing-coverage.json',
    'research/image-source-audit.md',
    'research/newsletter-benchmark-update.json',
    'review/final-review.md',
    'review/revision-3-authorization.md'
  ]),
  history: Object.freeze({
    'manifest.json': 'a9b63cec6118e49e7323bc500c1afd734f7cb4fb8d85e6ab6dc3cdef773ac11c',
    'claim-map.json': '54117cbddebb490635c7a1e19a8eb5b96719a854a36715064d838cc9dea92fb1',
    'article.md': 'e64de966c29936b33c69493555cc95f9cd7bd014516b7c04294621e4903ec0b4',
    'run-summary.md': '02ddb26434cc106cd19a25d7d60693e1252703107558344fea4a9d8cd546bd30',
    'final-review.md': '935a7c7da9c32817a83d7c874cbe244de193a83165bc18aeb0e44f6bbcdc22b5'
  })
});

function jevRevisionExceptionErrors({ manifest, stage, proof, observed } = {}) {
  const errors = [];
  const require = (condition, message) => { if (!condition) errors.push(`revision budget: ${message}`); };
  const pinned = JEV_TRUEFORGE_REVISION_EXCEPTION;
  if (Number.isInteger(manifest?.revision_loops) && manifest.revision_loops <= 2) {
    require(manifest.owner_revision_exception_proof === undefined, 'an owner exception requires the truthful total of three');
    require(manifest.run_id !== pinned.run || manifest.article_path !== pinned.post, 'the approved run must preserve the truthful total of three');
    return errors;
  }
  require(manifest?.revision_loops === 3, `invalid revision loop count: ${manifest?.revision_loops}`);
  require(manifest?.run_id === pinned.run && manifest?.article_path === pinned.post, 'no extra revision is approved for this run or post');
  require(manifest?.owner_revision_exception_proof === pinned.proof, 'missing or unapproved owner proof path');
  require(proof && typeof proof === 'object' && !Array.isArray(proof), 'owner proof is missing or invalid');
  require(observed && typeof observed === 'object' && !Array.isArray(observed), 'recomputed owner proof observations are missing');
  if (errors.length) return errors;
  require(['draft', 'final'].includes(stage), 'invalid validation stage');
  require(proof.run_id === pinned.run && proof.post === pinned.post, 'proof scope does not match the approved run and post');
  require(proof.prior_regular_revision_loops === 2 && proof.additional_owner_approved_revision === 1 && proof.additional_owner_approved_revision_applied === 1 && proof.total_content_revisions_after_correction === 3 && proof.total_content_revisions === 3, 'revision history must preserve two plus exactly one, total three');
  require(proof.prior_revision_approval_sha256 === pinned.priorApproval && observed.prior_revision_approval_sha256 === pinned.priorApproval, 'third-revision owner approval digest does not match');
  require(proof.schema_version === 1, 'unsupported owner-proof schema version');
  require(proof.implementation_authorization_sha256 === pinned.implementationApproval && observed.implementation_authorization_sha256 === pinned.implementationApproval, 'gate-change authorization digest does not match');
  for (const [file, sha256] of Object.entries(pinned.history)) {
    require(proof.history_sha256?.[file] === sha256 && observed.history_sha256?.[file] === sha256, `historical ${file} digest changed`);
  }
  require(observed.historical_manifest?.run_id === pinned.run && observed.historical_manifest?.article_path === pinned.post && observed.historical_manifest?.revision_loops === 2, 'historical manifest no longer records the original two revisions');
  require(proof.pre_third_revision_claim_map_sha256 === pinned.preClaimMap && observed.pre_third_revision_claim_map_sha256 === pinned.preClaimMap, 'pre-revision claim-map digest changed');
  require(proof.post_third_revision_claim_map_sha256 === pinned.postClaimMap && observed.current_claim_map_sha256 === pinned.postClaimMap, 'post-revision claim-map digest changed');
  require(proof.changed_claim_id === pinned.changedClaim, 'the approved revision must be limited to the one pinned claim');
  require(proof.exact_appended_statement === pinned.appendedStatement && observed.claim_map_change_exact === true, 'claim-map change is not the exact approved append');
  require(proof.article_before_sha256 === pinned.article && proof.article_after_sha256 === pinned.article && observed.article_before_sha256 === pinned.article && observed.current_draft_sha256 === pinned.article, 'article bytes must remain unchanged by the third revision');
  require(proof.protected_artifact_manifest_sha256 === pinned.protectedManifest && observed.protected_artifact_manifest_sha256 === pinned.protectedManifest, 'protected evidence, research, authority, review or asset inputs changed');
  require(proof.editorial_review_sha256 === pinned.editorialReview && observed.review_sha256 === pinned.editorialReview, 'independent review bytes do not match the pinned PASS');
  require(observed.review?.run_id === pinned.run && observed.review?.verdict === 'PASS' && observed.review?.claim_coverage === 1 && Array.isArray(observed.review?.claims) && observed.review.claims.length === 26 && observed.review.claims.every((claim) => claim?.supported === true), 'a fresh independent PASS covering all 26 claims is required');
  for (const key of ['exact_claim_map_only_change', 'protected_artifacts_unchanged']) require(proof[key] === true, `${key} must be true`);
  for (const key of ['other_gates_waived', 'global_policy_changed', 'publication_authorized_by_this_record']) require(proof[key] === false, `${key} must be false`);
  return errors;
}

export function ownerRevisionExceptionErrors({ manifest, stage, proof, observed } = {}) {
  if (manifest?.run_id === JEV_TRUEFORGE_REVISION_EXCEPTION.run || manifest?.owner_revision_exception_proof === JEV_TRUEFORGE_REVISION_EXCEPTION.proof) {
    return jevRevisionExceptionErrors({ manifest, stage, proof, observed });
  }
  const errors = [];
  const require = (condition, message) => { if (!condition) errors.push(`revision budget: ${message}`); };
  const pinned = B1_REVISION_EXCEPTION;
  if (Number.isInteger(manifest?.revision_loops) && manifest.revision_loops <= 2) {
    require(manifest.owner_revision_exception_proof === undefined, 'an owner exception requires the truthful total of three');
    require(manifest.run_id !== pinned.run || manifest.article_path !== pinned.post, 'the approved run must preserve the truthful total of three');
    return errors;
  }
  require(manifest?.revision_loops === 3, `invalid revision loop count: ${manifest?.revision_loops}`);
  require(manifest?.run_id === pinned.run && manifest?.article_path === pinned.post, 'no extra revision is approved for this run or post');
  require(manifest?.owner_revision_exception_proof === pinned.proof, 'missing or unapproved owner proof path');
  require(proof && typeof proof === 'object' && !Array.isArray(proof), 'owner proof is missing or invalid');
  require(observed && typeof observed === 'object' && !Array.isArray(observed), 'recomputed owner proof observations are missing');
  if (errors.length) return errors;
  require(['draft', 'final'].includes(stage), 'invalid validation stage');
  require(proof.run_id === pinned.run && proof.post === pinned.post, 'proof scope does not match the approved run and post');
  require(proof.prior_regular_revision_loops === 2 && proof.additional_owner_approved_revision === 1 && proof.additional_owner_approved_revision_applied === 1 && proof.total_content_revisions_after_correction === 3 && proof.total_content_revisions === 3, 'revision history must preserve two plus exactly one, total three');
  require(proof.approval_sha256 === pinned.approval && observed.approval_sha256 === pinned.approval, 'owner approval digest does not match the exact approval');
  require(proof.prior_FIX_sha256 === pinned.history['editorial-review.json'], 'prior FIX digest changed');
  for (const [file, sha256] of Object.entries(pinned.history)) {
    require(proof.history_sha256?.[file] === sha256 && observed.history_sha256?.[file] === sha256, `historical ${file} digest changed`);
  }
  require(proof.draft_before_sha256 === pinned.history['article.md'], 'pre-correction draft digest changed');
  require(observed.historical_manifest?.run_id === pinned.run && observed.historical_manifest?.article_path === pinned.post && observed.historical_manifest?.revision_loops === 2, 'historical manifest no longer records the original two revisions');
  require(proof.expected_draft_after_B1_only_sha256 === pinned.corrected && proof.actual_draft_after_sha256 === pinned.corrected && observed.derived_corrected_sha256 === pinned.corrected, 'corrected draft differs from the exact approved B1 deletion');
  require(observed.b1_deletion_exact === true && observed.marker_transition_exact === true, 'B1 deletion or final marker transition is not exact');
  require(proof.protected_artifact_manifest_sha256 === pinned.protectedManifest && observed.protected_artifact_manifest_sha256 === pinned.protectedManifest, 'protected evidence, authority, audit or asset inputs differ from the reviewed manifest');
  for (const key of ['exact_B1_only_deletion_verified', 'protected_artifacts_unchanged', 'approval_consumed_for_B1_only']) require(proof[key] === true, `${key} must be true`);
  for (const key of ['other_gates_waived', 'global_policy_changed', 'publication_authorized_by_this_record']) require(proof[key] === false, `${key} must be false`);
  const rereview = proof.independent_rereview;
  require(proof.independent_rereview_status === 'PASS' && rereview?.verdict === 'PASS', 'fresh independent PASS rereview is required');
  require(typeof rereview?.reviewer === 'string' && rereview.reviewer.trim().length > 0 && rereview.reviewer === observed.review?.reviewer, 'independent reviewer identity is missing or mismatched');
  require(Number.isFinite(Date.parse(proof.corrected_at)) && Number.isFinite(Date.parse(rereview?.completed_at)) && Date.parse(rereview.completed_at) > Date.parse(proof.corrected_at), 'independent rereview is missing or stale');
  require(rereview?.prior_review_sha256 === pinned.history['editorial-review.json'] && rereview?.corrected_draft_sha256 === pinned.corrected, 'rereview does not bind the prior FIX and corrected draft');
  require(observed.review_sha256 === pinned.review && rereview?.review_sha256 === pinned.review, 'rereview bytes do not match the exact native PASS response');
  require(observed.review?.run_id === pinned.run && observed.review?.verdict === 'PASS', 'canonical independent review is not a PASS for this run');
  if (stage === 'draft') {
    require(observed.current_draft_sha256 === pinned.corrected, 'draft-stage bytes must be the exact pre-marker B1 correction');
    require(['pending', 'in_progress'].includes(observed.selected_ledger_status), 'draft-stage ledger must still be pending or in_progress');
  } else if (stage === 'final') {
    require(typeof observed.derived_final_sha256 === 'string' && /^[a-f0-9]{64}$/.test(observed.derived_final_sha256) && observed.current_draft_sha256 === observed.derived_final_sha256, 'final draft is not the exact two-marker derivative');
    require(observed.selected_ledger_status === 'graduated' && Array.isArray(observed.ledger_transition_errors) && observed.ledger_transition_errors.length === 0, 'final draft requires the exact selected-entry ledger graduation');
    require(observed.current_source_sha256 === observed.derived_final_sha256, 'final source bytes do not match the validated derivative');
  }
  return errors;
}
