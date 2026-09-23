import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { readAdConfig, readIndexablePostMinimum, expectsInArticle, verifyAdBoundary } from '../verify-site-quality.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url));
assert.ok(process.env.TEST_NODE_MODULES, 'FAIL CLOSED: set TEST_NODE_MODULES to the external node_modules installed from tools/template-test-deps/package-lock.json; never install inside this repository.');
const external = fs.realpathSync(process.env.TEST_NODE_MODULES);
assert.ok(!external.startsWith(root), 'TEST_NODE_MODULES must be outside the repository');
const require = createRequire(import.meta.url);
const { Liquid } = require(path.join(external, 'liquidjs'));
const YAML = require(path.join(external, 'yaml'));
const pinned = JSON.parse(fs.readFileSync(path.join(root, 'tools/template-test-deps/package.json'))).dependencies;
for (const [name, version] of Object.entries(pinned)) assert.equal(require(path.join(external, name, 'package.json')).version, version, `${name} must match the pinned manifest`);
const site = YAML.parse(fs.readFileSync(path.join(root, '_config.yml'), 'utf8'));
const config = readAdConfig();
const engine = new Liquid({ root: path.join(root, '_includes'), jekyllInclude: true, strictFilters: true });
// Jekyll-only filter shim. Tests run real Liquid includes, not a native Jekyll build.
// auto uses CJK counting only when a CJK character is present; otherwise whitespace.
const cjk = /[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff\u3040-\u309f\uac00-\ud7af]/g;
const countWords = (value) => { const text = String(value || ''); return text.replace(cjk, ' ').split(/\s+/).filter(Boolean).length + (text.match(cjk) || []).length; };
engine.registerFilter('number_of_words', (value) => countWords(value));
const words = (n) => Array(n).fill('evidence').join(' ');
const long = Array.from({ length: 10 }, () => `<p>${words(Math.ceil(config.minimum / 10) + 1)}</p>`).join('\n');
const post = (overrides = {}) => ({ layout: 'post', url: '/posts/fixture/', content: long, ...overrides });
const eligible = (page, cfg = site) => page.layout === 'post' && page.url !== '/' && page.url !== '/404.html' && page.ads !== false && !String(page.robots || '').includes('noindex') && countWords(page.content.replace(/<[^>]*>/g, '')) >= (cfg.google_ad_min_post_words || 800);
async function include(name, page, options = {}) {
  return engine.renderFile(name, { site: options.site || site, page, jekyll: { environment: options.environment || 'production' }, include: options.include || {} });
}
async function rendered(page, content = page.content, adsOn = eligible(page)) {
  const head = await include('adsense.html', page);
  const body = await include('post-content.html', page, { include: { content, ads_on: adsOn } });
  const bottom = await include('adsense-post.html', page);
  return { html: head + '<article><div class="content">' + body + '</div><div class="post-ad-bottom">' + bottom + '</div></article>', body };
}
const errors = (html, page, content = page.content) => verifyAdBoundary(html, { route: page.url, config, eligible: eligible(page), inArticleExpected: expectsInArticle(content) });
const noAdMarkup = (html) => assert.doesNotMatch(html, /<ins\b|adsbygoogle\.js|\.push\(\{\}\)/);

test('native config reader agrees with YAML and does not hardcode publisher or slots', () => {
  assert.deepEqual(config, { client: site.google_ad_client, minimum: site.google_ad_min_post_words, bottom: String(site.google_ad_slots.post_bottom), inArticle: String(site.google_ad_slots.post_in_article) });
  assert.equal(readIndexablePostMinimum(), site.google_index_min_post_words);
});
test('eligible include rendering emits exact ownership, one loader and both positioned slots', async () => {
  const page = post(); const { html } = await rendered(page);
  assert.deepEqual(errors(html, page), []);
});
test('native verifier rejects wrong publisher, wrong/missing/duplicate slots and duplicate loader', async () => {
  const page = post(); const { html } = await rendered(page);
  const mutations = [
    html.replace(`content="${config.client}"`, 'content="wrong-publisher"'),
    html.replace(`client=${config.client}`, 'client=wrong-publisher'),
    html.replace(`data-ad-client="${config.client}"`, 'data-ad-client="wrong-publisher"'),
    html.replace(`data-ad-slot="${config.bottom}"`, 'data-ad-slot="wrong-slot"'),
    html.replace(/<ins\b[\s\S]*?<\/ins>/, ''),
    html + html.match(/<script\b[^>]*src=[\s\S]*?<\/script>/)[0],
    html + html.match(/<ins\b[\s\S]*?<\/ins>/)[0],
    html.replace(`data-ad-slot="${config.inArticle}"`, `data-ad-slot="${config.bottom}"`)
  ];
  for (const mutated of mutations) assert.notEqual(errors(mutated, page).length, 0);
});
test('each unit independently refuses home, nav, noindex, ads:false, short and missing layout', async () => {
  const pages = [post({ url: '/' }), post({ url: '/404.html' }), post({ layout: undefined }), post({ content: words(config.minimum - 1) }), post({ ads: false }), post({ robots: 'noindex, follow' }), post({ robots: ['noindex', 'follow'] }), ...['home', 'page', 'categories', 'category', 'tags', 'tag', 'archives', 'search'].map(layout => post({ layout, url: '/' + layout + '/' }))];
  for (const page of pages) {
    for (const name of ['adsense-post.html', 'adsense-in-article.html']) noAdMarkup(await include(name, page));
    const { html } = await rendered(page, page.content, true); // adversarial parent opt-in
    assert.deepEqual(verifyAdBoundary(html, { route: page.url, config }), [], JSON.stringify(page.layout));
  }
});
test('configured threshold is inclusive; development and empty credentials emit no ad code', async () => {
  for (const n of [config.minimum - 1, config.minimum, config.minimum + 1]) {
    const page = post({ content: words(n) });
    assert.equal(/adsbygoogle\.js/.test(await include('adsense.html', page)), n >= config.minimum);
    assert.equal(/<ins\b/.test(await include('adsense-post.html', page)), n >= config.minimum);
  }
  for (const name of ['adsense.html', 'adsense-post.html', 'adsense-in-article.html']) {
    noAdMarkup(await include(name, post(), { environment: 'development' }));
    for (const client of ['', null]) noAdMarkup(await include(name, post(), { site: { ...site, google_ad_client: client } }));
    noAdMarkup(await include(name, post({ content: words(config.minimum) }), { site: { ...site, google_ad_min_post_words: config.minimum + 1 } }));
  }
  for (const [name, key] of [['adsense-post.html', 'post_bottom'], ['adsense-in-article.html', 'post_in_article']]) noAdMarkup(await include(name, post(), { site: { ...site, google_ad_slots: { ...site.google_ad_slots, [key]: '' } } }));
});
test('placement expectation tracks real post-content paragraphs and safe midpoint boundaries', async () => {
  const cases = [words(1000), ...[6, 7, 8, 9, 10].flatMap(n => [Array(n).fill('<p>word</p>').join(''), Array(n).fill('<p>word</p>').join('\n')]), Array(10).fill('<blockquote><p>word</p></blockquote>').join(''), Array(10).fill('<div><p>word</p></div>').join(''), Array(10).fill('<h2>Heading</h2><p>word</p>').join('')];
  for (const content of cases) {
    const page = post(); const { html, body } = await rendered(page, content);
    assert.equal((body.match(/<ins\b/g) || []).length, expectsInArticle(content) ? 1 : 0);
    assert.deepEqual(errors(html, page, content), []);
    assert.equal(expectsInArticle(body), expectsInArticle(content));
  }
});
function sources(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? sources(path.join(dir, entry.name)) : /\.(md|markdown|html)$/.test(entry.name) ? [path.join(dir, entry.name)] : []);
}
function document(file) {
  const text = fs.readFileSync(file, 'utf8'); const fm = text.match(/^---\s*\r?\n([\s\S]*?)\r?\n---\s*\r?\n?/);
  assert.ok(fm, `frontmatter missing: ${file}`);
  return { meta: YAML.parse(fm[1]) || {}, body: text.slice(fm[0].length) };
}
test('all recursive real post frontmatter samples retain their ad boundaries', async (t) => {
  const defaults = site.defaults.find(rule => rule.scope.type === 'posts').values;
  const files = sources(path.join(root, '_posts'));
  for (const file of files) {
    const { meta, body } = document(file);
    const page = { ...defaults, ...meta, content: body, url: meta.permalink || '/posts/' + path.basename(file) + '/' };
    const html = await include('adsense.html', page);
    assert.equal(/adsbygoogle\.js/.test(html), eligible(page), path.relative(root, file));
    for (const name of ['adsense-post.html', 'adsense-in-article.html']) assert.equal(/<ins\b/.test(await include(name, page)), eligible(page), path.relative(root, file) + ':' + name);
  }
  t.diagnostic(`${files.length} actual post frontmatter samples, recursively including dated subdirectories; source body, not native Markdown output.`);
});
test('all real tab/home/404 frontmatter samples remain ownership-only', async (t) => {
  const defaults = site.defaults.find(rule => rule.scope.type === 'tabs').values;
  const files = [...sources(path.join(root, '_tabs')), path.join(root, 'index.html'), path.join(root, 'assets/404.html')];
  for (const file of files) {
    const { meta } = document(file);
    const page = { ...defaults, ...meta, content: long, url: meta.permalink || '/' + path.basename(file) + '/' };
    const { html } = await rendered(page, long, true);
    assert.deepEqual(verifyAdBoundary(html, { route: page.url, config }), [], path.relative(root, file));
  }
  t.diagnostic(`${files.length} actual navigation frontmatter samples.`);
});
test('native verifier rejects ad leakage on protected pages and missing ownership', async () => {
  const page = post({ robots: 'noindex' }); const { html } = await rendered(page);
  const live = await rendered(post());
  for (const fragment of [live.html.match(/<ins\b[\s\S]*?<\/ins>/)[0], live.html.match(/<script\b[^>]*src=[\s\S]*?<\/script>/)[0]]) assert.notEqual(verifyAdBoundary(html + fragment, { route: page.url, config }).length, 0);
  assert.notEqual(verifyAdBoundary(html.replace(/<meta\b[^>]*>/, ''), { route: page.url, config }).length, 0);
});
