---
layout: compress
permalink: /:basename.min.js
# PWA service worker
---

const swconfUrl = '{{ '/assets/js/data/swconf.js' | relative_url }}';

importScripts(swconfUrl);
const purge = swconf.purge;
const runtimeCacheName = `${swconf.cacheName}-runtime`;
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
  if (purge) {
    return;
  }

  event.waitUntil(
    caches.open(swconf.cacheName).then((cache) => {
      return cache.addAll(swconf.resources);
    })
  );
});

self.addEventListener('activate', (event) => {
  const activeCaches = new Set([swconf.cacheName, runtimeCacheName]);

  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (purge || !activeCaches.has(key)) {
            return caches.delete(key);
          }
          return undefined;
        })
      );
    })
  );
});

self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request).then((response) => {
        if (!isCacheableRuntimeResponse(event.request, response)) {
          return response;
        }

        {% comment %}See: <https://developers.google.com/web/fundamentals/primers/service-workers#cache_and_return_requests>{% endcomment %}
        const responseToCache = response.clone();

        caches
          .open(runtimeCacheName)
          .then((cache) => cache.put(event.request, responseToCache).then(() => trimRuntimeCache(cache)))
          .catch(() => undefined);

        return response;
      });
    })
  );
});
