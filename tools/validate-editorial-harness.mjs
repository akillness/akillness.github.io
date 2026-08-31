#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const positionalRoot = process.argv.slice(2).find((arg) => !arg.startsWith('--'));
const root = path.resolve(positionalRoot || process.cwd());
const runtimeMode = process.argv.includes('--runtime');
const failures = [];
const check = (condition, message) => {
  if (!condition) failures.push(message);
};
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8');
const exists = (relative) => fs.existsSync(path.join(root, relative));

const required = [
  'CLAUDE.md',
  'AGENTS.md',
  'persona.md',
  '.claude/editorial-policy.yml',
  '.claude/agents/editorial-director.md',
  '.claude/agents/trend-researcher.md',
  '.claude/agents/source-auditor.md',
  '.claude/agents/source-audit-writer.md',
  '.claude/agents/evidence-editor.md',
  '.claude/agents/publication-validator.md',
  '.claude/skills/editorial-publishing-harness/SKILL.md',
  '.claude/skills/editorial-publishing-harness/references/artifact-contract.md',
  '.claude/skills/editorial-publishing-harness/references/quality-gates.md',
  '.claude/skills/editorial-publishing-harness/references/scheduled-runbook.md',
  '.claude/skills/editorial-publishing-harness/references/injection-defense.md',
  '.claude/skills/editorial-publishing-harness/references/trigger-evals.json',
  '.agents/skills/editorial-publishing-harness/SKILL.md',
  '.claude/skills/authority-led-monetization/SKILL.md',
  '.claude/skills/authority-led-monetization/references/video-evidence-and-policy.md',
  '.claude/skills/authority-led-monetization/references/authority-brief-schema.md',
  '.claude/skills/authority-led-monetization/references/trigger-evals.json',
  '.agents/skills/authority-led-monetization/SKILL.md',
  'tools/editorial-workspace.mjs',
  'tools/validate-editorial-package.mjs',
  'tools/verify-editorial-boundaries.mjs',
  'tools/verify-publication-scope.mjs',
  'tools/lib/source-image-manifest.mjs',
  'tools/lib/authority-brief.mjs',
  'tools/tests/source-image-manifest.test.mjs',
  'tools/tests/authority-brief.test.mjs'
];
for (const file of required) check(exists(file), `Required harness file is missing: ${file}`);

if (exists('AGENTS.md')) {
  const agents = read('AGENTS.md');
  check(agents.includes('CLAUDE.md'), 'AGENTS.md does not point to CLAUDE.md');
  check(agents.length < 2000, 'AGENTS.md should remain a short pointer, not a duplicated contract');
}

if (exists('CLAUDE.md')) {
  const contract = read('CLAUDE.md');
  for (const phrase of ['_workspace/current/', '_workspace/archive/<run-id>/', 'Source Audit', 'draft-only', 'publish-on-green', '+0900', 'git add -A', 'source-image-manifest.json']) {
    check(contract.includes(phrase), `CLAUDE.md is missing contract phrase: ${phrase}`);
  }
}

if (exists('persona.md')) {
  const persona = read('persona.md');
  check(persona.includes('# 2026 Search, Influence, and Publication Strategy'), 'persona.md lacks integrated 2026 strategy');
  check(persona.includes('Named Recurring Format: Source Audit'), 'persona.md lacks Source Audit format');
}

if (exists('.claude/editorial-policy.yml')) {
  const policy = read('.claude/editorial-policy.yml');
  const draftOnly = /^publication_mode:\s+draft-only$/m.test(policy);
  const publishOnGreen = /^publication_mode:\s+publish-on-green$/m.test(policy);
  const standingFalse = /^standing_publish_approval:\s+false$/m.test(policy);
  const standingTrue = /^standing_publish_approval:\s+true$/m.test(policy);
  check((draftOnly && standingFalse) || (publishOnGreen && standingTrue), 'Publication mode and standing approval must form a valid dual-key pair');
  check(/^schedule_local:\s+"01:00"$/m.test(policy), 'Editorial schedule is not 01:00');
  check(/^scheduler:\s+Aside cron$/m.test(policy), 'External scheduler is not documented as Aside cron');
  check(/^routine_name:\s+Daily Source Audit (?:Draft|Publish)$/m.test(policy), 'External routine name is missing');
  check(/^timezone:\s+Asia\/Seoul$/m.test(policy), 'Editorial timezone is not Asia/Seoul');
  check(/^max_revision_loops:\s+2$/m.test(policy), 'Revision loop limit must be 2');
  check(/^minimum_reference_images:\s+4$/m.test(policy), 'Policy must require at least 4 source-derived reference images');
  check(/^maximum_reference_images:\s+12$/m.test(policy), 'Policy source-image maximum count must remain 12');
  check(/^source_image_contract_effective_date:\s+"2026-09-01"$/m.test(policy), 'Source-image contract effective date drifted');
  check(/^reference_image_max_bytes:\s+5242880$/m.test(policy), 'Policy source-image maximum must stay at 5 MiB');
  check(/^reference_image_max_total_bytes:\s+20971520$/m.test(policy), 'Policy source-image aggregate maximum must stay at 20 MiB');
  check(/^reference_image_require_raster_signature:\s+true$/m.test(policy), 'Policy must require raster structure verification');
  check(/^reference_image_require_metadata_stripped:\s+true$/m.test(policy), 'Policy must require EXIF/XMP/text metadata stripping');
  check(/^reference_image_min_pixels:\s+16384$/m.test(policy), 'Policy source-image pixel floor drifted');
  check(/^reference_image_min_short_side:\s+32$/m.test(policy), 'Policy source-image short-side floor drifted');
  const expectedLicenses = ['public-domain', 'cc0', 'cc-by', 'cc-by-sa', 'kogl-type-1', 'repo-license-covers-assets', 'official-press-kit'];
  const licenseBlock = policy.match(/^reference_image_license_bases:\s*\n((?:\s+-\s*[^\n]+\n?)*)/m)?.[1] || '';
  const policyLicenses = licenseBlock.split('\n').map((line) => line.match(/^\s+-\s*(.+)$/)?.[1]?.trim()).filter(Boolean);
  check(JSON.stringify(policyLicenses) === JSON.stringify(expectedLicenses), `Policy source-image license allowlist drifted: ${JSON.stringify(policyLicenses)}`);
  if (exists('tools/lib/source-image-manifest.mjs')) {
    const helper = read('tools/lib/source-image-manifest.mjs');
    const helperConst = (name) => helper.match(new RegExp(`^export const ${name} = (.+);$`, 'm'))?.[1];
    check(helperConst('SOURCE_IMAGE_CONTRACT_EFFECTIVE_DATE') === "'2026-09-01'", 'Source-image helper effective date drifted from policy');
    check(helperConst('MINIMUM_REFERENCE_IMAGES') === '4', 'Source-image helper minimum drifted from policy');
    check(helperConst('MAXIMUM_REFERENCE_IMAGES') === '12', 'Source-image helper maximum count drifted from policy');
    check(helperConst('MAX_REFERENCE_IMAGE_BYTES') === '5 * 1024 * 1024', 'Source-image helper per-file maximum drifted from policy');
    check(helperConst('MAX_REFERENCE_IMAGE_TOTAL_BYTES') === '20 * 1024 * 1024', 'Source-image helper aggregate maximum drifted from policy');
    check(helperConst('MIN_REFERENCE_IMAGE_PIXELS') === '16_384', 'Source-image helper pixel floor drifted from policy');
    check(helperConst('MIN_REFERENCE_IMAGE_SHORT_SIDE') === '32', 'Source-image helper short-side floor drifted from policy');
    const helperLicenseBlock = helper.match(/ALLOWED_LICENSE_BASES = \[([\s\S]*?)\]/)?.[1] || '';
    const helperLicenses = [...helperLicenseBlock.matchAll(/'([^']+)'/g)].map((match) => match[1]);
    check(JSON.stringify(helperLicenses) === JSON.stringify(expectedLicenses), `Source-image helper license allowlist drifted: ${JSON.stringify(helperLicenses)}`);
    check(helper.includes('metadataSegments === 0'), 'Source-image helper no longer enforces metadata stripping');
  }
  const exactPolicyValue = (key, expected, message) => {
    const matches = [...policy.matchAll(new RegExp(`^${key}:\\s*([^\\n#]+)`, 'gm'))].map((match) => match[1].trim());
    check(matches.length === 1 && matches[0] === expected, `${message}; found ${JSON.stringify(matches)}`);
  };
  exactPolicyValue('authority_contract_version', '1', 'Authority contract version must be 1');
  exactPolicyValue('authority_brief_path', '_workspace/current/research/authority-brief.json', 'Authority brief path drifted');
  exactPolicyValue('authority_site_mode', 'expert-source-audit', 'Authority site mode drifted');
  exactPolicyValue('authority_operating_mode', 'acquisition-content', 'Authority operating mode drifted');
  exactPolicyValue('authority_primary_lane', 'seo-and-content', 'Authority primary lane drifted');
  exactPolicyValue('authority_revenue_model', 'ads-and-paid-technical-review', 'Authority revenue model drifted');
  exactPolicyValue('authority_readout_after_days', '28', 'Authority readout window drifted');
  exactPolicyValue('authority_result_status_at_publish', 'not-measured', 'Authority publish-time result status drifted');
  for (const constraint of ['no-transcript-rewrite-articles', 'no-scaled-content-automation', 'no-unverified-outcome-claims']) {
    check(new RegExp(`^\\s+-\\s*${constraint}$`, 'm').test(policy), `Policy standing constraint is missing: ${constraint}`);
  }
  if (exists('tools/lib/authority-brief.mjs')) {
    const authorityHelper = read('tools/lib/authority-brief.mjs');
    const authorityConst = (name) => authorityHelper.match(new RegExp(`^export const ${name} = (.+);$`, 'm'))?.[1];
    check(authorityConst('AUTHORITY_BRIEF_SCHEMA_VERSION') === '1', 'Authority helper schema version drifted from policy');
    check(authorityConst('AUTHORITY_SITE_MODE') === "'expert-source-audit'", 'Authority helper site mode drifted from policy');
    check(authorityConst('AUTHORITY_OPERATING_MODE') === "'acquisition-content'", 'Authority helper operating mode drifted from policy');
    check(authorityConst('AUTHORITY_PRIMARY_LANE') === "'seo-and-content'", 'Authority helper primary lane drifted from policy');
    check(authorityConst('AUTHORITY_REVENUE_MODEL') === "'ads-and-paid-technical-review'", 'Authority helper revenue model drifted from policy');
    check(authorityConst('AUTHORITY_PRIMARY_KPI') === "'work-with-me-pageviews'", 'Authority helper primary KPI drifted');
    check(authorityConst('AUTHORITY_LEADING_SIGNAL') === "'organic-search-clicks'", 'Authority helper leading signal drifted');
    check(authorityConst('AUTHORITY_READOUT_AFTER_DAYS') === '28', 'Authority helper readout window drifted from policy');
    check(authorityConst('AUTHORITY_RESULT_STATUS_AT_PUBLISH') === "'not-measured'", 'Authority helper publish-time result status drifted from policy');
  }
  if (exists('tools/validate-editorial-package.mjs')) {
    const packageValidator = read('tools/validate-editorial-package.mjs');
    check(packageValidator.includes("from './lib/authority-brief.mjs'"), 'Package validator does not import the authority-brief helper');
    check(packageValidator.includes('validateAuthorityBrief({'), 'Package validator does not call validateAuthorityBrief');
    check(packageValidator.includes('validateAuthorityReviewFindings(review)'), 'Package validator does not enforce authority review findings');
    check(packageValidator.includes("research/authority-brief.json is missing"), 'Package validator does not fail closed on a missing authority brief');
  }
}

const agentFiles = required.filter((file) => file.startsWith('.claude/agents/'));
for (const file of agentFiles) {
  if (!exists(file)) continue;
  const text = read(file);
  const frontMatter = text.match(/^---\n([\s\S]*?)\n---\n/)?.[1] || '';
  for (const key of ['name:', 'description:', 'model:', 'allowed-tools:']) {
    check(frontMatter.includes(key), `${file} front matter lacks ${key}`);
  }
  for (const section of ['## Core Responsibilities', '## Operational Principles', '## Input Protocol', '## Output Protocol', '## Error Handling', '## Team Communication']) {
    check(text.includes(section), `${file} lacks ${section}`);
  }
}

for (const file of [
  '.claude/agents/trend-researcher.md',
  '.claude/agents/source-auditor.md',
  '.claude/agents/evidence-editor.md'
]) {
  if (!exists(file)) continue;
  const tools = read(file).match(/^allowed-tools:\s*(.+)$/m)?.[1] || '';
  for (const forbidden of ['Bash', 'Write', 'Edit']) {
    check(!tools.split(',').map((tool) => tool.trim()).includes(forbidden), `${file} must remain read-only; remove ${forbidden}`);
  }
}
if (exists('.claude/agents/source-audit-writer.md')) {
  const tools = read('.claude/agents/source-audit-writer.md').match(/^allowed-tools:\s*(.+)$/m)?.[1] || '';
  for (const forbidden of ['Bash', 'WebFetch', 'WebSearch']) {
    check(!tools.split(',').map((tool) => tool.trim()).includes(forbidden), `source-audit-writer must not read untrusted web content with ${forbidden}`);
  }
}

if (exists('.claude/skills/editorial-publishing-harness/SKILL.md')) {
  const skill = read('.claude/skills/editorial-publishing-harness/SKILL.md');
  check(skill.split('\n').length <= 500, 'Harness SKILL.md exceeds 500 lines');
  check(/^name:\s+editorial-publishing-harness$/m.test(skill), 'Harness skill name is incorrect');
  check(skill.includes('producer-reviewer'), 'Harness does not describe producer-reviewer architecture');
  check(skill.includes('Maximum two'), 'Harness does not enforce bounded revision loops');
}

for (const evalFile of [
  '.claude/skills/editorial-publishing-harness/references/trigger-evals.json',
  '.claude/skills/authority-led-monetization/references/trigger-evals.json'
]) {
  if (!exists(evalFile)) continue;
  try {
    const evals = JSON.parse(read(evalFile));
    check(Array.isArray(evals.should_trigger) && evals.should_trigger.length >= 10, `${evalFile} needs at least 10 positive queries`);
    check(Array.isArray(evals.should_not_trigger) && evals.should_not_trigger.length >= 10, `${evalFile} needs at least 10 negative queries`);
  } catch (error) {
    failures.push(`Trigger eval JSON is invalid (${evalFile}): ${error.message}`);
  }
}

if (exists('.claude/skills/authority-led-monetization/SKILL.md')) {
  const authoritySkill = read('.claude/skills/authority-led-monetization/SKILL.md');
  check(/^name:\s+authority-led-monetization$/m.test(authoritySkill), 'Authority skill name is incorrect');
  const description = authoritySkill.match(/^description:\s*>-?\n((?:[ \t]+[^\n]*\n)+)/m)?.[1]?.replace(/\s+/g, ' ').trim() || '';
  check(description.length > 0 && description.length <= 1024, `Authority skill description must be folded and <=1024 characters (found ${description.length})`);
  const sections = authoritySkill.match(/^## /gm) || [];
  check(sections.length === 5, `Authority skill must have exactly five sections (found ${sections.length})`);
  for (const phrase of ['expert-source-audit', 'acquisition-content', 'seo-and-content', 'ads-and-paid-technical-review', 'research/authority-brief.json', 'not-measured', 'scaled-content', 'transcript']) {
    check(authoritySkill.includes(phrase), `Authority skill is missing contract phrase: ${phrase}`);
  }
}

if (exists('.claude/skills/editorial-publishing-harness/SKILL.md')) {
  const harnessSkill = read('.claude/skills/editorial-publishing-harness/SKILL.md');
  check(harnessSkill.includes('authority-brief.json'), 'Harness does not require the authority brief');
  check(harnessSkill.includes('authority-led-monetization'), 'Harness does not reference the authority-led-monetization skill');
}

if (exists('.gitignore')) check(/^_workspace\/$/m.test(read('.gitignore')), '.gitignore does not ignore _workspace/');
if (exists('_config.yml')) check(/^\s+- _workspace\/$/m.test(read('_config.yml')), '_config.yml does not exclude _workspace/');
if (exists('.github/workflows/pages-deploy.yml')) {
  check(read('.github/workflows/pages-deploy.yml').includes('_workspace'), 'Pages workflow artifact gate does not mention _workspace');
}

if (runtimeMode) {
  check(exists('_workspace/current'), '_workspace/current has not been scaffolded');
  check(exists('_workspace/archive'), '_workspace/archive has not been scaffolded');
}

if (failures.length) {
  console.error(`Editorial harness validation failed with ${failures.length} issue(s):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Editorial harness validation passed: ${required.length} files, ${agentFiles.length} agents, 20 trigger evals.`);
