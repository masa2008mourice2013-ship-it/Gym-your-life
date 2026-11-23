// Gym your Life – Offline-Speicher (Service Worker)
const CACHE = 'gyl-v6';
const FILES = ['./', './index.html', './styles.css', './data.js', './js/core.js', './js/home.js', './js/plan.js', './js/plaene.js', './js/training.js', './js/stats.js', './js/routinen.js', './js/essen.js', './js/swim.js', './js/frei.js', './js/settings.js', './js/main.js', './manifest.webmanifest',
  './icons/logo.png', './icons/icon-192.png', './icons/icon-512.png', './icons/apple-touch-icon.png', './icons/favicon-32.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

// Erst aus dem Netz holen (immer aktuell), bei fehlendem Netz aus dem Speicher.
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).then((res) => {
      const copy = res.clone();
      if (res.ok && (e.request.url.startsWith(self.location.origin) || e.request.url.includes('fonts.g'))) {
        caches.open(CACHE).then((c) => c.put(e.request, copy));
      }
      return res;
    }).catch(() => caches.match(e.request).then((r) => r || caches.match('./index.html')))
  );
});
