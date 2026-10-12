import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { compareRouteSets, validatePublicPostCohort, parsePostFrontMatter } from '../lib/public-post-cohort.mjs';

test('folds original YAML title continuations without swallowing the next field', () => {
  const result = parsePostFrontMatter('---\ntitle: Top Papers in Computer Vision, NLP, Speech, Multimodal AI, Core ML, RecSys,\n  and Graph ML\ndate: 2024-05-18 18:20:00 +0800\npublished: true\n---\nBody.');
  assert.equal(result.fields.title, 'Top Papers in Computer Vision, NLP, Speech, Multimodal AI, Core ML, RecSys, and Graph ML');
  assert.equal(result.fields.date, '2024-05-18 18:20:00 +0800');
  assert.equal(result.fields.published, 'true');
});
test('folds a wrapped quoted title but does not include a following comment', () => {
  const result = parsePostFrontMatter('---\ntitle: "A wrapped\n  title"\n  # editorial comment\nads: false\n---\nBody.');
  assert.equal(result.fields.title, 'A wrapped title');
  assert.equal(result.fields.ads, 'false');
});

const now = new Date('2026-10-12T12:00:00.000Z');
const testTempRoot = process.env.PUBLIC_POST_COHORT_TEST_TMP || process.env.RUNNER_TEMP || os.tmpdir();
if (!path.isAbsolute(testTempRoot)) throw new Error('test temporary directory must be absolute');

async function fixture(t) {
  const root = await fs.mkdtemp(path.join(testTempRoot, 'public-post-cohort-'));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  return root;
}

async function writePost(root, relative, frontmatter) {
  const file = path.join(root, '_posts', relative);
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, `---\n${frontmatter}\n---\nPost body.\n`, 'utf8');
  return `_posts/${relative}`;
}

const postEntry = (sourcePath, url, fields = {}) => ({
  path: sourcePath,
  url,
  title: fields.title ?? 'A title',
  date: fields.date ?? '2026-10-01T00:00:00+09:00',
  noindex: fields.noindex ?? false,
  hidden: fields.hidden ?? false,
  restored_archive: fields.restored_archive ?? false
});
const manifest = (posts) => ({ built_at: '2026-10-12T12:00:00+00:00', posts });

 test('reports a published source missing from built manifest and a manifest source missing on disk', async (t) => {
  const root = await fixture(t);
  const pathA = await writePost(root, '2020-01-01-present.md', 'title: Present\ndate: 2020-01-01 12:00:00 +0800');
  const result = await validatePublicPostCohort({ root, manifest: manifest([postEntry('_posts/no-such.md', '/posts/ghost/')]), now });
  assert.ok(result.errors.some((error) => error.includes(`published source is missing from manifest: ${pathA}`)));
  assert.ok(result.errors.some((error) => error.includes('manifest contains an extra source path: _posts/no-such.md')));
});

test('rejects an extra route for a published:false source', async (t) => {
  const root = await fixture(t);
  const source = await writePost(root, '2020-01-02-unpublished.md', 'title: Hidden\npublished: false\ndate: 2020-01-02 12:00:00 +0800');
  const result = await validatePublicPostCohort({ root, manifest: manifest([postEntry(source, '/posts/unpublished/')]), now });
  assert.ok(result.errors.some((error) => error.includes(`manifest contains unpublished or future source: ${source}`)));
});

test('rejects duplicate output URLs and duplicate manifest paths', async (t) => {
  const root = await fixture(t);
  const source = await writePost(root, '2020-01-03-duplicate.md', 'title: Duplicate\ndate: 2020-01-03 12:00:00 +0800');
  const result = await validatePublicPostCohort({ root, manifest: manifest([
    postEntry(source, '/posts/same/'), postEntry(source, '/posts/same/')
  ]), now });
  assert.ok(result.errors.some((error) => error.includes('duplicate route /posts/same/')));
  assert.ok(result.errors.some((error) => error.includes(`published source occurs 2 times in manifest: ${source}`)));
});

test('set equality reports both missing and unexpected discoverability routes', () => {
  const result = compareRouteSets(['/posts/kept/', '/posts/unexpected/'], ['/posts/kept/', '/posts/missing/'], 'sitemap');
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((error) => error.includes('missing expected route: /posts/missing/')));
  assert.ok(result.errors.some((error) => error.includes('unexpected route: /posts/unexpected/')));
});

test('supports five generic noindex source examples without a live-count constant', async (t) => {
  const root = await fixture(t);
  const directives = ['noindex, follow', 'follow, noindex', 'NOINDEX', 'index, noindex, follow', 'noindex'];
  const entries = [];
  for (let i = 0; i < directives.length; i += 1) {
    const source = await writePost(root, `2020-02-0${i + 1}-note-${i}.md`, `title: Note ${i}\ndate: 2020-02-0${i + 1} 10:00:00 +0800\nrobots: ${directives[i]}`);
    entries.push(postEntry(source, `/posts/note-${i}/`, {
      title: `Note ${i}`,
      date: `2020-02-0${i + 1}T02:00:00.000Z`,
      noindex: true
    }));
  }
  const result = await validatePublicPostCohort({ root, manifest: manifest(entries), now });
  assert.equal(result.ok, true, result.errors.join('\n'));
  assert.equal(result.expectedPublishedRoutes.length, 5);
  assert.deepEqual(result.expectedVisibleRoutes, []);
});

test('excludes future dates, honors legacy offsets, filename Seoul-midnight fallback, nested paths and mapped uppercase routes', async (t) => {
  const root = await fixture(t);
  const nested = await writePost(root, 'archive/2020-03-01-UpperCASE-Stem.md', 'title: Uppercase & Encoded\ndate: 2020-03-01 08:00:00 +0800');
  const filenameDate = await writePost(root, 'notes/2020-03-02-fallback.markdown', 'title: Date fallback');
  const future = await writePost(root, '2026-10-13-tomorrow.md', 'title: Future\ndate: 2026-10-13 00:00:00 +0900');
  const posts = [
    postEntry(nested, '/posts/a-route-not-guessed/', { title: 'Uppercase & Encoded', date: '2020-03-01T00:00:00.000Z' }),
    postEntry(filenameDate, '/posts/encoded-%E2%9C%93/', { title: 'Date fallback', date: '2020-03-02T00:00:00+09:00' })
  ];
  const result = await validatePublicPostCohort({ root, manifest: manifest(posts), now });
  assert.equal(result.ok, true, result.errors.join('\n'));
  assert.ok(!result.expectedPublishedRoutes.includes('/posts/future/'));
  assert.deepEqual(result.expectedPublishedRoutes, ['/posts/a-route-not-guessed/', '/posts/encoded-%E2%9C%93/']);
  assert.ok(!result.errors.some((error) => error.includes(future)));
  assert.equal(compareRouteSets(['/posts/encoded-%E2%9C%93/'], ['/posts/encoded-%E2%9C%93/'], 'search JSON').ok, true);
});

test('treats a date-string restored_archive marker as present and exposes route-to-source metadata', async (t) => {
  const root = await fixture(t);
  const source = await writePost(root, '2020-06-01-restored.md', 'title: Restored\ndate: 2020-06-01 10:00:00 +0900\nrestored_archive: "2026-10-12"');
  const result = await validatePublicPostCohort({ root, manifest: manifest([
    postEntry(source, '/posts/restored-route/', {
      title: 'Restored', date: '2020-06-01T01:00:00.000Z', restored_archive: true
    })
  ]), now });
  assert.equal(result.ok, true, result.errors.join('\\n'));
  assert.equal(result.routeToSource['/posts/restored-route/'].path, source);
  assert.equal(result.routeToSource['/posts/restored-route/'].restored_archive, true);
  assert.equal(result.routeToSource['/posts/restored-route/'].restored_archive_id, '2026-10-12');
});

test('permits Jekyll runtime hidden protection for noindex sources but not indexable sources', async (t) => {
  const root = await fixture(t);
  const source = await writePost(root, '2020-06-02-protected.md', 'title: Protected\ndate: 2020-06-02 10:00:00 +0900\nrobots: noindex, follow');
  const result = await validatePublicPostCohort({ root, manifest: manifest([
    postEntry(source, '/posts/protected/', {
      title: 'Protected', date: '2020-06-02T01:00:00.000Z', noindex: true, hidden: true
    })
  ]), now });
  assert.equal(result.ok, true, result.errors.join('\\n'));
  assert.deepEqual(result.expectedVisibleRoutes, []);
  assert.equal(result.routeToSource['/posts/protected/'].hidden, true);
});

test('limits the feed route set to the newest five manifest posts', async (t) => {
  const root = await fixture(t);
  const entries = [];
  for (let i = 0; i < 7; i += 1) {
    const source = await writePost(root, `2020-05-0${i + 1}-feed-${i}.md`, `title: Feed ${i}\ndate: 2020-05-0${i + 1} 10:00:00 +0900`);
    entries.push(postEntry(source, `/posts/feed-${i}/`, {
      title: `Feed ${i}`,
      date: `2020-05-0${i + 1}T01:00:00.000Z`
    }));
  }
  const result = await validatePublicPostCohort({ root, manifest: manifest(entries), now });
  assert.equal(result.ok, true, result.errors.join('\\n'));
  assert.deepEqual(result.expectedFeedRoutes, ['/posts/feed-0/', '/posts/feed-1/', '/posts/feed-2/', '/posts/feed-3/', '/posts/feed-4/']);
  assert.equal(result.expectedFeedRoutes.length, 5);
});

test('rejects a source noindex mismatch and a hidden indexable source', async (t) => {
  const root = await fixture(t);
  const noindexSource = await writePost(root, '2020-04-01-noindex.md', 'title: noindex\ndate: 2020-04-01 10:00:00 +0900\nrobots: noindex, follow');
  const hiddenSource = await writePost(root, '2020-04-02-hidden.md', 'title: hidden\ndate: 2020-04-02 10:00:00 +0900\nhidden: true');
  const result = await validatePublicPostCohort({ root, manifest: manifest([
    postEntry(noindexSource, '/posts/noindex/', { noindex: false }),
    postEntry(hiddenSource, '/posts/hidden/', { hidden: true })
  ]), now });
  assert.ok(result.errors.some((error) => error.includes(`noindex mismatch for ${noindexSource}`)));
  assert.ok(result.errors.some((error) => error.includes(`hidden suppresses indexable published source: ${hiddenSource}`)));
});
