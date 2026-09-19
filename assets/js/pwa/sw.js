---
layout: compress
permalink: /:basename.min.js
# PWA service worker
---

const swconfUrl = '{{ '/assets/js/data/swconf.js' | relative_url }}';

importScripts(swconfUrl);
const purge = swconf.purge;
const runtimeCacheName = `${swconf.cacheName}-runtime`;
const navigationMigrationCacheName = 'chirpy-navigation-network-v1';
const maxRuntimeEntries = 60;
const maxRuntimeBytes = 1024 * 1024;

function verifyHost(url) {
  for (const host of swconf.allowHosts) {
    const regex = RegExp(`^http(s)?://${host}/`);
    if (regex.test(url)) {
      return true;
    }
  }
  return false;
}

function verifyUrl(url) {
  if (!verifyHost(url)) {
    return false;
  }

  const requestPath = new URL(url).pathname;

  for (const path of swconf.denyPaths) {
    if (requestPath.startsWith(path)) {
      return false;
    }
  }
  return true;
}

function isCacheableRuntimeResponse(request, response) {
  if (purge || request.method !== 'GET' || !response || !response.ok) {
    return false;
  }

  const url = new URL(request.url);
  const mediaDestinations = ['audio', 'image', 'video'];
  const contentLength = Number(response.headers.get('content-length') || 0);

  return (
    url.origin === location.origin &&
    verifyUrl(request.url) &&
    !mediaDestinations.includes(request.destination) &&
    (!Number.isFinite(contentLength) || contentLength <= maxRuntimeBytes)
  );
}

function trimRuntimeCache(cache) {
  return cache.keys().then((keys) => {
    const overflow = keys.length - maxRuntimeEntries;

    if (overflow <= 0) {
      return undefined;
    }

    return Promise.all(keys.slice(0, overflow).map((key) => cache.delete(key)));
  });
}

if (!purge) {
  swconf.allowHosts.push(location.host);
}

self.addEventListener('install', (event) => {
  const precache = purge
    ? Promise.resolve()
    : caches.open(swconf.cacheName).then((cache) => cache.addAll(swconf.resources));

  // Migrate existing cache-first clients immediately once. A persistent marker
  // restores the normal update prompt on later content deploys, avoiding a
  // forced reload every time a new article changes swconf.js.
  const activateMigration = caches.keys().then((keyList) => {
    if (!keyList.includes(navigationMigrationCacheName)) {
      return self.skipWaiting();
    }
    return undefined;
  });

  event.waitUntil(Promise.all([precache, activateMigration]));
});

self.addEventListener('activate', (event) => {
  const activeCaches = new Set([swconf.cacheName, runtimeCacheName, navigationMigrationCacheName]);

  const deleteOldCaches = caches.keys().then((keyList) => {
    return Promise.all(
      keyList.map((key) => {
        if (purge || !activeCaches.has(key)) {
          return caches.delete(key);
        }
        return undefined;
      })
    );
  });

  const markNavigationMigration = purge ? Promise.resolve() : caches.open(navigationMigrationCacheName);

  event.waitUntil(Promise.all([deleteOldCaches, markNavigationMigration]).then(() => self.clients.claim()));
});

self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

function cacheRuntimeResponse(request, response) {
  if (!isCacheableRuntimeResponse(request, response)) {
    return Promise.resolve(response);
  }

  const responseToCache = response.clone();

  return caches
    .open(runtimeCacheName)
    .then((cache) => cache.put(request, responseToCache).then(() => trimRuntimeCache(cache)))
    .catch(() => undefined)
    .then(() => response);
}

self.addEventListener('fetch', (event) => {
  // HTML navigations must prefer the network. Cache-first navigation kept an
  // 18-page home index alive after the live site had shrunk to 8 pages, so
  // readers followed retired post links into 404s. The cache remains an
  // offline fallback, but it is no longer the source of truth while online.
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => cacheRuntimeResponse(event.request, response))
        .catch(() =>
          caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            return caches.match('{{ '/' | relative_url }}').then((home) => home || Response.error());
          })
        )
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request).then((response) => cacheRuntimeResponse(event.request, response));
    })
  );
});
