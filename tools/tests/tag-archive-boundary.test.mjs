import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { readTagArchiveMinimum, readCategoryArchiveMinimum } from '../verify-site-quality.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url));
assert.ok(process.env.TEST_NODE_MODULES, 'FAIL CLOSED: set TEST_NODE_MODULES to the external node_modules installed from tools/template-test-deps/package-lock.json; never install inside this repository.');
const external = fs.realpathSync(process.env.TEST_NODE_MODULES);
assert.ok(!external.startsWith(root), 'TEST_NODE_MODULES must be outside the repository');
const require = createRequire(import.meta.url);
const { Liquid } = require(path.join(external, 'liquidjs'));
const YAML = require(path.join(external, 'yaml'));
const config = YAML.parse(fs.readFileSync(path.join(root, '_config.yml'), 'utf8'));

const engine = new Liquid({ root: path.join(root, '_includes'), jekyllInclude: true, strictFilters: true });
// Jekyll-only filter shims. These tests run real Liquid templates, not a native build.
engine.registerFilter('slugify', (value) => String(value ?? '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));
engine.registerFilter('url_encode', (value) => encodeURIComponent(String(value ?? '')).replace(/%2F/g, '/'));
engine.registerFilter('relative_url', (value) => `${config.baseurl || ''}${value}`);

const stripFrontMatter = (text) => text.replace(/^---\n[\s\S]*?\n---\n/, '');
const layout = (name) => stripFrontMatter(fs.readFileSync(path.join(root, '_layouts', name), 'utf8'));

// One fixture for every surface: "deep" clears the floor, "thin" does not, and
// "absent" is a tag the generator never saw.
const minimum = readTagArchiveMinimum();
const site = {
  ...config,
  baseurl: config.baseurl || '',
  data: {
    linkable_tags: ['Agent', 'deep-tag'],
    tag_visible_counts: { Agent: 25, 'deep-tag': minimum, 'thin-tag': 1 },
    linkable_categories: ['AI', 'Model & Paper'],
    category_visible_counts: { AI: 57, 'Model & Paper': 31, Unity: 1 },
    locales: { en: { panel: { trending_tags: 'Trending Tags' } } }
  }
};
const render = (template, page, include = {}) => engine.parseAndRender(template, { site, page, include, jekyll: { environment: 'production' } });
const renderInclude = (name, page, include = {}) => engine.renderFile(name, { site, page, include, jekyll: { environment: 'production' } });
const hrefs = (html) => [...html.matchAll(/href="([^"]+)"/g)].map((match) => match[1]);
// Explanatory comments are part of the template, not part of the rendered block.
const markup = (html) => html.replace(/<!--[\s\S]*?-->/g, '').trim();

test('the configured tag floor is a shared integer, not a template literal', () => {
  assert.equal(readTagArchiveMinimum(), config.tag_archive_min_posts);
  assert.ok(Number.isInteger(config.tag_archive_min_posts) && config.tag_archive_min_posts >= 2);
});

test('the tag hub links exactly the surviving archives, with their visible counts', async () => {
  const html = await render(layout('tags.html'), { title: 'Tags' });
  assert.deepEqual(hrefs(html), ['/tags/agent/', '/tags/deep-tag/']);
  assert.match(html, /Agent\s*<span class="text-muted">25<\/span>/);
  assert.match(html, new RegExp(`deep-tag\\s*<span class="text-muted">${minimum}</span>`));
  assert.doesNotMatch(html, /thin-tag/);
});

test('an empty surviving set renders an empty hub rather than inventing links', async () => {
  const bare = new Liquid({ root: path.join(root, '_includes'), jekyllInclude: true, strictFilters: true });
  bare.registerFilter('slugify', (v) => String(v ?? '').toLowerCase());
  bare.registerFilter('url_encode', (v) => String(v ?? ''));
  bare.registerFilter('relative_url', (v) => v);
  const html = await bare.parseAndRender(layout('tags.html'), { site: { ...site, data: {} }, page: {} });
  assert.deepEqual(hrefs(html), []);
});

test('post tag chips link surviving tags and degrade thin ones to plain labels', async () => {
  const html = await renderInclude('post-tags.html', { tags: ['Agent', 'thin-tag', 'never-seen'] });
  assert.deepEqual(hrefs(html), ['/tags/agent/']);
  assert.match(html, /<a\b[^>]*class="post-tag no-text-decoration"[^>]*>Agent<\/a>/);
  for (const label of ['thin-tag', 'never-seen']) {
    assert.match(html, new RegExp(`<span class="post-tag no-text-decoration">${label}</span>`));
  }
});

test('a post with no tags renders no tag block at all', async () => {
  assert.equal(markup(await renderInclude('post-tags.html', { tags: [] })), '');
});

// Category archives share the tag contract: the same floor, the same surviving
// set, and the same plain-label degradation for names whose page was not built.
test('the configured category floor is a shared integer, not a template literal', () => {
  assert.equal(readCategoryArchiveMinimum(), config.category_archive_min_posts);
  assert.ok(Number.isInteger(config.category_archive_min_posts) && config.category_archive_min_posts >= 2);
});

test('post category links point only at archives that were built', async () => {
  const html = await renderInclude('post-categories.html', { categories: ['AI', 'Model & Paper', 'Unity'] });
  assert.deepEqual(hrefs(html), ['/categories/ai/', '/categories/model-paper/']);
  assert.match(html, /<span>Unity<\/span>/);
  assert.doesNotMatch(html, /\/categories\/unity\//);
});

test('a post with no categories renders no category block at all', async () => {
  assert.equal(markup(await renderInclude('post-categories.html', { categories: [] })), '');
});

test('trending tags never advertise a tag whose page was not built', async () => {
  const html = await renderInclude('trending-tags.html', { url: '/' }, { lang: 'en' });
  assert.deepEqual(hrefs(html).sort(), ['/tags/agent/', '/tags/deep-tag/']);
  assert.doesNotMatch(html, /thin-tag/);
});

test('trending tags stay hidden when nothing survives the floor', async () => {
  const empty = { ...site, data: { ...site.data, linkable_tags: [] } };
  const html = await engine.renderFile('trending-tags.html', { site: empty, page: { url: '/' }, include: { lang: 'en' } });
  assert.equal(markup(html), '');
});
