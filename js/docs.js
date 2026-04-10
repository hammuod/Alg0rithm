async function loadDoc(path) {
  const app = document.getElementById('app');
  if (!app) return; // تأمين الكود في حال لم يجد العنصر

  // تنظيف المسار
  let mdPath = path.replace(/^\//, '').replace(/\/$/, '') || 'home';
  // إذا كان الرابط يحتوي على كلمة web/ احذفها لتجنب الـ 404
  mdPath = mdPath.replace(/^web\//, ''); 
  
  const finalUrl = `docs/${mdPath}.md`;
  console.log("جاري التحميل من:", finalUrl);

  try {
      const res = await fetch(finalUrl);
      if (!res.ok) throw new Error('404');
      const text = await res.text();
      
      // إضافة الكلاس للعنصر الأساسي ووضع المحتوى داخله مباشرة
      app.className = 'markdown-body'; 
      app.innerHTML = marked.parse(text);
      
  } catch (err) {
      app.innerHTML = '<p>الصفحة غير موجودة. 404</p>';
  }
}

// مستمع الأحداث للروابط
document.addEventListener('click', e => {
  const a = e.target.closest('a[data-doc]');
  if (!a) return;
  e.preventDefault();
  const path = a.getAttribute('data-doc');
  history.pushState(null, '', path);
  loadDoc(path);
});

// التعامل مع أزرار الرجوع والتقدم في المتصفح
window.addEventListener('popstate', () => {
  // نأخذ المسار من العنوان وننظفه من اسم المجلد الأساسي إذا وجد
  let path = location.pathname.replace(/^\/web\//, ''); 
  loadDoc(path || 'home');
});

// تشغيل الثيم (Dark Mode)
const btn = document.getElementById('dark-mode-toggle');
if(localStorage.getItem("theme") === "dark"){
  document.body.classList.add("dark-mode");
}

btn.onclick = () => {
  document.body.classList.toggle('dark-mode');
  localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
};
loadDoc("home")

// تحميل الصفحة الأولى عند فتح الموقع
// نمرر المسار الحالي من المتصفح بدلاً من كلمة 'home' دائماً
loadDoc(location.pathname.replace(/^\/web\//, '') || 'home');