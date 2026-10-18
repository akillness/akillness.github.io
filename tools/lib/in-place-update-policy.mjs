import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { isDeepStrictEqual } from 'node:util';
import { publicationPathErrors } from './archive-publication-path.mjs';

export const JEV_IN_PLACE_UPDATE_EXCEPTION = Object.freeze({
  run: '20261017-2108-jev-open-harness-update',
  post: '_posts/2026-10-17-jev-pipeline-37-of-40-cost-estimate.md',
  baseline: 'review/in-place-update-baseline.json',
  liveArticle: 'b418027730daff8fbfd00f303299dc2f0d94c7fbfca909e1045178b6f646f69a',
  draftArticle: 'e64de966c29936b33c69493555cc95f9cd7bd014516b7c04294621e4903ec0b4',
  assetDir: 'assets/img/posts/2026-10-17-jev-pipeline-37-of-40-cost-estimate',
  assets: Object.freeze([
    Object.freeze({
      path: 'assets/img/posts/2026-10-17-jev-pipeline-37-of-40-cost-estimate/pipeline-comparison.png',
      sha256: '1bc5508f7a9a3bff66f521d577bf3f33b371a90d02e1dd1fa9092dde98617e2d',
      bytes: 289181
    })
  ])
});

const baselineRecord = Object.freeze({
  schema_version: 1,
  run_id: JEV_IN_PLACE_UPDATE_EXCEPTION.run,
  article_path: JEV_IN_PLACE_UPDATE_EXCEPTION.post,
  live_article_sha256: JEV_IN_PLACE_UPDATE_EXCEPTION.liveArticle,
  draft_article_sha256: JEV_IN_PLACE_UPDATE_EXCEPTION.draftArticle,
  live_asset_dir: JEV_IN_PLACE_UPDATE_EXCEPTION.assetDir,
  package_asset_dir: JEV_IN_PLACE_UPDATE_EXCEPTION.assetDir,
  live_assets: JEV_IN_PLACE_UPDATE_EXCEPTION.assets,
  package_assets: JEV_IN_PLACE_UPDATE_EXCEPTION.assets,
  asset_bytes_unchanged: true,
  allow_asset_changes: false,
  publication_authorized: false
});

const digest = (bytes) => crypto.createHash('sha256').update(bytes).digest('hex');
const relativePosix = (root, file) => path.relative(root, file).split(path.sep).join('/');

function walkRegularFiles(root, errors, label) {
  if (!fs.existsSync(root)) return [];
  errors.push(...publicationPathErrors(root));
  if (errors.length) return [];
  let stat;
  try { stat = fs.lstatSync(root); }
  catch (error) {
    errors.push(`in-place update: cannot inspect ${label}: ${error.message}`);
    return [];
  }
  if (!stat.isDirectory()) {
    errors.push(`in-place update: ${label} is not a directory: ${root}`);
    return [];
  }
  const files = [];
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    const file = path.join(root, entry.name);
    if (entry.isSymbolicLink()) errors.push(`in-place update: ${label} contains a forbidden symlink: ${file}`);
    else if (entry.isDirectory()) files.push(...walkRegularFiles(file, errors, label));
    else if (entry.isFile()) files.push(file);
    else errors.push(`in-place update: ${label} contains a non-regular entry: ${file}`);
  }
  return files.sort();
}

function readHeadBlob(repoRoot, relative) {
  const result = spawnSync('git', ['show', `HEAD:${relative}`], {
    cwd: repoRoot,
    maxBuffer: 64 * 1024 * 1024
  });
  if (result.status !== 0) throw new Error(`cannot read committed baseline for ${relative}`);
  return result.stdout;
}

function assetManifest(files, root, errors, label) {
  const result = [];
  for (const file of files) {
    const pathName = relativePosix(root, file);
    const pathErrors = publicationPathErrors(file);
    errors.push(...pathErrors);
    const relative = path.relative(path.resolve(root), path.resolve(file));
    if (pathErrors.length || relative === '..' || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) {
      errors.push(`in-place update: ${label} path escapes its expected root: ${pathName}`);
      continue;
    }
    try {
      const stat = fs.lstatSync(file);
      if (!stat.isFile()) throw new Error('not a regular file');
      const bytes = fs.readFileSync(file);
      result.push({ path: pathName, sha256: digest(bytes), bytes: bytes.length });
    } catch (error) {
      errors.push(`in-place update: cannot read ${label} file ${pathName}: ${error.message}`);
    }
  }
  return result.sort((a, b) => a.path.localeCompare(b.path));
}

/**
 * Validates the one pinned review-only update. On success, unchanged assets are
 * deliberately omitted from publication scope; only the existing article can
 * be replaced. This function does not authorize copying, staging, or publishing.
 */
export function validateInPlaceUpdate({
  repoRoot,
  current,
  manifest,
  draftPath,
  packageAssetPaths = [],
  baselineSource = 'filesystem'
} = {}) {
  const pinned = JEV_IN_PLACE_UPDATE_EXCEPTION;
  const candidate = manifest?.run_id === pinned.run || manifest?.in_place_update_baseline === pinned.baseline;
  if (!candidate) return { matched: false, valid: false, errors: [], scopePaths: null };

  const errors = [];
  const require = (condition, message) => { if (!condition) errors.push(`in-place update: ${message}`); };
  require(manifest?.run_id === pinned.run, 'run_id is not the pinned run');
  require(manifest?.article_path === pinned.post, 'article_path is not the pinned existing post');
  require(manifest?.in_place_update_baseline === pinned.baseline, 'missing or unapproved baseline record path');
  require(manifest?.mode === 'draft-only' && manifest?.publication_requires_confirmation === true,
    'this exception is review-only and requires draft-only confirmation mode');
  require(['filesystem', 'git-head'].includes(baselineSource), 'invalid baseline source');
  if (errors.length) return { matched: true, valid: false, errors, scopePaths: null };

  const baselinePath = path.join(current, pinned.baseline);
  const baselinePathErrors = publicationPathErrors(baselinePath);
  errors.push(...baselinePathErrors);
  if (baselinePathErrors.length) return { matched: true, valid: false, errors, scopePaths: null };
  let record;
  try {
    const stat = fs.lstatSync(baselinePath);
    if (!stat.isFile() || stat.size > 1024 * 1024) throw new Error('baseline is not a regular file within the size limit');
    record = JSON.parse(fs.readFileSync(baselinePath, 'utf8'));
  } catch (error) {
    errors.push(`in-place update: cannot read a valid baseline record (${error.message})`);
  }
  require(record && isDeepStrictEqual(record, baselineRecord), 'baseline record differs from the pinned run/article and hashes');

  try {
    const liveArticleBytes = baselineSource === 'git-head'
      ? readHeadBlob(repoRoot, pinned.post)
      : (() => {
          const livePath = path.join(repoRoot, pinned.post);
          const pathErrors = publicationPathErrors(livePath);
          if (pathErrors.length) throw new Error(pathErrors.join('; '));
          return fs.readFileSync(livePath);
        })();
    require(digest(liveArticleBytes) === pinned.liveArticle, 'live article does not match the recorded pre-update baseline');
  } catch (error) {
    errors.push(`in-place update: ${error.message}`);
  }

  try {
    const draftPathErrors = publicationPathErrors(draftPath);
    if (draftPathErrors.length) throw new Error(draftPathErrors.join('; '));
    const draftBytes = fs.readFileSync(draftPath);
    require(digest(draftBytes) === pinned.draftArticle, 'draft article differs from the reviewed update bytes');
  } catch (error) {
    errors.push(`in-place update: cannot read the packaged article (${error.message})`);
  }

  const liveAssetRoot = path.join(repoRoot, pinned.assetDir);
  const packageAssetRoot = path.join(current, 'draft', pinned.assetDir);
  const liveFiles = walkRegularFiles(liveAssetRoot, errors, 'live asset directory');
  const packageFiles = packageAssetPaths.length
    ? [...packageAssetPaths].sort()
    : walkRegularFiles(packageAssetRoot, errors, 'package asset directory');
  const liveHashes = assetManifest(liveFiles, repoRoot, errors, 'live assets');
  const packageHashes = assetManifest(packageFiles, path.join(current, 'draft'), errors, 'packaged assets');
  require(isDeepStrictEqual(liveHashes, pinned.assets), 'live asset set or bytes differ from the recorded baseline');
  require(isDeepStrictEqual(packageHashes, pinned.assets), 'package asset set or bytes differ from the live baseline');
  if (baselineSource === 'git-head') {
    try {
      const headHashes = pinned.assets.map((asset) => {
        const bytes = readHeadBlob(repoRoot, asset.path);
        return { path: asset.path, sha256: digest(bytes), bytes: bytes.length };
      });
      require(isDeepStrictEqual(headHashes, pinned.assets), 'committed asset baseline differs from the recorded live asset');
    } catch (error) {
      errors.push(`in-place update: ${error.message}`);
    }
  }

  return {
    matched: true,
    valid: errors.length === 0,
    errors,
    scopePaths: errors.length === 0 ? [pinned.post] : null
  };
}
