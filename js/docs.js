window.$docsify = {
    el: '#app',
    name: 'Alg0rithm',
    routerMode: 'history',
    // نصيحة: إذا كان الـ HTML بجانب مجلد docs، استخدم المسار النسبي الصحيح
    basePath: './docs/', 

    // أضف الـ Alias هنا لإجبار Docsify على تنظيف الروابط داخلياً
    alias: {
        '/(.*)': function(path) {
            return ultimateCleanPath(path);
        }
    },

    loadSidebar: false,
    homepage: 'home.md', // تأكد أن الملف اسمه docs/home.md
    themeColor: '#3fbbfe',
    executeScript: true,
    auto2top: true,
};

// دالة التنظيف (تعديل بسيط لضمان التوافق)
function ultimateCleanPath(path) {
    if (!path || path === '/') return 'home.md'; // العودة للرئيسية إذا كان المسار فارغاً

    let clean = path.trim();
    clean = clean.replace(/\.(html|md)$/i, '');
    clean = clean.replace(/^#\/?/, '');
    
    // ملاحظة: Docsify داخلياً يفضل المسارات بدون / في البداية عند استخدام basePath
    if (clean.startsWith('/')) {
        clean = clean.substring(1);
    }

    clean = clean.toLowerCase();
    return clean + '.md'; // أضف .md هنا ليعرف Docsify ماذا يجلب من مجلد docs
}