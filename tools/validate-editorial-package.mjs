#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import {
  collectReferenceFiles,
  referencesPrefix,
  validateSourceImageManifest
} from './lib/source-image-manifest.mjs';

const argv = process.argv.slice(2);
let repoRootValue = process.cwd();
let stage = 'final';
for (let i = 0; i < argv.length; i += 1) {
  if (argv[i] === '--stage') {
    stage = argv[i + 1] || '';
    i += 1;
  } else if (argv[i] === '--root') {
    repoRootValue = argv[i + 1] || '';
    i += 1;
  } else if (!argv[i].startsWith('--')) {
    repoRootValue = argv[i];
  }
}
if (!['draft', 'final'].includes(stage)) throw new Error('--stage must be draft or final');
const repoRoot = path.resolve(repoRootValue);
const current = path.join(repoRoot, '_workspace', 'current');
const failures = [];
const warnings = [];
const pass = (condition, message) => {
  if (!condition) failures.push(message);
};
const warn = (condition, message) => {
  if (!condition) warnings.push(message);
};
const nonempty = (value, minimum = 1) => typeof value === 'string' && value.trim().length >= minimum;
const isHttpUrl = (value) => {
  try {
    return ['http:', 'https:'].includes(new URL(value).protocol);
  } catch {
    return false;
  }
};
const readJson = (file) => {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    failures.push(`Cannot read valid JSON: ${path.relative(repoRoot, file)} (${error.message})`);
    return null;
  }
};
const walk = (dir, predicate) => {
  if (!fs.existsSync(dir)) return [];
  const found = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) found.push(...walk(full, predicate));
    else if (predicate(full)) found.push(full);
  }
  return found;
};

pass(fs.existsSync(current), '_workspace/current is missing');
const manifestFile = path.join(current, 'manifest.json');
const manifest = fs.existsSync(manifestFile) ? readJson(manifestFile) : null;
pass(Boolean(manifest), 'manifest.json is missing or invalid');
if (manifest) {
  for (const key of ['schema_version', 'run_id', 'started_at_kst', 'target_date', 'mode', 'status', 'topic', 'slug', 'thesis', 'article_path', 'asset_dir', 'revision_loops', 'publication_requires_confirmation', 'gates']) {
    pass(manifest[key] !== undefined && manifest[key] !== null, `Manifest field is missing: ${key}`);
  }
  pass(manifest.schema_version === 1, `Unsupported manifest schema_version: ${manifest.schema_version}`);
  pass(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\+09:00$/.test(manifest.started_at_kst), `Invalid started_at_kst: ${manifest.started_at_kst}`);
  pass(/^\d{4}-\d{2}-\d{2}$/.test(manifest.target_date), `Invalid target_date: ${manifest.target_date}`);
  pass(['draft-only', 'publish-on-green'].includes(manifest.mode), `Invalid manifest mode: ${manifest.mode}`);
  if (manifest.mode === 'draft-only') pass(manifest.publication_requires_confirmation === true, 'draft-only manifest must require publication confirmation');
  if (manifest.mode === 'publish-on-green') pass(manifest.publication_requires_confirmation === false, 'approved publish-on-green manifest has inconsistent confirmation state');
  pass(Number.isInteger(manifest.revision_loops) && manifest.revision_loops <= 2, `Invalid revision loop count: ${manifest.revision_loops}`);
  pass(typeof manifest.gates === 'object' && !Array.isArray(manifest.gates), 'Manifest gates must be an object');
  pass(typeof manifest.topic === 'string' && manifest.topic.trim().length >= 5, 'Manifest topic is missing or too short');
  pass(typeof manifest.thesis === 'string' && manifest.thesis.trim().length >= 20, 'Manifest thesis is missing or too short');
  if (stage === 'draft') pass(['drafting', 'reviewing'].includes(manifest.status), `Draft validation requires drafting/reviewing status, found ${manifest.status}`);
}

const tasksFile = path.join(current, 'tasks.json');
const tasks = fs.existsSync(tasksFile) ? readJson(tasksFile) : null;
pass(Boolean(tasks) && Array.isArray(tasks.tasks), 'tasks.json is missing, invalid, or has no tasks array');
pass(fs.existsSync(path.join(current, 'messages')) && fs.statSync(path.join(current, 'messages')).isDirectory(), 'messages/ directory is missing');

const candidateFile = path.join(current, 'research', 'candidate-set.json');
const candidateSet = fs.existsSync(candidateFile) ? readJson(candidateFile) : null;
pass(Boolean(candidateSet), 'research/candidate-set.json is missing or invalid');
const candidates = Array.isArray(candidateSet) ? candidateSet : Array.isArray(candidateSet?.candidates) ? candidateSet.candidates : [];
pass(candidates.length >= 1, 'Candidate set contains no researched candidates');
pass(candidates.filter((candidate) => candidate?.selected === true).length === 1, 'Article package must have exactly one selected candidate');
for (const [index, candidate] of candidates.entries()) {
  const label = candidate?.candidate_id || index + 1;
  pass(nonempty(candidate?.candidate_id), `Candidate ${label} has no candidate_id`);
  pass(isHttpUrl(candidate?.url), `Candidate ${label} has an invalid URL`);
  pass(nonempty(candidate?.source_tier), `Candidate ${label} has no source_tier`);
  pass(Number.isFinite(Date.parse(candidate?.retrieved_at)), `Candidate ${label} has invalid retrieved_at`);
  pass(nonempty(candidate?.why_now), `Candidate ${label} has no why_now`);
  pass(nonempty(candidate?.audience_fit), `Candidate ${label} has no audience_fit`);
  pass(candidate?.overlap_with_existing !== undefined && candidate?.overlap_with_existing !== null, `Candidate ${label} has no overlap_with_existing`);
  pass(nonempty(candidate?.originality_opportunity), `Candidate ${label} has no originality_opportunity`);
  pass(typeof candidate?.selected === 'boolean', `Candidate ${label} has no boolean selected field`);
  if (candidate?.selected === false) pass(nonempty(candidate?.rejection_reason), `Rejected candidate ${label} has no rejection_reason`);
}
const coverageFile = path.join(current, 'research', 'existing-coverage.json');
const existingCoverage = fs.existsSync(coverageFile) ? readJson(coverageFile) : null;
pass(Boolean(existingCoverage), 'research/existing-coverage.json is missing or invalid');

const postsDir = path.join(current, 'draft', '_posts');
const drafts = walk(postsDir, (file) => file.endsWith('.md'));
pass(drafts.length === 1, `Expected exactly one draft post, found ${drafts.length}`);

let article = '';
let frontMatter = '';
let body = '';
let draftPath = null;
if (drafts.length === 1) {
  draftPath = drafts[0];
  article = fs.readFileSync(draftPath, 'utf8');
  const match = article.match(/^---\s*\n([\s\S]*?)\n---\s*\n/);
  pass(Boolean(match), 'Draft has no valid YAML front matter');
  if (match) {
    frontMatter = match[1];
    body = article.slice(match[0].length);
  }
}

const fmLine = (key) => frontMatter.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'))?.[1]?.trim() || '';
const stripQuotes = (value) => value.replace(/^['"]|['"]$/g, '').trim();
const title = stripQuotes(fmLine('title'));
const description = stripQuotes(fmLine('description'));
const dateValue = stripQuotes(fmLine('date'));
const categoriesValue = fmLine('categories');
const tagsValue = fmLine('tags');
const imagePath = stripQuotes(frontMatter.match(/^\s*path:\s*(.+)$/m)?.[1]?.trim() || '');
const imageAlt = stripQuotes(frontMatter.match(/^\s*alt:\s*(.+)$/m)?.[1]?.trim() || '');

for (const key of ['title', 'description', 'date', 'categories', 'tags', 'image']) {
  pass(new RegExp(`^${key}:`, 'm').test(frontMatter), `Missing front-matter key: ${key}`);
}
pass(title.length >= 20 && title.length <= 100, `Title length should be 20-100 characters (found ${title.length})`);
pass(description.length >= 80 && description.length <= 180, `Description length should be 80-180 characters (found ${description.length})`);
pass(Boolean(imagePath) && Boolean(imageAlt), 'image.path and image.alt are required');
const articleStem = draftPath ? path.basename(draftPath, '.md') : '';
const expectedAssetPrefix = articleStem ? `/assets/img/posts/${articleStem}/` : '';
if (expectedAssetPrefix) {
  pass(imagePath.startsWith(expectedAssetPrefix), `Hero image must be inside ${expectedAssetPrefix}`);
  const livePost = path.join(repoRoot, '_posts', path.basename(draftPath));
  const liveAssetDir = path.join(repoRoot, expectedAssetPrefix.replace(/^\//, ''));
  pass(!fs.existsSync(livePost), `Live article target already exists: ${path.relative(repoRoot, livePost)}`);
  pass(!fs.existsSync(liveAssetDir), `Live asset target already exists: ${path.relative(repoRoot, liveAssetDir)}`);
}

const parsedDate = Date.parse(dateValue);
pass(Number.isFinite(parsedDate), `Invalid front-matter date: ${dateValue || '(missing)'}`);
pass(/\+0900$/.test(dateValue), 'Automated draft date must use +0900');
if (Number.isFinite(parsedDate)) {
  pass(parsedDate < Date.now() - 60_000, `Draft date is not safely in the past: ${dateValue}`);
}
if (draftPath && manifest?.target_date) {
  const draftBasename = path.basename(draftPath);
  const expectedSlug = path.basename(draftPath, '.md').replace(/^\d{4}-\d{2}-\d{2}-/, '');
  pass(draftBasename.startsWith(`${manifest.target_date}-`), 'Draft filename does not match manifest target_date');
  pass(manifest.slug === expectedSlug, `Manifest slug does not match draft filename: ${manifest.slug} vs ${expectedSlug}`);
  pass(manifest.article_path === `_posts/${draftBasename}`, `Manifest article_path does not match draft: ${manifest.article_path}`);
  pass(manifest.asset_dir === `assets/img/posts/${articleStem}/`, `Manifest asset_dir does not match draft: ${manifest.asset_dir}`);
}

const requiredHeadings = [
  /^##\s+🤔\s+Curiosity\b/m,
  /^##\s+📚\s+Retrieve\b/m,
  /^##\s+💡\s+Innovation\b/m,
  /^##\s+🎯\s+Key Takeaways\b/m,
  /^##\s+🤔\s+New Questions\b/m,
  /^##\s+References\b/m
];
for (const heading of requiredHeadings) pass(heading.test(body), `Required persona heading missing: ${heading}`);

const hangulCount = (body.match(/[가-힣]/g) || []).length;
const latinCount = (body.match(/[A-Za-z]/g) || []).length;
const englishWordCount = (body.replace(/```[\s\S]*?```/g, ' ').match(/\b[A-Za-z0-9][A-Za-z0-9'’-]*\b/g) || []).length;
pass(latinCount >= 2500, `Draft is too short for an evidence-rich English article (${latinCount} Latin letters)`);
if (englishWordCount < 800) {
  pass(/^robots:\s*noindex, follow$/m.test(frontMatter), `Draft below 800 English words must be noindex (${englishWordCount})`);
  pass(/^sitemap:\s*false$/m.test(frontMatter), 'Sub-800-word draft must be excluded from the sitemap');
  pass(/^ads:\s*false$/m.test(frontMatter), 'Sub-800-word draft must explicitly disable ads');
}
pass(hangulCount <= Math.max(20, latinCount * 0.01), `Draft contains too much Hangul for an English article (${hangulCount} characters)`);
pass((body.match(/```/g) || []).length % 2 === 0, 'Unbalanced fenced code blocks');
warn(/```mermaid\s/i.test(body), 'No Mermaid diagram found');
warn(/^\|.+\|\s*$/m.test(body), 'No Markdown comparison/evidence table found');

const localPaths = new Set();
for (const match of article.matchAll(/(?:\(|:\s*|src=["'])(\/assets\/img\/posts\/[^)\s"']+)/g)) {
  localPaths.add(match[1]);
}
if (imagePath.startsWith('/assets/')) localPaths.add(imagePath);
pass(localPaths.size >= 1, 'No local article asset is referenced');
for (const asset of localPaths) {
  if (expectedAssetPrefix) pass(asset.startsWith(expectedAssetPrefix), `Article asset is outside its matching folder: ${asset}`);
  const packaged = path.join(current, 'draft', asset.replace(/^\//, ''));
  pass(fs.existsSync(packaged), `Referenced asset is missing from package: ${asset}`);
}

const packagedAssets = walk(path.join(current, 'draft', 'assets', 'img', 'posts'), () => true);
for (const asset of packagedAssets) {
  const publicPath = `/${path.relative(path.join(current, 'draft'), asset).split(path.sep).join('/')}`;
  pass(localPaths.has(publicPath), `Orphan package asset is not referenced: ${publicPath}`);
}

const categoryNormalized = categoriesValue.replace(/^\[|\]$/g, '').split(',').map((v) => stripQuotes(v.trim())).filter(Boolean);
const existingCategories = new Set();
for (const post of walk(path.join(repoRoot, '_posts'), (file) => file.endsWith('.md'))) {
  const prefix = fs.readFileSync(post, 'utf8').slice(0, 2500);
  const value = prefix.match(/^categories:\s*(.+)$/m)?.[1]?.trim() || '';
  for (const item of value.replace(/^\[|\]$/g, '').split(',').map((v) => stripQuotes(v.trim())).filter(Boolean)) existingCategories.add(item);
}
pass(categoryNormalized.length >= 1, 'At least one category is required');
for (const category of categoryNormalized) pass(existingCategories.has(category), `Category is not reused from the existing corpus: ${category}`);

const tags = tagsValue.replace(/^\[|\]$/g, '').split(',').map((v) => stripQuotes(v.trim())).filter(Boolean);
pass(tags.length >= 2, 'At least two tags are required');
for (const tag of tags) pass(tag === tag.toLowerCase(), `Tag must be lowercase: ${tag}`);

const internalLinks = [...body.matchAll(/\]\((\/posts\/[^)]+)\)/g)].map((match) => match[1]);
warn(internalLinks.length >= 2, `Fewer than two editorial internal links found (${internalLinks.length})`);
const externalUrls = new Set([...body.matchAll(/https?:\/\/[^)\s>]+/g)].map((match) => match[0].replace(/[.,;:]$/, '')));
pass(externalUrls.size >= 3, `At least three explicit external references are required (found ${externalUrls.size})`);

const sensitivePatterns = [
  /\/Users\/[A-Za-z0-9._-]+\//,
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  /\bsk-[A-Za-z0-9_-]{20,}\b/,
  /\bgh[pousr]_[A-Za-z0-9]{20,}\b/,
  /\bAKIA[0-9A-Z]{16}\b/
];
for (const pattern of sensitivePatterns) pass(!pattern.test(article), `Sensitive/local value matches ${pattern}`);

const evidenceFile = path.join(current, 'evidence', 'evidence-pack.json');
const evidence = fs.existsSync(evidenceFile) ? readJson(evidenceFile) : null;
pass(Boolean(evidence), 'evidence/evidence-pack.json is missing or invalid');
const sourceMapFile = path.join(current, 'evidence', 'source-map.md');
const sourceMap = fs.existsSync(sourceMapFile) ? fs.readFileSync(sourceMapFile, 'utf8').trim() : '';
pass(sourceMap.length >= 50, 'evidence/source-map.md is missing or too short');
const claims = Array.isArray(evidence) ? evidence : Array.isArray(evidence?.claims) ? evidence.claims : [];
pass(claims.length >= 1, 'Evidence pack contains no claims');
for (const [index, claim] of claims.entries()) {
  const label = claim.claim_id || index + 1;
  pass(nonempty(claim.claim_id), `Evidence claim ${label} has no claim_id`);
  pass(nonempty(claim.claim), `Evidence claim ${label} has no claim text`);
  pass(['verified', 'inferred', 'unverified'].includes(claim.verification), `Evidence claim ${label} has invalid verification state`);
  pass(isHttpUrl(claim.source_url), `Evidence claim ${label} has an invalid source_url`);
  if (claim.verification === 'verified') pass(nonempty(claim.pinned_ref) || nonempty(claim.source_version), `Verified claim ${label} has no pinned_ref or source_version`);
  pass(Number.isFinite(Date.parse(claim.retrieved_at)), `Evidence claim ${label} has invalid retrieved_at`);
  pass(nonempty(claim.quote_or_coordinate), `Evidence claim ${label} has no quote_or_coordinate`);
  pass(nonempty(claim.caveat), `Evidence claim ${label} has no explicit caveat`);
}
const claimById = new Map(claims.map((claim) => [claim.claim_id, claim]));

const claimMapFile = path.join(current, 'draft', 'claim-map.json');
const claimMap = fs.existsSync(claimMapFile) ? readJson(claimMapFile) : null;
pass(Boolean(claimMap), 'draft/claim-map.json is missing or invalid');
const mappedClaims = Array.isArray(claimMap) ? claimMap : Array.isArray(claimMap?.claims) ? claimMap.claims : [];
pass(mappedClaims.length >= 1, 'Claim map contains no material draft claims');
for (const [index, mapped] of mappedClaims.entries()) {
  const claimId = mapped.claim_id;
  const evidenceClaim = claimById.get(claimId);
  pass(Boolean(claimId), `Mapped claim ${index + 1} has no claim_id`);
  pass(Boolean(evidenceClaim), `Mapped claim has no evidence entry: ${claimId || index + 1}`);
  if (evidenceClaim) pass(evidenceClaim.verification !== 'unverified', `Draft maps an unverified assertion: ${claimId}`);
}
const verifiedPrimary = mappedClaims
  .map((mapped) => claimById.get(mapped.claim_id))
  .filter((claim) => claim?.verification === 'verified' && (claim.pinned_ref || claim.primary === true));
pass(verifiedPrimary.length >= 1, 'No mapped draft claim uses verified primary or pinned evidence');

// Source-derived reference image contract (fails closed for every package).
const sourceImageManifestFile = path.join(current, 'draft', 'source-image-manifest.json');
const sourceImageManifest = fs.existsSync(sourceImageManifestFile) ? readJson(sourceImageManifestFile) : null;
pass(fs.existsSync(sourceImageManifestFile), 'draft/source-image-manifest.json is missing; the source-image contract fails closed');
const referenceDir = articleStem
  ? path.join(current, 'draft', 'assets', 'img', 'posts', articleStem, 'references')
  : null;
const referenceFiles = referenceDir ? collectReferenceFiles(referenceDir, referencesPrefix(articleStem)) : {};
const sourceImageResult = validateSourceImageManifest({
  manifest: sourceImageManifest,
  articleBody: body,
  articleStem,
  evidenceSourceUrls: claims.map((claim) => claim?.source_url).filter(Boolean),
  referenceFiles,
  expectedRunId: manifest?.run_id,
  expectedRunStartedAt: manifest?.started_at_kst
});
for (const failure of sourceImageResult.failures) failures.push(failure);

const summaryFile = path.join(current, 'run-summary.md');
const summary = fs.existsSync(summaryFile) ? fs.readFileSync(summaryFile, 'utf8') : '';
pass(Boolean(summary), 'run-summary.md is missing');
if (stage === 'final') {
  pass(!summary.includes('Pending research.'), 'run-summary.md still contains the scaffold placeholder');
  pass(summary.includes('## Gate table'), 'run-summary.md has no gate table');
  const reviewFile = path.join(current, 'review', 'editorial-review.json');
  const review = fs.existsSync(reviewFile) ? readJson(reviewFile) : null;
  pass(Boolean(review), 'review/editorial-review.json is missing or invalid');
  if (review) {
    pass(review.verdict === 'PASS', `Independent editorial review is not PASS: ${review.verdict || 'missing'}`);
    pass(Number(review.claim_coverage) === 1, `Independent review claim coverage must be 1.0: ${review.claim_coverage}`);
    pass(nonempty(review.originality) || (review.originality && typeof review.originality === 'object'), 'Independent review has no originality finding');
    pass(nonempty(review.persona_honesty) || (review.persona_honesty && typeof review.persona_honesty === 'object'), 'Independent review has no persona_honesty finding');
    const reviewClaims = Array.isArray(review.claims) ? review.claims : [];
    const mappedIds = [...new Set(mappedClaims.map((claim) => claim.claim_id))].sort();
    const reviewIds = [...new Set(reviewClaims.map((claim) => claim.claim_id))].sort();
    pass(JSON.stringify(reviewIds) === JSON.stringify(mappedIds), `Independent review claim IDs do not exactly cover the claim map. Expected ${JSON.stringify(mappedIds)}, got ${JSON.stringify(reviewIds)}`);
    for (const [index, claim] of reviewClaims.entries()) {
      const label = claim.claim_id || index + 1;
      pass(nonempty(claim.claim_id), `Review claim ${label} has no claim_id`);
      pass(typeof claim.supported === 'boolean', `Review claim ${label} has no boolean supported field`);
      pass(nonempty(claim.evidence_ref), `Review claim ${label} has no evidence_ref`);
      if (claim.supported === false) pass(nonempty(claim.required_fix), `Unsupported review claim ${label} has no required_fix`);
      if (review.verdict === 'PASS') pass(claim.supported === true, `PASS review contains unsupported claim: ${label}`);
    }
  }
  const draftValidationFile = path.join(current, 'validation', 'draft-validation.json');
  const draftValidation = fs.existsSync(draftValidationFile) ? readJson(draftValidationFile) : null;
  pass(draftValidation?.result === 'PASS', `Draft-stage validation is missing or not PASS: ${draftValidation?.result || 'missing'}`);
  const scopeFile = path.join(current, 'validation', 'path-scope.txt');
  const scope = fs.existsSync(scopeFile) ? fs.readFileSync(scopeFile, 'utf8').trim() : '';
  pass(Boolean(scope), 'validation/path-scope.txt is missing or empty');
  if (manifest) {
    pass(['reviewing', 'ready_for_review'].includes(manifest.status), `Final validation requires reviewing/ready_for_review status, found ${manifest.status}`);
    const gateVerdicts = Object.values(manifest.gates || {}).map((gate) => typeof gate === 'string' ? gate : gate?.verdict);
    pass(gateVerdicts.length >= 1, 'Final validation requires recorded manifest gates');
    pass(gateVerdicts.every((verdict) => verdict === 'PASS'), `Final validation found a non-PASS manifest gate: ${gateVerdicts.join(', ')}`);
  }
}

const report = {
  generated_at: new Date().toISOString(),
  run_id: manifest?.run_id || null,
  stage,
  draft: draftPath ? path.relative(repoRoot, draftPath) : null,
  result: failures.length ? 'FIX' : 'PASS',
  metrics: {
    latin_letters: latinCount,
    english_words: englishWordCount,
    hangul_characters: hangulCount,
    local_assets: localPaths.size,
    packaged_assets: packagedAssets.length,
    internal_links: internalLinks.length,
    external_urls: externalUrls.size,
    evidence_claims: claims.length,
    mapped_claims: mappedClaims.length,
    verified_primary_claims: verifiedPrimary.length,
    reference_images: sourceImageResult.metrics.reference_images,
    credited_reference_images: sourceImageResult.metrics.credited_reference_images,
    total_reference_image_bytes: sourceImageResult.metrics.total_reference_image_bytes
  },
  failures,
  warnings
};
fs.mkdirSync(path.join(current, 'validation'), { recursive: true });
const reportName = stage === 'draft' ? 'draft-validation.json' : 'validation.json';
fs.writeFileSync(path.join(current, 'validation', reportName), `${JSON.stringify(report, null, 2)}\n`);

if (failures.length) {
  console.error(`Editorial package validation failed with ${failures.length} issue(s):`);
  for (const failure of failures) console.error(`- ${failure}`);
  if (warnings.length) console.error(`Warnings: ${warnings.join('; ')}`);
  process.exit(1);
}

console.log(`Editorial package ${stage} validation passed with ${warnings.length} warning(s).`);
for (const warning of warnings) console.log(`- warning: ${warning}`);
