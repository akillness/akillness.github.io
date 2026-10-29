import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../', import.meta.url));
assert.ok(process.env.TEST_NODE_MODULES, 'FAIL CLOSED: use the external test dependencies provisioned by CI; never install inside this repository.');
const external = fs.realpathSync(process.env.TEST_NODE_MODULES);
assert.ok(!external.startsWith(root), 'TEST_NODE_MODULES must be outside the repository');
const require = createRequire(import.meta.url);
const { Liquid } = require(path.join(external, 'liquidjs'));
const YAML = require(path.join(external, 'yaml'));
const site = YAML.parse(fs.readFileSync(path.join(root, '_config.yml'), 'utf8'));
const engine = new Liquid({ root: path.join(root, '_includes'), jekyllInclude: true, strictFilters: true });
engine.registerFilter('relative_url', (value) => value);

async function renderFooter(environment = 'production', overrides = {}) {
  const footerSite = {
    ...site,
    ...overrides,
    author: { name: 'Fodev JEO' },
    data: { locales: { en: { copyright: { brief: '', verbose: '' } } } }
  };
  return engine.renderFile('footer.html', {
    site: footerSite,
    page: {},
    jekyll: { environment },
    include: { lang: 'en' }
  });
}

function consentScript(html) {
  const match = html.match(/<script>([\s\S]*?)<\/script>/);
  assert.ok(match, 'production footer should include the consent API hook');
  return match[1];
}

function runConsentHook(script, {
  success = true,
  gdprApplies = true,
  hasTcfApi = true,
  hasRevocationApi = true,
  consentApiReady = true
} = {}) {
  const control = { hidden: true };
  const link = {
    listeners: {},
    addEventListener(type, listener) { this.listeners[type] = listener; }
  };
  const callbackQueue = [];
  const showRevocationMessage = hasRevocationApi ? function showRevocationMessage() {} : undefined;
  const calls = [];
  let tcfCallback;
  const googlefc = { callbackQueue };
  if (hasRevocationApi) googlefc.showRevocationMessage = showRevocationMessage;
  const window = { googlefc };
  if (hasTcfApi) {
    window.__tcfapi = (command, version, callback) => {
      calls.push({ command, version });
      if (command !== 'addEventListener' || version !== 2) {
        callback(null, false);
        return;
      }
      tcfCallback = callback;
      callback({ gdprApplies }, success);
    };
  }
  const document = {
    getElementById(id) {
      if (id === 'google-consent-revocation-control') return control;
      if (id === 'google-consent-revocation-link') return link;
      return null;
    }
  };
  vm.runInNewContext(script, { window, document });
  const ready = callbackQueue.find((entry) => entry && typeof entry === 'object' && typeof entry.CONSENT_API_READY === 'function');
  assert.ok(ready, 'hook should wait for Google Consent API readiness');
  if (consentApiReady) ready.CONSENT_API_READY();
  return { control, link, callbackQueue, showRevocationMessage, calls, googlefc, get tcfCallback() { return tcfCallback; } };
}

test('production footer provides a hidden consent-settings link only when AdSense is configured', async () => {
  const production = await renderFooter();
  assert.match(production, /<span id="google-consent-revocation-control" hidden>\s*<span aria-hidden="true">·<\/span>/);
  assert.match(production, /id="google-consent-revocation-link"/);
  assert.match(production, /href="\/privacy\/"/);
  assert.match(production, /Privacy and cookie settings/);
  const privacyToTerms = production.match(/<a href="\/privacy\/">Privacy<\/a>([\s\S]*?)<a href="\/terms\/">Terms<\/a>/)?.[1];
  assert.ok(privacyToTerms, 'rendered footer should place consent settings between Privacy and Terms');
  const analyticsStart = privacyToTerms.indexOf('<button type="button" id="analytics-settings"');
  const controlStart = privacyToTerms.indexOf('<span id="google-consent-revocation-control" hidden>');
  const linkStart = privacyToTerms.indexOf('<a id="google-consent-revocation-link"');
  const separators = [...privacyToTerms.matchAll(/aria-hidden="true">·<\/span>/g)];
  assert.equal(separators.length, 3, 'analytics settings and Terms have visible separators, and the ad control has a hidden separator');
  assert.ok(analyticsStart >= 0 && separators[0].index < analyticsStart, 'analytics settings follows its visible separator');
  assert.ok(controlStart > analyticsStart && separators[1].index > controlStart && separators[1].index < linkStart, 'ad separator stays inside the hidden control');
  assert.ok(separators[2].index > linkStart, 'the always-visible Terms separator follows the optional control');

  const development = await renderFooter('development');
  assert.doesNotMatch(development, /google-consent-revocation-link/);
  const disabled = await renderFooter('production', { google_ad_client: '' });
  assert.doesNotMatch(disabled, /google-consent-revocation-link/);
});

test('consent-settings link appears only when TCF reports GDPR applies and opens the revocation flow', async () => {
  const script = consentScript(await renderFooter());
  const applicable = runConsentHook(script, { gdprApplies: true });
  assert.deepEqual(applicable.calls, [{ command: 'addEventListener', version: 2 }]);
  assert.equal(applicable.control.hidden, false);

  let prevented = false;
  applicable.link.listeners.click({ preventDefault() { prevented = true; } });
  assert.equal(prevented, true);
  assert.equal(applicable.callbackQueue.at(-1), applicable.showRevocationMessage);

  assert.equal(runConsentHook(script, { gdprApplies: false }).control.hidden, true);
  assert.equal(runConsentHook(script, { success: false }).control.hidden, true);
  assert.equal(runConsentHook(script, { hasTcfApi: false }).control.hidden, true);
  assert.equal(runConsentHook(script, { hasRevocationApi: false }).control.hidden, true);
  assert.equal(runConsentHook(script, { consentApiReady: false }).control.hidden, true);
});

test('later TCF events update visibility and failures hide the control', async () => {
  const hook = runConsentHook(consentScript(await renderFooter()));
  assert.equal(hook.control.hidden, false);
  hook.tcfCallback({ gdprApplies: false }, true);
  assert.equal(hook.control.hidden, true);
  hook.tcfCallback({ gdprApplies: true }, true);
  assert.equal(hook.control.hidden, false);
  hook.tcfCallback({ gdprApplies: true }, false);
  assert.equal(hook.control.hidden, true);
  hook.tcfCallback(null, true);
  assert.equal(hook.control.hidden, true);
});

test('click falls back to the privacy page if the revocation API becomes unavailable', async () => {
  const hook = runConsentHook(consentScript(await renderFooter()));
  assert.equal(hook.control.hidden, false);
  delete hook.googlefc.showRevocationMessage;
  let prevented = false;
  hook.link.listeners.click({ preventDefault() { prevented = true; } });
  assert.equal(prevented, false);
  assert.equal(hook.callbackQueue.includes(hook.showRevocationMessage), false);
});
