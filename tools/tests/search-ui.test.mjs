import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const include = readFileSync(new URL('../../_includes/search-loader.html', import.meta.url), 'utf8');
const markup = readFileSync(new URL('../../_includes/search-results.html', import.meta.url), 'utf8');
const topbar = readFileSync(new URL('../../_includes/topbar.html', import.meta.url), 'utf8');
const stripComments = (html) => html.replace(/<!--[\s\S]*?-->/g, '');
const template = include.match(/{% capture result_elem %}([\s\S]*?){% endcapture %}/)[1].replace(/\n/g, '');
// Only render Liquid slots. All executable search code comes from the shipped include.
const code = include.match(/<script>([\s\S]*?)<\/script>/)[1]
  .replace(/{{ result_elem \| strip_newlines }}/g, template)
  .replace(/{{ '\/assets\/js\/data\/search-meta.json' \| relative_url }}/g, '/meta.json')
  .replace(/{{ '\/assets\/js\/data\/search.json' \| relative_url }}/g, '/full.json')
  .replace(/{{ site.data.origin\[type\].search.js \| relative_url }}/g, '/library.js');
assert.doesNotMatch(code, /{{|{%/);

const row = (title = 'Alpha', extra = {}) => ({ title, url: '/posts/alpha/', categories: 'Engineering', tags: 'tools', date: '2026-09-03', snippet: 'A useful article.', ...extra });
const deferred = () => { let resolve, reject; const promise = new Promise((a, b) => { resolve = a; reject = b; }); return { promise, resolve, reject }; };
const flush = async () => { for (let i = 0; i < 20; i++) await Promise.resolve(); };

function harness({ library = true, compressed = false } = {}) {
  const elements = new Map();
  class Element {
    constructor() { this.handlers = {}; this.attrs = {}; this.value = ''; this.innerHTML = ''; this.textContent = ''; this.hidden = true; this.disabled = false; }
    addEventListener(type, fn) { (this.handlers[type] ||= []).push(fn); }
    fire(type, event = {}) { for (const fn of this.handlers[type] || []) fn(event); }
    setAttribute(key, value) { this.attrs[key] = String(value); }
    getAttribute(key) { return this.attrs[key] ?? null; }
    removeAttribute(key) { delete this.attrs[key]; }
    querySelectorAll(selector) { assert.equal(selector, 'article'); return [...this.innerHTML.matchAll(/<article\b/g)]; }
    querySelector(selector) { return this.querySelectorAll(selector)[0] || null; }
    focus() { this.focused = true; }
    remove() { this.removed = true; }
  }
  for (const id of ['search-input', 'search-results', 'search-status', 'search-retry', 'search-cancel']) elements.set(id, new Element());
  const calls = [], scripts = [], timers = new Map(), errors = [];
  let timerID = 0, options, index;
  // SJS 1.10 uses singleton options/index, synchronous search and template middleware.
  // This adapter simulates that dependency, not the loader state machine under test.
  function SimpleJekyllSearch(next) {
    options = next; index = next.json;
    return { search(query) {
      const matches = index.filter((record) => Object.values(record).some((value) => String(value).toLowerCase().includes(query.toLowerCase()))).slice(0, 10);
      options.resultsContainer.innerHTML = matches.map((record) => options.searchResultTemplate.replace(/{(.*?)}/g, (match, key) => {
        const value = options.templateMiddleware(key, record[key], options.searchResultTemplate);
        return value === undefined ? record[key] || match : value;
      })).join('') || options.noResultsText;
    } };
  }
  const window = {
    location: new URL('https://example.test/posts/current/'),
    setTimeout(fn) { timers.set(++timerID, fn); return timerID; },
    clearTimeout(id) { timers.delete(id); },
    ...(library ? { SimpleJekyllSearch } : {})
  };
  const document = {
    getElementById: (id) => elements.get(id) || null,
    createElement: () => new Element(),
    head: { appendChild(script) { scripts.push(script); } },
    addEventListener(type, fn) { assert.equal(type, 'DOMContentLoaded'); fn(); }
  };
  // Match the compress layout without stripping comments or otherwise rewriting JS.
  const executedCode = compressed ? code.replace(/[\r\n]/g, '') : code;
  if (compressed) assert.doesNotMatch(executedCode, /[\r\n]/);
  vm.runInNewContext(executedCode, { document, window, URL, Promise, console: { error: (err) => errors.push(err) }, fetch(url) { const pending = deferred(); calls.push({ url, ...pending }); return pending.promise; } });
  const get = (id) => elements.get(`search-${id}`);
  return {
    get, calls, scripts, errors, window,
    async type(value, event = 'input') { get('input').value = value; get('input').fire(event); await flush(); },
    async tick() { const pending = [...timers.values()]; timers.clear(); for (const fn of pending) fn(); await flush(); },
    async reply(n, data, status = 200) { calls[n].resolve({ ok: status === 200, status, json: () => Promise.resolve(data) }); await flush(); },
    async reject(n) { calls[n].reject(new Error('offline')); await flush(); },
    async retry() { get('retry').fire('click'); await flush(); },
    async cancel() { get('cancel').fire('click'); get('input').value = ''; get('results').innerHTML = ''; await flush(); },
    async libraryReady(n = 0) { window.SimpleJekyllSearch = SimpleJekyllSearch; scripts[n].onload(); await flush(); }
  };
}

function unavailable(h) {
  assert.match(h.get('status').textContent, /unavailable/i);
  assert.doesNotMatch(h.get('status').textContent, /no (matches|results)/i);
  assert.equal(h.get('results').innerHTML, '');
  assert.notEqual(h.get('results').getAttribute('aria-busy'), 'true');
  assert.equal(h.get('retry').hidden, false);
}

test('metadata success stays lazy and reports visible status', async () => {
  const h = harness();
  assert.equal(h.calls.length, 0);
  await h.type('   '); await h.tick();
  assert.equal(h.calls.length, 0);
  await h.type('Alpha'); await h.tick();
  assert.equal(h.calls.length, 1);
  assert.equal(h.get('results').getAttribute('aria-busy'), 'true');
  assert.match(h.get('status').textContent, /search|load/i);
  await h.reply(0, [row()]);
  assert.equal(h.calls.length, 1);
  assert.match(h.get('results').innerHTML, /<article\b/);
  assert.match(h.get('status').textContent, /1 result/i);
  assert.notEqual(h.get('results').getAttribute('aria-busy'), 'true');
});

for (const found of [true, false]) {
  test(`metadata miss falls back to full text: ${found ? 'success' : 'no matches'}`, async () => {
    const h = harness();
    await h.type('needle'); await h.tick(); await h.reply(0, [row()]);
    assert.deepEqual(h.calls.map((call) => call.url), ['/meta.json', '/full.json']);
    assert.match(h.get('status').textContent, /full article text/i);
    assert.equal(h.get('results').getAttribute('aria-busy'), 'true');
    assert.equal(h.get('results').innerHTML, '');
    await h.reply(1, [row('Alpha', { content: found ? 'needle' : 'nothing' })]);
    assert.match(h.get('status').textContent, found ? /1 result/i : /no matching articles/i);
    assert.equal(h.get('retry').hidden, true);
    await h.type('other'); await h.tick();
    assert.equal(h.calls.length, 2);
  });
}

for (const stage of ['meta', 'full']) {
  for (const failure of ['http', 'network', 'json', 'object', 'record', 'missing-content']) {
    if (failure === 'missing-content' && stage === 'meta') continue;
    test(`${stage} ${failure} failure is unavailable, then retry recovers`, async () => {
      const h = harness();
      await h.type('needle'); await h.tick();
      if (stage === 'full') await h.reply(0, [row()]);
      const n = stage === 'meta' ? 0 : 1;
      if (failure === 'http') await h.reply(n, [], 503);
      else if (failure === 'network') await h.reject(n);
      else if (failure === 'json') {
        h.calls[n].resolve({ ok: true, json: () => Promise.reject(new SyntaxError('Invalid JSON')) }); await flush();
      } else if (failure === 'object') await h.reply(n, {});
      else if (failure === 'record') await h.reply(n, [row('needle', { tags: {} })]);
      else await h.reply(n, [row('needle')]);
      unavailable(h);
      await h.retry();
      assert.equal(h.calls.length, n + 2);
      assert.equal(h.calls[n + 1].url, stage === 'meta' ? '/meta.json' : '/full.json');
      await h.reply(n + 1, [row('needle', { content: 'needle' })]);
      assert.match(h.get('status').textContent, /1 result/i);
      assert.equal(h.get('retry').hidden, true);
      assert.equal(h.get('input').focused, true);
    });
  }
}

for (const failure of ['error', 'missing-global']) {
  test(`library ${failure} removes failed script and retries without duplicate metadata`, async () => {
    const h = harness({ library: false });
    assert.equal(h.scripts.length, 0);
    await h.type('Alpha'); await h.tick();
    assert.equal(h.scripts.length, 1);
    if (failure === 'error') h.scripts[0].onerror(); else h.scripts[0].onload();
    await flush(); unavailable(h);
    assert.equal(h.scripts[0].removed, true);
    // The metadata fetch is still pending while the failed library is retried.
    await h.retry();
    assert.equal(h.scripts.length, 2);
    assert.equal(h.calls.length, 1);
    await h.reply(0, [row()]); await h.libraryReady(1);
    assert.match(h.get('status').textContent, /1 result/i);
  });
}

test('overlapping metadata/library and full requests are deduplicated', async () => {
  const h = harness({ library: false });
  await h.type('one'); await h.tick(); await h.type('two'); await h.tick();
  assert.equal(h.calls.length, 1); assert.equal(h.scripts.length, 1);
  await h.reply(0, []); await h.libraryReady();
  assert.equal(h.calls.length, 2);
  await h.type('three'); await h.tick();
  assert.equal(h.calls.length, 2);
  await h.reply(1, [row('three', { content: 'three' })]);
  assert.match(h.get('results').innerHTML, /three/);
  assert.match(h.get('status').textContent, /1 result/i);
});

for (const operation of ['clear', 'cancel', 'native-search-clear']) {
  for (const stage of ['debounce', 'meta', 'full']) {
    test(`${operation} during ${stage} invalidates pending work immediately`, async () => {
      const h = harness();
      await h.type('needle');
      if (stage !== 'debounce') await h.tick();
      if (stage === 'full') await h.reply(0, []);
      if (operation === 'cancel') await h.cancel();
      else await h.type('', operation === 'native-search-clear' ? 'search' : 'input');
      assert.notEqual(h.get('results').getAttribute('aria-busy'), 'true');
      assert.equal(h.get('results').innerHTML, '');
      assert.equal(h.get('retry').hidden, true);
      if (stage === 'meta') await h.reply(0, [row('needle')]);
      if (stage === 'full') await h.reply(1, [row('needle', { content: 'needle' })]);
      await h.tick();
      assert.equal(h.calls.length, stage === 'debounce' ? 0 : stage === 'meta' ? 1 : 2);
      assert.equal(h.get('results').innerHTML, '');
      assert.match(h.get('status').textContent, /type to search/i);
    });
  }
}

test('stale full response cannot overwrite a newer metadata result', async () => {
  const h = harness();
  await h.type('needle'); await h.tick(); await h.reply(0, [row()]);
  await h.type('Alpha'); await h.tick();
  assert.match(h.get('status').textContent, /1 result/i);
  const before = h.get('results').innerHTML;
  await h.reply(1, [row('needle', { content: 'needle' })]);
  assert.equal(h.get('results').innerHTML, before);
  assert.match(h.get('status').textContent, /1 result/i);
});

test('query change before debounce invalidates a previous completion and busy state', async () => {
  const h = harness();
  await h.type('needle'); await h.tick(); await h.reply(0, []);
  await h.type('new');
  await h.reply(1, [row('needle', { content: 'needle' })]);
  assert.equal(h.get('results').innerHTML, '');
  assert.equal(h.get('results').getAttribute('aria-busy'), 'true');
  await h.tick();
  assert.match(h.get('status').textContent, /no matching articles/i);
});

test('a stale error does not expose retry or clear the next query busy state', async () => {
  const h = harness();
  await h.type('needle'); await h.tick(); await h.reply(0, []);
  await h.type('new'); await h.reject(1);
  assert.equal(h.get('retry').hidden, true);
  assert.equal(h.get('results').getAttribute('aria-busy'), 'true');
  await h.tick(); assert.equal(h.calls.length, 3);
  await h.reply(2, [row('new', { content: 'new' })]);
  assert.match(h.get('status').textContent, /1 result/i);
});

test('clear then same query does not resurrect an old request before debounce', async () => {
  const h = harness();
  await h.type('Alpha'); await h.tick();
  await h.type(''); await h.type('Alpha');
  await h.reply(0, [row()]);
  assert.equal(h.get('results').innerHTML, '');
  await h.tick(); assert.match(h.get('status').textContent, /1 result/i);
  assert.equal(h.calls.length, 1);
});

test('result text is escaped but trusted category/tag wrappers remain', async () => {
  const h = harness();
  const payload = '<img src=x onerror="bad()"> & \'quoted\'';
  await h.type('needle'); await h.tick();
  await h.reply(0, [row('needle ' + payload, { snippet: payload, categories: payload, tags: payload })]);
  const html = h.get('results').innerHTML;
  assert.doesNotMatch(html, /<img|<script/);
  assert.equal((html.match(/&lt;img/g) || []).length, 4);
  assert.match(html, /&quot;bad\(\)&quot;/);
  assert.match(html, /&#39;quoted&#39;/);
  assert.match(html, /<div class="me-sm-4"><i class="far fa-folder fa-fw"/);
  assert.match(html, /<div><i class="fa fa-tag fa-fw"/);
});

for (const url of ['javascript:alert(1)', 'data:text/html,bad', '//evil.test/x', 'https://evil.test/x', '/\\evil.test/x', 'https://user:pass@example.test/x', '\nhttps://example.test/x']) {
  test(`unsafe result URL is neutralized: ${JSON.stringify(url)}`, async () => {
    const h = harness(); await h.type('Alpha'); await h.tick(); await h.reply(0, [row('Alpha', { url })]);
    assert.match(h.get('results').innerHTML, /href="#"/);
  });
}

test('same-site URLs preserve query/hash safely and empty taxonomy stays empty', async () => {
  const h = harness(); await h.type('Alpha'); await h.tick();
  await h.reply(0, [row('Alpha', { url: '/posts/alpha/?x=1&y=2#part', categories: '', tags: '' })]);
  assert.match(h.get('results').innerHTML, /href="https:\/\/example.test\/posts\/alpha\/\?x=1&amp;y=2#part"/);
  assert.doesNotMatch(h.get('results').innerHTML, /fa-folder|fa-tag|\{categories\}|\{tags\}/);
});

test('shipped markup provides native labeled controls and persistent visible announcements', () => {
  const cleanResults = stripComments(markup), cleanTopbar = stripComments(topbar);
  const tag = (html, id) => {
    const match = html.match(new RegExp('<[^>]+\\bid="' + id + '"[^>]*>'));
    assert.ok(match, `Expected real element ${id}`); return match[0];
  };
  const status = tag(cleanResults, 'search-status');
  assert.match(status, /role="status"/); assert.match(status, /aria-live="polite"/); assert.match(status, /aria-atomic="true"/);
  assert.doesNotMatch(status, /\bhidden\b|sr-only|visually-hidden|aria-hidden/);
  assert.match(tag(cleanResults, 'search-results'), /aria-busy="false"/);
  assert.match(tag(cleanResults, 'search-retry'), /^<button\b.*type="button"/);
  assert.match(tag(cleanResults, 'search-retry'), /\bhidden\b/);
  const input = tag(cleanTopbar, 'search-input');
  assert.match(input, /type="search"/); assert.match(input, /aria-label="Search articles"/);
  assert.match(input, /aria-controls="search-results"/); assert.match(input, /aria-describedby="search-help"/);
  tag(cleanResults, 'search-help');
  for (const id of ['search-trigger', 'search-cancel']) {
    assert.match(tag(cleanTopbar, id), /aria-label="[^"]+"/);
    assert.match(tag(cleanTopbar, id), /aria-controls="search-result-wrapper"/);
  }
  assert.doesNotMatch(code, /preventDefault|stopPropagation|addEventListener\(['"]key(?:down|up)/);
});

test('valid empty metadata and full indexes produce no matches, not unavailable', async () => {
  const h = harness(); await h.type('needle'); await h.tick(); await h.reply(0, []); await h.reply(1, []);
  assert.match(h.get('status').textContent, /no matching articles/i);
  assert.equal(h.get('results').innerHTML, '');
  assert.equal(h.get('retry').hidden, true);
  assert.equal(h.calls.length, 2);
});

test('same-origin URL attributes cannot inject markup or become protocol-relative', async () => {
  const h = harness(); await h.type('Alpha'); await h.tick();
  await h.reply(0, [row('Alpha', { url: 'https://example.test//evil.test/\"onmouseover=\"bad?x=1&y=2' })]);
  const html = h.get('results').innerHTML;
  assert.match(html, /href="https:\/\/example.test\/\/evil.test\/%22onmouseover=%22bad\?x=1&amp;y=2"/);
  assert.doesNotMatch(html, /href="\/\/|"onmouseover="/);
});

test('compressed shipped script runs with CR/LF removed: lazy search, failure, retry, cancel', async () => {
  const h = harness({ library: false, compressed: true });
  assert.equal(h.calls.length, 0);
  assert.equal(h.scripts.length, 0);
  await h.type('Alpha'); await h.tick();
  await h.reply(0, [row()]); await h.libraryReady();
  assert.match(h.get('status').textContent, /1 result/i);
  assert.equal(h.calls.length, 1);
  assert.match(h.get('results').innerHTML, /href="https:\/\/example.test\/posts\/alpha\/"/);
  await h.type('needle'); await h.tick();
  assert.equal(h.calls[1].url, '/full.json');
  await h.reject(1); unavailable(h);
  await h.retry(); await h.reply(2, [row('needle', { content: 'needle' })]);
  assert.match(h.get('status').textContent, /1 result/i);
  assert.equal(h.get('retry').hidden, true);
  await h.cancel();
  assert.equal(h.get('results').innerHTML, '');
  assert.notEqual(h.get('results').getAttribute('aria-busy'), 'true');
});
