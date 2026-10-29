import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

// Run with the pinned template-test dependencies outside this checkout.
const root = fileURLToPath(new URL('../../', import.meta.url));
assert.ok(process.env.TEST_NODE_MODULES, 'Set TEST_NODE_MODULES to the external template-test dependencies');
const external = fs.realpathSync(process.env.TEST_NODE_MODULES);
assert.ok(!external.startsWith(root), 'TEST_NODE_MODULES must be outside the repository');
const require = createRequire(import.meta.url);
const { Liquid } = require(path.join(external, 'liquidjs'));
const YAML = require(path.join(external, 'yaml'));
const puppeteer = require(path.join(external, 'puppeteer-core'));
const sass = require(path.join(external, 'sass'));
const chrome = process.env.CHROME_PATH || [
  '/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/chromium',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
].find((candidate) => fs.existsSync(candidate));
assert.ok(chrome, 'Chromium was not found; set CHROME_PATH');

function compileStyles() {
  const source = fs.readFileSync(path.join(root, 'assets/css/jekyll-theme-chirpy.scss'), 'utf8').replace(/^---\s*\n---\s*\n/, '');
  return sass.compileString(source, { loadPaths: [path.join(root, '_sass')], silenceDeprecations: ['import', 'global-builtin', 'color-functions', 'slash-div'] }).css;
}

function assertFits(boxes) {
  const { footer, main, links, consent, controls, width, scrollWidth } = boxes;
  assert.ok(main.bottom <= footer.top + 1, 'footer must follow main content without overlap');
  assert.ok(links.bottom <= consent.top + 1, 'expanded consent must follow the footer links');
  for (const [name, box] of Object.entries({ links, consent, ...controls })) {
    assert.ok(box.width > 0 && box.height > 0, `${name} must be visible`);
    assert.ok(box.top >= footer.top - 1 && box.bottom <= footer.bottom + 1, `${name} must fit inside the footer`);
    assert.ok(box.left >= -1 && box.right <= width + 1, `${name} must fit the viewport`);
  }
  assert.ok(scrollWidth <= width + 1, 'footer must not create horizontal page overflow');
}

test('production footer contains expanded analytics and GDPR controls on a narrow viewport', async () => {
  const css = compileStyles();

  const site = YAML.parse(fs.readFileSync(path.join(root, '_config.yml'), 'utf8'));
  site.google_analytics = { id: 'G-TEST12345' };
  site.google_ad_client = 'ca-pub-1234567890123456';
  site.data = { origin: { test: {} }, locales: {} };
  site.pwa = { enabled: false };
  const liquid = new Liquid({ root: path.join(root, '_includes'), jekyllInclude: true });
  liquid.registerFilter('relative_url', (value) => value);
  liquid.registerFilter('jsonify', JSON.stringify);
  const context = { site, jekyll: { environment: 'production' }, type: 'test', page: {} };
  const [footer, scripts] = await Promise.all(['footer.html', 'js-selector.html'].map((name) => liquid.renderFile(name, context)));
  // The page relies on Bootstrap's mobile flex utilities; these are the only ones used by this fixture.
  const bootstrapUtilities = '.d-flex{display:flex!important}.flex-column{flex-direction:column!important}.justify-content-center{justify-content:center!important}';
  const html = `<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"><style>${bootstrapUtilities}\n${css}</style></head><body><main>Page content</main>${footer}${scripts}</body></html>`;
  const server = http.createServer((req, res) => { res.writeHead(200, { 'Content-Type': 'text/html' }); res.end(html); });
  let browser;
  try {
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    browser = await puppeteer.launch({ executablePath: chrome, headless: true });
    const page = await browser.newPage();
    await page.setViewport({ width: 320, height: 700 });
    await page.setRequestInterception(true);
    page.on('request', (request) => request.url().startsWith('http://127.0.0.1:') ? request.continue() : request.abort());
    await page.evaluateOnNewDocument(() => {
      window.googlefc = { callbackQueue: [], showRevocationMessage() {} };
      window.__tcfapi = (command, version, callback) => callback({ gdprApplies: true }, true);
    });
    await page.goto(`http://127.0.0.1:${server.address().port}/`, { waitUntil: 'load' });
    await page.evaluate(() => window.googlefc.callbackQueue.find((entry) => entry.CONSENT_API_READY).CONSENT_API_READY());
    const measure = () => page.evaluate(() => {
      const rect = (selector) => {
        const el = document.querySelector(selector);
        if (!el || getComputedStyle(el).display === 'none' || el.hidden) return { width: 0, height: 0 };
        const { top, bottom, left, right, width, height } = el.getBoundingClientRect();
        return { top, bottom, left, right, width, height };
      };
      return { footer: rect('footer'), main: rect('main'), links: rect('.footer-links'), consent: rect('#analytics-consent'), width: document.documentElement.clientWidth, scrollWidth: document.documentElement.scrollWidth, controls: { analytics: rect('#analytics-settings'), gdpr: rect('#google-consent-revocation-link'), accept: rect('#analytics-accept'), decline: rect('#analytics-decline') } };
    });
    assertFits(await measure());
    // A fixed-height regression must make the same geometry checks fail.
    await page.addStyleTag({ content: 'footer { height: 6rem !important; min-height: 0 !important; }' });
    const awaitedBoxes = await measure();
    assert.throws(() => assertFits(awaitedBoxes), /expanded consent must follow the footer links|must fit inside the footer/);
  } finally {
    if (browser) await browser.close();
    await new Promise((resolve) => server.close(resolve));
  }
});

function assertStacked(layout, width) {
  assert.ok(layout.header.width >= layout.table.width - 2, `${width}px row header must use the available width`);
  assert.ok(layout.cell.width >= layout.table.width - 2, `${width}px evidence cell must use the available width`);
  assert.ok(layout.header.bottom <= layout.cell.top + 1, `${width}px evidence must follow its row header`);
}

test('project evidence rows reflow on narrow screens while retaining table headers', async () => {
  const css = compileStyles();
  const html = `<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"><style>*,*::before,*::after{box-sizing:border-box}${css}</style></head><body>
    <main><article><p class="project-evidence-intro">Project evidence</p><div class="content">
    <table class="project-evidence-table"><thead><tr><th scope="col">Project thread</th><th scope="col">Problem and evidence</th></tr></thead>
    <tbody><tr><th scope="row"><a href="#details">Recent side projects</a></th><td>Independent projects with evidence and links.</td></tr></tbody></table>
    </div></article></main></body></html>`;
  const browser = await puppeteer.launch({ executablePath: chrome, headless: true });
  try {
    const page = await browser.newPage();
    await page.setContent(html);
    for (const width of [320, 600, 601, 1000]) {
      await page.setViewport({ width, height: 900 });
      const layout = await page.evaluate(() => {
        const table = document.querySelector('table');
        const header = table.querySelector('tbody th');
        const cell = table.querySelector('tbody td');
        const box = (element) => {
          const { top, bottom, left, right, width } = element.getBoundingClientRect();
          return { top, bottom, left, right, width, display: getComputedStyle(element).display };
        };
        return { table: box(table), header: box(header), cell: box(cell), viewport: document.documentElement.clientWidth, scrollWidth: document.documentElement.scrollWidth };
      });
      assert.ok(layout.scrollWidth <= layout.viewport + 1, `${width}px must not overflow horizontally`);
      if (width <= 600) {
        assertStacked(layout, width);
      } else {
        assert.equal(layout.header.display, 'table-cell');
        assert.equal(layout.cell.display, 'table-cell');
        assert.ok(layout.header.right <= layout.cell.left + 1, `${width}px cells must remain side by side`);
      }
      const client = await page.createCDPSession();
      const tree = await client.send('Accessibility.getFullAXTree');
      await client.detach();
      const roles = tree.nodes.filter((node) => !node.ignored).map((node) => [node.role?.value, node.name?.value]);
      for (const expected of [['columnheader', 'Project thread'], ['columnheader', 'Problem and evidence'], ['rowheader', 'Recent side projects']]) {
        assert.ok(roles.some(([role, name]) => role === expected[0] && name === expected[1]), `${width}px accessibility tree must retain ${expected.join(' ')}`);
      }
    }
    await page.setViewport({ width: 320, height: 900 });
    await page.addStyleTag({ content: 'main article:has(.project-evidence-intro) .content .project-evidence-table tbody th[scope="row"] { width: 28% !important; }' });
    const mutated = await page.evaluate(() => {
      const box = (selector) => {
        const { width, bottom, top } = document.querySelector(selector).getBoundingClientRect();
        return { width, bottom, top };
      };
      return { table: box('table'), header: box('tbody th'), cell: box('tbody td') };
    });
    assert.throws(() => assertStacked(mutated, 320), /row header must use the available width/);
  } finally { await browser.close(); }
});
