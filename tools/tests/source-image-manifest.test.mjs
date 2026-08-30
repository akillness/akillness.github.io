import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import {
  ALLOWED_LICENSE_BASES,
  MINIMUM_REFERENCE_IMAGES,
  MAXIMUM_REFERENCE_IMAGES,
  MAX_REFERENCE_IMAGE_BYTES,
  MAX_REFERENCE_IMAGE_TOTAL_BYTES,
  collectReferenceFiles,
  rasterSignatureMatches,
  referencesPrefix,
  sourceImageContractAppliesToStem,
  validateSourceImageManifest
} from '../lib/source-image-manifest.mjs';

const STEM = '2026-09-01-example-audit';
const PREFIX = referencesPrefix(STEM);
const RUN_ID = '20260901-0100-example-audit';

const fakeSha = (i) => crypto.createHash('sha256').update(`image-${i}`).digest('hex');
const fakePng = (width = 256, height = 256, withMetadata = false) => {
  const bytes = Buffer.alloc(withMetadata ? 57 : 45);
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).copy(bytes, 0);
  bytes.writeUInt32BE(13, 8);
  bytes.write('IHDR', 12, 'ascii');
  bytes.writeUInt32BE(width, 16);
  bytes.writeUInt32BE(height, 20);
  if (withMetadata) bytes.write('eXIf', 37, 'ascii');
  bytes.write('IEND', (withMetadata ? 45 : 33) + 4, 'ascii');
  return bytes;
};
const fakeJpeg = (width = 256, height = 256, withMetadata = false) => {
  const sof = Buffer.alloc(13);
  Buffer.from([0xff, 0xc0, 0x00, 0x0b, 0x08]).copy(sof, 0);
  sof.writeUInt16BE(height, 5);
  sof.writeUInt16BE(width, 7);
  return Buffer.concat([Buffer.from([0xff, 0xd8]), ...(withMetadata ? [Buffer.from([0xff, 0xe1, 0x00, 0x04, 0x45, 0x58])] : []), sof]);
};
const fakeWebp = (width = 256, height = 256, withMetadata = false) => {
  const bytes = Buffer.alloc(withMetadata ? 38 : 30);
  bytes.write('RIFF', 0, 'ascii');
  bytes.write('WEBP', 8, 'ascii');
  bytes.write('VP8X', 12, 'ascii');
  bytes.writeUInt32LE(10, 16);
  const w = width - 1;
  const h = height - 1;
  bytes[24] = w & 0xff; bytes[25] = (w >> 8) & 0xff; bytes[26] = (w >> 16) & 0xff;
  bytes[27] = h & 0xff; bytes[28] = (h >> 8) & 0xff; bytes[29] = (h >> 16) & 0xff;
  if (withMetadata) bytes.write('EXIF', 30, 'ascii');
  return bytes;
};

function makeItem(i, overrides = {}) {
  return {
    local_path: `${PREFIX}figure-${i}.png`,
    source_page_url: `https://example.com/docs/page-${i}`,
    download_url: `https://example.com/raw/figure-${i}.png`,
    publisher_or_creator: `Example Publisher ${i}`,
    license_basis: 'cc-by',
    license_url: 'https://creativecommons.org/licenses/by/4.0/',
    license_quote:
      'You are free to share and adapt the material for any purpose, even commercially, with attribution.',
    retrieved_at: '2026-08-31T02:30:00+09:00',
    sha256: fakeSha(i),
    transformation: 'none',
    transformation_note: 'Downloaded original file, no modification.',
    alt: `Figure ${i} from the inspected source`,
    attribution_text: `Image ${i} by Example Publisher ${i}, CC BY 4.0`,
    commercial_use_allowed: true,
    redistribution_allowed: true,
    ...overrides
  };
}

function figureHtml(item) {
  return [
    '<figure class="source-image">',
    `  <img src="/${item.local_path}" alt="${item.alt}" />`,
    `  <figcaption>Source: <a href="${item.source_page_url}">${item.publisher_or_creator}</a> — ${item.attribution_text} (<a href="${item.license_url}">license</a>)</figcaption>`,
    '</figure>'
  ].join('\n');
}

function makeFixture({ count = MINIMUM_REFERENCE_IMAGES, mutateItems, mutateFixture } = {}) {
  const items = Array.from({ length: count }, (_, i) => makeItem(i + 1));
  if (mutateItems) mutateItems(items);
  const fixture = {
    manifest: { schema_version: 1, run_id: RUN_ID, images: items },
    articleBody: `Intro paragraph.\n\n${items.map((item) => figureHtml(item)).join('\n\n')}\n\nOutro.`,
    articleStem: STEM,
    evidenceSourceUrls: items.map((item) => item.source_page_url),
    referenceFiles: Object.fromEntries(
      items.map((item) => [item.local_path, { regular: true, size: 1024, sha256: item.sha256, validRaster: true }])
    ),
    expectedRunId: RUN_ID,
    expectedRunStartedAt: '2026-08-31T01:00:00+09:00'
  };
  if (mutateFixture) mutateFixture(fixture);
  return fixture;
}

const run = (fixture) => validateSourceImageManifest(fixture);

test('source-image contract effective date preserves legacy posts and closes the opt-out for new posts', () => {
  assert.equal(sourceImageContractAppliesToStem('2026-08-31-legacy-post'), false);
  assert.equal(sourceImageContractAppliesToStem('2026-09-01-first-covered-post'), true);
  assert.equal(sourceImageContractAppliesToStem('2027-01-01-covered-post'), true);
  assert.equal(sourceImageContractAppliesToStem('not-a-dated-post'), false);
});

test('true positive: a fully compliant package passes with full metrics', () => {
  const { failures, metrics } = run(makeFixture());
  assert.deepEqual(failures, []);
  assert.equal(metrics.reference_images, 4);
  assert.equal(metrics.credited_reference_images, 4);
});

test('true positive: repo-license-covers-assets passes when pinned_ref is present', () => {
  const { failures } = run(
    makeFixture({
      mutateItems: (items) => {
        items[0].license_basis = 'repo-license-covers-assets';
        items[0].license_url = 'https://example.com/repo/LICENSE';
        items[0].pinned_ref = '5de7275fe87a66a19d52a4d9b0b3a4f2a5a90115';
      }
    })
  );
  assert.deepEqual(failures, []);
});

test('every allowed license basis is accepted', () => {
  for (const basis of ALLOWED_LICENSE_BASES) {
    const { failures } = run(
      makeFixture({
        mutateItems: (items) => {
          items[0].license_basis = basis;
          if (basis === 'repo-license-covers-assets') items[0].pinned_ref = 'v1.0.0';
        }
      })
    );
    assert.deepEqual(failures, [], `license basis ${basis} should pass`);
  }
});

test('fails closed when the sidecar manifest is missing', () => {
  const fixture = makeFixture();
  fixture.manifest = null;
  const { failures } = run(fixture);
  assert.ok(failures.some((f) => f.includes('fails closed')));
});

test('fails outside the 4 to 12 reference-image count band', () => {
  const tooFew = run(makeFixture({ count: 3 }));
  assert.ok(tooFew.failures.some((f) => f.includes('at least 4 source-derived reference images')));
  const tooMany = run(makeFixture({ count: MAXIMUM_REFERENCE_IMAGES + 1 }));
  assert.ok(tooMany.failures.some((f) => f.includes('at most 12 source-derived reference images')));
});

test('fails on a non-allowlisted license basis (fail closed)', () => {
  const { failures } = run(
    makeFixture({ mutateItems: (items) => { items[1].license_basis = 'cc-by-nc'; } })
  );
  assert.ok(failures.some((f) => f.includes('license_basis "cc-by-nc" is not in the allowlist')));
});

test('fails when repo-license-covers-assets lacks pinned_ref', () => {
  const { failures } = run(
    makeFixture({ mutateItems: (items) => { items[0].license_basis = 'repo-license-covers-assets'; } })
  );
  assert.ok(failures.some((f) => f.includes('without a pinned_ref')));
});

test('fails when license_quote is shorter than 40 characters', () => {
  const { failures } = run(
    makeFixture({ mutateItems: (items) => { items[2].license_quote = 'Short quote.'; } })
  );
  assert.ok(failures.some((f) => f.includes('license_quote must be at least 40 characters')));
});

test('fails when source_page_url is not an evidence-pack source_url', () => {
  const { failures } = run(
    makeFixture({
      mutateFixture: (fixture) => { fixture.evidenceSourceUrls = fixture.evidenceSourceUrls.slice(1); }
    })
  );
  assert.ok(failures.some((f) => f.includes('not an evidence-pack source_url')));
});

test('fails on duplicate sha256 and duplicate local_path', () => {
  const dupSha = run(
    makeFixture({
      mutateItems: (items) => { items[1].sha256 = items[0].sha256; },
      mutateFixture: (fixture) => {
        fixture.referenceFiles[fixture.manifest.images[1].local_path].sha256 = fixture.manifest.images[0].sha256;
      }
    })
  );
  assert.ok(dupSha.failures.some((f) => f.includes('duplicate sha256')));

  const dupPath = run(
    makeFixture({ mutateItems: (items) => { items[1].local_path = items[0].local_path; } })
  );
  assert.ok(dupPath.failures.some((f) => f.includes('duplicate local_path')));
});

test('fails when a duplicate crop/resize reuses the same download_url', () => {
  const { failures } = run(
    makeFixture({ mutateItems: (items) => { items[1].download_url = items[0].download_url; } })
  );
  assert.ok(failures.some((f) => f.includes('duplicate crops/resizes')));
});

test('fails on invalid image extension', () => {
  const { failures } = run(
    makeFixture({
      mutateItems: (items) => { items[0].local_path = `${PREFIX}figure-1.gif`; },
      mutateFixture: (fixture) => {
        fixture.referenceFiles = Object.fromEntries(
          fixture.manifest.images.map((entry) => [entry.local_path, { regular: true, size: 1024, sha256: entry.sha256, validRaster: true }])
        );
        fixture.articleBody = `${fixture.manifest.images.map((entry) => figureHtml(entry)).join('\n\n')}`;
      }
    })
  );
  assert.ok(failures.some((f) => f.includes('raster extension')));
});

test('fails on missing, empty, oversized, or hash-mismatched files', () => {
  const missing = run(
    makeFixture({
      mutateFixture: (fixture) => { delete fixture.referenceFiles[fixture.manifest.images[0].local_path]; }
    })
  );
  assert.ok(missing.failures.some((f) => f.includes('missing from the package references directory')));

  const empty = run(
    makeFixture({
      mutateFixture: (fixture) => { fixture.referenceFiles[fixture.manifest.images[0].local_path].size = 0; }
    })
  );
  assert.ok(empty.failures.some((f) => f.includes('file is empty')));

  const oversized = run(
    makeFixture({
      mutateFixture: (fixture) => {
        fixture.referenceFiles[fixture.manifest.images[0].local_path].size = MAX_REFERENCE_IMAGE_BYTES + 1;
      }
    })
  );
  assert.ok(oversized.failures.some((f) => f.includes('exceeds')));

  const mismatch = run(
    makeFixture({
      mutateFixture: (fixture) => {
        fixture.referenceFiles[fixture.manifest.images[0].local_path].sha256 = fakeSha(99);
      }
    })
  );
  assert.ok(mismatch.failures.some((f) => f.includes('does not match the file on disk')));
});

test('fails when retrieval time predates the run or is implausibly future-dated', () => {
  const old = run(makeFixture({ mutateItems: (items) => { items[0].retrieved_at = '2026-08-30T23:59:59+09:00'; } }));
  assert.ok(old.failures.some((f) => f.includes('predates the current run')));
  const future = run(makeFixture({ mutateItems: (items) => { items[0].retrieved_at = '2999-01-01T00:00:00Z'; } }));
  assert.ok(future.failures.some((f) => f.includes('implausibly in the future')));
});

test('fails when commercial use or redistribution is not affirmatively true', () => {
  const commercial = run(
    makeFixture({ mutateItems: (items) => { items[3].commercial_use_allowed = false; } })
  );
  assert.ok(commercial.failures.some((f) => f.includes('commercial_use_allowed: true')));

  const redistribution = run(
    makeFixture({ mutateItems: (items) => { items[3].redistribution_allowed = 'yes'; } })
  );
  assert.ok(redistribution.failures.some((f) => f.includes('redistribution_allowed: true')));
});

test('fails when an item has no figure, two figures, or a stripped figcaption credit', () => {
  const noFigure = run(
    makeFixture({
      mutateFixture: (fixture) => {
        fixture.articleBody = fixture.manifest.images.slice(1).map((item) => figureHtml(item)).join('\n\n');
      }
    })
  );
  assert.ok(noFigure.failures.some((f) => f.includes('exactly one <figure class="source-image"> block, found 0')));
  assert.equal(noFigure.metrics.credited_reference_images, 3);

  const doubled = run(
    makeFixture({
      mutateFixture: (fixture) => {
        fixture.articleBody += `\n\n${figureHtml(fixture.manifest.images[0])}`;
      }
    })
  );
  assert.ok(doubled.failures.some((f) => f.includes('found 2')));

  const uncredited = run(
    makeFixture({
      mutateFixture: (fixture) => {
        const item = fixture.manifest.images[0];
        fixture.articleBody = fixture.articleBody.replace(item.attribution_text, 'no credit here');
      }
    })
  );
  assert.ok(uncredited.failures.some((f) => f.includes('figcaption is missing exact attribution_text')));
  assert.equal(uncredited.metrics.credited_reference_images, 3);
});

test('fails when the figure img alt differs from the manifest alt', () => {
  const { failures } = run(
    makeFixture({
      mutateFixture: (fixture) => {
        const item = fixture.manifest.images[0];
        fixture.articleBody = fixture.articleBody.replace(`alt="${item.alt}"`, 'alt="something else"');
      }
    })
  );
  assert.ok(failures.some((f) => f.includes('img alt does not match manifest alt')));
});

test('fails on orphan references files and unmanifested figures', () => {
  const orphan = run(
    makeFixture({
      mutateFixture: (fixture) => {
        fixture.referenceFiles[`${PREFIX}stray.png`] = { regular: true, size: 10, sha256: fakeSha(50), validRaster: true };
      }
    })
  );
  assert.ok(orphan.failures.some((f) => f.includes('references file has no manifest entry')));

  const unmanifested = run(
    makeFixture({
      mutateFixture: (fixture) => {
        fixture.articleBody += `\n\n${figureHtml(makeItem(9))}`;
      }
    })
  );
  assert.ok(unmanifested.failures.some((f) => f.includes('unmanifested image')));
});

test('fails on wrong schema_version, run_id mismatch, and path escape', () => {
  const schema = run(
    makeFixture({ mutateFixture: (fixture) => { fixture.manifest.schema_version = 2; } })
  );
  assert.ok(schema.failures.some((f) => f.includes('unsupported schema_version')));

  const runId = run(
    makeFixture({ mutateFixture: (fixture) => { fixture.manifest.run_id = 'another-run'; } })
  );
  assert.ok(runId.failures.some((f) => f.includes('does not match workspace run')));

  const escape = run(
    makeFixture({
      mutateItems: (items) => { items[0].local_path = 'assets/img/posts/other-post/references/figure-1.png'; }
    })
  );
  assert.ok(escape.failures.some((f) => f.includes('local_path must live under')));
});

test('does not count source figures hidden in comments, Liquid, details or code', () => {
  const commented = makeFixture();
  commented.articleBody = `<!--\n${commented.articleBody}\n-->`;
  const commentResult = run(commented);
  assert.ok(commentResult.failures.some((f) => f.includes('found 0')));
  assert.equal(commentResult.metrics.credited_reference_images, 0);

  const fenced = makeFixture();
  fenced.articleBody = `   \`\`\`html\n${fenced.articleBody}\n   \`\`\`\``;
  const fenceResult = run(fenced);
  assert.ok(fenceResult.failures.some((f) => f.includes('found 0')));
  assert.equal(fenceResult.metrics.credited_reference_images, 0);

  const inline = makeFixture();
  inline.articleBody = `\`\`${inline.articleBody.replace(/\n/g, '')}\`\``;
  const inlineResult = run(inline);
  assert.ok(inlineResult.failures.some((f) => f.includes('found 0')));
  assert.equal(inlineResult.metrics.credited_reference_images, 0);

  const liquid = makeFixture();
  liquid.articleBody = `{% comment %}\n${liquid.articleBody}\n{% endcomment %}`;
  assert.ok(run(liquid).failures.some((f) => f.includes('found 0')));

  const details = makeFixture();
  details.articleBody = `<details open>\n${details.articleBody}\n</details>`;
  assert.ok(run(details).failures.some((f) => f.includes('visibly rendered')));

  const hiddenParent = makeFixture();
  hiddenParent.articleBody = `<div style="display:none"><div></div>\n${hiddenParent.articleBody}\n</div>`;
  assert.ok(run(hiddenParent).failures.some((f) => f.includes('visibly rendered')));

  for (const [open, close] of [
    ['<template>', '</template>'],
    ['<noscript>', '</noscript>'],
    ['<td hidden>', '</td>'],
    ['<dialog>', '</dialog>'],
    ['<dd hidden>', '</dd>'],
    ['<button hidden>', '</button>'],
    ['<div data-src="a/">', '</div>'],
    ['{% if false %}', '{% endif %}']
  ]) {
    const inert = makeFixture();
    inert.articleBody = `${open}\n${inert.articleBody}\n${close}`;
    assert.ok(run(inert).failures.some((f) => f.includes('visibly rendered')), `Expected inert wrapper ${open} to fail`);
  }
});

test('does not mistake Markdown autolinks for HTML ancestors', () => {
  const fixture = makeFixture();
  fixture.articleBody = `<https://example.com/reference>\n\n${fixture.articleBody}`;
  assert.deepEqual(run(fixture).failures, []);
});

test('fails source figures or images with hidden and inline-style attributes', () => {
  const hiddenFigure = makeFixture();
  hiddenFigure.articleBody = hiddenFigure.articleBody.replace('<figure class="source-image">', '<figure class="source-image" hidden>');
  assert.ok(run(hiddenFigure).failures.some((f) => f.includes('visibly rendered')));

  const styledImage = makeFixture();
  styledImage.articleBody = styledImage.articleBody.replace(' />', ' style="visibility:hidden" />');
  assert.ok(run(styledImage).failures.some((f) => f.includes('visibly rendered')));

  const extraClass = makeFixture();
  extraClass.articleBody = extraClass.articleBody.replace('class="source-image"', 'class="source-image custom-visibility"');
  assert.ok(run(extraClass).failures.some((f) => f.includes('visibly rendered')));
});

test('decodes safe HTML entities before exact attribution matching', () => {
  const fixture = makeFixture({
    mutateItems: (items) => {
      items[0].alt = 'Chart by A & B';
      items[0].publisher_or_creator = 'A & B Institute';
      items[0].attribution_text = 'Chart © A & B Institute';
    },
    mutateFixture: (value) => {
      value.articleBody = value.articleBody.replaceAll('&', '&amp;').replace('©', '&#169;');
    }
  });
  assert.deepEqual(run(fixture).failures, []);
});

test('fails on non-raster bytes and an excessive aggregate image payload', () => {
  const invalid = makeFixture();
  invalid.referenceFiles[invalid.manifest.images[0].local_path].validRaster = false;
  assert.ok(run(invalid).failures.some((f) => f.includes('bytes do not match')));

  const aggregate = makeFixture({ count: 5 });
  const each = Math.floor(MAX_REFERENCE_IMAGE_TOTAL_BYTES / 5) + 1;
  for (const info of Object.values(aggregate.referenceFiles)) info.size = each;
  assert.ok(run(aggregate).failures.some((f) => f.includes('aggregate limit')));
});

test('recognizes metadata-free plausible PNG, JPEG and WebP structures by declared extension', () => {
  assert.equal(rasterSignatureMatches('x.png', fakePng()), true);
  assert.equal(rasterSignatureMatches('x.jpg', fakeJpeg()), true);
  assert.equal(rasterSignatureMatches('x.jpeg', fakeJpeg()), true);
  assert.equal(rasterSignatureMatches('x.webp', fakeWebp()), true);
  assert.equal(rasterSignatureMatches('x.png', fakePng(256, 256, true)), false);
  assert.equal(rasterSignatureMatches('x.jpg', fakeJpeg(256, 256, true)), false);
  assert.equal(rasterSignatureMatches('x.webp', fakeWebp(256, 256, true)), false);
  const malformedPng = fakePng(); malformedPng.writeUInt32BE(999, 33);
  assert.equal(rasterSignatureMatches('x.png', malformedPng), false);
  assert.equal(rasterSignatureMatches('x.png', fakePng(1, 1)), false);
  assert.equal(rasterSignatureMatches('x.png', Buffer.from('<html>')), false);
  assert.equal(rasterSignatureMatches('x.svg.png', Buffer.from('<svg/>')), false);
});

test('collectReferenceFiles records raster facts and rejects symlinks', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'source-image-test-'));
  try {
    const payload = fakePng();
    fs.writeFileSync(path.join(dir, 'figure-1.png'), payload);
    fs.symlinkSync('figure-1.png', path.join(dir, 'linked.png'));
    const files = collectReferenceFiles(dir, PREFIX);
    const key = `${PREFIX}figure-1.png`;
    assert.ok(files[key]);
    assert.equal(files[key].regular, true);
    assert.equal(files[key].validRaster, true);
    assert.equal(files[key].metadataSegments, 0);
    assert.equal(files[key].size, payload.length);
    assert.equal(files[key].sha256, crypto.createHash('sha256').update(payload).digest('hex'));
    assert.equal(files[`${PREFIX}linked.png`].regular, false);
    assert.equal(files[`${PREFIX}linked.png`].invalidType, 'symlink');
    assert.deepEqual(collectReferenceFiles(path.join(dir, 'missing'), PREFIX), {});
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('publication scope fails closed when the references directory is absent', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'source-image-scope-'));
  try {
    const stem = '2026-09-02-scope-missing-images';
    fs.mkdirSync(path.join(root, '_workspace', 'current', 'draft', '_posts'), { recursive: true });
    fs.mkdirSync(path.join(root, '_workspace', 'current', 'draft', 'assets', 'img', 'posts', stem), { recursive: true });
    fs.writeFileSync(path.join(root, '_workspace', 'current', 'draft', '_posts', `${stem}.md`), '---\ntitle: test\n---\n');
    fs.writeFileSync(path.join(root, '_workspace', 'current', 'draft', 'assets', 'img', 'posts', stem, 'original.svg'), '<svg/>');
    const scopeTool = path.resolve(process.cwd(), 'tools', 'verify-publication-scope.mjs');
    const result = spawnSync(process.execPath, [scopeTool, '--root', root], { encoding: 'utf8' });
    assert.notEqual(result.status, 0);
    assert.match(`${result.stdout}${result.stderr}`, /4–12 source-derived reference images/);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});
