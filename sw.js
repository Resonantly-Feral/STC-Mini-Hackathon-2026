/* Dry Run service worker: keeps the static files so a refresh works offline.
   Registered from app.js only when the page is served over https. */

/* Bump this on every deploy so the new files replace the old ones. */
var CACHE_VERSION = 'dryrun-v4';

var FILES = [
  './',
  'index.html',
  'style.css',
  'scoring.js',
  'cards.js',
  'town.js',
  'app.js'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then(function (cache) {
        /* 'reload' skips the browser's own HTTP cache, so a new version gets new files. */
        return cache.addAll(FILES.map(function (file) { return new Request(file, { cache: 'reload' }); }));
      })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys()
      .then(function (names) {
        return Promise.all(names.map(function (name) {
          if (name !== CACHE_VERSION) return caches.delete(name);
        }));
      })
      .then(function () { return self.clients.claim(); })
  );
});

/* Cached copy first, network only for anything not in the cache. */
self.addEventListener('fetch', function (event) {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then(function (cached) {
      return cached || fetch(event.request);
    })
  );
});
