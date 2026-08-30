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
  'tools/editorial-workspace.mjs',
  'tools/validate-editorial-package.mjs',
  'tools/verify-editorial-boundaries.mjs',
  'tools/verify-publication-scope.mjs',
  'tools/lib/source-image-manifest.mjs',
  'tools/tests/source-image-manifest.test.mjs'
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

if (exists('.claude/skills/editorial-publishing-harness/references/trigger-evals.json')) {
  try {
    const evals = JSON.parse(read('.claude/skills/editorial-publishing-harness/references/trigger-evals.json'));
    check(Array.isArray(evals.should_trigger) && evals.should_trigger.length >= 10, 'Trigger eval needs at least 10 positive queries');
    check(Array.isArray(evals.should_not_trigger) && evals.should_not_trigger.length >= 10, 'Trigger eval needs at least 10 negative queries');
  } catch (error) {
    failures.push(`Trigger eval JSON is invalid: ${error.message}`);
  }
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
