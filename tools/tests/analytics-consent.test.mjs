import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

// Run with TEST_NODE_MODULES outside this checkout; CHROME_PATH overrides browser discovery.
const root = fileURLToPath(new URL('../../', import.meta.url));
assert.ok(process.env.TEST_NODE_MODULES, 'Set TEST_NODE_MODULES to an external node_modules containing liquidjs, yaml and puppeteer-core');
const external = fs.realpathSync(process.env.TEST_NODE_MODULES);
assert.ok(!external.startsWith(root), 'TEST_NODE_MODULES must be outside the repository');
const chrome = process.env.CHROME_PATH || [
  '/usr/bin/google-chrome',
  '/usr/bin/google-chrome-stable',
  '/usr/bin/chromium',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
].find((candidate) => fs.existsSync(candidate));
assert.ok(chrome, 'Chromium was not found; set CHROME_PATH to its executable');
const require = createRequire(import.meta.url);
const { Liquid } = require(path.join(external, 'liquidjs'));
const YAML = require(path.join(external, 'yaml'));
const puppeteer = require(path.join(external, 'puppeteer-core'));
const site = YAML.parse(fs.readFileSync(path.join(root, '_config.yml'), 'utf8'));
site.google_analytics = { id: 'G-TEST12345' };
site.google_ad_client = 'ca-pub-1234567890123456';
site.data = { origin: { test: {} }, locales: {} };
site.pwa = { enabled: false };
const liquid = new Liquid({ root: path.join(root, '_includes'), jekyllInclude: true });
liquid.registerFilter('relative_url', (value) => value);
liquid.registerFilter('jsonify', JSON.stringify);
liquid.registerFilter('number_of_words', (value) => String(value).trim().split(/\s+/).length);

let browser, server, origin;
before(async () => {
  const context = {
    site, jekyll: { environment: 'production' }, type: 'test',
    page: { layout: 'post', url: '/first/', content: 'word '.repeat(850) }
  };
  // Execute the production ad, footer and JS selector includes, including the actual analytics include.
  const [ads, footer, scripts] = await Promise.all(['adsense.html', 'footer.html', 'js-selector.html'].map((name) => liquid.renderFile(name, context)));
  const html = `<!doctype html><html><head>${ads}</head><body><main><a href="/second/">Next page</a></main>${footer}${scripts}</body></html>`;
  server = http.createServer((req, res) => { res.writeHead(200, { 'Content-Type': 'text/html' }); res.end(html); });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  origin = `http://127.0.0.1:${server.address().port}`;
  browser = await puppeteer.launch({ executablePath: chrome, headless: true });
});
after(async () => {
  if (browser) await browser.close();
  if (server) await new Promise((resolve) => server.close(resolve));
});

async function session({ storageError = false, context = null } = {}) {
  context ||= await browser.createBrowserContext();
  const page = await context.newPage();
  const requests = [];
  await page.setRequestInterception(true);
  page.on('request', (request) => {
    const url = request.url();
    requests.push(url);
    if (url.startsWith(origin)) return request.continue();
    // Simulate a loaded analytics library setting cookies; never contact Google.
    if (url.startsWith('https://www.googletagmanager.com/gtag/js')) {
      return request.respond({ status: 200, contentType: 'application/javascript', body: "document.cookie='_ga=fixture; path=/'; document.cookie='_ga_TEST12345=fixture; path=/';" });
    }
    return request.respond({ status: 200, contentType: 'application/javascript', body: '' });
  });
  if (storageError) await page.evaluateOnNewDocument(() => {
    Object.defineProperty(window, 'localStorage', { get() { throw new DOMException('Blocked', 'SecurityError'); } });
  });
  const ga = () => requests.filter((url) => url.startsWith('https://www.googletagmanager.com/gtag/js'));
  const ads = () => requests.filter((url) => url.startsWith('https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js'));
  return { context, page, ga, ads };
}

async function open(s, pathname = '/first/') { await s.page.goto(origin + pathname, { waitUntil: 'networkidle0' }); }
async function cookies(page) { return (await page.cookies()).map((cookie) => cookie.name); }
// Pass-through by default; the mode is set per document so reloads start from normal cookie behavior.
function cookieControl() {
  const descriptor = Object.getOwnPropertyDescriptor(Document.prototype, 'cookie');
  window.__cookieMode = 'normal';
  Object.defineProperty(Document.prototype, 'cookie', {
    configurable: true,
    get() {
      if (window.__cookieMode === 'throw') throw new DOMException('Blocked', 'SecurityError');
      return descriptor.get.call(this);
    },
    set(value) {
      if (window.__cookieMode === 'throw') throw new DOMException('Blocked', 'SecurityError');
      if (window.__cookieMode === 'ignore') return;
      descriptor.set.call(this, value);
    }
  });
}
const cleanupWarning = "Some analytics cookies could not be removed in this browser. Clear this site's data in your browser settings.";

test('no analytics before choice or after decline, including navigation; ads remain separate', async () => {
  const s = await session();
  try {
    await open(s);
    assert.equal(s.ga().length, 0);
    assert.equal(s.ads().length, 1, 'eligible advertising remains independent from analytics consent');
    assert.ok(!(await cookies(s.page)).some((name) => name === '_ga' || name.startsWith('_ga_')));
    assert.equal(await s.page.$eval('#analytics-consent', (el) => el.hidden), false);
    await s.page.click('#analytics-decline');
    await open(s, '/second/');
    assert.equal(s.ga().length, 0);
    assert.equal(s.ads().length, 2);
    assert.equal(await s.page.$eval('#analytics-consent', (el) => el.hidden), true);
    assert.ok(!(await cookies(s.page)).some((name) => name === '_ga' || name.startsWith('_ga_')));
  } finally { await s.context.close(); }
});

test('grant persists across pages; keyboard settings can revoke and stop later analytics', async () => {
  const s = await session();
  try {
    await open(s);
    await s.page.click('#analytics-accept');
    await s.page.waitForFunction(() => document.cookie.includes('_ga_TEST12345='));
    assert.equal(s.ga().length, 1);
    const commands = await s.page.evaluate(() => window.dataLayer.map((entry) => Array.from(entry)));
    const consent = commands.findIndex((entry) => entry[0] === 'consent' && entry[1] === 'default');
    const config = commands.findIndex((entry) => entry[0] === 'config');
    assert.ok(consent >= 0 && config > consent, 'advertising defaults must precede analytics configuration');
    for (const key of ['ad_storage', 'ad_user_data', 'ad_personalization']) assert.equal(commands[consent][2][key], 'denied');
    assert.ok(!(await cookies(s.page)).includes('_gcl_au'));
    await open(s, '/second/');
    assert.equal(s.ga().length, 2);
    assert.equal(await s.page.$eval('#analytics-consent', (el) => el.hidden), true);
    await s.page.focus('#analytics-settings');
    await s.page.keyboard.press('Enter');
    assert.equal(await s.page.$eval('#analytics-consent', (el) => el.hidden), false);
    assert.equal(await s.page.evaluate(() => document.activeElement.id), 'analytics-accept');
    await s.page.keyboard.press('Tab');
    assert.equal(await s.page.evaluate(() => document.activeElement.id), 'analytics-decline');
    await Promise.all([s.page.waitForNavigation({ waitUntil: 'networkidle0' }), s.page.keyboard.press('Enter')]);
    assert.equal(s.ga().length, 2, 'reload after revocation must not fetch analytics');
    assert.ok(!(await cookies(s.page)).some((name) => name === '_ga' || name.startsWith('_ga_')));
    await open(s, '/first/');
    assert.equal(s.ga().length, 2);
  } finally { await s.context.close(); }
});

test('blocked storage fails closed and reports inability to save', async () => {
  const s = await session({ storageError: true });
  try {
    await open(s);
    await s.page.click('#analytics-accept');
    assert.equal(s.ga().length, 0);
    assert.match(await s.page.$eval('#analytics-consent-status', (el) => el.textContent), /could not be saved/i);
    assert.equal(await s.page.$eval('#analytics-consent', (el) => el.hidden), false);
    assert.ok(!(await cookies(s.page)).some((name) => name === '_ga' || name.startsWith('_ga_')));
  } finally { await s.context.close(); }
});

test('cookie access that throws during decline disables analytics and warns on the next load', { timeout: 20000 }, async () => {
  const s = await session();
  try {
    await s.page.evaluateOnNewDocument(cookieControl);
    await open(s);
    await s.page.evaluate(() => { window.__cookieMode = 'throw'; });
    await s.page.click('#analytics-decline');
    const state = await s.page.evaluate(() => ({
      disabled: window['ga-disable-G-TEST12345'],
      flag: sessionStorage.getItem('analytics-cookie-cleanup-incomplete')
    }));
    assert.deepEqual(state, { disabled: true, flag: '1' });
    assert.equal(s.ga().length, 0);
    await open(s, '/second/');
    assert.equal(await s.page.$eval('#analytics-consent', (el) => el.hidden), false);
    assert.equal(await s.page.$eval('#analytics-settings', (el) => el.getAttribute('aria-expanded')), 'true');
    assert.equal(await s.page.$eval('#analytics-consent-status', (el) => el.textContent), cleanupWarning);
    assert.equal(await s.page.evaluate(() => sessionStorage.getItem('analytics-cookie-cleanup-incomplete')), null, 'warning flag is consumed on the next load');
    assert.equal(s.ga().length, 0);
  } finally { await s.context.close(); }
});

test('cookie removal silently ignored during decline reloads with the cleanup warning', { timeout: 20000 }, async () => {
  const s = await session();
  try {
    await s.page.evaluateOnNewDocument(cookieControl);
    await open(s);
    await s.page.click('#analytics-accept');
    await s.page.waitForFunction(() => document.cookie.includes('_ga_TEST12345='));
    assert.equal(s.ga().length, 1);
    await s.page.evaluate(() => { window.__cookieMode = 'ignore'; });
    const reloaded = s.page.waitForNavigation({ waitUntil: 'networkidle0' });
    await s.page.click('#analytics-settings');
    await s.page.click('#analytics-decline');
    await reloaded;
    assert.equal(await s.page.$eval('#analytics-consent', (el) => el.hidden), false);
    assert.equal(await s.page.$eval('#analytics-consent-status', (el) => el.textContent), cleanupWarning);
    assert.equal(await s.page.evaluate(() => sessionStorage.getItem('analytics-cookie-cleanup-incomplete')), null, 'warning flag is consumed on the next load');
    assert.ok(!(await cookies(s.page)).some((name) => name === '_ga' || name.startsWith('_ga_')), 'the reloaded load removes the cookie in normal cookie mode');
    assert.equal(s.ga().length, 1, 'the reloaded page must not fetch analytics after decline');
  } finally { await s.context.close(); }
});

test('successful decline leaves no cleanup warning on the next load', { timeout: 20000 }, async () => {
  const s = await session();
  try {
    await s.page.evaluateOnNewDocument(cookieControl);
    await open(s);
    await s.page.click('#analytics-accept');
    await s.page.waitForFunction(() => document.cookie.includes('_ga_TEST12345='));
    const reloaded = s.page.waitForNavigation({ waitUntil: 'networkidle0' });
    await s.page.click('#analytics-settings');
    await s.page.click('#analytics-decline');
    await reloaded;
    assert.equal(await s.page.$eval('#analytics-consent-status', (el) => el.textContent), '');
    assert.ok(!(await cookies(s.page)).some((name) => name === '_ga' || name.startsWith('_ga_')));
    await open(s, '/second/');
    assert.equal(await s.page.$eval('#analytics-consent', (el) => el.hidden), true);
    assert.equal(await s.page.$eval('#analytics-consent-status', (el) => el.textContent), '');
    assert.equal(await s.page.evaluate(() => sessionStorage.getItem('analytics-cookie-cleanup-incomplete')), null);
    assert.equal(s.ga().length, 1);
  } finally { await s.context.close(); }
});

test('denied consent removes a pre-existing analytics cookie on load without warning', { timeout: 20000 }, async () => {
  const s = await session();
  try {
    await s.page.evaluateOnNewDocument(cookieControl);
    await open(s);
    await s.page.evaluate(() => localStorage.setItem('analytics-consent', 'denied'));
    await s.page.setCookie({ name: '_ga', value: 'stale', url: origin });
    assert.ok((await cookies(s.page)).includes('_ga'), 'fixture planted a visible analytics cookie');
    await open(s);
    assert.deepEqual((await cookies(s.page)).filter((name) => name === '_ga' || name.startsWith('_ga_')), []);
    assert.equal(await s.page.$eval('#analytics-consent', (el) => el.hidden), true);
    assert.equal(await s.page.$eval('#analytics-consent-status', (el) => el.textContent), '');
    assert.equal(await s.page.evaluate(() => sessionStorage.getItem('analytics-cookie-cleanup-incomplete')), null);
    assert.equal(s.ga().length, 0);
  } finally { await s.context.close(); }
});

test('denied consent on load warns when a visible analytics cookie cannot be removed', { timeout: 20000 }, async () => {
  const s = await session();
  try {
    await s.page.evaluateOnNewDocument(cookieControl);
    await s.page.evaluateOnNewDocument(() => { window.__cookieMode = 'ignore'; });
    await open(s);
    await s.page.evaluate(() => localStorage.setItem('analytics-consent', 'denied'));
    await s.page.setCookie({ name: '_ga', value: 'stale', url: origin });
    await open(s);
    assert.ok((await cookies(s.page)).includes('_ga'), 'the fixture kept the analytics cookie, so cleanup truly failed');
    assert.equal(await s.page.$eval('#analytics-consent', (el) => el.hidden), false);
    assert.equal(await s.page.$eval('#analytics-settings', (el) => el.getAttribute('aria-expanded')), 'true');
    assert.equal(await s.page.$eval('#analytics-consent-status', (el) => el.textContent), cleanupWarning);
    assert.equal(s.ga().length, 0);
  } finally { await s.context.close(); }
});

for (const change of ['decline', 'remove', 'clear']) {
  test(`another tab ${change} disables active analytics and prevents reload requests`, { timeout: 20000 }, async () => {
    const active = await session();
    const other = await session({ context: active.context });
    const messages = [];
    active.page.on('console', (message) => messages.push(message.text()));
    await active.page.evaluateOnNewDocument(() => {
      let value;
      Object.defineProperty(window, 'ga-disable-G-TEST12345', {
        configurable: true,
        get() { return value; },
        set(next) { value = next; if (next === true) console.log('analytics-disabled'); }
      });
      window.addEventListener('beforeunload', () => console.log('cookies-before-reload:' + document.cookie));
    });
    try {
      await active.page.bringToFront();
      await open(active);
      await active.page.click('#analytics-accept');
      await active.page.waitForFunction(() => document.cookie.includes('_ga_TEST12345='));
      await other.page.bringToFront();
      await open(other, '/second/');
      await active.page.evaluate(() => { document.cookie = 'unrelated=keep; path=/'; });
      const initialCookies = await cookies(active.page);
      assert.ok(initialCookies.includes('_ga') && initialCookies.includes('_ga_TEST12345'), 'loaded analytics has set both cookies');
      assert.ok(initialCookies.includes('unrelated'));
      assert.equal(active.ga().length, 1);
      assert.equal(other.ga().length, 1);
      const reloaded = active.page.waitForNavigation({ waitUntil: 'networkidle0' });
      if (change === 'decline') {
        await other.page.click('#analytics-settings');
        await other.page.click('#analytics-decline');
      } else if (change === 'remove') {
        await other.page.evaluate(() => localStorage.removeItem('analytics-consent'));
      } else {
        await other.page.evaluate(() => localStorage.clear());
      }
      await reloaded;
      assert.ok(messages.includes('analytics-disabled'), 'active tab disables analytics before reloading');
      const beforeReload = messages.find((message) => message.startsWith('cookies-before-reload:'));
      assert.ok(beforeReload, 'active tab reported cookies before reloading');
      assert.doesNotMatch(beforeReload, /(?:^|[;: ]+)_ga(?:_|=)/, 'analytics cookies must be removed before reload');
      assert.match(beforeReload, /(?:^|[;: ]+)unrelated=keep(?:;|$)/, 'unrelated cookie must survive reset');
      assert.deepEqual((await cookies(active.page)).filter((name) => name === '_ga' || name.startsWith('_ga_')), []);
      assert.ok((await cookies(active.page)).includes('unrelated'));
      assert.equal(active.ga().length, 1, 'the active tab must not fetch analytics again');
      await open(active, '/first/');
      assert.equal(active.ga().length, 1);
    } finally { await active.context.close(); }
  });
}
