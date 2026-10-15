import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  MANUAL_SINGLE_ARTICLE_APPROVAL_RECORD_PATH,
  MANUAL_SINGLE_ARTICLE_APPROVAL_TYPE,
  validateManualSingleArticleApproval
} from '../lib/manual-publication-approval.mjs';

const runId = '20261015-1050-approval-freshness';
const articlePath = '_posts/2026-10-15-example-audit.md';
const approvedPaths = [
  articlePath,
  'assets/img/posts/2026-10-15-example-audit/example-cover.png',
  'assets/img/posts/2026-10-15-example-audit/example-diagram.svg'
];

function fixture() {
  const ownerRequest = '승인, 추가 후 푸시';
  return {
    policyEnabled: true,
    policyMaxArticles: 1,
    policyMaxAgeHours: 24,
    policyRecordPath: MANUAL_SINGLE_ARTICLE_APPROVAL_RECORD_PATH,
    now: Date.parse('2026-10-15T17:50:00+09:00'),
    packagePaths: [...approvedPaths],
    manifest: {
      run_id: runId,
      started_at_kst: '2026-10-15T10:54:48+09:00',
      mode: 'publish-on-green',
      publication_requires_confirmation: false,
      article_path: articlePath,
      approval_context: {
        type: MANUAL_SINGLE_ARTICLE_APPROVAL_TYPE,
        owner_request: ownerRequest,
        standing_routine_not_used: true,
        approval_record_path: MANUAL_SINGLE_ARTICLE_APPROVAL_RECORD_PATH,
        approved_article_path: articlePath,
        approved_scope_paths: [...approvedPaths]
      }
    },
    approvalRecord: {
      schema_version: 1,
      run_id: runId,
      approval_type: MANUAL_SINGLE_ARTICLE_APPROVAL_TYPE,
      owner_request: ownerRequest,
      user_requests: ['깃 푸시해', ownerRequest],
      recorded_at_kst: '2026-10-15T17:29:28+09:00',
      standing_routine_not_used: true,
      approved_article_path: articlePath,
      approved_scope_paths: [...approvedPaths]
    }
  };
}

test('accepts one explicit manual approval bound to one article and its exact package paths', () => {
  assert.deepEqual(validateManualSingleArticleApproval(fixture()).errors, []);
});


test('rejects package paths that exceed the owner-approved scope', () => {
  const value = fixture();
  value.packagePaths.push('_config.yml');
  value.packagePaths.sort();
  assert.ok(validateManualSingleArticleApproval(value).errors.some((error) => error.includes('outside the article and its matching assets')));
});

test('rejects an approval record from another run', () => {
  const value = fixture();
  value.approvalRecord.run_id = 'another-run';
  assert.ok(validateManualSingleArticleApproval(value).errors.some((error) => error.includes('run_id')));
});

test('rejects a missing approval record', () => {
  const value = fixture();
  value.approvalRecord = null;
  assert.ok(validateManualSingleArticleApproval(value).errors.some((error) => error.includes('approval record is missing')));
});

test('rejects a manual approval when its policy capability is disabled', () => {
  const value = fixture();
  value.policyEnabled = false;
  assert.ok(validateManualSingleArticleApproval(value).errors.some((error) => error.includes('disabled by policy')));
});

test('rejects an article path that does not match the approved post', () => {
  const value = fixture();
  value.manifest.approval_context.approved_article_path = '_posts/2026-10-15-different.md';
  assert.ok(validateManualSingleArticleApproval(value).errors.some((error) => error.includes('article path')));
});

test('rejects a scope record containing an unrelated path', () => {
  const value = fixture();
  value.manifest.approval_context.approved_scope_paths.push('_config.yml');
  value.manifest.approval_context.approved_scope_paths.sort();
  assert.ok(validateManualSingleArticleApproval(value).errors.some((error) => error.includes('approved paths do not exactly match')));
});


test('rejects a policy that widens the one-article maximum', () => {
  const value = fixture();
  value.policyMaxArticles = 2;
  assert.ok(validateManualSingleArticleApproval(value).errors.some((error) => error.includes('max_articles')));
});


test('allows a single-post package with no local assets', () => {
  const value = fixture();
  value.packagePaths = [articlePath];
  value.manifest.approval_context.approved_scope_paths = [articlePath];
  value.approvalRecord.approved_scope_paths = [articlePath];
  assert.deepEqual(validateManualSingleArticleApproval(value).errors, []);
});


test('fails closed without throwing when derived package paths contain invalid values', () => {
  const value = fixture();
  value.packagePaths = [articlePath, null];
  let result;
  assert.doesNotThrow(() => { result = validateManualSingleArticleApproval(value); });
  assert.ok(result.errors.some((error) => error.includes('derived package paths')));
});


test('rejects approval older than the configured freshness window', () => {
  const value = fixture();
  value.now = Date.parse('2026-10-16T18:00:00+09:00');
  assert.ok(validateManualSingleArticleApproval(value).errors.some((error) => error.includes('older than 24 hours')));
});

test('rejects approval recorded before the run started', () => {
  const value = fixture();
  value.approvalRecord.recorded_at_kst = '2026-10-15T10:00:00+09:00';
  assert.ok(validateManualSingleArticleApproval(value).errors.some((error) => error.includes('after manifest.started_at_kst')));
});

test('rejects an approval timestamp in the future', () => {
  const value = fixture();
  value.approvalRecord.recorded_at_kst = '2026-10-16T10:00:00+09:00';
  assert.ok(validateManualSingleArticleApproval(value).errors.some((error) => error.includes('future')));
});


test('rejects a policy that widens the approval freshness window', () => {
  const value = fixture();
  value.policyMaxAgeHours = 48;
  assert.ok(validateManualSingleArticleApproval(value).errors.some((error) => error.includes('max_age_hours')));
});


test('rejects an approval timestamp equal to the run start', () => {
  const value = fixture();
  value.approvalRecord.recorded_at_kst = value.manifest.started_at_kst;
  assert.ok(validateManualSingleArticleApproval(value).errors.some((error) => error.includes('after manifest.started_at_kst')));
});
