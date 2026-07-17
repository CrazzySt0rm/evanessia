const CACHE = 'eva-v1';
const STATIC = ['/', '/index.html', '/manifest.json', '/icons/icon-192.png', '/icons/icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(STATIC)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

// Network-first: always try network, fall back to cache for shell
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  // API calls — never cache
  if (url.pathname.startsWith('/chat') || url.pathname.startsWith('/tts')) return;
  e.respondWith(
    fetch(e.request)
      .then(r => { const clone = r.clone(); caches.open(CACHE).then(c => c.put(e.request, clone)); return r; })
      .catch(() => caches.match(e.request))
  );
});
