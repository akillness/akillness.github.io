import test from 'node:test';
import assert from 'node:assert/strict';
import { verifyPostLinks } from '../verify-site-quality.mjs';

const builtFiles = new Set(['/index.html', '/posts/current/index.html', '/posts/kept/index.html', '/posts/noindex/index.html', '/posts/한글/index.html']);
const verify = (html, route = '/posts/current/') => verifyPostLinks(html, { route, builtFiles });

for (const href of [
  '/posts/retired/',
  'https://akillness.github.io/posts/retired/',
  'http://akillness.github.io/posts/retired/',
  '//akillness.github.io/posts/retired/',
  '../retired/',
  '/posts/retired/?source=test&amp;other=1#heading'
]) {
  test(`rejects a missing post target: ${href}`, () => {
    assert.deepEqual(verify(`<a href="${href}">old post</a>`), [
      'link points at a post that was not built: /posts/retired/ (from /posts/current/)'
    ]);
  });
}

for (const href of [
  '/posts/kept/', '/posts/kept', '/posts/kept/index.html',
  'https://akillness.github.io/posts/kept/?a=1&amp;b=2#section',
  '../kept/', '/posts/%ED%95%9C%EA%B8%80/', '#section', '/posts/noindex/'
]) {
  test(`accepts a built post without changing indexing policy: ${href}`, () => {
    assert.deepEqual(verify(`<a href="${href}">post</a>`), []);
  });
}

test('checks single-quoted, unquoted and uppercase hrefs, but not data-href', () => {
  for (const tag of ["<a href='/posts/retired/'>", '<a HREF=/posts/retired/>', '<A HREF="/posts/retired/">']) {
    assert.equal(verify(tag).length, 1);
  }
  assert.deepEqual(verify('<a data-href="/posts/retired/">placeholder</a>'), []);
});

test('ignores search templates, CSS, comments and escaped code examples', () => {
  assert.deepEqual(verify(`
    <script>var template = '<a href="https://akillness.github.io/posts/{url}/">';</script>
    <STYLE>.x { content: '<a href="/posts/retired/">'; }</STYLE>
    <!-- <a href="/posts/retired/"> -->
    <code>&lt;a href="/posts/retired/"&gt;</code>
  `), []);
});

test('does not treat sibling Pages projects, assets or other hosts as this post namespace', () => {
  for (const href of ['/hongT/', '/portfolio/', '/assets/img/missing.png', 'https://other.example/posts/retired/', 'https://akillness.github.io.evil.example/posts/retired/', 'mailto:editor@example.com', 'javascript:void(0)']) {
    assert.deepEqual(verify(`<a href="${href}">link</a>`), []);
  }
});

test('decodes numeric HTML entities before identifying local post links', () => {
  assert.equal(verify('<a href="&#47;posts&#x2f;retired/">old</a>').length, 1);
});

test('reports malformed percent encoding rather than throwing', () => {
  assert.deepEqual(verify('<a href="/posts/%ZZ/">bad</a>'), [
    'post link has invalid URL encoding: /posts/%ZZ/ (from /posts/current/)'
  ]);
});

test('deduplicates repeated bad links on one source page', () => {
  assert.equal(verify('<a href="/posts/retired/">one</a><a href="https://akillness.github.io/posts/retired/">two</a>').length, 1);
});

test('source route is included in the failure for a non-post source page', () => {
  assert.deepEqual(verify('<a href="/posts/retired/">old</a>', '/start-here/'), [
    'link points at a post that was not built: /posts/retired/ (from /start-here/)'
  ]);
});

test('does not mistake href text inside another attribute for an actual link', () => {
  assert.deepEqual(verify(`<a title='example href="/posts/retired/"' href="/posts/kept/">valid</a>`), []);
  assert.deepEqual(verify(`<a title='example href="/posts/retired/"'>not linked</a>`), []);
});

test('handles greater-than characters inside quoted attributes', () => {
  assert.deepEqual(verify('<a title="value > threshold" href="/posts/kept/">valid</a>'), []);
  assert.equal(verify('<a title="value > threshold" href="/posts/retired/">old</a>').length, 1);
});
