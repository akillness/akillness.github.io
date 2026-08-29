#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';

const args = process.argv.slice(2);
const command = args.shift() || 'status';
const options = new Map();
for (let i = 0; i < args.length; i += 1) {
  const arg = args[i];
  if (!arg.startsWith('--')) throw new Error(`Unexpected argument: ${arg}`);
  const key = arg.slice(2);
  const next = args[i + 1];
  if (!next || next.startsWith('--')) options.set(key, true);
  else {
    options.set(key, next);
    i += 1;
  }
}

const repoRoot = path.resolve(String(options.get('root') || process.cwd()));
const workspaceRoot = path.join(repoRoot, '_workspace');
const currentDir = path.join(workspaceRoot, 'current');
const archiveDir = path.join(workspaceRoot, 'archive');
const lanes = ['research', 'evidence', 'draft', 'review', 'validation', 'messages'];
const manifestPath = path.join(currentDir, 'manifest.json');

function kstParts(date = new Date()) {
  const shifted = new Date(date.getTime() + 9 * 60 * 60 * 1000);
  const pad = (value) => String(value).padStart(2, '0');
  return {
    year: shifted.getUTCFullYear(),
    month: pad(shifted.getUTCMonth() + 1),
    day: pad(shifted.getUTCDate()),
    hour: pad(shifted.getUTCHours()),
    minute: pad(shifted.getUTCMinutes()),
    second: pad(shifted.getUTCSeconds())
  };
}

function kstIso(date = new Date()) {
  const p = kstParts(date);
  return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}:${p.second}+09:00`;
}

function safePostDate(minutes = 60) {
  if (!Number.isFinite(minutes) || minutes < 1 || minutes > 24 * 60) {
    throw new Error(`Safety margin must be 1..1440 minutes, received ${minutes}`);
  }
  const p = kstParts(new Date(Date.now() - minutes * 60 * 1000));
  return `${p.year}-${p.month}-${p.day} ${p.hour}:${p.minute}:${p.second} +0900`;
}

function ensureBase() {
  fs.mkdirSync(workspaceRoot, { recursive: true });
  fs.mkdirSync(archiveDir, { recursive: true });
}

function readManifest() {
  if (!fs.existsSync(manifestPath)) return null;
  return JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
}

function uniqueArchivePath(runId) {
  let candidate = path.join(archiveDir, runId);
  let suffix = 2;
  while (fs.existsSync(candidate)) {
    candidate = path.join(archiveDir, `${runId}-${suffix}`);
    suffix += 1;
  }
  return candidate;
}

function archiveInventory(dir) {
  const files = [];
  const visit = (current) => {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      if (entry.name === 'archive-manifest.json') continue;
      const full = path.join(current, entry.name);
      if (entry.isSymbolicLink()) throw new Error(`Archive contains a forbidden symlink: ${full}`);
      if (entry.isDirectory()) visit(full);
      else if (entry.isFile()) {
        const bytes = fs.readFileSync(full);
        files.push({
          path: path.relative(dir, full).split(path.sep).join('/'),
          bytes: bytes.length,
          sha256: createHash('sha256').update(bytes).digest('hex')
        });
      }
    }
  };
  visit(dir);
  return files.sort((a, b) => a.path.localeCompare(b.path));
}

function sealArchive(dir, runId) {
  const seal = {
    schema_version: 1,
    run_id: runId,
    sealed_at_kst: kstIso(),
    algorithm: 'sha256',
    files: archiveInventory(dir)
  };
  fs.writeFileSync(path.join(dir, 'archive-manifest.json'), `${JSON.stringify(seal, null, 2)}\n`);
  return seal;
}

function verifyArchives() {
  ensureBase();
  const results = [];
  for (const entry of fs.readdirSync(archiveDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const dir = path.join(archiveDir, entry.name);
    const sealPath = path.join(dir, 'archive-manifest.json');
    if (!fs.existsSync(sealPath)) throw new Error(`Archive is not sealed: ${entry.name}`);
    const seal = JSON.parse(fs.readFileSync(sealPath, 'utf8'));
    const actual = archiveInventory(dir);
    if (JSON.stringify(actual) !== JSON.stringify(seal.files)) {
      throw new Error(`Archive integrity check failed: ${entry.name}`);
    }
    results.push({ run_id: entry.name, files: actual.length, verified: true });
  }
  return results;
}

function archiveCurrent(reason = 'superseded') {
  ensureBase();
  if (!fs.existsSync(currentDir)) return null;
  const entries = fs.readdirSync(currentDir);
  if (entries.length === 0) {
    fs.rmSync(currentDir, { recursive: true, force: true });
    return null;
  }

  const manifest = readManifest() || {};
  const p = kstParts();
  const fallback = `${p.year}${p.month}${p.day}-${p.hour}${p.minute}-unlabeled`;
  const runId = String(manifest.run_id || fallback).replace(/[^a-zA-Z0-9._-]+/g, '-');
  const destination = uniqueArchivePath(runId);

  if (!['published', 'ready_for_review', 'rejected', 'blocked'].includes(manifest.status)) {
    manifest.status = 'superseded';
    manifest.archive_reason = reason;
    manifest.closed_at_kst = kstIso();
    fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  }

  fs.renameSync(currentDir, destination);
  fs.writeFileSync(
    path.join(destination, 'ARCHIVED.md'),
    `# Archived editorial run\n\n- Run: \`${runId}\`\n- Archived: ${kstIso()}\n- Final status: \`${manifest.status || 'unknown'}\`\n- Reason: ${reason}\n\nThis directory is immutable by project rule. Start a new run in \`_workspace/current/\`; never edit or delete this archive.\n`
  );
  sealArchive(destination, runId);
  return destination;
}

function scaffoldCurrent(manifest) {
  fs.mkdirSync(currentDir, { recursive: true });
  for (const lane of lanes) fs.mkdirSync(path.join(currentDir, lane), { recursive: true });
  fs.mkdirSync(path.join(currentDir, 'draft', '_posts'), { recursive: true });
  fs.mkdirSync(path.join(currentDir, 'draft', 'assets', 'img', 'posts'), { recursive: true });
  fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  fs.writeFileSync(
    path.join(currentDir, 'tasks.json'),
    `${JSON.stringify({ run_id: manifest.run_id, tasks: [] }, null, 2)}\n`
  );
  fs.writeFileSync(
    path.join(currentDir, 'run-summary.md'),
    `# Editorial run ${manifest.run_id}\n\n- Status: ${manifest.status}\n- Target date: ${manifest.target_date}\n- Mode: ${manifest.mode}\n\n## Topic decision\n\nPending research.\n\n## Gate table\n\n| Gate | Verdict | Evidence |\n|---|---|---|\n`
  );
}

function start() {
  const runId = String(options.get('run-id') || '');
  const targetDate = String(options.get('target-date') || '');
  const mode = String(options.get('mode') || 'draft-only');
  if (!/^[a-zA-Z0-9][a-zA-Z0-9._-]{5,100}$/.test(runId)) {
    throw new Error('start requires --run-id with 6-101 safe characters');
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(targetDate)) {
    throw new Error('start requires --target-date YYYY-MM-DD');
  }
  if (!['draft-only', 'publish-on-green'].includes(mode)) {
    throw new Error('--mode must be draft-only or publish-on-green');
  }
  if (mode === 'publish-on-green') {
    const policyPath = path.join(repoRoot, '.claude', 'editorial-policy.yml');
    const policy = fs.existsSync(policyPath) ? fs.readFileSync(policyPath, 'utf8') : '';
    const modeApproved = /^publication_mode:\s*publish-on-green\s*$/m.test(policy);
    const standingApproved = /^standing_publish_approval:\s*true\s*$/m.test(policy);
    if (!modeApproved || !standingApproved) {
      throw new Error('publish-on-green requires matching policy mode and standing_publish_approval: true');
    }
  }

  verifyArchives();
  const archived = archiveCurrent('superseded');
  const manifest = {
    schema_version: 1,
    run_id: runId,
    started_at_kst: kstIso(),
    target_date: targetDate,
    mode,
    status: 'researching',
    topic: null,
    slug: null,
    thesis: null,
    article_path: null,
    asset_dir: null,
    revision_loops: 0,
    publication_requires_confirmation: mode !== 'publish-on-green',
    gates: {}
  };
  scaffoldCurrent(manifest);
  console.log(JSON.stringify({ current: currentDir, archived, manifest }, null, 2));
}

function setStatus() {
  const status = String(options.get('status') || '');
  const allowed = ['researching', 'drafting', 'reviewing', 'ready_for_review', 'published', 'rejected', 'blocked', 'superseded'];
  if (!allowed.includes(status)) throw new Error(`--status must be one of ${allowed.join(', ')}`);
  const manifest = readManifest();
  if (!manifest) throw new Error('No current manifest found');
  manifest.status = status;
  manifest.updated_at_kst = kstIso();
  if (['published', 'rejected', 'blocked'].includes(status)) manifest.closed_at_kst = kstIso();
  fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(JSON.stringify(manifest, null, 2));
}

function status() {
  const manifest = readManifest();
  const archives = fs.existsSync(archiveDir)
    ? fs.readdirSync(archiveDir, { withFileTypes: true }).filter((entry) => entry.isDirectory()).map((entry) => entry.name)
    : [];
  console.log(JSON.stringify({ workspaceRoot, current: manifest, archives }, null, 2));
}

switch (command) {
  case 'start':
    start();
    break;
  case 'archive': {
    verifyArchives();
    const archived = archiveCurrent(String(options.get('reason') || 'manual-close'));
    fs.mkdirSync(currentDir, { recursive: true });
    console.log(JSON.stringify({ archived, current: currentDir }, null, 2));
    break;
  }
  case 'set-status':
    setStatus();
    break;
  case 'safe-date':
    console.log(safePostDate(Number(options.get('minutes') || 60)));
    break;
  case 'verify-archives':
    console.log(JSON.stringify({ archives: verifyArchives() }, null, 2));
    break;
  case 'status':
    status();
    break;
  default:
    throw new Error(`Unknown command: ${command}`);
}
