#!/usr/bin/env node
// Pure validation core for the authority-led monetization contract.
// The fail-closed rule: every automated article package records one
// research/authority-brief.json that binds the article to a declared
// authority basis, an original contribution, an honest AI-role disclosure,
// one internal next action, and an unmeasured-baseline measurement plan.
// No outcome (traffic, revenue, ranking) may be claimed at publish time.

export const AUTHORITY_BRIEF_SCHEMA_VERSION = 1;
export const AUTHORITY_SITE_MODE = 'expert-source-audit';
export const AUTHORITY_OPERATING_MODE = 'acquisition-content';
export const AUTHORITY_PRIMARY_LANE = 'seo-and-content';
export const AUTHORITY_REVENUE_MODEL = 'ads-and-paid-technical-review';
export const AUTHORITY_READOUT_AFTER_DAYS = 28;
export const AUTHORITY_PRIMARY_KPI = 'work-with-me-pageviews';
export const AUTHORITY_LEADING_SIGNAL = 'organic-search-clicks';
export const AUTHORITY_RESULT_STATUS_AT_PUBLISH = 'not-measured';
export const AUTHORITY_JUDGMENT_OWNER = 'evidence-gated-editorial-harness';
export const AUTHORITY_BASIS_TYPE = 'primary-source-analysis';
export const ORIGINAL_CONTRIBUTION_KINDS = [
  'comparative-analysis',
  'implementation-audit',
  'operational-synthesis',
  'decision-framework'
];
export const NEXT_ACTION_TYPE = 'related-article';
export const NEXT_ACTION_PATH_PATTERN = /^\/posts\/[a-z0-9][a-z0-9-]*\/$/;
export const MIN_SUMMARY_LENGTH = 40;
export const MIN_DISCLOSURE_LENGTH = 40;
export const MIN_READER_VALUE_LENGTH = 20;
export const MIN_CONTEXT_FIELD_LENGTH = 20;

export const BRIEF_TOP_LEVEL_FIELDS = [
  'schema_version',
  'run_id',
  'selected_candidate_id',
  'site_mode',
  'operating_mode',
  'primary_lane',
  'audience_segment',
  'reader_job',
  'content_pillar',
  'authority_basis',
  'original_contribution',
  'ai_role',
  'revenue_model',
  'next_action',
  'measurement'
];

export const REQUIRED_AUTHORITY_REVIEW_FINDINGS = [
  ['authority_fit', true],
  ['reader_value', true],
  ['monetization_honesty', true],
  ['ai_role_honesty', true],
  ['next_action_verified', true],
  ['scaled_content_risk', false]
];

const nonempty = (value, minimum = 1) => typeof value === 'string' && value.trim().length >= minimum;
const plainObject = (value) => Boolean(value) && typeof value === 'object' && !Array.isArray(value);

function visibleArticleBody(value) {
  return String(value || '')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/^(?: {4}|\t).*(?:\n|$)/gm, '')
    .replace(/`[^`\n]*`/g, '')
    .replace(/\{%\s*comment\s*%\}[\s\S]*?\{%\s*endcomment\s*%\}/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<(template|noscript|script|style|details)\b[^>]*>[\s\S]*?<\/\1>/gi, '')
    .replace(/<([a-z][a-z0-9:-]*)\b(?=[^>]*(?:\s(?:hidden|inert)(?:\s|=|>)|\saria-hidden\s*=\s*["']?true|\sstyle\s*=\s*["'][^"']*(?:display\s*:\s*none|visibility\s*:\s*hidden)))[^>]*>[\s\S]*?<\/\1>/gi, '');
}

function checkUnknownKeys(errors, object, allowed, label) {
  for (const key of Object.keys(object)) {
    if (!allowed.includes(key)) errors.push(`${label} contains an unknown field: ${key}`);
  }
}

function checkEvidenceClaimIds(errors, ids, claimById, label) {
  if (!Array.isArray(ids) || ids.length === 0) {
    errors.push(`${label}.evidence_claim_ids must be a non-empty array`);
    return 0;
  }
  const seen = new Set();
  for (const id of ids) {
    if (!nonempty(id)) {
      errors.push(`${label}.evidence_claim_ids contains an empty id`);
      continue;
    }
    if (seen.has(id)) errors.push(`${label}.evidence_claim_ids contains a duplicate id: ${id}`);
    seen.add(id);
    const claim = claimById.get(id);
    if (!claim) errors.push(`${label}.evidence_claim_ids references a missing evidence claim: ${id}`);
    else if (claim.verification === 'unverified') errors.push(`${label}.evidence_claim_ids references an unverified claim: ${id}`);
  }
  return seen.size;
}

export function validateAuthorityBrief({ brief, manifest, selectedCandidate, evidenceClaims, articleBody, contentPillars }) {
  const errors = [];
  const metrics = {
    authority_evidence_claims: 0,
    contribution_evidence_claims: 0,
    disclosure_in_body: false,
    next_action_in_body: false
  };
  if (!plainObject(brief)) {
    errors.push('research/authority-brief.json is missing or invalid; the authority-led monetization contract fails closed');
    return { errors, metrics };
  }
  const visibleBody = visibleArticleBody(articleBody);

  checkUnknownKeys(errors, brief, BRIEF_TOP_LEVEL_FIELDS, 'authority brief');
  if (brief.schema_version !== AUTHORITY_BRIEF_SCHEMA_VERSION) errors.push(`authority brief schema_version must be ${AUTHORITY_BRIEF_SCHEMA_VERSION}`);
  if (!nonempty(brief.run_id) || brief.run_id !== manifest?.run_id) errors.push(`authority brief run_id does not match the manifest run_id: ${brief.run_id}`);
  if (!nonempty(brief.selected_candidate_id)) errors.push('authority brief selected_candidate_id is missing');
  else if (brief.selected_candidate_id !== selectedCandidate?.candidate_id) errors.push(`authority brief selected_candidate_id does not match the selected candidate: ${brief.selected_candidate_id}`);
  if (brief.site_mode !== AUTHORITY_SITE_MODE) errors.push(`authority brief site_mode must be ${AUTHORITY_SITE_MODE}`);
  if (brief.operating_mode !== AUTHORITY_OPERATING_MODE) errors.push(`authority brief operating_mode must be ${AUTHORITY_OPERATING_MODE}`);
  if (brief.primary_lane !== AUTHORITY_PRIMARY_LANE) errors.push(`authority brief primary_lane must be ${AUTHORITY_PRIMARY_LANE}`);
  if (!nonempty(brief.audience_segment, MIN_CONTEXT_FIELD_LENGTH)) errors.push(`authority brief audience_segment needs at least ${MIN_CONTEXT_FIELD_LENGTH} characters`);
  if (!nonempty(brief.reader_job, MIN_CONTEXT_FIELD_LENGTH)) errors.push(`authority brief reader_job needs at least ${MIN_CONTEXT_FIELD_LENGTH} characters`);
  const pillars = Array.isArray(contentPillars) ? contentPillars : [];
  if (!nonempty(brief.content_pillar) || !pillars.includes(brief.content_pillar)) errors.push(`authority brief content_pillar is not a declared policy pillar: ${brief.content_pillar}`);
  if (nonempty(selectedCandidate?.content_pillar) && brief.content_pillar !== selectedCandidate.content_pillar) {
    errors.push(`authority brief content_pillar does not match the selected candidate pillar: ${brief.content_pillar} vs ${selectedCandidate.content_pillar}`);
  }
  if (brief.revenue_model !== AUTHORITY_REVENUE_MODEL) errors.push(`authority brief revenue_model must be ${AUTHORITY_REVENUE_MODEL}`);

  const claims = Array.isArray(evidenceClaims) ? evidenceClaims : [];
  const claimById = new Map(claims.filter((claim) => nonempty(claim?.claim_id)).map((claim) => [claim.claim_id, claim]));

  if (!plainObject(brief.authority_basis)) errors.push('authority brief authority_basis must be an object');
  else {
    checkUnknownKeys(errors, brief.authority_basis, ['type', 'summary', 'evidence_claim_ids'], 'authority_basis');
    if (brief.authority_basis.type !== AUTHORITY_BASIS_TYPE) errors.push(`authority_basis.type must be ${AUTHORITY_BASIS_TYPE}`);
    if (!nonempty(brief.authority_basis.summary, MIN_SUMMARY_LENGTH)) errors.push(`authority_basis.summary needs at least ${MIN_SUMMARY_LENGTH} characters`);
    metrics.authority_evidence_claims = checkEvidenceClaimIds(errors, brief.authority_basis.evidence_claim_ids, claimById, 'authority_basis');
  }

  if (!plainObject(brief.original_contribution)) errors.push('authority brief original_contribution must be an object');
  else {
    checkUnknownKeys(errors, brief.original_contribution, ['kind', 'summary', 'evidence_claim_ids'], 'original_contribution');
    if (!ORIGINAL_CONTRIBUTION_KINDS.includes(brief.original_contribution.kind)) errors.push(`original_contribution.kind must be one of ${ORIGINAL_CONTRIBUTION_KINDS.join('|')}: ${brief.original_contribution.kind}`);
    if (!nonempty(brief.original_contribution.summary, MIN_SUMMARY_LENGTH)) errors.push(`original_contribution.summary needs at least ${MIN_SUMMARY_LENGTH} characters`);
    metrics.contribution_evidence_claims = checkEvidenceClaimIds(errors, brief.original_contribution.evidence_claim_ids, claimById, 'original_contribution');
  }

  if (!plainObject(brief.ai_role)) errors.push('authority brief ai_role must be an object');
  else {
    checkUnknownKeys(errors, brief.ai_role, ['research_assistance', 'draft_assistance', 'editorial_judgment_owner', 'human_review_status', 'first_hand_experience_claimed', 'disclosure'], 'ai_role');
    if (brief.ai_role.research_assistance !== true) errors.push('ai_role.research_assistance must be true; hiding AI research assistance is dishonest');
    if (brief.ai_role.draft_assistance !== true) errors.push('ai_role.draft_assistance must be true; hiding AI draft assistance is dishonest');
    if (brief.ai_role.editorial_judgment_owner !== AUTHORITY_JUDGMENT_OWNER) errors.push(`ai_role.editorial_judgment_owner must be ${AUTHORITY_JUDGMENT_OWNER}`);
    const expectedReview = manifest?.mode === 'publish-on-green' ? 'standing-policy-approved' : 'manual-review-pending';
    if (brief.ai_role.human_review_status !== expectedReview) errors.push(`ai_role.human_review_status must be ${expectedReview} for mode ${manifest?.mode}: ${brief.ai_role.human_review_status}`);
    if (brief.ai_role.first_hand_experience_claimed !== false) errors.push('ai_role.first_hand_experience_claimed must be false; scheduled automation never claims lived experience');
    if (!nonempty(brief.ai_role.disclosure, MIN_DISCLOSURE_LENGTH) || /[<>\n]/.test(String(brief.ai_role.disclosure || ''))) errors.push(`ai_role.disclosure must be one safe line of at least ${MIN_DISCLOSURE_LENGTH} characters`);
    else if (visibleBody.split(/\r?\n/).includes(`> **Editorial method:** ${brief.ai_role.disclosure.trim()}`)) metrics.disclosure_in_body = true;
    else errors.push('ai_role.disclosure text does not appear in a visible Editorial method blockquote');
  }

  if (!plainObject(brief.next_action)) errors.push('authority brief next_action must be an object');
  else {
    checkUnknownKeys(errors, brief.next_action, ['type', 'path', 'reader_value'], 'next_action');
    if (brief.next_action.type !== NEXT_ACTION_TYPE) errors.push(`next_action.type must be ${NEXT_ACTION_TYPE}`);
    if (!nonempty(brief.next_action.path) || !NEXT_ACTION_PATH_PATTERN.test(brief.next_action.path)) errors.push(`next_action.path must match ${NEXT_ACTION_PATH_PATTERN}: ${brief.next_action.path}`);
    else if (visibleBody.includes(`](${brief.next_action.path})`)) metrics.next_action_in_body = true;
    else errors.push(`next_action.path does not appear as a visible Markdown internal link: ${brief.next_action.path}`);
    if (!nonempty(brief.next_action.reader_value, MIN_READER_VALUE_LENGTH)) errors.push(`next_action.reader_value needs at least ${MIN_READER_VALUE_LENGTH} characters`);
  }

  if (!plainObject(brief.measurement)) errors.push('authority brief measurement must be an object');
  else {
    checkUnknownKeys(errors, brief.measurement, ['primary_kpi', 'leading_signal', 'baseline_status', 'baseline_value', 'success_threshold_status', 'success_threshold', 'readout_after_days', 'result_status'], 'measurement');
    if (brief.measurement.primary_kpi !== AUTHORITY_PRIMARY_KPI) errors.push(`measurement.primary_kpi must be ${AUTHORITY_PRIMARY_KPI}`);
    if (brief.measurement.leading_signal !== AUTHORITY_LEADING_SIGNAL) errors.push(`measurement.leading_signal must be ${AUTHORITY_LEADING_SIGNAL}`);
    if (brief.measurement.baseline_status !== 'unmeasured') errors.push('measurement.baseline_status must be unmeasured until a real baseline readout exists');
    if (brief.measurement.baseline_value !== null) errors.push('measurement.baseline_value must be null; never invent a baseline number');
    if (brief.measurement.success_threshold_status !== 'pending-baseline') errors.push('measurement.success_threshold_status must be pending-baseline');
    if (brief.measurement.success_threshold !== null) errors.push('measurement.success_threshold must be null; never invent a success number');
    if (brief.measurement.readout_after_days !== AUTHORITY_READOUT_AFTER_DAYS) errors.push(`measurement.readout_after_days must be ${AUTHORITY_READOUT_AFTER_DAYS}`);
    if (brief.measurement.result_status !== AUTHORITY_RESULT_STATUS_AT_PUBLISH) errors.push(`measurement.result_status must be ${AUTHORITY_RESULT_STATUS_AT_PUBLISH} at publish time`);
  }

  return { errors, metrics };
}

export function validateAuthorityReviewFindings(review) {
  const errors = [];
  if (!plainObject(review)) {
    errors.push('Independent review is missing; authority findings cannot be verified');
    return { errors };
  }
  for (const [field, expected] of REQUIRED_AUTHORITY_REVIEW_FINDINGS) {
    if (review[field] !== expected) errors.push(`Independent review must record ${field}: ${expected}; found ${JSON.stringify(review[field])}`);
  }
  if (!nonempty(review.authority_rationale, MIN_SUMMARY_LENGTH)) errors.push(`Independent review authority_rationale needs at least ${MIN_SUMMARY_LENGTH} characters`);
  return { errors };
}
