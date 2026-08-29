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
  'tools/verify-publication-scope.mjs'
];
for (const file of required) check(exists(file), `Required harness file is missing: ${file}`);

if (exists('AGENTS.md')) {
  const agents = read('AGENTS.md');
  check(agents.includes('CLAUDE.md'), 'AGENTS.md does not point to CLAUDE.md');
  check(agents.length < 2000, 'AGENTS.md should remain a short pointer, not a duplicated contract');
}

if (exists('CLAUDE.md')) {
  const contract = read('CLAUDE.md');
  for (const phrase of ['_workspace/current/', '_workspace/archive/<run-id>/', 'Source Audit', 'draft-only', 'publish-on-green', '+0900', 'git add -A']) {
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
