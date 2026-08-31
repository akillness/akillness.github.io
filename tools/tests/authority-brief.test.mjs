import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  AUTHORITY_READOUT_AFTER_DAYS,
  ORIGINAL_CONTRIBUTION_KINDS,
  validateAuthorityBrief,
  validateAuthorityReviewFindings
} from '../lib/authority-brief.mjs';

const RUN_ID = '20260901-0100-example-audit';
const PILLARS = [
  'ai-agents-and-harness-engineering',
  'mcp-reliability-security-and-operations',
  'unity-and-game-production-automation',
  'multimodal-game-qa-and-3d-vision'
];
const DISCLOSURE =
  'This Source Audit was researched and drafted with AI assistance inside an evidence-gated editorial harness; every material claim maps to cited primary sources.';
const NEXT_PATH = '/posts/existing-related-audit/';

function makeBrief(overrides = {}) {
  return {
    schema_version: 1,
    run_id: RUN_ID,
    selected_candidate_id: 'cand-1',
    site_mode: 'expert-source-audit',
    operating_mode: 'acquisition-content',
    primary_lane: 'seo-and-content',
    audience_segment: 'Engineers operating AI agent harnesses in production',
    reader_job: 'Decide whether to adopt the audited release safely',
    content_pillar: 'ai-agents-and-harness-engineering',
    authority_basis: {
      type: 'primary-source-analysis',
      summary: 'Direct reading of the pinned release source, tests, and changelog behind every claim.',
      evidence_claim_ids: ['c1', 'c2']
    },
    original_contribution: {
      kind: 'implementation-audit',
      summary: 'An implementation audit of guard behavior the announcement does not document at all.',
      evidence_claim_ids: ['c2']
    },
    ai_role: {
      research_assistance: true,
      draft_assistance: true,
      editorial_judgment_owner: 'evidence-gated-editorial-harness',
      human_review_status: 'standing-policy-approved',
      first_hand_experience_claimed: false,
      disclosure: DISCLOSURE
    },
    revenue_model: 'ads-and-paid-technical-review',
    next_action: {
      type: 'related-article',
      path: NEXT_PATH,
      reader_value: 'Compares the same guard pattern on an earlier release.'
    },
    measurement: {
      primary_kpi: 'work-with-me-pageviews',
      leading_signal: 'organic-search-clicks',
      baseline_status: 'unmeasured',
      baseline_value: null,
      success_threshold_status: 'pending-baseline',
      success_threshold: null,
      readout_after_days: AUTHORITY_READOUT_AFTER_DAYS,
      result_status: 'not-measured'
    },
    ...overrides
  };
}

function makeFixture({ mutateBrief, mutateFixture } = {}) {
  const brief = makeBrief();
  if (mutateBrief) mutateBrief(brief);
  const fixture = {
    brief,
    manifest: { run_id: RUN_ID, mode: 'publish-on-green' },
    selectedCandidate: { candidate_id: 'cand-1', content_pillar: 'ai-agents-and-harness-engineering' },
    evidenceClaims: [
      { claim_id: 'c1', verification: 'verified' },
      { claim_id: 'c2', verification: 'verified' },
      { claim_id: 'c3', verification: 'inferred' },
      { claim_id: 'c-bad', verification: 'unverified' }
    ],
    articleBody: `Intro.\n\n> **Editorial method:** ${DISCLOSURE}\n\nRead the follow-up in [the related audit](${NEXT_PATH}).\n\nOutro.`,
    contentPillars: PILLARS
  };
  if (mutateFixture) mutateFixture(fixture);
  return fixture;
}

const run = (fixture) => validateAuthorityBrief(fixture);

test('true positive: a fully compliant authority brief passes with metrics', () => {
  const { errors, metrics } = run(makeFixture());
  assert.deepEqual(errors, []);
  assert.equal(metrics.authority_evidence_claims, 2);
  assert.equal(metrics.contribution_evidence_claims, 1);
  assert.equal(metrics.disclosure_in_body, true);
  assert.equal(metrics.next_action_in_body, true);
});

test('every original contribution kind is accepted', () => {
  for (const kind of ORIGINAL_CONTRIBUTION_KINDS) {
    const { errors } = run(makeFixture({ mutateBrief: (brief) => { brief.original_contribution.kind = kind; } }));
    assert.deepEqual(errors, [], `kind ${kind} should pass`);
  }
});

test('draft-only mode requires manual-review-pending review status', () => {
  const draftFixture = makeFixture({
    mutateBrief: (brief) => { brief.ai_role.human_review_status = 'manual-review-pending'; },
    mutateFixture: (fixture) => { fixture.manifest.mode = 'draft-only'; }
  });
  assert.deepEqual(run(draftFixture).errors, []);
  const wrongStatus = makeFixture({ mutateFixture: (fixture) => { fixture.manifest.mode = 'draft-only'; } });
  assert.ok(run(wrongStatus).errors.some((e) => e.includes('human_review_status must be manual-review-pending')));
});

test('fails closed when the brief is missing', () => {
  const fixture = makeFixture({ mutateFixture: (f) => { f.brief = null; } });
  const { errors } = run(fixture);
  assert.ok(errors.some((e) => e.includes('fails closed')));
});

const failsWith = (mutateBrief, phrase, mutateFixture) => {
  const { errors } = run(makeFixture({ mutateBrief, mutateFixture }));
  assert.ok(errors.some((e) => e.includes(phrase)), `Expected failure containing: ${phrase}\nGot: ${errors.join('\n')}`);
};

test('fails on identity and mode drift', () => {
  failsWith((b) => { b.schema_version = 2; }, 'schema_version must be 1');
  failsWith((b) => { b.run_id = 'other-run'; }, 'run_id does not match');
  failsWith((b) => { delete b.selected_candidate_id; }, 'selected_candidate_id is missing');
  failsWith((b) => { b.selected_candidate_id = 'cand-9'; }, 'does not match the selected candidate');
  failsWith((b) => { b.site_mode = 'volume-farm'; }, 'site_mode must be expert-source-audit');
  failsWith((b) => { b.operating_mode = 'scaled-content'; }, 'operating_mode must be acquisition-content');
  failsWith((b) => { b.primary_lane = 'paid-ads'; }, 'primary_lane must be seo-and-content');
  failsWith((b) => { b.revenue_model = 'affiliate'; }, 'revenue_model must be ads-and-paid-technical-review');
  failsWith((b) => { b.unknown_extra = true; }, 'unknown field: unknown_extra');
});

test('fails on pillar drift and candidate pillar mismatch', () => {
  failsWith((b) => { b.content_pillar = 'made-up-pillar'; }, 'not a declared policy pillar');
  failsWith((b) => { b.content_pillar = 'mcp-reliability-security-and-operations'; }, 'does not match the selected candidate pillar');
});

test('fails on weak or unverified authority evidence', () => {
  failsWith((b) => { b.authority_basis.type = 'personal-story'; }, 'authority_basis.type must be primary-source-analysis');
  failsWith((b) => { b.authority_basis.summary = 'too short'; }, 'authority_basis.summary needs at least 40 characters');
  failsWith((b) => { b.authority_basis.evidence_claim_ids = []; }, 'authority_basis.evidence_claim_ids must be a non-empty array');
  failsWith((b) => { b.authority_basis.evidence_claim_ids = ['c1', 'c1']; }, 'duplicate id: c1');
  failsWith((b) => { b.authority_basis.evidence_claim_ids = ['missing-claim']; }, 'missing evidence claim: missing-claim');
  failsWith((b) => { b.authority_basis.evidence_claim_ids = ['c-bad']; }, 'references an unverified claim: c-bad');
  failsWith((b) => { b.original_contribution.kind = 'listicle'; }, 'original_contribution.kind must be one of');
  failsWith((b) => { b.original_contribution.evidence_claim_ids = ['c-bad']; }, 'references an unverified claim: c-bad');
});

test('fails on dishonest AI-role records', () => {
  failsWith((b) => { b.ai_role.research_assistance = false; }, 'research_assistance must be true');
  failsWith((b) => { b.ai_role.draft_assistance = false; }, 'draft_assistance must be true');
  failsWith((b) => { b.ai_role.editorial_judgment_owner = 'human-editor'; }, 'editorial_judgment_owner must be evidence-gated-editorial-harness');
  failsWith((b) => { b.ai_role.first_hand_experience_claimed = true; }, 'first_hand_experience_claimed must be false');
  failsWith((b) => { b.ai_role.disclosure = 'AI helped.'; }, 'disclosure must be one safe line of at least 40 characters');
});

test('fails when the disclosure text is not visible in the article body', () => {
  const fixture = makeFixture({ mutateFixture: (f) => { f.articleBody = f.articleBody.replace(DISCLOSURE, 'A different disclosure sentence long enough to pass length checks alone.'); } });
  assert.ok(run(fixture).errors.some((e) => e.includes('does not appear in a visible Editorial method blockquote')));
});

test('hidden disclosure and next-action text do not satisfy the visible contract', () => {
  const commented = makeFixture({ mutateFixture: (f) => { f.articleBody = `<!-- > **Editorial method:** ${DISCLOSURE}\n[related](${NEXT_PATH}) -->`; } });
  const commentedErrors = run(commented).errors;
  assert.ok(commentedErrors.some((e) => e.includes('visible Editorial method blockquote')));
  assert.ok(commentedErrors.some((e) => e.includes('visible Markdown internal link')));

  const fenced = makeFixture({ mutateFixture: (f) => { f.articleBody = `\`\`\`markdown\n> **Editorial method:** ${DISCLOSURE}\n[related](${NEXT_PATH})\n\`\`\``; } });
  const fencedErrors = run(fenced).errors;
  assert.ok(fencedErrors.some((e) => e.includes('visible Editorial method blockquote')));
  assert.ok(fencedErrors.some((e) => e.includes('visible Markdown internal link')));

  const indented = makeFixture({ mutateFixture: (f) => { f.articleBody = `    > **Editorial method:** ${DISCLOSURE}\n    [related](${NEXT_PATH})`; } });
  const indentedErrors = run(indented).errors;
  assert.ok(indentedErrors.some((e) => e.includes('visible Editorial method blockquote')));
  assert.ok(indentedErrors.some((e) => e.includes('visible Markdown internal link')));

  const hidden = makeFixture({ mutateFixture: (f) => { f.articleBody = `<div hidden>\n> **Editorial method:** ${DISCLOSURE}\n[related](${NEXT_PATH})\n</div>`; } });
  const hiddenErrors = run(hidden).errors;
  assert.ok(hiddenErrors.some((e) => e.includes('visible Editorial method blockquote')));
  assert.ok(hiddenErrors.some((e) => e.includes('visible Markdown internal link')));
});

test('fails on invalid or unembedded next action', () => {
  failsWith((b) => { b.next_action.type = 'newsletter-signup'; }, 'next_action.type must be related-article');
  failsWith((b) => { b.next_action.path = '/work-with-me/'; }, 'next_action.path must match');
  failsWith((b) => { b.next_action.path = '/posts/Slug-With-Caps/'; }, 'next_action.path must match');
  failsWith((b) => { b.next_action.path = '/posts/slug/?utm_source=x'; }, 'next_action.path must match');
  failsWith((b) => { b.next_action.path = 'https://example.com/posts/slug/'; }, 'next_action.path must match');
  failsWith((b) => { b.next_action.reader_value = 'short'; }, 'reader_value needs at least 20 characters');
  const notEmbedded = makeFixture({ mutateBrief: (b) => { b.next_action.path = '/posts/never-linked-post/'; } });
  assert.ok(run(notEmbedded).errors.some((e) => e.includes('does not appear as a visible Markdown internal link')));
});

test('fails on fabricated measurement numbers or premature results', () => {
  failsWith((b) => { b.measurement.primary_kpi = 'revenue'; }, 'primary_kpi must be work-with-me-pageviews');
  failsWith((b) => { b.measurement.leading_signal = 'pageviews'; }, 'leading_signal must be organic-search-clicks');
  failsWith((b) => { b.measurement.baseline_status = 'measured'; }, 'baseline_status must be unmeasured');
  failsWith((b) => { b.measurement.baseline_value = 120; }, 'baseline_value must be null');
  failsWith((b) => { b.measurement.success_threshold_status = 'set'; }, 'success_threshold_status must be pending-baseline');
  failsWith((b) => { b.measurement.success_threshold = 500; }, 'success_threshold must be null');
  failsWith((b) => { b.measurement.readout_after_days = 7; }, `readout_after_days must be ${AUTHORITY_READOUT_AFTER_DAYS}`);
  failsWith((b) => { b.measurement.result_status = 'successful'; }, 'result_status must be not-measured');
});

test('fails safely on missing nested objects', () => {
  for (const key of ['authority_basis', 'original_contribution', 'ai_role', 'next_action', 'measurement']) {
    failsWith((b) => { delete b[key]; }, `${key} must be an object`);
    failsWith((b) => { b[key] = 'not-an-object'; }, `${key} must be an object`);
  }
});

test('review findings: compliant review passes, drifted review fails', () => {
  const goodReview = {
    authority_fit: true,
    reader_value: true,
    monetization_honesty: true,
    ai_role_honesty: true,
    next_action_verified: true,
    scaled_content_risk: false,
    authority_rationale: 'The article demonstrates pinned-source authority and an honest AI-role disclosure.'
  };
  assert.deepEqual(validateAuthorityReviewFindings(goodReview).errors, []);
  for (const [field, expected] of [
    ['authority_fit', true],
    ['reader_value', true],
    ['monetization_honesty', true],
    ['ai_role_honesty', true],
    ['next_action_verified', true],
    ['scaled_content_risk', false]
  ]) {
    const broken = { ...goodReview, [field]: !expected };
    assert.ok(validateAuthorityReviewFindings(broken).errors.some((e) => e.includes(field)), `expected ${field} failure`);
  }
  assert.ok(validateAuthorityReviewFindings({ ...goodReview, authority_rationale: 'short' }).errors.some((e) => e.includes('authority_rationale')));
  assert.ok(validateAuthorityReviewFindings(null).errors.length >= 1);
});
