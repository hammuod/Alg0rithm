const CACHE_NAME = 'entrnet-v2';
const ASSETS = [
  '/entrnet.html',
  '/css/net.css',
  '/js/net.js',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css',
  'https://cdn.jsdelivr.net/npm/prismjs/themes/prism-tomorrow.min.css',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.bundle.min.js',
  'https://cdn.jsdelivr.net/npm/docsify@4',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/7.0.1/css/all.min.css'
];

// تثبيت SW وتخزين الملفات في الكاش
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.allSettled(
        ASSETS.map((url) => cache.add(url).catch(() => {}))
      );
    }).then(() => self.skipWaiting())
  );
});

// تفعيل SW وحذف الكاش القديم
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// استرجاع من الكاش عند الطلب
self.addEventListener('fetch', (event) => {
  // صفحات التنقّل: جرّب الشبكة، ولو فشلت اعرض صفحة offline
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('/entrnet.html'))
    );
    return;
  }

  // باقي الملفات: كاش أولاً ثم الشبكة
  event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request)));
});
