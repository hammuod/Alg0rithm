async function loadDoc(path) {
  const app = document.getElementById('app');
  if (!app) return;

  let mdPath = path.replace(/^\//, '').replace(/\/$/, '') || 'home.md';
  if (!mdPath.endsWith('.md')) mdPath += '.md';

  const finalUrl = `docs/${mdPath}`;
  console.log("جاري التحميل من:", finalUrl);

  try {
    const res = await fetch(finalUrl);
    if (!res.ok) throw new Error('404');
    const text = await res.text();
    app.className = 'markdown-body';
    app.innerHTML = marked.parse(text);
  } catch (err) {
    app.innerHTML = '<p>الصفحة غير موجودة. 404</p>';
  }
}

document.addEventListener('click', e => {
  const a = e.target.closest('a[data-doc]');
  if (!a) return;
  e.preventDefault();
  const path = a.getAttribute('data-doc');
  history.pushState(null, '', `?=${path}`);
  loadDoc(path);
  document.body.classList.remove('docs-sidebar-open');
});

document.body.classList.add("dark-mode");

const sidebarToggle = document.getElementById('sidebarToggle');
const sidebarBackdrop = document.getElementById('sidebarBackdrop');

if (sidebarToggle) {
  sidebarToggle.addEventListener('click', () => {
    document.body.classList.toggle('docs-sidebar-open');
  });
}

if (sidebarBackdrop) {
  sidebarBackdrop.addEventListener('click', () => {
    document.body.classList.remove('docs-sidebar-open');
  });
}

window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.body.classList.remove('docs-sidebar-open');
  }
});

// تحميل أول صفحة
const param = new URLSearchParams(location.search).get('');
loadDoc(param || 'home.md');