import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { resolvePublicationPost } from '../lib/archive-publication-path.mjs';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const PACKAGE_TOOL = path.join(REPO_ROOT, 'tools', 'validate-editorial-package.mjs');
const SCOPE_TOOL = path.join(REPO_ROOT, 'tools', 'verify-publication-scope.mjs');
const STEM = '2026-03-18-nemoclaw-safe-agents-guide';
const BASENAME = `${STEM}.md`;
const NESTED_POST = `_posts/2026/03/${BASENAME}`;
const FLAT_POST = `_posts/${BASENAME}`;
const FLAT_ARCHIVE_POST = '_posts/2026-08-16-unity-cli-atomic-agent.md';
const FLAT_ARCHIVE_STEM = path.basename(FLAT_ARCHIVE_POST, '.md');
const FLAT_ARCHIVE_ASSET_ROOT = `assets/img/posts/${FLAT_ARCHIVE_STEM}`;
const FLAT_ARCHIVE_HERO = `${FLAT_ARCHIVE_ASSET_ROOT}/nemoclaw-egress-boundary.png`;
const ASSET_ROOT = `assets/img/posts/${STEM}`;
const HERO = `${ASSET_ROOT}/nemoclaw-egress-boundary.png`;
const SOURCE_URL = 'https://docs.nvidia.com/nemoclaw/latest/user-guide/openclaw/security/best-practices';
const RUN_ID = 'normal-archive-test-run';
const EXCEPTION_RUN_ID = '20261015-0042-archive-nemoclaw-manual';
const SOURCE_REVISION = '635addccb53a4a08274d5225759377956dcea653';
const TMP_ROOT = fs.realpathSync(process.env.RUNNER_TEMP || os.tmpdir());

const env = { ...process.env, TMPDIR: '/private/tmp', TEST_NODE_MODULES: '/private/tmp/ak-archive-tests-20261014/node_modules' };
const run = (tool, root, ...args) => spawnSync(process.execPath, [tool, '--root', root, ...args], {
  cwd: REPO_ROOT,
  env,
  encoding: 'utf8',
  maxBuffer: 64 * 1024 * 1024
});
const output = (result) => `${result.stdout || ''}${result.stderr || ''}`;
const json = (root, relative) => JSON.parse(fs.readFileSync(path.join(root, relative), 'utf8'));
const writeJson = (root, relative, value) => fs.writeFileSync(path.join(root, relative), `${JSON.stringify(value, null, 2)}\n`);

function fakePng(width = 256, height = 256) {
  const bytes = Buffer.alloc(45);
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).copy(bytes, 0);
  bytes.writeUInt32BE(13, 8);
  bytes.write('IHDR', 12, 'ascii');
  bytes.writeUInt32BE(width, 16);
  bytes.writeUInt32BE(height, 20);
  bytes.write('IEND', 37, 'ascii');
  return bytes;
}

function articleBody() {
  const paragraph = 'NemoClaw boundary analysis records the tested scope, names the remaining uncertainty, and separates documentation evidence from an installation claim. ';
  const longEvidenceBody = paragraph.repeat(40);
  return [
    'NVIDIA documents a broad network boundary for sandbox binaries, while the preview remains limited to one trusted host.',
    '',
    '<figure class="explanatory-image">',
    `  <img src="/${HERO}" width="256" height="256" alt="Conceptual NemoClaw egress boundary diagram">`,
    '  <figcaption>Original illustration by Aside; not source evidence.</figcaption>',
    '</figure>',
    `[Editable SVG source](/${ASSET_ROOT}/nemoclaw-egress-boundary.svg)`,
    '',
    longEvidenceBody,
    'Read the [related audit](/posts/related-audit/) and [follow-up note](/posts/follow-up-note/) before adopting the boundary.',
    '',
    '## What does the documented egress boundary allow?',
    longEvidenceBody.slice(0, 260),
    '',
    '## Why does the single-host preview limit matter?',
    longEvidenceBody.slice(0, 260),
    '',
    '## Key Takeaways',
    'The post distinguishes a precise network grant from unsupported claims about overall safety.',
    '',
    '## New Questions',
    'Which controls should be measured before a multi-tenant deployment?',
    '',
    '## References',
    `- ${SOURCE_URL}`,
    '- https://docs.nvidia.com/nemoclaw/latest/user-guide/openclaw/about/overview',
    '- https://docs.nvidia.com/nemoclaw/latest/user-guide/openclaw/reference/platform-support'
  ].join('\n');
}

function makeBrief() {
  return {
    schema_version: 1,
    run_id: RUN_ID,
    selected_candidate_id: 'cand-nemoclaw',
    site_mode: 'expert-source-audit',
    operating_mode: 'acquisition-content',
    primary_lane: 'seo-and-content',
    audience_segment: 'Engineers operating AI agent harnesses in production',
    reader_job: 'Decide whether to adopt the audited release safely',
    content_pillar: 'ai-agents-and-harness-engineering',
    authority_basis: {
      type: 'primary-source-analysis',
      summary: 'Direct reading of pinned NVIDIA documentation behind the article claims.',
      evidence_claim_ids: ['c1']
    },
    original_contribution: {
      kind: 'implementation-audit',
      summary: 'An implementation audit of the documented network boundary and its limits.',
      evidence_claim_ids: ['c1']
    },
    ai_role: {
      research_assistance: true,
      draft_assistance: true,
      editorial_judgment_owner: 'evidence-gated-editorial-harness',
      human_review_status: 'standing-policy-approved',
      first_hand_experience_claimed: false,
      disclosure: 'This Source Audit was researched and drafted with AI assistance inside an evidence-gated editorial harness; every material claim maps to cited primary sources.'
    },
    revenue_model: 'ads-and-paid-technical-review',
    next_action: {
      type: 'related-article',
      path: '/posts/related-audit/',
      reader_value: 'Compare the same guard pattern on an earlier release.'
    },
    measurement: {
      primary_kpi: 'work-with-me-pageviews',
      leading_signal: 'organic-search-clicks',
      baseline_status: 'unmeasured',
      baseline_value: null,
      success_threshold_status: 'pending-baseline',
      success_threshold: null,
      readout_after_days: 28,
      result_status: 'not-measured'
    }
  };
}


function makeFixture({ settledSelectedEntry = false } = {}) {
  const root = fs.mkdtempSync(path.join(TMP_ROOT, 'publication-path-compat-'));
  fs.mkdirSync(path.join(root, '_workspace', 'current', 'draft', '_posts', '2026', '03'), { recursive: true });
  fs.mkdirSync(path.join(root, '_workspace', 'current', 'draft', 'assets', 'img', 'posts', STEM), { recursive: true });
  fs.mkdirSync(path.join(root, '_workspace', 'current', 'draft', 'research'), { recursive: true });
  fs.mkdirSync(path.join(root, '_workspace', 'current', 'draft', 'evidence'), { recursive: true });
  fs.mkdirSync(path.join(root, '_workspace', 'current', 'messages'), { recursive: true });
  fs.mkdirSync(path.join(root, '_workspace', 'current', 'research'), { recursive: true });
  fs.mkdirSync(path.join(root, '_workspace', 'current', 'evidence'), { recursive: true });
  fs.mkdirSync(path.join(root, '_workspace', 'current', 'validation'), { recursive: true });
  fs.mkdirSync(path.join(root, '_posts'), { recursive: true });
  fs.mkdirSync(path.join(root, '_data'), { recursive: true });
  fs.mkdirSync(path.join(root, '.claude'), { recursive: true });

  fs.copyFileSync(path.join(REPO_ROOT, '.claude', 'editorial-policy.yml'), path.join(root, '.claude', 'editorial-policy.yml'));
  for (const file of ['archive_development.json', 'archive_restoration.json']) {
    fs.copyFileSync(path.join(REPO_ROOT, '_data', file), path.join(root, '_data', file));
  }
  const developmentLedger = json(root, '_data/archive_development.json');
  const selectedEntry = developmentLedger.posts.find((entry) => entry.path === NESTED_POST);
  if (settledSelectedEntry) Object.assign(selectedEntry, {
    status: 'graduated',
    developed_at: '2026-10-14',
    survey_note: 'Settled source seed used to prove fixture normalization remains independent of the live ledger status.',
    merged_into: '_posts/2026/03/2026-03-19-nemoclaw-followup.md'
  });
  selectedEntry.status = 'pending';
  selectedEntry.developed_at = null;
  selectedEntry.survey_note = null;
  delete selectedEntry.merged_into;
  writeJson(root, '_data/archive_development.json', developmentLedger);
  fs.writeFileSync(path.join(root, '_posts', '2025-01-01-existing.md'), '---\ncategories: ["AI, Agents"]\n---\nExisting.\n');

  const hero = fakePng();
  fs.writeFileSync(path.join(root, '_workspace', 'current', 'draft', HERO), hero);
  fs.writeFileSync(path.join(root, '_workspace', 'current', 'draft', `${ASSET_ROOT}/nemoclaw-egress-boundary.svg`), '<svg xmlns="http://www.w3.org/2000/svg"><title>Boundary</title></svg>\n');
  fs.writeFileSync(path.join(root, '_workspace', 'current', 'draft', '_posts', '2026', '03', BASENAME), [
    '---',
    'published: true',
    'title: "NemoClaw boundary audit for safer agents"',
    'description: "A source-grounded audit of the NemoClaw egress boundary, preview scope, remaining controls, and questions operators should answer before adoption."',
    'categories: ["AI, Agents"]',
    'tags: [agents, nemoclaw, security]',
    'date: 2026-03-18 10:00:00 +0900',
    'permalink: /posts/nemoclaw-safe-agents-guide/',
    'restored_archive: "2026-10-12"',
    'ads: false',
    `image:\n  path: /${HERO}\n  alt: "Conceptual NemoClaw egress boundary diagram"`,
    'image_policy: source-first-fallback',
    '---',
    articleBody(),
    ''
  ].join('\n'));

  const sha = crypto.createHash('sha256').update(hero).digest('hex');
  writeJson(root, `_workspace/current/draft/source-image-manifest.json`, {
    schema_version: 1,
    run_id: RUN_ID,
    image_policy: 'source-first-fallback',
    source_first_audit: {
      report_path: 'research/image-source-audit.md',
      sha256: crypto.createHash('sha256').update(`Candidate audit report. ${SOURCE_URL}\nArchived branded imagery has unclear item-level reuse rights; an original explanatory diagram is used instead.\n`).digest('hex'),
      candidates: [{ source_page_url: SOURCE_URL, decision: 'no-usable-image', reason: 'Archived branded imagery has unclear item-level reuse rights.' }]
    },
    images: [],
    explanatory_images: [{
      local_path: HERO,
      kind: 'original',
      creator: 'Aside',
      alt: 'Conceptual NemoClaw egress boundary diagram',
      attribution_text: 'Original illustration by Aside; not source evidence.',
      sha256: sha,
      bytes: hero.length
    }]
  });
  fs.writeFileSync(path.join(root, '_workspace', 'current', 'research', 'image-source-audit.md'), `Candidate audit report. ${SOURCE_URL}\nArchived branded imagery has unclear item-level reuse rights; an original explanatory diagram is used instead.\n`);
  fs.writeFileSync(path.join(root, '_workspace', 'current', 'research', 'authority-brief.json'), `${JSON.stringify(makeBrief(), null, 2)}\n`);
  writeJson(root, '_workspace/current/manifest.json', {
    schema_version: 1,
    run_id: RUN_ID,
    started_at_kst: '2026-10-15T00:44:44+09:00',
    target_date: '2026-03-18',
    mode: 'publish-on-green',
    status: 'reviewing',
    topic: 'Deploy Safer OpenClaw Agents with NVIDIA NemoClaw',
    slug: STEM.replace(/^2026-03-18-/, ''),
    thesis: 'NemoClaw permits a broad documented egress boundary while the preview remains limited to one trusted host.',
    article_path: NESTED_POST,
    asset_dir: `${ASSET_ROOT}/`,
    revision_loops: 2,
    publication_requires_confirmation: false,
    gates: { validation: 'PASS' }
  });
  writeJson(root, '_workspace/current/tasks.json', { tasks: [{ id: 'draft', status: 'done' }] });
  writeJson(root, '_workspace/current/research/candidate-set.json', {
    candidates: [{
      candidate_id: 'cand-nemoclaw',
      url: SOURCE_URL,
      source_tier: 'primary',
      retrieved_at: '2026-10-15T00:50:00+09:00',
      why_now: 'The current preview documentation changed the operator boundary.',
      audience_fit: 'Operators need a precise adoption boundary.',
      overlap_with_existing: 'No existing audit covers this release.',
      originality_opportunity: 'Audit the exact network scope instead of repeating launch copy.',
      content_pillar: 'ai-agents-and-harness-engineering',
      selected: true
    }]
  });
  writeJson(root, '_workspace/current/research/existing-coverage.json', { checked: true });
  writeJson(root, '_workspace/current/evidence/evidence-pack.json', {
    claims: [{
      claim_id: 'c1',
      claim: 'The Personal tier permits sandbox binaries to use TCP on ports 80 and 443.',
      verification: 'verified',
      source_url: SOURCE_URL,
      pinned_ref: 'docs-2026-03-16',
      retrieved_at: '2026-10-15T00:50:00+09:00',
      quote_or_coordinate: 'security guide: Personal tier egress section',
      caveat: 'This is a documentation audit, not a live installation test.',
      primary: true
    }]
  });
  fs.writeFileSync(path.join(root, '_workspace', 'current', 'evidence', 'source-map.md'), `# Source map\n\nThe claim is pinned to the NVIDIA security guide at ${SOURCE_URL}.\n`);
  writeJson(root, '_workspace/current/draft/claim-map.json', { claims: [{ claim_id: 'c1' }] });
  fs.writeFileSync(path.join(root, '_workspace', 'current', 'run-summary.md'), 'A complete source-grounded package is ready for validation.\n');
  fs.writeFileSync(path.join(root, '_workspace', 'current', 'validation', 'draft-validation.json'), '{"result":"PASS"}\n');
  return root;
}

function updateManifest(root, changes) {
  const manifest = json(root, '_workspace/current/manifest.json');
  Object.assign(manifest, changes);
  writeJson(root, '_workspace/current/manifest.json', manifest);
}
function updateLedger(root, mutate) {
  const ledger = json(root, '_data/archive_development.json');
  mutate(ledger.posts.find((entry) => entry.path === NESTED_POST), ledger);
  writeJson(root, '_data/archive_development.json', ledger);
}
function updateFlatLedger(root, mutate) {
  const ledger = json(root, '_data/archive_development.json');
  mutate(ledger.posts.find((entry) => entry.path === FLAT_ARCHIVE_POST), ledger);
  writeJson(root, '_data/archive_development.json', ledger);
}

function flatDraft(root) {
  const nested = path.join(root, '_workspace/current/draft', NESTED_POST);
  const flat = path.join(root, '_workspace/current/draft', FLAT_POST);
  fs.mkdirSync(path.dirname(flat), { recursive: true });
  fs.renameSync(nested, flat);
  updateManifest(root, { article_path: FLAT_POST, asset_dir: `${ASSET_ROOT}/` });
}
function flatArchiveFixture() {
  const root = makeFixture();
  const nestedDraft = path.join(root, '_workspace/current/draft', NESTED_POST);
  const flatDraftPath = path.join(root, '_workspace/current/draft', FLAT_ARCHIVE_POST);
  fs.mkdirSync(path.dirname(flatDraftPath), { recursive: true });
  fs.renameSync(nestedDraft, flatDraftPath);
  fs.renameSync(
    path.join(root, '_workspace/current/draft', ASSET_ROOT),
    path.join(root, '_workspace/current/draft', FLAT_ARCHIVE_ASSET_ROOT)
  );

  const article = fs.readFileSync(flatDraftPath, 'utf8')
    .split(STEM).join(FLAT_ARCHIVE_STEM)
    .replace('date: 2026-03-18 10:00:00 +0900', 'date: 2026-08-16 10:00:00 +0900');
  fs.writeFileSync(flatDraftPath, article);
  const manifest = json(root, '_workspace/current/manifest.json');
  Object.assign(manifest, {
    target_date: '2026-08-16',
    slug: FLAT_ARCHIVE_STEM.replace(/^\d{4}-\d{2}-\d{2}-/, ''),
    article_path: FLAT_ARCHIVE_POST,
    asset_dir: `${FLAT_ARCHIVE_ASSET_ROOT}/`
  });
  writeJson(root, '_workspace/current/manifest.json', manifest);
  const imageManifest = json(root, '_workspace/current/draft/source-image-manifest.json');
  imageManifest.explanatory_images[0].local_path = FLAT_ARCHIVE_HERO;
  writeJson(root, '_workspace/current/draft/source-image-manifest.json', imageManifest);
  updateFlatLedger(root, (entry) => {
    entry.status = 'pending';
    entry.developed_at = null;
    entry.survey_note = null;
    delete entry.merged_into;
  });
  return root;
}

function installLiveFlatArchiveTargets(root) {
  const draftRoot = path.join(root, '_workspace/current/draft');
  const livePost = path.join(root, FLAT_ARCHIVE_POST);
  const liveAssets = path.join(root, FLAT_ARCHIVE_ASSET_ROOT);
  fs.mkdirSync(path.dirname(livePost), { recursive: true });
  fs.mkdirSync(liveAssets, { recursive: true });
  fs.copyFileSync(path.join(draftRoot, FLAT_ARCHIVE_POST), livePost);
  for (const file of ['nemoclaw-egress-boundary.png', 'nemoclaw-egress-boundary.svg']) {
    fs.copyFileSync(path.join(draftRoot, FLAT_ARCHIVE_ASSET_ROOT, file), path.join(liveAssets, file));
  }
}
function graduateFlat(root) {
  const post = path.join(root, '_workspace/current/draft', FLAT_ARCHIVE_POST);
  const rewritten = fs.readFileSync(post, 'utf8')
    .replace('restored_archive: "2026-10-12"\n', 'archive_developed: 2026-10-15\nlast_modified_at: "2026-10-15 02:00:00 +0900"\n')
    .replace('ads: false\n', '');
  fs.writeFileSync(post, rewritten);
  updateFlatLedger(root, (entry) => {
    entry.status = 'graduated';
    entry.developed_at = '2026-10-15';
    entry.survey_note = 'Re-read the current Unity CLI and Atomic Agent documentation; rebuilt this source audit around the exact automation boundary and its remaining editor limits.';
  });
}

function stagedFlatFixture() {
  const root = flatArchiveFixture();
  fs.mkdirSync(path.join(root, 'tools'), { recursive: true });
  fs.writeFileSync(path.join(root, 'tools/existing.mjs'), 'export const existing = true;\n');
  git(root, ['init', '-q']);
  git(root, ['config', 'user.email', 'tests@example.invalid']);
  git(root, ['config', 'user.name', 'Publication path tests']);
  git(root, ['config', 'diff.renames', 'true']);
  git(root, ['add', '_data/archive_development.json', 'tools/existing.mjs']);
  git(root, ['commit', '-qm', 'baseline flat archive ledger and tool']);
  graduateFlat(root);
  installLiveFlatArchiveTargets(root);
  fs.writeFileSync(path.join(root, '_workspace/current/validation/path-scope.txt'), `${expectedFlatPackageScope().join('\n')}\n`);
  git(root, ['add', FLAT_ARCHIVE_POST, `${FLAT_ARCHIVE_ASSET_ROOT}/nemoclaw-egress-boundary.png`, `${FLAT_ARCHIVE_ASSET_ROOT}/nemoclaw-egress-boundary.svg`, '_data/archive_development.json']);
  return root;
}

function resolveFlat(root) {
  const draftRoot = path.join(root, '_workspace/current/draft');
  return resolvePublicationPost({
    repoRoot: root,
    draftRoot,
    draftPath: path.join(draftRoot, FLAT_ARCHIVE_POST),
    manifest: json(root, '_workspace/current/manifest.json')
  });
}

function expectedFlatPackageScope() {
  return [
    FLAT_ARCHIVE_POST,
    `${FLAT_ARCHIVE_ASSET_ROOT}/nemoclaw-egress-boundary.png`,
    `${FLAT_ARCHIVE_ASSET_ROOT}/nemoclaw-egress-boundary.svg`,
    '_data/archive_development.json'
  ].sort();
}

function expectedPackageScope() {
  return [NESTED_POST, `${ASSET_ROOT}/nemoclaw-egress-boundary.png`, `${ASSET_ROOT}/nemoclaw-egress-boundary.svg`, '_data/archive_development.json'].sort();
}
function graduate(root) {
  const post = path.join(root, '_workspace/current/draft', NESTED_POST);
  const rewritten = fs.readFileSync(post, 'utf8')
    .replace('restored_archive: "2026-10-12"\n', 'archive_developed: 2026-10-15\nlast_modified_at: "2026-10-15 02:00:00 +0900"\n')
    .replace('ads: false\n', '');
  fs.writeFileSync(post, rewritten);
  updateLedger(root, (entry) => {
    entry.status = 'graduated';
    entry.developed_at = '2026-10-15';
    entry.survey_note = 'Re-read the current NVIDIA security, overview, platform, prerequisite, and quickstart documentation; rebuilt this source audit around the exact egress grant and its one-host preview limits.';
  });
}

function git(root, args) {
  const result = spawnSync('git', args, { cwd: root, env, encoding: 'utf8' });
  assert.equal(result.status, 0, `git ${args.join(' ')} failed: ${output(result)}`);
}

function stagedFixture({ settledSelectedEntry = false, baselineExtraPath = null } = {}) {
  const root = makeFixture({ settledSelectedEntry });
  fs.mkdirSync(path.join(root, 'tools'), { recursive: true });
  fs.writeFileSync(path.join(root, 'tools/existing.mjs'), 'export const existing = true;\n');
  if (baselineExtraPath) {
    const baselineExtra = path.join(root, baselineExtraPath);
    fs.mkdirSync(path.dirname(baselineExtra), { recursive: true });
    fs.copyFileSync(path.join(root, `_workspace/current/draft/${HERO}`), baselineExtra);
  }
  git(root, ['init', '-q']);
  git(root, ['config', 'user.email', 'tests@example.invalid']);
  git(root, ['config', 'user.name', 'Publication path tests']);
  git(root, ['config', 'diff.renames', 'true']);
  git(root, ['add', '_data/archive_development.json', 'tools/existing.mjs', ...(baselineExtraPath ? [baselineExtraPath] : [])]);
  git(root, ['commit', '-qm', 'baseline ledger and tool']);
  graduate(root);
  const livePost = path.join(root, '_posts', '2026', '03', BASENAME);
  const liveAssets = path.join(root, 'assets', 'img', 'posts', STEM);
  fs.mkdirSync(path.dirname(livePost), { recursive: true });
  fs.mkdirSync(liveAssets, { recursive: true });
  fs.copyFileSync(path.join(root, '_workspace/current/draft', NESTED_POST), livePost);
  for (const file of ['nemoclaw-egress-boundary.png', 'nemoclaw-egress-boundary.svg']) {
    fs.copyFileSync(path.join(root, `_workspace/current/draft/${ASSET_ROOT}/${file}`), path.join(liveAssets, file));
  }
  fs.writeFileSync(path.join(root, '_workspace/current/validation/path-scope.txt'), [
    NESTED_POST,
    `${ASSET_ROOT}/nemoclaw-egress-boundary.png`,
    `${ASSET_ROOT}/nemoclaw-egress-boundary.svg`,
    '_data/archive_development.json'
  ].sort().join('\n') + '\n');
  git(root, ['add', NESTED_POST, `${ASSET_ROOT}/nemoclaw-egress-boundary.png`, `${ASSET_ROOT}/nemoclaw-egress-boundary.svg`, '_data/archive_development.json']);
  return root;
}

test('staged scope rejects a tracked rename into the selected asset', () => {
  const root = stagedFixture({ baselineExtraPath: 'tools/preserved.png' });
  try {
    const preserved = path.join(root, 'tools/preserved.png');
    fs.rmSync(preserved);
    git(root, ['add', '-A', 'tools/preserved.png']);

    const nameStatus = spawnSync('git', ['diff', '--cached', '--name-status'], { cwd: root, env, encoding: 'utf8' });
    assert.equal(nameStatus.status, 0, output(nameStatus));
    assert.ok(output(nameStatus).split('\n').includes(`R100\ttools/preserved.png\t${HERO}`));

    const nameOnly = spawnSync('git', ['diff', '--cached', '--name-only'], { cwd: root, env, encoding: 'utf8' });
    assert.equal(nameOnly.status, 0, output(nameOnly));
    const stagedNames = nameOnly.stdout.split('\n').filter(Boolean);
    assert.ok(stagedNames.includes(HERO));
    assert.ok(!stagedNames.includes('tools/preserved.png'));

    const result = run(SCOPE_TOOL, root, '--staged');
    assert.notEqual(result.status, 0, output(result));
  } finally { removeFixture(root); }
});

function removeFixture(root) {
  fs.rmSync(root, { recursive: true, force: true });
}

 test('accepts a ledger-bound nested archive package and records the exact nested allowlist', () => {
  const root = makeFixture();
  try {
    const packageResult = run(PACKAGE_TOOL, root, '--stage', 'draft');
    assert.equal(packageResult.status, 0, output(packageResult));
    const scopeResult = run(SCOPE_TOOL, root);
    assert.equal(scopeResult.status, 0, output(scopeResult));
    assert.deepEqual(fs.readFileSync(path.join(root, '_workspace/current/validation/path-scope.txt'), 'utf8').trim().split('\n'), expectedPackageScope());
  } finally { removeFixture(root); }
});

test('rejects an ordinary future revision 3 without the owner exception', () => {
  const root = makeFixture();
  try {
    updateManifest(root, { revision_loops: 3 });
    const result = run(PACKAGE_TOOL, root, '--stage', 'draft');
    assert.notEqual(result.status, 0, output(result));
    assert.match(output(result), /revision budget/);
  } finally { removeFixture(root); }
});

test('rejects the exact owner run/post/proof when required evidence is missing', () => {
  const root = makeFixture();
  try {
    updateManifest(root, { run_id: EXCEPTION_RUN_ID, revision_loops: 3, owner_revision_exception_proof: 'review/owner-b1-revision-proof.json' });
    const result = run(PACKAGE_TOOL, root, '--stage', 'draft');
    assert.notEqual(result.status, 0, output(result));
    assert.match(output(result), /Cannot verify the scoped owner revision exception|revision budget/);
  } finally { removeFixture(root); }
});

test('rejects a symlinked fixed history artifact before reading it', () => {
  const root = makeFixture();
  try {
    updateManifest(root, { run_id: EXCEPTION_RUN_ID, revision_loops: 3, owner_revision_exception_proof: 'review/owner-b1-revision-proof.json' });
    const history = path.join(root, '_workspace/current/review/history/before-owner-approved-b1-revision');
    fs.mkdirSync(history, { recursive: true });
    fs.symlinkSync(path.join(root, '_workspace/current/manifest.json'), path.join(history, 'manifest.json'));
    const result = run(PACKAGE_TOOL, root, '--stage', 'draft');
    assert.notEqual(result.status, 0, output(result));
    assert.match(output(result), /Forbidden symlink or inaccessible publication path/);
  } finally { removeFixture(root); }
});


test('derives nested package scope instead of flattening the selected post', () => {
  const root = makeFixture();
  try {
    const result = run(SCOPE_TOOL, root);
    assert.equal(result.status, 0, output(result));
    assert.deepEqual(fs.readFileSync(path.join(root, '_workspace/current/validation/path-scope.txt'), 'utf8').trim().split('\n'), expectedPackageScope());
  } finally { removeFixture(root); }
});
test('binds an eligible restored flat ledger post as archive', () => {
  const root = flatArchiveFixture();
  try {
    const draftRoot = path.join(root, '_workspace/current/draft');
    const resolved = resolvePublicationPost({
      repoRoot: root,
      draftRoot,
      draftPath: path.join(draftRoot, FLAT_ARCHIVE_POST),
      manifest: json(root, '_workspace/current/manifest.json')
    });
    assert.deepEqual(resolved.errors, []);
    assert.ok(resolved.archive, 'eligible restored flat post must bind to archive metadata');
    assert.equal(resolved.archive.entry.path, FLAT_ARCHIVE_POST);
    assert.equal(resolved.archive.entry.original_date, '2026-08-16');
  } finally { removeFixture(root); }
});

test('both publication CLI gates accept existing live targets for a bound flat archive post', () => {
  const root = flatArchiveFixture();
  try {
    installLiveFlatArchiveTargets(root);
    const packageResult = run(PACKAGE_TOOL, root, '--stage', 'draft');
    assert.equal(packageResult.status, 0, output(packageResult));
    const scopeResult = run(SCOPE_TOOL, root);
    assert.equal(scopeResult.status, 0, output(scopeResult));
    assert.deepEqual(
      fs.readFileSync(path.join(root, '_workspace/current/validation/path-scope.txt'), 'utf8').trim().split('\n'),
      expectedFlatPackageScope()
    );
  } finally { removeFixture(root); }
});
for (const [label, mutate] of [
  ['missing ledger', (root) => fs.rmSync(path.join(root, '_data/archive_development.json'))],
  ['invalid JSON ledger', (root) => fs.writeFileSync(path.join(root, '_data/archive_development.json'), '{not-json\n')],
  ['ledger without posts', (root) => {
    const ledger = json(root, '_data/archive_development.json');
    delete ledger.posts;
    writeJson(root, '_data/archive_development.json', ledger);
  }],
  ['ledger with non-array posts', (root) => {
    const ledger = json(root, '_data/archive_development.json');
    ledger.posts = {};
    writeJson(root, '_data/archive_development.json', ledger);
  }]
]) {
  test(`keeps an ordinary flat draft neutral with ${label}`, () => {
    const root = makeFixture();
    try {
      flatDraft(root);
      mutate(root);
      const resolved = resolvePublicationPost({
        repoRoot: root,
        draftRoot: path.join(root, '_workspace/current/draft'),
        draftPath: path.join(root, '_workspace/current/draft', FLAT_POST),
        manifest: json(root, '_workspace/current/manifest.json')
      });
      assert.deepEqual(resolved.errors, []);
      assert.equal(resolved.archive, null);
      const packageResult = run(PACKAGE_TOOL, root, '--stage', 'draft');
      assert.equal(packageResult.status, 0, output(packageResult));
      fs.writeFileSync(path.join(root, '_posts', BASENAME), '---\ntitle: existing\n---\n');
      const collision = run(PACKAGE_TOOL, root, '--stage', 'draft');
      assert.notEqual(collision.status, 0, output(collision));
      assert.match(output(collision), /Live article target already exists/);
    } finally { removeFixture(root); }
  });
}

test('rejects a symlinked ambient ledger before flat archive neutral fallback', () => {
  const root = makeFixture();
  try {
    flatDraft(root);
    const ledger = path.join(root, '_data/archive_development.json');
    fs.renameSync(ledger, `${ledger}.real`);
    fs.symlinkSync(`${ledger}.real`, ledger);
    const resolved = resolvePublicationPost({
      repoRoot: root,
      draftRoot: path.join(root, '_workspace/current/draft'),
      draftPath: path.join(root, '_workspace/current/draft', FLAT_POST),
      manifest: json(root, '_workspace/current/manifest.json')
    });
    assert.equal(resolved.archive, null);
    assert.deepEqual(resolved.errors, [`Forbidden symlink or inaccessible publication path: ${ledger}`]);
  } finally { removeFixture(root); }
});

test('fails closed when an eligible flat ledger entry is duplicated', () => {
  const root = flatArchiveFixture();
  try {
    updateFlatLedger(root, (entry, ledger) => { ledger.posts.push({ ...entry }); });
    const resolved = resolveFlat(root);
    assert.equal(resolved.archive, null);
    assert.match(resolved.errors.join('\n'), /duplicate ledger entry/);
  } finally { removeFixture(root); }
});

test('fails closed when a matching flat ledger has malformed restoration data', () => {
  const root = flatArchiveFixture();
  try {
    fs.writeFileSync(path.join(root, '_data/archive_restoration.json'), '{not-json\n');
    const resolved = resolveFlat(root);
    assert.equal(resolved.archive, null);
    assert.match(resolved.errors.join('\n'), /Cannot bind publication to the archive ledger/);
  } finally { removeFixture(root); }
});

test('staged scope accepts a graduated flat archive entry and matching live targets', () => {
  const root = stagedFlatFixture();
  try {
    const result = run(SCOPE_TOOL, root, '--staged');
    assert.equal(result.status, 0, output(result));
  } finally { removeFixture(root); }
});

test('staged scope rejects an unrelated change beside a flat archive graduation', () => {
  const root = stagedFlatFixture();
  try {
    const ledger = json(root, '_data/archive_development.json');
    const other = ledger.posts.find((entry) => entry.path !== FLAT_ARCHIVE_POST);
    other.title = `${other.title} tampered`;
    writeJson(root, '_data/archive_development.json', ledger);
    git(root, ['add', '_data/archive_development.json']);
    const result = run(SCOPE_TOOL, root, '--staged');
    assert.notEqual(result.status, 0, output(result));
    assert.match(output(result), /unrelated entry or program metadata/);
  } finally { removeFixture(root); }
});
for (const [label, mutate, expectedMessage] of [
  ['restoration identity drift', (root) => updateFlatLedger(root, (_entry, ledger) => { ledger.source_restoration_id = 'other-restoration'; }), /approved restoration/],
  ['ineligible ledger entry', (root) => updateFlatLedger(root, (entry) => {
    entry.status = 'retired';
    entry.developed_at = '2026-10-15';
    entry.survey_note = 'This entry is intentionally ineligible for the publication graduation path in this regression control.';
  }), /not eligible for graduation/],
  ['ledger date drift', (root) => updateFlatLedger(root, (entry) => { entry.original_date = '2026-08-17'; }), /original date does not match/]
]) {
  test(`rejects flat archive ${label}`, () => {
    const root = flatArchiveFixture();
    try {
      mutate(root);
      const draftRoot = path.join(root, '_workspace/current/draft');
      const resolved = resolvePublicationPost({
        repoRoot: root,
        draftRoot,
        draftPath: path.join(draftRoot, FLAT_ARCHIVE_POST),
        manifest: json(root, '_workspace/current/manifest.json')
      });
      assert.notEqual(resolved.errors.length, 0);
      assert.equal(resolved.archive, null);
      assert.match(resolved.errors.join('\n'), expectedMessage);
    } finally { removeFixture(root); }
  });
}
test('keeps ordinary flat-post acceptance and rejects its existing live collision', () => {
  const root = makeFixture();
  try {
    flatDraft(root);
    const packageResult = run(PACKAGE_TOOL, root, '--stage', 'draft');
    assert.equal(packageResult.status, 0, output(packageResult));
    const scopeResult = run(SCOPE_TOOL, root);
    assert.equal(scopeResult.status, 0, output(scopeResult));
    fs.mkdirSync(path.join(root, '_posts'), { recursive: true });
    fs.writeFileSync(path.join(root, '_posts', BASENAME), '---\ntitle: existing\n---\n');
    const collision = run(PACKAGE_TOOL, root, '--stage', 'draft');
    assert.notEqual(collision.status, 0);
    assert.match(output(collision), /Live article target already exists/);
  } finally { removeFixture(root); }
});


for (const [label, articlePath] of [
  ['dot-segment', `_posts/2026/03/./${BASENAME}`],
  ['traversal', `_posts/2026/03/../${BASENAME}`],
  ['absolute', `/tmp/${BASENAME}`],
  ['backslash', `_posts\\2026\\03\\${BASENAME}`],
  ['noncanonical', `_posts/2026/03/not-the-selected-post.md`]
]) {
  test(`rejects ${label} manifest paths`, () => {
    const root = makeFixture();
    try {
      updateManifest(root, { article_path: articlePath });
      const result = run(PACKAGE_TOOL, root, '--stage', 'draft');
      assert.notEqual(result.status, 0, output(result));
    } finally { removeFixture(root); }
  });
}

test('rejects a manifest whose selected nested path is not the actual draft', () => {
  const root = makeFixture();
  try {
    updateManifest(root, { article_path: '_posts/2026/03/2026-03-18-other.md' });
    const result = run(PACKAGE_TOOL, root, '--stage', 'draft');
    assert.notEqual(result.status, 0);
    assert.match(output(result), /article_path/);
  } finally { removeFixture(root); }
});

for (const [label, setup] of [
  ['post symlink', (root) => {
    const post = path.join(root, '_workspace/current/draft', NESTED_POST);
    fs.renameSync(post, `${post}.real`);
    fs.symlinkSync(`${post}.real`, post);
  }],
  ['ancestor symlink', (root) => {
    const posts = path.join(root, '_workspace/current/draft/_posts');
    fs.renameSync(path.join(posts, '2026'), `${posts}/2026-real`);
    fs.symlinkSync(`${posts}/2026-real`, `${posts}/2026`);
  }]
]) {
  test(`rejects ${label} in both validators`, () => {
    const root = makeFixture();
    try {
      setup(root);
      const packageResult = run(PACKAGE_TOOL, root, '--stage', 'draft');
      const scopeResult = run(SCOPE_TOOL, root);
      assert.notEqual(packageResult.status, 0, output(packageResult));
      assert.notEqual(scopeResult.status, 0, output(scopeResult));
    } finally { removeFixture(root); }
  });
}

test('rejects a nested draft when its path is absent from the archive ledger', () => {
  const root = makeFixture();
  try {
    updateLedger(root, (_entry, ledger) => { ledger.posts = ledger.posts.filter((entry) => entry.path !== NESTED_POST); });
    const result = run(PACKAGE_TOOL, root, '--stage', 'draft');
    assert.notEqual(result.status, 0, output(result));
  } finally { removeFixture(root); }
});

for (const [label, mutate] of [
  ['restoration binding drift', (root) => updateLedger(root, (_entry, ledger) => { ledger.source_restoration_id = 'other-restoration'; })],
  ['ambiguous duplicate ledger binding', (root) => updateLedger(root, (entry, ledger) => { ledger.posts.push({ ...entry }); })]
]) {
  test(`rejects ${label}`, () => {
    const root = makeFixture();
    try {
      mutate(root);
      const result = run(PACKAGE_TOOL, root, '--stage', 'draft');
      assert.notEqual(result.status, 0, output(result));
    } finally { removeFixture(root); }
  });
}

test('staged scope accepts only the selected nested post, matching assets, and one authorized ledger update', () => {
  const root = stagedFixture();
  try {
    const result = run(SCOPE_TOOL, root, '--staged');
    assert.equal(result.status, 0, output(result));
  } finally { removeFixture(root); }
});

test('staged scope re-seeds a settled selected entry before graduation', () => {
  const root = stagedFixture({ settledSelectedEntry: true });
  try {
    const result = run(SCOPE_TOOL, root, '--staged');
    assert.equal(result.status, 0, output(result));
    const selectedEntry = json(root, '_data/archive_development.json').posts.find((entry) => entry.path === NESTED_POST);
    assert.equal(selectedEntry.merged_into, undefined);
  } finally { removeFixture(root); }
});

test('staged scope rejects an unrelated tracked regular-file to symlink type change', () => {
  const root = stagedFixture();
  try {
    const file = path.join(root, 'tools/existing.mjs');
    fs.rmSync(file);
    fs.symlinkSync(path.join(root, '_workspace/current/draft', NESTED_POST), file);
    git(root, ['add', '-A', 'tools/existing.mjs']);
    const result = run(SCOPE_TOOL, root, '--staged');
    assert.notEqual(result.status, 0, output(result));
  } finally { removeFixture(root); }
});

for (const [label, relative] of [
  ['nested post', NESTED_POST],
  ['matching asset', `${ASSET_ROOT}/nemoclaw-egress-boundary.png`],
  ['archive ledger', '_data/archive_development.json']
]) {
  test(`staged scope rejects executable mode on the selected ${label}`, () => {
    const root = stagedFixture();
    try {
      git(root, ['update-index', '--chmod=+x', relative]);
      const result = run(SCOPE_TOOL, root, '--staged');
      assert.notEqual(result.status, 0, output(result));
    } finally { removeFixture(root); }
  });
}

for (const [label, relative] of [
  ['unrelated post', '_posts/2026-01-01-unrelated.md'],
  ['unrelated tool', 'tools/unrelated.mjs'],
  ['unrelated asset', 'assets/img/posts/other-post/unrelated.png'],
  ['unrelated ledger entry', '_data/archive_development.json']
]) {
  test(`staged scope rejects ${label}`, () => {
    const root = stagedFixture();
    try {
      if (relative === '_data/archive_development.json') {
        const ledger = json(root, '_data/archive_development.json');
        const other = ledger.posts.find((entry) => entry.path !== NESTED_POST);
        other.title = `${other.title} tampered`;
        writeJson(root, '_data/archive_development.json', ledger);
      } else {
        fs.mkdirSync(path.dirname(path.join(root, relative)), { recursive: true });
        fs.writeFileSync(path.join(root, relative), 'unrelated\n');
      }
      git(root, ['add', relative]);
      const result = run(SCOPE_TOOL, root, '--staged');
      assert.notEqual(result.status, 0, output(result));
    } finally { removeFixture(root); }
  });
}
