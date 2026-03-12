const CACHE_NAME = 'alg0rithm-offline-v1';
const OFFLINE_URL = '/entrnet.html'; // صفحة الطوارئ فقط

// 1. التحميل مرة واحدة فقط عند أول زيارة
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            // يحمل صفحة الأوفلاين ويخزنها في الهارددسك
            return cache.add(new Request(OFFLINE_URL, { cache: 'reload' }));
        })
    );
});

// 2. الاستماع الذكي: الموقع يشتغل طبيعي طول ما فيه نت
self.addEventListener('fetch', (event) => {
    // نطبق المنطق فقط على الصفحات (Navigation)
    if (event.request.mode === 'navigate') {
        event.respondWith(
            // حاول تجيب الصفحة من النت أولاً (طبيعي)
            fetch(event.request).catch(() => {
                // إذا انقطع النت، طلع صفحة الأوفلاين من الهارددسك
                return caches.match(OFFLINE_URL);
            })
        );
    }
});