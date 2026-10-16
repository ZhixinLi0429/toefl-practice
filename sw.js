// App shell: network-first so updates show up. Question banks (data/*.json) are large and rarely change,
// so serve them cache-first and refresh in the background. Audio/images stay with the browser cache.
const CACHE = 'toefl-practice-v1';
const SHELL = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL))); self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;
  const net = fetch(e.request).then(r => { if (r.ok) { const c = r.clone(); caches.open(CACHE).then(x => x.put(e.request, c)); } return r; });
  if (url.pathname.includes('/data/')) e.respondWith(caches.match(e.request).then(hit => { if (hit) { net.catch(() => {}); return hit; } return net; }));
  else e.respondWith(net.catch(() => caches.match(e.request)));
});
