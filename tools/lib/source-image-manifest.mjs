#!/usr/bin/env node
// Pure validation core for the source-derived reference image contract.
// Legacy packages retain the fail-closed count rule; approved source-first fallback
// packages validate an audited, credited explanatory asset instead. Legacy packages ship at least
// MINIMUM_REFERENCE_IMAGES distinct, rights-cleared raster references, either
// downloaded from inspected reference materials or directly captured from an
// owner-controlled public interface under explicit scoped permission. Each is
// credited in exactly one adjacent <figure class="source-image"> block and
// described by _workspace/current/draft/source-image-manifest.json.

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

export const SOURCE_IMAGE_SCHEMA_VERSION = 1;
export const SOURCE_IMAGE_CONTRACT_EFFECTIVE_DATE = '2026-09-01';
export const MINIMUM_REFERENCE_IMAGES = 4;
export const MAXIMUM_REFERENCE_IMAGES = 12;
export const MAX_REFERENCE_IMAGE_BYTES = 5 * 1024 * 1024;
export const MAX_REFERENCE_IMAGE_TOTAL_BYTES = 20 * 1024 * 1024;
export const MIN_REFERENCE_IMAGE_PIXELS = 16_384;
export const MIN_REFERENCE_IMAGE_SHORT_SIDE = 32;
export const MIN_LICENSE_QUOTE_LENGTH = 40;
export const MIN_OWNER_REUSE_ATTESTATION_LENGTH = 40;
export const FIRST_PARTY_SCREENSHOT_BASIS = 'own-screenshot-of-public-interface';
export const FIRST_PARTY_SCREENSHOT_SCOPE = 'akillness-git-blog-only';
export const VALID_IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp'];
export const ALLOWED_LICENSE_BASES = [
  'public-domain',
  'cc0',
  'cc-by',
  'cc-by-sa',
  'kogl-type-1',
  'repo-license-covers-assets',
  'official-press-kit'
];
export const ALLOWED_IMAGE_BASES = [...ALLOWED_LICENSE_BASES, FIRST_PARTY_SCREENSHOT_BASIS];
export const REQUIRED_IMAGE_FIELDS = [
  'local_path',
  'source_page_url',
  'publisher_or_creator',
  'license_basis',
  'retrieved_at',
  'sha256',
  'transformation',
  'transformation_note',
  'alt',
  'attribution_text',
  'commercial_use_allowed',
  'redistribution_allowed'
];

export const referencesPrefix = (articleStem) => `assets/img/posts/${articleStem}/references/`;
export const sourceImageContractAppliesToStem = (articleStem) => {
  const date = String(articleStem || '').match(/^(\d{4}-\d{2}-\d{2})-/)?.[1];
  return Boolean(date && date >= SOURCE_IMAGE_CONTRACT_EFFECTIVE_DATE);
};

const nonempty = (value, minimum = 1) => typeof value === 'string' && value.trim().length >= minimum;
const isHttpUrl = (value) => {
  try {
    return ['http:', 'https:'].includes(new URL(value).protocol);
  } catch {
    return false;
  }
};
const isHttpsUrl = (value) => {
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
};

const decodeHtmlEntities = (value) => String(value ?? '').replace(
  /&(#x[0-9a-f]+|#\d+|amp|lt|gt|quot|apos);/gi,
  (whole, entity) => {
    const lower = entity.toLowerCase();
    if (lower === 'amp') return '&';
    if (lower === 'lt') return '<';
    if (lower === 'gt') return '>';
    if (lower === 'quot') return '"';
    if (lower === 'apos') return "'";
    const point = lower.startsWith('#x')
      ? Number.parseInt(lower.slice(2), 16)
      : Number.parseInt(lower.slice(1), 10);
    return Number.isInteger(point) && point >= 0 && point <= 0x10ffff
      ? String.fromCodePoint(point)
      : whole;
  }
);

const stripFencedCode = (value) => {
  const kept = [];
  let fence = null;
  for (const line of String(value || '').split('\n')) {
    if (!fence) {
      const opener = line.match(/^[ \t]{0,3}(`{3,}|~{3,})/);
      if (opener) fence = { char: opener[1][0], length: opener[1].length };
      else kept.push(line);
      continue;
    }
    const closing = line.match(/^[ \t]{0,3}(`+|~+)[ \t]*$/);
    if (closing && closing[1][0] === fence.char && closing[1].length >= fence.length) fence = null;
  }
  return kept.join('\n');
};

const renderedMarkdownSource = (value) => stripFencedCode(String(value || '')
  .replace(/<!--[\s\S]*?-->/g, '')
  .replace(/\{%-?\s*comment\s*-?%\}[\s\S]*?\{%-?\s*endcomment\s*-?%\}/gi, ''))
  .replace(/(`{1,2})[^`\n]*\1/g, '')
  .replace(/^(?: {4}|\t).*$/gm, '');

const attributeValue = (tag, name) => {
  const match = String(tag || '').match(new RegExp(`\\s${name}\\s*=\\s*(["'])([\\s\\S]*?)\\1`, 'i'));
  return match ? decodeHtmlEntities(match[2]) : null;
};

const tagIsHidden = (tag) => {
  const classes = (attributeValue(tag, 'class') || '').split(/\s+/);
  return /\shidden(?:\s|=|>|\/)/i.test(String(tag || ''))
    || /\saria-hidden\s*=\s*(?:"true"|'true'|true)(?:\s|>|\/)/i.test(String(tag || ''))
    || /\sstyle\s*=/i.test(String(tag || ''))
    || classes.some((name) => ['hidden', 'sr-only', 'visually-hidden'].includes(name));
};

const sourceFigureHasAncestor = (source, figureIndex) => {
  const voidElements = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);
  const stack = [];
  const tokens = /<(\/?)\s*([a-z][\w:-]*)\b([^>]*)>|\{%-?\s*(end)?(capture|case|for|if|tablerow|unless|while)\b[^%]*-?%\}/gi;
  for (const match of String(source || '').slice(0, figureIndex).matchAll(tokens)) {
    if (match[2]) {
      const tag = match[2].toLowerCase();
      if (voidElements.has(tag) || /^\s*(?::\/\/|@)/.test(match[3])) continue;
      if (match[1]) {
        const index = stack.map((item) => item.key).lastIndexOf(`html:${tag}`);
        if (index >= 0) stack.splice(index, 1);
      } else {
        const outsideQuotes = match[3].replace(/"[^"]*"|'[^']*'/g, '');
        if (!outsideQuotes.trimEnd().endsWith('/')) stack.push({ key: `html:${tag}` });
      }
    } else {
      const key = `liquid:${match[5].toLowerCase()}`;
      if (match[4]) {
        const index = stack.map((item) => item.key).lastIndexOf(key);
        if (index >= 0) stack.splice(index, 1);
      } else stack.push({ key });
    }
  }
  return stack.length > 0;
};

export const hasValidImageExtension = (filePath) =>
  VALID_IMAGE_EXTENSIONS.includes(path.posix.extname(String(filePath)).toLowerCase());

const ascii = (bytes, start, end) => String.fromCharCode(...bytes.subarray(start, end));
const be16 = (bytes, offset) => (bytes[offset] << 8) | bytes[offset + 1];
const be32 = (bytes, offset) => ((bytes[offset] * 0x1000000) + (bytes[offset + 1] << 16) + (bytes[offset + 2] << 8) + bytes[offset + 3]) >>> 0;
const le24 = (bytes, offset) => bytes[offset] | (bytes[offset + 1] << 8) | (bytes[offset + 2] << 16);
const le32 = (bytes, offset) => (bytes[offset] | (bytes[offset + 1] << 8) | (bytes[offset + 2] << 16) | (bytes[offset + 3] * 0x1000000)) >>> 0;

export function inspectRasterImage(filePath, data) {
  const bytes = data instanceof Uint8Array ? data : new Uint8Array();
  const ext = path.posix.extname(String(filePath)).toLowerCase();
  let format = null;
  let width = 0;
  let height = 0;
  let metadataSegments = 0;

  if (ext === '.png') {
    const signature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
    if (bytes.length >= 45 && signature.every((byte, index) => bytes[index] === byte) && be32(bytes, 8) === 13 && ascii(bytes, 12, 16) === 'IHDR') {
      width = be32(bytes, 16);
      height = be32(bytes, 20);
      let offset = 8;
      let chunksValid = true;
      let sawIend = false;
      while (offset + 12 <= bytes.length) {
        const length = be32(bytes, offset);
        const type = ascii(bytes, offset + 4, offset + 8);
        if (['eXIf', 'iTXt', 'tEXt', 'zTXt'].includes(type)) metadataSegments += 1;
        const next = offset + 12 + length;
        if (next <= offset || next > bytes.length) { chunksValid = false; break; }
        offset = next;
        if (type === 'IEND') { sawIend = length === 0; break; }
      }
      if (chunksValid && sawIend) format = 'png';
    }
  } else if (ext === '.jpg' || ext === '.jpeg') {
    if (bytes.length >= 10 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
      const sof = new Set([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf]);
      let offset = 2;
      while (offset + 4 <= bytes.length) {
        if (bytes[offset] !== 0xff) { offset += 1; continue; }
        while (offset < bytes.length && bytes[offset] === 0xff) offset += 1;
        const marker = bytes[offset];
        offset += 1;
        if (marker === 0xd9 || marker === 0xda) break;
        if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) continue;
        if (offset + 2 > bytes.length) break;
        const length = be16(bytes, offset);
        if (length < 2 || offset + length > bytes.length) break;
        if (marker === 0xe1 || marker === 0xed || marker === 0xfe) metadataSegments += 1;
        if (sof.has(marker) && length >= 7) {
          format = 'jpeg';
          height = be16(bytes, offset + 3);
          width = be16(bytes, offset + 5);
        }
        offset += length;
      }
    }
  } else if (ext === '.webp' && bytes.length >= 30 && ascii(bytes, 0, 4) === 'RIFF' && ascii(bytes, 8, 12) === 'WEBP') {
    const chunk = ascii(bytes, 12, 16);
    if (chunk === 'VP8X') {
      format = 'webp';
      width = le24(bytes, 24) + 1;
      height = le24(bytes, 27) + 1;
    } else if (chunk === 'VP8L' && bytes[20] === 0x2f) {
      format = 'webp';
      width = 1 + (bytes[21] | ((bytes[22] & 0x3f) << 8));
      height = 1 + ((bytes[22] >> 6) | (bytes[23] << 2) | ((bytes[24] & 0x0f) << 10));
    } else if (chunk === 'VP8 ' && bytes[23] === 0x9d && bytes[24] === 0x01 && bytes[25] === 0x2a) {
      format = 'webp';
      width = (bytes[26] | (bytes[27] << 8)) & 0x3fff;
      height = (bytes[28] | (bytes[29] << 8)) & 0x3fff;
    }
    let offset = 12;
    while (offset + 8 <= bytes.length) {
      const type = ascii(bytes, offset, offset + 4);
      const length = le32(bytes, offset + 4);
      if (type === 'EXIF' || type === 'XMP ' || type === 'XMP_') metadataSegments += 1;
      const next = offset + 8 + length + (length % 2);
      if (next <= offset || next > bytes.length) break;
      offset = next;
    }
  }

  const valid = Boolean(format)
    && Number.isInteger(width)
    && Number.isInteger(height)
    && Math.min(width, height) >= MIN_REFERENCE_IMAGE_SHORT_SIDE
    && width * height >= MIN_REFERENCE_IMAGE_PIXELS
    && metadataSegments === 0;
  return { valid, format, width, height, metadataSegments };
}

export const rasterSignatureMatches = (filePath, data) => inspectRasterImage(filePath, data).valid;

// The stricter fallback grammar is opt-in so legacy source-credit parsing stays unchanged.
const validFallbackDimensions = (tag) => [...String(tag).matchAll(/\s(?:width|height)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi)]
  .every((match) => {
    const value = decodeHtmlEntities(match[1] ?? match[2] ?? match[3]);
    return /^\d+$/.test(value) && Number(value) > 0;
  });

export function extractSourceImageFigures(articleBody, { strictFallback = false } = {}) {
  const figures = [];
  const body = renderedMarkdownSource(articleBody);
  for (const match of body.matchAll(/<figure\b([^>]*)>([\s\S]*?)<\/figure>/gi)) {
    const figureTag = `<figure${match[1]}>`;
    const classes = (attributeValue(figureTag, 'class') || '').split(/\s+/).filter(Boolean);
    if (!classes.includes('source-image')) continue;
    const inner = match[2];
    const imgTags = [...inner.matchAll(/<img\b[^>]*>/gi)].map((entry) => entry[0]);
    const captions = [...inner.matchAll(/<figcaption\b[^>]*>([\s\S]*?)<\/figcaption>/gi)].map((entry) => entry[1]);
    figures.push({
      src: attributeValue(imgTags[0], 'src'),
      alt: attributeValue(imgTags[0], 'alt'),
      caption: captions[0] === undefined ? null : decodeHtmlEntities(captions[0]),
      imgCount: imgTags.length,
      captionCount: captions.length,
      hidden: classes.length !== 1
        // Fallback credit must be a plain-text, attribute-free caption, directly
        // beside its image. Nested markup/template/style cannot stand in for a
        // visibly rendered origin disclosure. Inspect raw HTML before decoding.
        || (strictFallback && (!/^\s*<img\b[^>]*>\s*<figcaption\s*>[^<>]*<\/figcaption\s*>\s*$/i.test(inner)
          || /\{[{%]/.test(inner)
          || !validFallbackDimensions(figureTag)
          || imgTags.some((tag) => !validFallbackDimensions(tag))))
        || tagIsHidden(figureTag)
        || imgTags.some((tag) => tagIsHidden(tag) || attributeValue(tag, 'class') !== null)
        || sourceFigureHasAncestor(body, match.index)
    });
  }
  return figures;
}

export function hasValidSourceFigureRightsCaption(caption, articleStem, firstPartyScreenshotPolicy = null) {
  const text = String(caption || '');
  const urls = new Set(text.match(/https?:\/\/[^"'<>\s)]+/g) || []);
  if (urls.size >= 2) return true;
  if (urls.size !== 1) return false;

  const [sourceUrl] = urls;
  const policy = firstPartyScreenshotPolicy && typeof firstPartyScreenshotPolicy === 'object'
    ? firstPartyScreenshotPolicy
    : null;
  const allowedArticleStems = Array.isArray(policy?.allowedArticleStems) ? policy.allowedArticleStems : [];
  const allowedSourcePageUrls = Array.isArray(policy?.allowedSourcePageUrls) ? policy.allowedSourcePageUrls : [];
  const attestationScope = String(policy?.ownerReuseAttestation || '').match(/for reuse in this (.+? only);/i)?.[1];
  return policy?.scope === FIRST_PARTY_SCREENSHOT_SCOPE
    && allowedArticleStems.includes(articleStem)
    && allowedSourcePageUrls.includes(sourceUrl)
    && nonempty(policy?.owner)
    && text.includes(policy.owner)
    && /project-owner permission/i.test(text)
    && Boolean(attestationScope && text.includes(attestationScope))
    && /no third-party license (?:is asserted|is implied)/i.test(text);
}

/**
 * Pure validator. All inputs are plain data so true positive/negative tests
 * need no filesystem.
 *
 * @param {object} options
 * @param {object|null} options.manifest parsed source-image-manifest.json
 * @param {string} options.articleBody markdown body after front matter
 * @param {string} options.articleStem e.g. 2026-09-01-example-audit
 * @param {Iterable<string>} options.evidenceSourceUrls evidence-pack source_url values
 * @param {Record<string,{regular:boolean,size:number,sha256:string,validRaster:boolean}>} options.referenceFiles
 *        repo-relative path -> observed file facts for every entry in references/
 * @param {string} [options.expectedRunId] workspace manifest run_id
 * @param {string} [options.expectedRunStartedAt] workspace manifest started_at_kst
 * @param {object|null} [options.firstPartyScreenshotPolicy] explicit source/stem/owner allowlist from the repo policy
 * @returns {{failures:string[],metrics:{reference_images:number,credited_reference_images:number}}}
 */
export function validateSourceImageManifest({
  manifest,
  articleBody,
  articleStem,
  evidenceSourceUrls,
  referenceFiles,
  expectedRunId,
  expectedRunStartedAt,
  firstPartyScreenshotPolicy = null,
  fallbackContext = null
}) {
  const failures = [];
  const fail = (message) => failures.push(`source-image: ${message}`);
  const files = referenceFiles && typeof referenceFiles === 'object' ? referenceFiles : {};
  const metrics = {
    reference_images: Object.keys(files).length,
    credited_reference_images: 0,
    total_reference_image_bytes: 0
  };

  if (!/^\d{4}-\d{2}-\d{2}-[a-z0-9][a-z0-9-]*$/.test(String(articleStem || ''))) {
    fail(`invalid article stem: ${articleStem || '(missing)'}`);
  }
  if (!nonempty(expectedRunId)) fail('expected workspace run_id is missing');

  if (!manifest || typeof manifest !== 'object' || Array.isArray(manifest)) {
    fail('source-image-manifest.json is missing or not an object; the contract fails closed');
    return { failures, metrics };
  }
  if (manifest.schema_version !== SOURCE_IMAGE_SCHEMA_VERSION) {
    fail(`unsupported schema_version: ${manifest.schema_version}`);
  }
  if (!nonempty(manifest.run_id)) fail('manifest has no run_id');
  else if (expectedRunId && manifest.run_id !== expectedRunId) {
    fail(`manifest run_id ${manifest.run_id} does not match workspace run ${expectedRunId}`);
  }
  if (!Array.isArray(manifest.images)) {
    fail('manifest has no images[] array; the contract fails closed');
    return { failures, metrics };
  }

  const items = manifest.images;
  const fallback = manifest.image_policy === SOURCE_FIRST_FALLBACK;
  if (fallback) failures.push(...validateImageFallback({ manifest, articleBody, articleStem, evidenceSourceUrls, ...fallbackContext }).failures);
  if (!fallback && items.length < MINIMUM_REFERENCE_IMAGES) {
    fail(`at least ${MINIMUM_REFERENCE_IMAGES} source-derived reference images are required, found ${items.length}; the run blocks`);
  }
  if (items.length > MAXIMUM_REFERENCE_IMAGES) {
    fail(`at most ${MAXIMUM_REFERENCE_IMAGES} source-derived reference images are allowed, found ${items.length}; the run blocks`);
  }

  const prefix = referencesPrefix(articleStem);
  const evidenceUrls = new Set(evidenceSourceUrls || []);
  const seenLocalPaths = new Map();
  const seenShas = new Map();
  const seenDownloadUrls = new Map();
  const seenCaptureStates = new Map();
  const figures = extractSourceImageFigures(articleBody);
  const figureUseCount = new Map();
  for (const figure of figures) {
    if (figure.imgCount !== 1) fail(`a <figure class="source-image"> block must contain exactly one img, found ${figure.imgCount}`);
    if (figure.captionCount !== 1) fail(`a <figure class="source-image"> block must contain exactly one figcaption, found ${figure.captionCount}`);
    if (!figure.src) {
      fail('a <figure class="source-image"> block has no parsable <img src="...">');
      continue;
    }
    figureUseCount.set(figure.src, (figureUseCount.get(figure.src) || 0) + 1);
  }

  for (const [index, item] of items.entries()) {
    const label = typeof item?.local_path === 'string' && item.local_path ? item.local_path : `images[${index}]`;
    if (!item || typeof item !== 'object') {
      fail(`${label} is not an object`);
      continue;
    }
    for (const field of REQUIRED_IMAGE_FIELDS) {
      if (item[field] === undefined || item[field] === null) fail(`${label} is missing required field ${field}`);
    }
    const firstPartyScreenshot = item.license_basis === FIRST_PARTY_SCREENSHOT_BASIS;

    const localPath = String(item.local_path || '');
    if (!localPath.startsWith(prefix) || localPath.includes('..')) {
      fail(`${label} local_path must live under ${prefix}`);
    }
    if (!hasValidImageExtension(localPath)) {
      fail(`${label} must use a raster extension ${VALID_IMAGE_EXTENSIONS.join('/')}`);
    }
    if (seenLocalPaths.has(localPath)) fail(`duplicate local_path: ${localPath}`);
    seenLocalPaths.set(localPath, item);

    if (firstPartyScreenshot ? !isHttpsUrl(item.source_page_url) : !isHttpUrl(item.source_page_url)) {
      fail(firstPartyScreenshot
        ? `${label} must use an HTTPS public-interface source_page_url`
        : `${label} has an invalid source_page_url`);
    } else if (!evidenceUrls.has(item.source_page_url)) {
      fail(`${label} source_page_url is not an evidence-pack source_url: ${item.source_page_url}`);
    }

    if (!ALLOWED_IMAGE_BASES.includes(item.license_basis)) {
      fail(`${label} license_basis "${item.license_basis}" is not in the allowlist; the contract fails closed`);
    }
    if (item.license_basis === 'repo-license-covers-assets' && !nonempty(item.pinned_ref)) {
      fail(`${label} uses repo-license-covers-assets without a pinned_ref`);
    }
    if (firstPartyScreenshot) {
      const policy = firstPartyScreenshotPolicy && typeof firstPartyScreenshotPolicy === 'object'
        ? firstPartyScreenshotPolicy
        : null;
      const allowedArticleStems = Array.isArray(policy?.allowedArticleStems) ? policy.allowedArticleStems : [];
      const allowedSourcePageUrls = Array.isArray(policy?.allowedSourcePageUrls) ? policy.allowedSourcePageUrls : [];
      if (policy?.scope !== FIRST_PARTY_SCREENSHOT_SCOPE
        || !allowedArticleStems.includes(articleStem)
        || !allowedSourcePageUrls.includes(item.source_page_url)) {
        fail(`${label} first-party screenshot is not explicitly allowlisted for this article and source URL`);
      }
      if (!nonempty(item.owner_reuse_scope) || item.owner_reuse_scope !== policy?.scope) {
        fail(`${label} owner_reuse_scope must exactly match the repo policy scope`);
      }
      if (!nonempty(item.owner_reuse_attestation, MIN_OWNER_REUSE_ATTESTATION_LENGTH)
        || item.owner_reuse_attestation !== policy?.ownerReuseAttestation) {
        fail(`${label} owner_reuse_attestation must exactly match the repo policy attestation`);
      }
      if (!nonempty(policy?.owner) || item.publisher_or_creator !== policy.owner) {
        fail(`${label} publisher_or_creator must exactly match the allowlisted interface owner`);
      }
      for (const field of ['download_url', 'license_url', 'license_quote']) {
        if (item[field] !== undefined && item[field] !== null) {
          fail(`${label} must not claim external download/license metadata for an owner screenshot`);
        }
      }
      if (!/\bowner\b/i.test(String(item.attribution_text || '')) || !/permission/i.test(String(item.attribution_text || ''))) {
        fail(`${label} owner screenshot attribution must identify owner permission`);
      }
      if (!nonempty(item.capture_state)) {
        fail(`${label} owner screenshot is missing capture_state`);
      } else {
        const captureState = item.capture_state.trim().toLocaleLowerCase('en-US');
        if (seenCaptureStates.has(captureState)) {
          fail(`${label} has duplicate capture_state ${captureState}`);
        }
        seenCaptureStates.set(captureState, label);
      }
    } else {
      if (!isHttpUrl(item.download_url)) fail(`${label} has an invalid download_url`);
      else if (seenDownloadUrls.has(item.download_url)) {
        fail(`${label} reuses download_url ${item.download_url}; duplicate crops/resizes of one source image do not count`);
      }
      seenDownloadUrls.set(item.download_url, label);
      if (!isHttpUrl(item.license_url)) fail(`${label} has an invalid license_url`);
      if (!nonempty(item.license_quote, MIN_LICENSE_QUOTE_LENGTH)) {
        fail(`${label} license_quote must be at least ${MIN_LICENSE_QUOTE_LENGTH} characters`);
      }
      if (item.owner_reuse_attestation !== undefined && item.owner_reuse_attestation !== null) {
        fail(`${label} must not mix owner-reuse attestation with an external license basis`);
      }
      if (item.capture_state !== undefined && item.capture_state !== null) {
        fail(`${label} must not include capture_state for an externally licensed download`);
      }
    }
    const retrievedAt = Date.parse(item.retrieved_at);
    const runStartedAt = Date.parse(expectedRunStartedAt);
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?(?:Z|[+-]\d{2}:\d{2})$/.test(String(item.retrieved_at || '')) || !Number.isFinite(retrievedAt)) {
      fail(`${label} has invalid retrieved_at`);
    } else {
      if (Number.isFinite(runStartedAt) && retrievedAt < runStartedAt) fail(`${label} retrieved_at predates the current run`);
      if (retrievedAt > Date.now() + 10 * 60 * 1000) fail(`${label} retrieved_at is implausibly in the future`);
    }
    const sha = String(item.sha256 || '').toLowerCase();
    if (!/^[0-9a-f]{64}$/.test(sha)) fail(`${label} sha256 is not a 64-hex digest`);
    else if (seenShas.has(sha)) fail(`duplicate sha256 shared by ${seenShas.get(sha)} and ${label}`);
    seenShas.set(sha, label);
    if (!nonempty(item.transformation)) fail(`${label} has no transformation`);
    if (!nonempty(item.transformation_note)) fail(`${label} has no transformation_note`);
    if (!nonempty(item.alt)) fail(`${label} has no alt text`);
    if (!nonempty(item.attribution_text)) fail(`${label} has no attribution_text`);
    if (item.commercial_use_allowed !== true) fail(`${label} must record commercial_use_allowed: true`);
    if (item.redistribution_allowed !== true) fail(`${label} must record redistribution_allowed: true`);

    const observed = files[localPath];
    if (!observed) fail(`${label} file is missing from the package references directory`);
    else {
      if (observed.regular !== true) fail(`${label} is not a regular file (${observed.invalidType || 'unknown type'})`);
      if (!(observed.size > 0)) fail(`${label} file is empty`);
      if (Number.isFinite(observed.size) && observed.size > 0) metrics.total_reference_image_bytes += observed.size;
      if (observed.size > MAX_REFERENCE_IMAGE_BYTES) {
        fail(`${label} exceeds ${MAX_REFERENCE_IMAGE_BYTES} bytes (${observed.size})`);
      }
      if (observed.metadataSegments > 0) fail(`${label} must have EXIF/XMP/text metadata stripped`);
      else if (observed.validRaster !== true) fail(`${label} bytes do not match a plausible raster structure for its extension`);
      if (String(observed.sha256 || '').toLowerCase() !== sha) {
        fail(`${label} sha256 does not match the file on disk`);
      }
    }

    // Exactly one adjacent credited figure per manifest item.
    const src = `/${localPath}`;
    const uses = figureUseCount.get(src) || 0;
    if (uses !== 1) {
      fail(`${label} must appear in exactly one <figure class="source-image"> block, found ${uses}`);
    }
    const figure = figures.find((candidate) => candidate.src === src);
    let credited = uses === 1;
    if (figure) {
      if (figure.hidden) {
        fail(`${label} source-image figure must be a top-level visibly rendered block without hidden, extra-class or inline-style attributes`);
        credited = false;
      }
      if (figure.alt !== item.alt) {
        fail(`${label} figure img alt does not match manifest alt`);
        credited = false;
      }
      const caption = figure.caption || '';
      const figureCredits = [
        ['source_page_url', item.source_page_url],
        ['publisher_or_creator', item.publisher_or_creator],
        ['attribution_text', item.attribution_text]
      ];
      if (!firstPartyScreenshot) figureCredits.push(['license_url', item.license_url]);
      for (const [creditField, value] of figureCredits) {
        if (!nonempty(String(value ?? '')) || !caption.includes(String(value))) {
          fail(`${label} figcaption is missing exact ${creditField}`);
          credited = false;
        }
      }
    } else {
      credited = false;
    }
    if (credited) metrics.credited_reference_images += 1;
  }

  if (metrics.total_reference_image_bytes > MAX_REFERENCE_IMAGE_TOTAL_BYTES) {
    fail(`reference images exceed the ${MAX_REFERENCE_IMAGE_TOTAL_BYTES}-byte aggregate limit (${metrics.total_reference_image_bytes})`);
  }

  // Bijection: every file under references/ has exactly one manifest entry.
  for (const filePath of Object.keys(files)) {
    if (!seenLocalPaths.has(filePath)) {
      fail(`references file has no manifest entry: ${filePath}`);
    }
  }
  // And every source-image figure must map back to a manifest item.
  for (const src of figureUseCount.keys()) {
    if (!seenLocalPaths.has(src.replace(/^\//, ''))) {
      fail(`<figure class="source-image"> references an unmanifested image: ${src}`);
    }
  }

  return { failures, metrics };
}

// Check ancestors in order, before any directory enumeration or byte read.
// Callers using platform aliases (such as /tmp) must supply the canonical path.
export const pathHasNoSymlinks = (target) => {
  const absolute = path.resolve(target);
  let current = path.parse(absolute).root;
  try {
    if (fs.lstatSync(current).isSymbolicLink()) return false;
    for (const part of path.relative(current, absolute).split(path.sep).filter(Boolean)) {
      current = path.join(current, part);
      if (fs.lstatSync(current).isSymbolicLink()) return false;
    }
    return true;
  } catch { return false; }
};

const containedPathWithoutSymlinks = (root, target) => {
  const relative = path.relative(path.resolve(root), path.resolve(target));
  return relative !== ".." && !relative.startsWith(".." + path.sep)
    && !path.isAbsolute(relative) && pathHasNoSymlinks(target);
};

/**
 * Filesystem adapter: observe every file below `referenceDir` and key it by
 * `prefix + relative path` so the result feeds validateSourceImageManifest.
 */
export function collectReferenceFiles(referenceDir, prefix) {
  const files = {};
  if (!fs.existsSync(referenceDir)) return files;
  const recordInvalid = (full, type) => {
    const relative = path.relative(referenceDir, full).split(path.sep).join('/');
    files[`${prefix}${relative}`] = {
      regular: false,
      invalidType: type,
      size: 0,
      sha256: '',
      validRaster: false
    };
  };
  if (!pathHasNoSymlinks(referenceDir)) {
    recordInvalid(referenceDir, "symlink or inaccessible ancestor");
    return files;
  }
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isSymbolicLink()) recordInvalid(full, 'symlink');
      else if (entry.isDirectory()) walk(full);
      else if (entry.isFile()) {
        const relative = path.relative(referenceDir, full).split(path.sep).join('/');
        const data = fs.readFileSync(full);
        const raster = inspectRasterImage(relative, data);
        files[`${prefix}${relative}`] = {
          regular: true,
          size: data.length,
          sha256: crypto.createHash('sha256').update(data).digest('hex'),
          validRaster: raster.valid,
          width: raster.width,
          height: raster.height,
          metadataSegments: raster.metadataSegments
        };
      } else recordInvalid(full, 'non-regular entry');
    }
  };
  walk(referenceDir);
  return files;
}

// Explicit approved mode, not a no-image exemption. Legacy manifests are unchanged.
export const SOURCE_FIRST_FALLBACK = 'source-first-fallback';
export const sourceFirstFallbackApproved = (policyText) =>
  /^image_selection_policy:\s*source-first-fallback$/m.test(policyText)
  && /^image_selection_scope:\s*akillness-git-blog-only$/m.test(policyText);

export function validateShippedImageFallback({ articleBody, articleStem, assetFiles = {} }) {
  const failures = [];
  const figures = extractSourceImageFigures(String(articleBody).replace(/class="explanatory-image"/g, 'class="source-image"'), { strictFallback: true })
    .filter((figure) => !figure.src?.includes('/references/'));
  if (!figures.length) failures.push('image-fallback: a visible credited original/generated local explanatory image is required');
  for (const figure of figures) {
    const local = String(figure.src || '').replace(/^\//, '');
    const file = assetFiles[local];
    if (!local.startsWith('assets/img/posts/' + articleStem + '/') || local.includes('..') || local.includes('/references/')) failures.push('image-fallback: asset must be local and outside references/');
    if (figure.hidden || figure.imgCount !== 1 || figure.captionCount !== 1 || !nonempty(figure.alt)) failures.push('image-fallback: explanatory figure must be visible with one image, alt and caption');
    const captionText = String(figure.caption || '');
    if (!/Original illustration by .+|AI-generated illustration by .+/i.test(captionText) || !captionText.includes('not source evidence')) failures.push('image-fallback: caption must identify original/AI-generated illustration, creator/tool and not source evidence');
    if (!file || file.regular !== true || !(file.size > 0) || file.size > MAX_REFERENCE_IMAGE_BYTES || file.validRaster !== true || file.metadataSegments > 0) failures.push('image-fallback: explanatory asset must have valid metadata-free raster bytes within size limits');
  }
  return { failures, figures };
}

export function imageFallbackContextFromDisk(packageRoot, articleStem, policyText) {
  const draftRoot = path.join(packageRoot, 'draft');
  const assetPrefix = 'assets/img/posts/' + articleStem + '/';
  const assetDir = path.join(draftRoot, assetPrefix);
  const assetFiles = containedPathWithoutSymlinks(draftRoot, assetDir)
    ? collectReferenceFiles(assetDir, assetPrefix) : {};
  const reportPath = path.join(packageRoot, 'research', 'image-source-audit.md');
  const safeReport = containedPathWithoutSymlinks(packageRoot, reportPath) && fs.lstatSync(reportPath).isFile();
  const reportBytes = safeReport ? fs.readFileSync(reportPath) : Buffer.alloc(0);
  return { approved: sourceFirstFallbackApproved(policyText), assetFiles, auditReport: { path: 'research/image-source-audit.md', size: reportBytes.length, sha256: crypto.createHash('sha256').update(reportBytes).digest('hex'), text: reportBytes.toString('utf8') } };
}

export function validateImageFallback({ manifest, articleBody, articleStem, evidenceSourceUrls = [], approved = false, assetFiles = {}, auditReport = null }) {
  const result = validateShippedImageFallback({ articleBody, articleStem, assetFiles });
  const failures = result.failures;
  if (!approved) failures.push('image-fallback: repo source-first policy approval is absent');
  const audit = manifest?.source_first_audit;
  if (audit?.report_path !== 'research/image-source-audit.md' || !/^[a-f0-9]{64}$/.test(audit?.sha256 || '') || audit?.sha256 !== auditReport?.sha256 || !(auditReport?.size >= 80)) failures.push('image-fallback: source-first audit must bind the nonempty internal report bytes');
  const sources = new Set(evidenceSourceUrls);
  if (!Array.isArray(audit?.candidates) || !audit.candidates.length) failures.push('image-fallback: inspected source candidates are required');
  for (const candidate of audit?.candidates || []) {
    if (!sources.has(candidate.source_page_url) || !isHttpUrl(candidate.source_page_url) || !auditReport?.text?.includes(candidate.source_page_url) || !nonempty(candidate.reason, 20)) failures.push('image-fallback: candidate must bind evidence URL, audit report and a concrete reason');
    if (!['used', 'rights-unclear', 'irrelevant', 'no-usable-image'].includes(candidate.decision)) failures.push('image-fallback: invalid source candidate decision');
    if (candidate.decision === 'used' && !manifest.images?.some((item) => item.source_page_url === candidate.source_page_url)) failures.push('image-fallback: usable source candidate must have a source manifest item');
  }
  const images = manifest?.explanatory_images;
  if (!Array.isArray(images) || !images.length) failures.push('image-fallback: explanatory_images sidecar is required');
  const paths = new Set();
  for (const item of images || []) {
    const observed = assetFiles[item.local_path];
    const figures = result.figures.filter((figure) => figure.src === '/' + item.local_path);
    if (paths.has(item.local_path)) failures.push('image-fallback: duplicate explanatory path');
    paths.add(item.local_path);
    if (!['original', 'generated'].includes(item.kind) || !nonempty(item.creator) || !nonempty(item.alt) || !nonempty(item.attribution_text)) failures.push('image-fallback: kind, creator, alt and attribution are required');
    const label = item.kind === 'generated' ? 'AI-generated illustration by ' : 'Original illustration by ';
    if (!String(item.attribution_text).includes(label + item.creator) || !String(item.attribution_text).includes('not source evidence')) failures.push('image-fallback: honest origin and non-evidence credit required');
    if (!/^[a-f0-9]{64}$/.test(item.sha256 || '') || item.sha256 !== observed?.sha256 || !(item.bytes > 0) || item.bytes !== observed?.size) failures.push('image-fallback: explanatory image hash/bytes mismatch');
    if (figures.length !== 1 || figures[0]?.alt !== item.alt || !figures[0]?.caption?.includes(item.attribution_text)) failures.push('image-fallback: explanatory sidecar must match one visible figure exactly');
  }
  for (const figure of result.figures) if (!paths.has(figure.src?.replace(/^\//, ''))) failures.push('image-fallback: unmanifested explanatory image');
  return { failures };
}
