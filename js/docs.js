// إعدادات Docsify للربط مع المجلدات الموضحة في الصورة
window.$docsify = {
    el: '#app',
    
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

// دالة مساعدة اختيارية إذا أردت التحكم في التحميل يدوياً
function loadAlgo(path) {
    // Docsify يعمل تلقائياً مع الـ Hash (#/)
    // ولكن هذه الدالة تفيدك إذا أردت عمل "Log" أو أكشن إضافي
    window.location.hash = path;
}