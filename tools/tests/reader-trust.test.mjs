import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const root = fileURLToPath(new URL('../../', import.meta.url));
assert.ok(process.env.TEST_NODE_MODULES, 'Set TEST_NODE_MODULES to the externally installed pinned template-test dependencies.');
const external = fs.realpathSync(process.env.TEST_NODE_MODULES);
assert.ok(!external.startsWith(root), 'Template-test dependencies must be outside the repository.');
const require = createRequire(import.meta.url);
const { Liquid } = require(path.join(external, 'liquidjs'));
const YAML = require(path.join(external, 'yaml'));
const engine = new Liquid({ root: path.join(root, '_includes'), jekyllInclude: true, strictFilters: true });
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const withoutComments = html => html.replace(/<!--[\s\S]*?-->/g, '').replace(/{%\s*comment\s*%}[\s\S]*?{%\s*endcomment\s*%}/g, '');
const walk = dir => fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(dir, e.name)) : /\.(md|markdown)$/.test(e.name) ? [path.join(dir, e.name)] : []);
const posts = walk(path.join(root, '_posts')).map(file => {
  const text = fs.readFileSync(file, 'utf8');
  const meta = YAML.parse(text.match(/^---\s*\n([\s\S]*?)\n---/)?.[1] || '');
  return { file, meta, slug: path.basename(file).replace(/^\d{4}-\d{2}-\d{2}-/, '').replace(/\.(md|markdown)$/, '').toLowerCase() };
});

test('actual correction include renders scope once and escapes text; incomplete notices remain absent', async () => {
  const page = { correction_date: '2026-09-07', correction_note: 'A scoped correction <not an element>' };
  const html = await engine.renderFile('article-correction.html', { page });
  assert.equal((html.match(/<aside\b/g) || []).length, 1);
  assert.match(html, /datetime="2026-09-07"/);
  assert.ok(html.includes('A scoped correction &lt;not an element&gt;'));
  assert.match(html, /not a new publication or a full re-review/);
  for (const incomplete of [{}, { correction_date: page.correction_date }, { correction_note: page.correction_note }, { ...page, correction_note: '' }, { ...page, correction_date: '' }]) {
    assert.doesNotMatch(await engine.renderFile('article-correction.html', { page: incomplete }), /<aside\b/);
  }
  assert.match(withoutComments(read('_layouts/post.html')), /{%\s*include article-correction\.html\s*%}/);
});

test('all material correction records contain an ISO date and a nonempty scope', async () => {
  const corrected = posts.filter(({ meta }) => meta.correction_date || meta.correction_note);
  assert.ok(corrected.length >= 2);
  for (const { meta, file } of corrected) {
    assert.match(String(meta.correction_date), /^\d{4}-\d{2}-\d{2}$/, file);
    assert.ok(typeof meta.correction_note === 'string' && meta.correction_note.trim(), file);
    const html = await engine.renderFile('article-correction.html', { page: meta });
    assert.equal((html.match(/<aside\b/g) || []).length, 1, file);
  }
});

test('Start Here never recommends a source-marked hidden, unpublished or noindex post', () => {
  const links = [...read('_tabs/start-here.md').matchAll(/\]\(\/posts\/([^/)]+)\/?\)/g)];
  assert.ok(links.length > 10);
  for (const [, slug] of links) {
    const post = posts.find(p => p.slug === slug.toLowerCase());
    assert.ok(post, `Unknown Start Here post: ${slug}`);
    assert.notEqual(post.meta.hidden, true, slug);
    assert.notEqual(post.meta.published, false, slug);
    assert.ok(!String(post.meta.robots || '').includes('noindex'), slug);
  }
});

test('the corrected affiliated overview has no unmeasured multiplier or delivery-time promise', () => {
  const text = read('_posts/2026/06/2026-06-22-jeo-code-ai-builder-harness.md');
  assert.doesNotMatch(text, /10[×x]|3[×x]\s+to|2-person team 2 weeks|\d+ min\*?\*?\s*\|/);
  assert.match(text, /No controlled productivity benchmark is supplied/);
  assert.match(text, /illustrative scenarios, not measured delivery reports/);
  assert.match(text, /affiliated overview, not an independent product review/);
});
