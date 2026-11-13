const CACHE = 'calendario-v14';
const ASSETS = ['./', './index.html', './style.css', './app.js', './config.js', './manifest.json'];
self.addEventListener('install', e => { self.skipWaiting(); e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS))) });
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())));
// Red primero (siempre la última versión); caché solo si no hay conexión.
self.addEventListener('fetch', e => {
    if (e.request.method !== 'GET') return;
    const url = new URL(e.request.url);
    if (url.origin !== location.origin) return;
    e.respondWith(fetch(e.request).then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return r }).catch(() => caches.match(e.request)));
});
self.addEventListener('notificationclick', e => { e.notification.close(); e.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then(l => l.length ? l[0].focus() : clients.openWindow('./'))) });
self.addEventListener('push', e => {
    let d = {}; try { d = e.data.json() } catch (_) { d = { body: e.data ? e.data.text() : '' } }
    e.waitUntil(self.registration.showNotification(d.title || 'Calendario de clase', { body: d.body || '', tag: d.tag, icon: './icons/icon-192.png', badge: './icons/icon-192.png', data: { url: d.url || './' } }))
});