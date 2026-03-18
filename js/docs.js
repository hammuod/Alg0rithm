// إعدادات Docsify للربط مع المجلدات الموضحة في الصورة
window.$docsify = {
    el: '#app',
    name: 'Alg0rithm',
    routerMode: 'history', // يزيل الـ # تماماً
    // بما أن ملف HTML في المجلد الرئيسي و docs بجانبه
    basePath: 'docs/', 

    // إعدادات الواجهة
    loadSidebar: false, // نستخدم الـ Sidebar الخاص بك في HTML
    homepage: 'home.md', // تأكد من وجوده داخل مجلد docs
    themeColor: '#3fbbfe',
    
    // تفعيل الـ Plugins المفيدة
    executeScript: true,
    auto2top: true,
};

function ultimateCleanPath(path) {
    if (!path) return '';

    let clean = path.trim();

    // 1. إزالة أي امتداد ملف (.html أو .md)
    clean = clean.replace(/\.(html|md)$/i, '');

    // 2. إزالة أي "هاش" زائد في البداية
    clean = clean.replace(/^#\/?/, '');

    // 3. التأكد من أن الرابط يبدأ بـ / واحد فقط
    if (!clean.startsWith('/')) {
        clean = '/' + clean;
    }

    // 4. تحويل للأحرف الصغيرة لضمان التوافق مع Vercel/Linux
    clean = clean.toLowerCase();

    // 5. إزالة أي تكرار للشرطات المائلة //
    clean = clean.replace(/\/+/g, '/');

    return clean;
}

