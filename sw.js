const CACHE_NAME = 'alg0rithm-v7';

// القائمة الموحدة والمحدثة لجميع أصول الموقع بمسارات التنظيم الجديدة
const ASSETS = [
  '/',
  '/index.html',
  '/lap.html',
  
  // جميع ملفات التنسيق داخل مجلد css
  '/css/style.css',
  '/css/global.css',
  '/css/net.css',
  '/css/responsive.css',
  
  // جميع ملفات البرمجة داخل مجلد js
  '/js/index.js',
  '/js/net.js',
  '/js/lap.js', // المحرك المحلي
  
  // المكتبات والأيقونات المحلية
  '/libs/bootstrap/css/bootstrap.min.css',
  '/libs/bootstrap/js/bootstrap.min.js',
  '/libs/fontawesome/css/all.min.css',
  '/libs/fontawesome/webfonts/fa-brands-400.woff2',
  '/libs/fontawesome/webfonts/fa-regular-400.woff2',
  '/libs/fontawesome/webfonts/fa-solid-900.woff2',
  '/libs/fontawesome/webfonts/fa-v4compatibility.woff2',
  '/libs/github-markdown/github-markdown.min.css',
  '/libs/highlightjs/styles/github.min.css',
  '/libs/highlightjs/styles/github-dark.min.css',
  '/libs/highlightjs/highlight.min.js',
  '/libs/marked/marked.umd.min.js',
  '/libs/firebase/firebase-app-compat.js',
  '/libs/firebase/firebase-database-compat.js'
];

// 1. التثبيت وتخزين جميع الملفات في الكاش
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.allSettled(
        ASSETS.map((url) => cache.add(url).catch((err) => console.warn(`Failed to cache: ${url}`, err)))
      );
    }).then(() => self.skipWaiting())
  );
});

// 2. تنظيف الإصدارات القديمة وتفعيل الكاش الجديد
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// 3. معالجة طلبات جلب الملفات
self.addEventListener('fetch', (event) => {
  const requestUrl = event.request.url;

  // المحرك السحابي: Network First (الشبكة أولاً، والعودة للنسخة المحفوظة أوفلاين)
  if (requestUrl.includes('lap.js') || requestUrl.includes('lapCode.json')) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache));
          }
          return networkResponse;
        })
        .catch(() => {
          console.log("Offline mode: serving cached engine");
          return caches.match(event.request).then((cached) => cached || caches.match('/js/lap.js'));
        })
    );
    return;
  }

  // التصفح بين الصفحات
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        return cached || fetch(event.request).catch(() => caches.match('/lap.html') || caches.match('/'));
      })
    );
    return;
  }

  // باقي الأصول الثابتة: Cache First (الأداء والمحتوى المخزن أوفلاين)
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache));
        }
        return networkResponse;
      }).catch(() => {
        return new Response('Offline', { status: 503, statusText: 'Offline' });
      });
    })
  );
});