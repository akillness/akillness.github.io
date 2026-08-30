#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import {
  MINIMUM_REFERENCE_IMAGES,
  MAXIMUM_REFERENCE_IMAGES,
  hasValidImageExtension,
  referencesPrefix
} from './lib/source-image-manifest.mjs';

const argv = process.argv.slice(2);
const stagedMode = argv.includes('--staged');
const rootValue = argv.find((arg, index) => !arg.startsWith('--') && argv[index - 1] !== '--root');
const explicitRootIndex = argv.indexOf('--root');
const repoRoot = path.resolve(explicitRootIndex >= 0 ? argv[explicitRootIndex + 1] : rootValue || process.cwd());
const current = path.join(repoRoot, '_workspace', 'current');
const validationDir = path.join(current, 'validation');
const scopeFile = path.join(validationDir, 'path-scope.txt');
const failures = [];
const check = (condition, message) => {
  if (!condition) failures.push(message);
};
const walkFiles = (dir) => {
  if (!fs.existsSync(dir)) return [];
  const found = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isSymbolicLink()) failures.push(`Package contains a forbidden symlink: ${full}`);
    else if (entry.isDirectory()) found.push(...walkFiles(full));
    else if (entry.isFile()) found.push(full);
  }
  return found.sort();
};

function expectedPackagePaths({ checkCollisions = true } = {}) {
  const draftRoot = path.join(current, 'draft');
  const postDir = path.join(draftRoot, '_posts');
  const posts = walkFiles(postDir).filter((file) => file.endsWith('.md'));
  check(posts.length === 1, `Expected exactly one package post, found ${posts.length}`);
  if (posts.length !== 1) return [];

  const basename = path.basename(posts[0]);
  const stem = path.basename(posts[0], '.md');
  check(/^\d{4}-\d{2}-\d{2}-[a-z0-9][a-z0-9-]*$/.test(stem), `Unsafe article filename: ${basename}`);

  const packageAssetDir = path.join(draftRoot, 'assets', 'img', 'posts', stem);
  const assets = walkFiles(packageAssetDir);
  check(assets.length >= 1, `No packaged assets found for ${stem}`);

  const paths = [`_posts/${basename}`];
  const refPrefix = referencesPrefix(stem);
  const referenceImages = [];
  for (const asset of assets) {
    const relative = path.relative(draftRoot, asset).split(path.sep).join('/');
    check(relative.startsWith(`assets/img/posts/${stem}/`), `Asset escapes matching article folder: ${relative}`);
    if (relative.startsWith(refPrefix)) {
      check(hasValidImageExtension(relative), `Reference image has a forbidden extension: ${relative}`);
      referenceImages.push(relative);
    }
    paths.push(relative);
  }

  // Source-image contract is unconditional for every new automated package.
  // Derive the count from the walked references folder rather than trusting a
  // sidecar or a manually authored path list.
  check(
    referenceImages.length >= MINIMUM_REFERENCE_IMAGES && referenceImages.length <= MAXIMUM_REFERENCE_IMAGES,
    `Package must ship ${MINIMUM_REFERENCE_IMAGES}–${MAXIMUM_REFERENCE_IMAGES} source-derived reference images under ${refPrefix}, found ${referenceImages.length}`
  );

  if (checkCollisions) {
    const livePost = path.join(repoRoot, '_posts', basename);
    const liveAssets = path.join(repoRoot, 'assets', 'img', 'posts', stem);
    check(!fs.existsSync(livePost), `Live article target already exists: _posts/${basename}`);
    check(!fs.existsSync(liveAssets), `Live asset target already exists: assets/img/posts/${stem}/`);
  }
  return [...new Set(paths)].sort();
}

let expected = [];
if (stagedMode) {
  check(fs.existsSync(scopeFile), 'validation/path-scope.txt is missing; validate package scope before staging');
  const recorded = fs.existsSync(scopeFile)
    ? fs.readFileSync(scopeFile, 'utf8').split('\n').map((line) => line.trim()).filter(Boolean).sort()
    : [];
  expected = expectedPackagePaths({ checkCollisions: false });
  check(JSON.stringify(recorded) === JSON.stringify(expected), `Recorded path scope is stale or edited. Derived ${JSON.stringify(expected)}, recorded ${JSON.stringify(recorded)}`);
  const result = spawnSync('git', ['diff', '--cached', '--name-only', '--diff-filter=ACMRD'], {
    cwd: repoRoot,
    encoding: 'utf8'
  });
  check(result.status === 0, `Cannot inspect staged paths: ${result.stderr || result.stdout}`);
  const staged = result.status === 0 ? result.stdout.split('\n').map((line) => line.trim()).filter(Boolean).sort() : [];
  check(staged.length > 0, 'No staged publication paths found');
  check(JSON.stringify(staged) === JSON.stringify(expected), `Staged paths do not exactly match validated scope. Expected ${JSON.stringify(expected)}, got ${JSON.stringify(staged)}`);
  for (const file of expected) {
    const packaged = path.join(current, 'draft', file);
    check(fs.existsSync(packaged), `Validated package file is missing: ${file}`);
    const stagedBlob = spawnSync('git', ['show', `:${file}`], { cwd: repoRoot });
    check(stagedBlob.status === 0, `Cannot read staged file content: ${file}`);
    if (fs.existsSync(packaged) && stagedBlob.status === 0) {
      check(stagedBlob.stdout.equals(fs.readFileSync(packaged)), `Staged file differs from validated package: ${file}`);
    }
  }
  for (const file of staged) {
    const postMatch = file.match(/^_posts\/(\d{4}-\d{2}-\d{2}-[a-z0-9][a-z0-9-]*)\.md$/);
    const assetMatch = file.match(/^assets\/img\/posts\/(\d{4}-\d{2}-\d{2}-[a-z0-9][a-z0-9-]*)\/.+/);
    check(Boolean(postMatch || assetMatch), `Forbidden staged publication path: ${file}`);
  }
} else {
  expected = expectedPackagePaths();
  fs.mkdirSync(validationDir, { recursive: true });
  if (!failures.length) fs.writeFileSync(scopeFile, `${expected.join('\n')}\n`);
}

if (failures.length) {
  console.error(`Publication scope verification failed with ${failures.length} issue(s):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Publication scope verification passed (${stagedMode ? 'staged' : 'package'}): ${expected.length} exact path(s).`);
