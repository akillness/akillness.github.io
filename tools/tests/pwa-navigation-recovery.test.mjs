import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../..', import.meta.url));
const read = (path) => fs.readFileSync(new URL(path, `${new URL(`file://${root}/`).href}`), 'utf8');

const worker = read('assets/js/pwa/sw.js');
const notFound = read('assets/404.html');

test('service worker migrates stale clients once and claims open tabs', () => {
  assert.match(worker, /navigationMigrationCacheName = 'chirpy-navigation-network-v1'/);
  assert.match(worker, /!keyList\.includes\(navigationMigrationCacheName\)/);
  assert.match(worker, /self\.skipWaiting\(\)/);
  assert.match(worker, /self\.clients\.claim\(\)/);
  assert.match(worker, /activeCaches = new Set\(\[swconf\.cacheName, runtimeCacheName, navigationMigrationCacheName\]\)/);
});

test('HTML navigation is network-first with an offline cache fallback', () => {
  const navigationBranch = worker.match(/if \(event\.request\.mode === 'navigate'\) \{([\s\S]*?)\n  \}\n\n  event\.respondWith/)?.[1];
  assert.ok(navigationBranch, 'navigation-specific fetch branch is missing');
  assert.ok(
    navigationBranch.indexOf('fetch(event.request)') < navigationBranch.indexOf('caches.match(event.request)'),
    'navigation must try the network before its cache fallback'
  );
});

test('404 page explains retirement and offers maintained recovery routes', () => {
  assert.match(notFound, /^robots: noindex, follow$/m);
  assert.match(notFound, /older imported and translated articles/);
  for (const route of ["'/'", "'/start-here/'", "'/archives/'", "'/categories/'"]) {
    assert.ok(notFound.includes(route), `missing 404 recovery route ${route}`);
  }
});
