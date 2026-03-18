// دالة التنظيف الاحترافية
function cleanPathForDocsify(path) {
    if (!path) return 'home';
    
    return path.trim()
        .replace(/^#\/?/, '')         // حذف # في البداية
        .replace(/\.html$/i, '')      // حذف .html من النهاية
        .replace(/\.md$/i, '')        // حذف .md من النهاية
        .replace(/\/+/g, '/')         // توحيد الشرطات المائلة
        .toLowerCase();               // التأكد من أنها حروف صغيرة
}

window.$docsify = {
    el: '#app',
    name: 'Alg0rithm',
    routerMode: 'history',
    basePath: './docs/', // الملفات موجودة في مجلد docs
    
    // إجبار Docsify على إضافة .md داخلياً عند الطلب
    ext: '.md',
    
    // الـ Alias للتأكد من أن الروابط نظيفة دائماً
    alias: {
        '/(.*)': function(path) {
            return cleanPathForDocsify(path);
        }
    },
    
    homepage: 'home.md',
    loadSidebar: false,
};