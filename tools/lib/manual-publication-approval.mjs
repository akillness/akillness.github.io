export const MANUAL_SINGLE_ARTICLE_APPROVAL_TYPE = 'manual-single-article-publication';
export const MANUAL_SINGLE_ARTICLE_APPROVAL_STATUS = 'manual-single-article-approved';
export const MANUAL_SINGLE_ARTICLE_APPROVAL_RECORD_PATH = 'messages/manual-single-article-approval.json';
export const MANUAL_SINGLE_ARTICLE_APPROVAL_MAX_AGE_HOURS = 24;

const nonempty = (value) => typeof value === 'string' && value.trim().length > 0;
const plainObject = (value) => Boolean(value) && typeof value === 'object' && !Array.isArray(value);
const sameArray = (left, right) => JSON.stringify(left) === JSON.stringify(right);

function checkUnknownKeys(errors, object, allowed, label) {
  for (const key of Object.keys(object)) {
    if (!allowed.includes(key)) errors.push(`${label} contains an unknown field: ${key}`);
  }
}

function validatePathList(errors, value, label) {
  if (!Array.isArray(value) || value.length === 0 || value.some((item) => !nonempty(item))) {
    errors.push(`${label} must be a non-empty array of paths`);
    return null;
  }
  const sorted = [...value].sort();
  if (new Set(value).size !== value.length) errors.push(`${label} contains duplicate paths`);
  if (!sameArray(value, sorted)) errors.push(`${label} must be sorted`);
  return sorted;
}

export function validateManualSingleArticleApproval({
  manifest,
  approvalRecord,
  packagePaths,
  policyEnabled,
  policyMaxArticles,
  policyMaxAgeHours,
  policyRecordPath,
  now = Date.now()
}) {
  const errors = [];
  const context = manifest?.approval_context;
  if (context?.type !== MANUAL_SINGLE_ARTICLE_APPROVAL_TYPE) return { errors };

  if (manifest.mode !== 'publish-on-green') errors.push('manual single-article approval requires publish-on-green mode');
  if (manifest.publication_requires_confirmation !== false) errors.push('approved manual single-article mode must not require publication confirmation');
  if (policyEnabled !== true) errors.push('manual single-article publication is disabled by policy');
  if (policyMaxArticles !== 1) errors.push('manual single-article policy max_articles must be exactly 1');
  if (policyMaxAgeHours !== MANUAL_SINGLE_ARTICLE_APPROVAL_MAX_AGE_HOURS) errors.push(`manual single-article approval max_age_hours must be exactly ${MANUAL_SINGLE_ARTICLE_APPROVAL_MAX_AGE_HOURS}`);
  if (policyRecordPath !== MANUAL_SINGLE_ARTICLE_APPROVAL_RECORD_PATH) errors.push(`policy manual approval record path must be ${MANUAL_SINGLE_ARTICLE_APPROVAL_RECORD_PATH}`);

  if (!plainObject(context)) {
    errors.push('manual single-article approval context must be an object');
    return { errors };
  }
  checkUnknownKeys(errors, context, [
    'type', 'owner_request', 'standing_routine_not_used', 'approval_record_path',
    'approved_article_path', 'approved_scope_paths'
  ], 'manual single-article approval context');
  if (!nonempty(context.owner_request)) errors.push('manual single-article owner_request is missing');
  if (context.standing_routine_not_used !== true) errors.push('manual single-article approval must record standing_routine_not_used: true');
  if (context.approval_record_path !== MANUAL_SINGLE_ARTICLE_APPROVAL_RECORD_PATH) errors.push(`approval_context.approval_record_path must be ${MANUAL_SINGLE_ARTICLE_APPROVAL_RECORD_PATH}`);

  const articlePath = manifest.article_path;
  const match = typeof articlePath === 'string'
    ? articlePath.match(/^_posts\/(\d{4}-\d{2}-\d{2}-[a-z0-9][a-z0-9-]*)\.md$/)
    : null;
  if (!match) errors.push('manual single-article approval must bind one safe _posts/YYYY-MM-DD-<slug>.md path');
  if (context.approved_article_path !== articlePath) errors.push('approval context article path does not match manifest.article_path');

  const contextPaths = validatePathList(errors, context.approved_scope_paths, 'approval_context.approved_scope_paths');
  const recordedPaths = validatePathList(errors, approvalRecord?.approved_scope_paths, 'approval record approved_scope_paths');
  const derivedPaths = validatePathList(errors, packagePaths, 'derived package paths');
  if (contextPaths && derivedPaths && !sameArray(contextPaths, derivedPaths)) errors.push('approval context approved paths do not exactly match the derived package scope');
  if (recordedPaths && derivedPaths && !sameArray(recordedPaths, derivedPaths)) errors.push('approval record approved paths do not exactly match the derived package scope');

  if (!derivedPaths || !match) return { errors };
  const postPaths = derivedPaths.filter((item) => /^_posts\//.test(item));
  const assetPrefix = `assets/img/posts/${match[1]}/`;
  const assetPaths = derivedPaths.filter((item) => item.startsWith('assets/'));
  if (postPaths.length !== 1 || postPaths[0] !== articlePath) errors.push('manual single-article package must contain exactly the approved article path');
  if (assetPaths.some((item) => !item.startsWith(assetPrefix))) errors.push(`manual single-article package assets must stay under ${assetPrefix}`);
  if (derivedPaths.some((item) => item !== articlePath && !item.startsWith(assetPrefix))) errors.push('manual single-article package contains a path outside the article and its matching assets');

  if (!plainObject(approvalRecord)) {
    errors.push('manual single-article approval record is missing or invalid');
    return { errors };
  }
  checkUnknownKeys(errors, approvalRecord, [
    'schema_version', 'run_id', 'approval_type', 'owner_request', 'user_requests',
    'recorded_at_kst', 'standing_routine_not_used', 'approved_article_path', 'approved_scope_paths'
  ], 'manual single-article approval record');
  if (approvalRecord.schema_version !== 1) errors.push('manual single-article approval record schema_version must be 1');
  if (approvalRecord.run_id !== manifest.run_id) errors.push('manual single-article approval record run_id does not match the manifest');
  if (approvalRecord.approval_type !== MANUAL_SINGLE_ARTICLE_APPROVAL_TYPE) errors.push('manual single-article approval record approval_type is invalid');
  if (!nonempty(approvalRecord.owner_request) || approvalRecord.owner_request !== context.owner_request) errors.push('approval record owner_request does not match the manifest approval context');
  if (!Array.isArray(approvalRecord.user_requests) || approvalRecord.user_requests.length === 0 || approvalRecord.user_requests.some((item) => !nonempty(item)) || !approvalRecord.user_requests.includes(approvalRecord.owner_request)) {
    errors.push('approval record user_requests must include the exact owner_request');
  }
  const recordedAt = typeof approvalRecord.recorded_at_kst === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\+09:00$/.test(approvalRecord.recorded_at_kst)
    ? Date.parse(approvalRecord.recorded_at_kst)
    : Number.NaN;
  if (!Number.isFinite(recordedAt)) {
    errors.push('approval record recorded_at_kst must be a valid KST ISO timestamp');
  } else {
    const runStartedAt = Date.parse(manifest.started_at_kst);
    if (!Number.isFinite(runStartedAt)) errors.push('manifest.started_at_kst must be a valid timestamp for approval freshness checks');
    else if (recordedAt <= runStartedAt) errors.push('approval record must be recorded after manifest.started_at_kst');
    if (!Number.isFinite(now)) errors.push('approval freshness check requires a valid current timestamp');
    else {
      if (recordedAt > now) errors.push('approval record timestamp must not be in the future');
      if (now - recordedAt > MANUAL_SINGLE_ARTICLE_APPROVAL_MAX_AGE_HOURS * 60 * 60 * 1000) {
        errors.push(`approval record is older than ${MANUAL_SINGLE_ARTICLE_APPROVAL_MAX_AGE_HOURS} hours`);
      }
    }
  }
  if (approvalRecord.standing_routine_not_used !== true) errors.push('approval record must record standing_routine_not_used: true');
  if (approvalRecord.approved_article_path !== articlePath || context.approved_article_path !== approvalRecord.approved_article_path) errors.push('approval record article path does not match the manifest and approval context');

  return { errors };
}
