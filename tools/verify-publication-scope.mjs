#!/usr/bin/env node

import { SOURCE_FIRST_FALLBACK, imageFallbackContextFromDisk, validateImageFallback } from './lib/source-image-manifest.mjs';
import { ARCHIVE_LEDGER_PATH, publicationPathErrors, resolvePublicationPost, archiveGraduationErrors } from './lib/archive-publication-path.mjs';
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
let selectedPost = null;
const check = (condition, message) => {
  if (!condition) failures.push(message);
};
const walkFiles = (dir) => {
  if (!fs.existsSync(dir)) return [];
  const pathErrors = publicationPathErrors(dir);
  failures.push(...pathErrors);
  if (pathErrors.length) return [];
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
  let manifest = null;
  const manifestPath = path.join(current, 'manifest.json');
  const manifestErrors = publicationPathErrors(manifestPath);
  failures.push(...manifestErrors);
  if (!manifestErrors.length) {
    try { manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8')); }
    catch (error) { failures.push(`Cannot read publication manifest: ${error.message}`); }
  }
  selectedPost = resolvePublicationPost({ repoRoot, draftRoot, draftPath: posts[0], manifest });
  failures.push(...selectedPost.errors);

  const packageAssetDir = path.join(draftRoot, 'assets', 'img', 'posts', stem);
  const assets = walkFiles(packageAssetDir);
  check(assets.length >= 1, `No packaged assets found for ${stem}`);

  const paths = [selectedPost.postPath];
  if (selectedPost.archive) paths.push(ARCHIVE_LEDGER_PATH);
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

  // Source rights stay mandatory; only explicit audited fallback relaxes the legacy floor.
  // Derive the count from the walked references folder rather than trusting a
  // sidecar or a manually authored path list.
  const sidecarPath = path.join(draftRoot, 'source-image-manifest.json');
  const sidecar = fs.existsSync(sidecarPath) ? JSON.parse(fs.readFileSync(sidecarPath, 'utf8')) : null;
  const fallback = sidecar?.image_policy === SOURCE_FIRST_FALLBACK;
  const postText = fs.readFileSync(posts[0], 'utf8');
  const postHeader = postText.match(/^---\s*\n([\s\S]*?)\n---/)?.[1] || '';
  check((/^image_policy:\s*['"]?source-first-fallback['"]?\s*$/m.test(postHeader)) === fallback, 'Post and source-image sidecar fallback mode must match');
  if (fallback) {
    const evidence = JSON.parse(fs.readFileSync(path.join(current, 'evidence', 'evidence-pack.json'), 'utf8'));
    const result = validateImageFallback({ manifest: sidecar, articleBody: fs.readFileSync(posts[0], 'utf8').replace(/^---\s*\n[\s\S]*?\n---\s*\n?/, ''), articleStem: stem,
      evidenceSourceUrls: (Array.isArray(evidence) ? evidence : evidence.claims || []).map((claim) => claim.source_url),
      ...imageFallbackContextFromDisk(current, stem, fs.readFileSync(path.join(repoRoot, '.claude', 'editorial-policy.yml'), 'utf8')) });
    failures.push(...result.failures);
  }
  check(
    (fallback || referenceImages.length >= MINIMUM_REFERENCE_IMAGES) && referenceImages.length <= MAXIMUM_REFERENCE_IMAGES,
    `Package must ship ${MINIMUM_REFERENCE_IMAGES}–${MAXIMUM_REFERENCE_IMAGES} qualifying source-derived reference images under ${refPrefix}, found ${referenceImages.length}`
  );

  if (checkCollisions && !selectedPost.archive) {
    const livePost = path.join(repoRoot, selectedPost.postPath);
    const liveAssets = path.join(repoRoot, 'assets', 'img', 'posts', stem);
    check(!fs.existsSync(livePost), `Live article target already exists: ${selectedPost.postPath}`);
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
  const result = spawnSync('git', ['diff', '--cached', '--name-only', '--no-renames'], {
    cwd: repoRoot,
    encoding: 'utf8'
  });
  check(result.status === 0, `Cannot inspect staged paths: ${result.stderr || result.stdout}`);
  const staged = result.status === 0 ? result.stdout.split('\n').map((line) => line.trim()).filter(Boolean).sort() : [];
  check(staged.length > 0, 'No staged publication paths found');
  check(JSON.stringify(staged) === JSON.stringify(expected), `Staged paths do not exactly match validated scope. Expected ${JSON.stringify(expected)}, got ${JSON.stringify(staged)}`);
  for (const file of expected) {
    const packaged = file === ARCHIVE_LEDGER_PATH ? path.join(repoRoot, file) : path.join(current, 'draft', file);
    check(fs.existsSync(packaged), `Validated package file is missing: ${file}`);
    failures.push(...publicationPathErrors(packaged));
    const stagedEntry = spawnSync('git', ['ls-files', '--stage', '--', file], { cwd: repoRoot, encoding: 'utf8' });
    check(stagedEntry.status === 0 && /^100644 [0-9a-f]{40,64} 0\t[^\n]+\n?$/.test(stagedEntry.stdout), `Staged publication file must be a regular, resolved, non-executable file: ${file}`);
    // Reference images routinely exceed Node's 1 MiB default stdout buffer, which would
    // otherwise fail with ENOBUFS and be misread as an unreadable staged file.
    const stagedBlob = spawnSync('git', ['show', `:${file}`], { cwd: repoRoot, maxBuffer: 64 * 1024 * 1024 });
    check(stagedBlob.status === 0, `Cannot read staged file content: ${file}`);
    if (fs.existsSync(packaged) && stagedBlob.status === 0) {
      check(stagedBlob.stdout.equals(fs.readFileSync(packaged)), `Staged file differs from validated package: ${file}`);
      if (file === ARCHIVE_LEDGER_PATH && selectedPost?.archive) {
        const baseline = spawnSync('git', ['show', `HEAD:${ARCHIVE_LEDGER_PATH}`], { cwd: repoRoot, encoding: 'utf8' });
        check(baseline.status === 0, 'Cannot read the committed archive ledger baseline');
        if (baseline.status === 0) {
          try {
            failures.push(...archiveGraduationErrors({ before: JSON.parse(baseline.stdout), after: JSON.parse(stagedBlob.stdout.toString('utf8')),
              postPath: selectedPost.postPath, article: fs.readFileSync(path.join(current, 'draft', selectedPost.postPath), 'utf8'),
              restoredSources: selectedPost.archive.restoredSources }));
          } catch (error) { failures.push(`Cannot verify staged archive graduation: ${error.message}`); }
        }
      }
    }
  }
  for (const file of staged) {
    const postMatch = file === selectedPost?.postPath;
    const assetMatch = file.startsWith(`assets/img/posts/${selectedPost?.stem}/`);
    const ledgerMatch = file === ARCHIVE_LEDGER_PATH && Boolean(selectedPost?.archive);
    check(postMatch || assetMatch || ledgerMatch, `Forbidden staged publication path: ${file}`);
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
