/**
 * ACMS Arena Tracker — Service Worker
 * Strategy: cache-first with runtime caching of cross-origin static assets
 * (esm.sh, fonts, MSAL CDN). Auth + Graph API endpoints are network-only.
 * Bump CACHE_NAME below to force clients to re-precache.
 */
const CACHE_NAME = 'arena-gate-v10';
// Hosts whose responses must NEVER be cached (auth, dynamic data API)
const NO_CACHE_HOSTS = [
  'login.microsoftonline.com',
  'login.live.com',
  'graph.microsoft.com',
  'sharepoint.com',
];
const PRECACHE_URLS = [
  './',
  './index.html',
  './manifest.json',
  './icon-180.png',
  './icon-192.png',
  './icon-512.png',
];

// On install: precache the local shell.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
      .catch((e) => { console.warn('[sw] precache partial:', e); })
      .then(() => self.skipWaiting())
  );
});

// On activate: drop old cache versions.
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// On fetch: cache-first; fall back to network and store the response for next time.
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  // Only handle http(s) — skip chrome-extension, etc.
  const url = new URL(req.url);
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return;

  // Auth + Graph requests bypass the cache entirely
  if (NO_CACHE_HOSTS.some((h) => url.hostname === h || url.hostname.endsWith('.' + h))) return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(req, { ignoreSearch: false });
    if (cached) {
      // Stale-while-revalidate for cross-origin CDN assets so we eventually pick up updates
      if (url.origin !== self.location.origin) {
        fetch(req).then((resp) => {
          if (resp && resp.status === 200) cache.put(req, resp.clone()).catch(() => {});
        }).catch(() => {});
      }
      return cached;
    }
    try {
      const resp = await fetch(req);
      if (resp && resp.status === 200) {
        // Cache HTTPS GET responses (including cross-origin where CORS allows)
        cache.put(req, resp.clone()).catch(() => {});
      }
      return resp;
    } catch (err) {
      // Offline + not in cache: return the app shell as a fallback for navigations
      if (req.mode === 'navigate') {
        const fallback = await cache.match('./index.html') || await cache.match('./');
        if (fallback) return fallback;
      }
      throw err;
    }
  })());
});
