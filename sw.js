const CACHE = 'compras-v4';
const ASSETS = ['index.html','manifest.json','icons/icon-192.png','icons/icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  if (e.request.url.includes('fonts.g')) {
    e.respondWith(fetch(e.request).then(r=>{const c=r.clone();caches.open(CACHE).then(cache=>cache.put(e.request,c));return r;}).catch(()=>caches.match(e.request)));
    return;
  }
  e.respondWith(caches.match(e.request).then(cached=>{
    if(cached) return cached;
    return fetch(e.request).then(r=>{
      if(r&&r.status===200&&r.type!=='opaque'){const c=r.clone();caches.open(CACHE).then(cache=>cache.put(e.request,c));}
      return r;
    }).catch(()=>{if(e.request.destination==='document')return caches.match('index.html');});
  }));
});
