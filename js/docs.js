
const currentPath = window.location.pathname;

const ALLOWED_DOCS = new Set([
  'home.md',
  'web/bubble-sort.md',
  'web/selection-sort.md',
  'web/linear-search.md',
  'web/find-maximum.md'
]);

if (localStorage.getItem('transitioning') === 'start') {
    const curtain = document.createElement('div');
    curtain.classList.add('curtain');
    curtain.style.transition = 'none';
    curtain.classList.add('active');
    document.body.appendChild(curtain);

    setTimeout(() => {
        curtain.style.transition = 'all 0.5s ease';
        curtain.classList.remove('active');
        curtain.classList.add('exit');
        
        setTimeout(() => {
            curtain.remove();
            localStorage.removeItem('transitioning');
        }, 500); 
    }, 100); 
}

document.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', e => {
        const targetHref = link.href;
        
        try {
            const targetUrl = new URL(targetHref);
            const isSamePage = targetUrl.pathname === currentPath;
            const isAnchor = targetHref.includes('#');

            if (targetHref && !isSamePage && !isAnchor && targetUrl.origin === window.location.origin) {
                e.preventDefault();
                localStorage.setItem('transitioning', 'start');
                
                const curtain = document.createElement('div');
                curtain.classList.add('curtain');
                document.body.appendChild(curtain);

                setTimeout(() => {
                    curtain.classList.add('active');
                    setTimeout(() => {
                        window.location.href = targetHref;
                    }, 500);
                }, 50);
            }
        } catch (err) {
            return;
        }
    });
});

async function loadDoc(path) {
  const app = document.getElementById('app');
  if (!app) return;

  let mdPath = path.replace(/^\//, '').replace(/\/$/, '') || 'home.md';
  if (!mdPath.endsWith('.md')) mdPath += '.md';

  if (!ALLOWED_DOCS.has(mdPath)) {
    app.className = 'docs-app';
    app.innerHTML = '<p>Page not found. 404</p>';
    return;
  }

  const finalUrl = `docs/${mdPath}`;

  try {
    const res = await fetch(finalUrl);
    if (!res.ok) throw new Error('not-found');
    const text = await res.text();
    if (typeof marked === 'undefined' || typeof marked.parse !== 'function') {
      throw new Error('marked-missing');
    }
    app.className = 'markdown-body';
    app.innerHTML = marked.parse(text);
  } catch (err) {
    if (err && err.message === 'marked-missing') {
      app.innerHTML = '<p>Renderer error: the Markdown library is unavailable.</p>';
    } else {
      app.innerHTML = '<p>Page not found. 404</p>';
    }
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

const themeBtn = document.getElementById('dark-mode-toggle');
if (themeBtn) {
  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark-mode");
  }
  themeBtn.onclick = () => {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
  };
}

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
