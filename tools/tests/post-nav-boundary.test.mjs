import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../', import.meta.url));
assert.ok(process.env.TEST_NODE_MODULES, 'FAIL CLOSED: set TEST_NODE_MODULES to the external node_modules installed from tools/template-test-deps/package-lock.json; never install inside this repository.');
const external = fs.realpathSync(process.env.TEST_NODE_MODULES);
assert.ok(!external.startsWith(root), 'TEST_NODE_MODULES must be outside the repository');
const require = createRequire(import.meta.url);
const { Liquid } = require(path.join(external, 'liquidjs'));

const engine = new Liquid({ root: path.join(root, '_includes'), jekyllInclude: true, strictFilters: true });

// site.posts is newest first, exactly as Jekyll exposes it. `hidden` is set on
// every noindex post by _plugins/archive_quality_policy.rb; the `robots` field
// is the source the plugin reads, so both are represented here.
const posts = [
  { url: '/posts/live-3/', title: 'Live 3' },
  { url: '/posts/retired-b/', title: 'Retired B', robots: 'noindex, follow', hidden: true },
  { url: '/posts/live-2/', title: 'Live 2' },
  { url: '/posts/retired-a/', title: 'Retired A', robots: 'noindex, follow', hidden: true },
  { url: '/posts/live-1/', title: 'Live 1' }
];
const site = {
  baseurl: '',
  posts,
  data: { locales: { en: { post: { button: { previous: 'Older', next: 'Newer' } } } } }
};
const render = (page) => engine.renderFile('post-nav.html', { site, page, include: { lang: 'en' } });
const hrefs = (html) => [...html.matchAll(/href="([^"]+)"/g)].map((match) => match[1]);
const disabled = (html) => (html.match(/class="btn btn-outline-primary disabled"/g) || []).length;

test('the older/newer chain skips retired reposts instead of linking them', async () => {
  const html = await render({ url: '/posts/live-2/', title: 'Live 2' });
  assert.deepEqual(hrefs(html), ['/posts/live-1/', '/posts/live-3/']);
  assert.doesNotMatch(html, /retired/);
  assert.equal(disabled(html), 0);
});

test('no retired repost is reachable from any live post through this nav', async () => {
  for (const page of posts.filter((post) => !post.hidden)) {
    const links = hrefs(await render(page));
    for (const link of links) {
      assert.ok(!link.includes('retired'), `${page.url} links retired post ${link}`);
    }
  }
});

test('the newest and oldest live posts disable the edge button rather than wrap around', async () => {
  const newest = await render({ url: '/posts/live-3/', title: 'Live 3' });
  assert.deepEqual(hrefs(newest), ['/posts/live-2/']);
  assert.equal(disabled(newest), 1);

  const oldest = await render({ url: '/posts/live-1/', title: 'Live 1' });
  assert.deepEqual(hrefs(oldest), ['/posts/live-2/']);
  assert.equal(disabled(oldest), 1);
});

test('a retired repost is a dead end: it links neither direction', async () => {
  const html = await render({ url: '/posts/retired-a/', title: 'Retired A', robots: 'noindex, follow', hidden: true });
  assert.deepEqual(hrefs(html), []);
  assert.equal(disabled(html), 2);
});

test('a post that clears the boundary still gets a usable nav when only one live post exists', async () => {
  const solo = { ...site, posts: [{ url: '/posts/only/', title: 'Only' }] };
  const html = await engine.renderFile('post-nav.html', { site: solo, page: { url: '/posts/only/' }, include: { lang: 'en' } });
  assert.deepEqual(hrefs(html), []);
  assert.equal(disabled(html), 2);
});
