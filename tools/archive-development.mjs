#!/usr/bin/env node
// Ledger operations for the archive development program.
//
//   node tools/archive-development.mjs status
//   node tools/archive-development.mjs next [--count 2] [--pillar <name>]
//   node tools/archive-development.mjs show <_posts/...md>
//   node tools/archive-development.mjs set <_posts/...md> --status in_progress|graduated|retired|merged|pending
//        [--developed-at YYYY-MM-DD] [--note "..."] [--merged-into _posts/...md]
//
// `set` validates the whole ledger before writing and refuses an invalid state.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateArchiveRestoration } from './lib/archive-restoration-policy.mjs';
import { validateArchiveDevelopment } from './lib/archive-development-policy.mjs';

const repoRoot = fileURLToPath(new URL('../', import.meta.url));
const ledgerPath = path.join(repoRoot, '_data', 'archive_development.json');
const restoredSources = validateArchiveRestoration(JSON.parse(fs.readFileSync(path.join(repoRoot, '_data', 'archive_restoration.json'), 'utf8'))).restoredSources;
const ledger = JSON.parse(fs.readFileSync(ledgerPath, 'utf8'));
const argv = process.argv.slice(2);
const command = argv[0];
const option = (name, fallback) => {
  const index = argv.indexOf(name);
  return index >= 0 && argv[index + 1] !== undefined ? argv[index + 1] : fallback;
};

const fail = (message) => { console.error(message); process.exit(1); };
const baseline = validateArchiveDevelopment(ledger, restoredSources);
if (baseline.errors.length) fail(`ledger is invalid:\n${baseline.errors.join('\n')}`);

if (command === 'status' || !command) {
  const counts = {};
  for (const entry of ledger.posts) counts[entry.status] = (counts[entry.status] || 0) + 1;
  console.log(JSON.stringify({ program_id: ledger.program_id, total: ledger.posts.length, ...counts }, null, 2));
  process.exit(0);
}

if (command === 'next') {
  const count = Number(option('--count', '2'));
  const pillar = option('--pillar', null);
  const candidates = ledger.posts
    .filter((entry) => entry.status === 'pending' && (!pillar || entry.pillar === pillar))
    .sort((a, b) => b.priority - a.priority || a.original_date.localeCompare(b.original_date))
    .slice(0, count);
  for (const entry of candidates) console.log(JSON.stringify(entry));
  process.exit(0);
}

const target = argv[1];
const entry = ledger.posts.find((item) => item.path === target);
if (!entry) fail(`no ledger entry for ${target}`);

if (command === 'show') {
  console.log(JSON.stringify(entry, null, 2));
  process.exit(0);
}

if (command === 'set') {
  const status = option('--status', null);
  if (!status) fail('--status is required');
  entry.status = status;
  const developedAt = option('--developed-at', null);
  if (developedAt) entry.developed_at = developedAt;
  const note = option('--note', null);
  if (note) entry.survey_note = note;
  const mergedInto = option('--merged-into', null);
  if (mergedInto) entry.merged_into = mergedInto;
  if (status === 'pending') { entry.developed_at = null; entry.survey_note = null; delete entry.merged_into; }
  const result = validateArchiveDevelopment(ledger, restoredSources);
  if (result.errors.length) fail(`refusing to write an invalid ledger:\n${result.errors.join('\n')}`);
  fs.writeFileSync(ledgerPath, JSON.stringify(ledger, null, 2) + '\n');
  console.log(`updated ${entry.path} -> ${status}`);
  process.exit(0);
}

fail(`unknown command: ${command}`);
