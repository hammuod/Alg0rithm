
const currentPath = window.location.pathname;

const ti18n = (key, fallback) => (window.I18N && I18N.t(key)) || fallback;
const localizedDocTitle = (docId, fallbackTitle) => ti18n(`algo.${docId}`, fallbackTitle);
const localizedCategory = (category) => ti18n(`docs.categories.${category}`, category);

const firebaseConfig = {
  apiKey: "AIzaSyBlPyaRQRTNPM5Xzl-dT3mAKUNQAqWULVo",
  authDomain: "alg0rithm-databese.firebaseapp.com",
  databaseURL: "https://alg0rithm-databese-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "alg0rithm-databese",
  storageBucket: "alg0rithm-databese.firebasestorage.app",
  messagingSenderId: "556223912953",
  appId: "1:556223912953:web:41ee9241fc7cf3cce57b28",
  measurementId: "G-XGTFMSJ026"
};

let fbDb = null;
if (typeof firebase !== 'undefined' && typeof firebase.initializeApp === 'function') {
  fbDb = firebase.initializeApp(firebaseConfig).database();
}

function flattenTree(snap, hasMarker, prefix = '', out = {}) {
  snap.forEach((child) => {
    const key = prefix ? `${prefix}/${child.key}` : child.key;
    const val = child.val();
    if (val && typeof val === 'object' && hasMarker(val)) {
      out[key] = val;
    } else if (val && typeof val === 'object') {
      flattenTree(child, hasMarker, key, out);
    }
  });
  return out;
}

const isMetaRecord = (v) => typeof v.category === 'string';
const isDocRecord = (v) => typeof v.content === 'string';

let categoryIndexPromise = null;
let docsCachePromise = null;

function getCategoryIndex() {
  if (!fbDb) return Promise.resolve(null);
  if (!categoryIndexPromise) {
    categoryIndexPromise = fbDb.ref('data/meta').once('value')
      .then((snap) => {
        if (!snap.exists()) return null;
        const flat = flattenTree(snap, isMetaRecord);
        const map = {};
        Object.keys(flat).forEach((k) => { map[k] = flat[k].category; });
        return map;
      })
      .catch(() => null);
  }
  return categoryIndexPromise;
}

function getDocsCache() {
  if (!fbDb) return Promise.resolve(null);
  if (!docsCachePromise) {
    docsCachePromise = fbDb.ref('data').once('value')
      .then((snap) => {
        if (!snap.exists()) return null;
        const flat = flattenTree(snap, isDocRecord);
        const index = {};
        Object.keys(flat).forEach((k) => {
          index[k.split('/').pop()] = { category: k.split('/').slice(0, -1).join('/'), content: flat[k].content };
        });
        return index;
      })
      .catch(() => null);
  }
  return docsCachePromise;
}

async function fetchFirebaseDoc(docPath) {
  if (!fbDb) throw new Error('not-found');
  const docId = docPath.split('/').pop();

  const index = await getCategoryIndex();
  if (index && index[docPath]) {
    const snap = await fbDb.ref(`data/${index[docPath]}/${docId}`).once('value');
    const val = snap.val();
    if (val && typeof val.content === 'string') return val.content;
    throw new Error('not-found');
  }

  const docs = await getDocsCache();
  if (docs && docs[docId]) return docs[docId].content;
  throw new Error('not-found');
}

async function loadDocFromSource(mdPath) {
  try {
    return await fetchFirebaseDoc(mdPath.replace(/\.md$/, ''));
  } catch (err) {
    if (!ALLOWED_DOCS.has(mdPath)) throw err;
    const res = await fetch(`docs/${mdPath}`);
    if (!res.ok) throw err;
    return await res.text();
  }
}

let activeDocPath = null;
let sidebarGroupsPromise = null;

function getSidebarGroups() {
  if (!fbDb) return Promise.resolve([]);
  if (!sidebarGroupsPromise) {
    sidebarGroupsPromise = (async () => {
      try {
        const snap = await fbDb.ref('data').once('value');
        if (!snap.exists()) return [];
        const flat = flattenTree(snap, isDocRecord);
        const groups = {};
        Object.keys(flat).forEach((k) => {
          const segs = k.split('/');
          const docId = segs.pop();
          const category = segs.join('/');
          (groups[category] = groups[category] || []).push({
            docId,
            title: flat[k].title || docId
          });
        });
        return Object.keys(groups)
          .sort((a, b) => a.localeCompare(b))
          .map((category) => ({
            category,
            docs: groups[category].sort((a, b) => a.title.localeCompare(b.title))
          }));
      } catch (e) {
        return [];
      }
    })();
  }
  return sidebarGroupsPromise;
}

function renderSidebar(groups) {
  const container = document.getElementById('sidebarAccordion');
  if (!container || !groups.length) return false;
  container.innerHTML = '';

  groups.forEach((group, gi) => {
    const gid = 'grp-' + gi;
    const categoryLabel = localizedCategory(group.category);
    const item = document.createElement('div');
    item.className = 'accordion-item';
    item.style.backgroundColor = 'var(--bg-card)';

    const header = document.createElement('h2');
    header.className = 'accordion-header';
    header.id = gid + '-head';
    header.innerHTML =
      '<button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" ' +
      'data-bs-target="#' + gid + '" aria-expanded="false" aria-controls="' + gid + '" ' +
      'style="background-color: var(--bg-card); color: var(--text); border: none; box-shadow: none;">' +
      escapeHtml(categoryLabel) + '</button>';

    const panel = document.createElement('div');
    panel.id = gid;
    panel.className = 'accordion-collapse collapse';
    panel.setAttribute('aria-labelledby', gid + '-head');
    panel.setAttribute('data-bs-parent', '#sidebarAccordion');
    const body = document.createElement('div');
    body.className = 'accordion-body p-0';
    panel.appendChild(body);

    group.docs.forEach((doc) => {
      const a = document.createElement('a');
      const title = localizedDocTitle(doc.docId, doc.title);
      const acronym = title
        .split(/\s+/)
        .filter((w) => w.length > 1)
        .map((w) => w[0])
        .join('')
        .toLowerCase();
      a.href = '?=web/' + doc.docId;
      a.setAttribute('data-doc', 'web/' + doc.docId);
      a.setAttribute('data-label', title);
      a.setAttribute('data-hay', [title, doc.title, doc.docId, group.category, acronym].join(' ').toLowerCase());
      a.className = 'd-block text-decoration-none p-2 ps-4';
      a.style.color = 'var(--text-gray)';
      a.textContent = title;
      body.appendChild(a);
    });

    item.appendChild(header);
    item.appendChild(panel);
    container.appendChild(item);
  });

  if (activeDocPath) highlightActiveDoc(activeDocPath);
  container.dataset.rendered = '1';
  return true;
}

function setLinkMatchState(a, matched, query) {
  const raw = a.getAttribute('data-label') || a.textContent;
  if (!matched || !query) {
    a.textContent = raw;
    return;
  }
  const idx = raw.toLowerCase().indexOf(query);
  if (idx < 0) {
    a.textContent = raw;
    return;
  }
  a.innerHTML =
    escapeHtml(raw.slice(0, idx)) +
    '<mark>' + escapeHtml(raw.slice(idx, idx + query.length)) + '</mark>' +
    escapeHtml(raw.slice(idx + query.length));
}

function levenshtein(a, b) {
  if (a === b) return 0;
  const la = a.length;
  const lb = b.length;
  if (!la) return lb;
  if (!lb) return la;
  let prev = new Array(lb + 1);
  let curr = new Array(lb + 1);
  for (let j = 0; j <= lb; j++) prev[j] = j;
  for (let i = 1; i <= la; i++) {
    curr[0] = i;
    for (let j = 1; j <= lb; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
    }
    const tmp = prev;
    prev = curr;
    curr = tmp;
  }
  return prev[lb];
}

const FUZZY_THRESHOLD = 0.45;

function fuzzyScore(query, hay) {
  const qWords = query.split(/\s+/).filter(Boolean);
  const hayLower = hay.toLowerCase();
  if (qWords.every((w) => hayLower.includes(w))) return 0;

  const tokens = hayLower.split(/[\s-]+/).filter((t) => t.length >= 3);
  let total = 0;
  let used = 0;
  qWords.forEach((w) => {
    if (w.length < 3) {
      total += 1;
      used++;
      return;
    }
    let best = Infinity;
    tokens.forEach((t) => {
      const norm = levenshtein(w, t) / Math.max(w.length, t.length);
      if (norm < best) best = norm;
    });
    total += best === Infinity ? 1 : best;
    used++;
  });
  return used ? total / used : 0;
}

function filterSidebar(query) {
  const q = (query || '').trim().toLowerCase();
  const groups = Array.from(document.querySelectorAll('#sidebarAccordion .accordion-item'));
  const container = document.getElementById('sidebarAccordion');
  const emptyMsg = document.getElementById('docsSearchEmpty');
  let anyMatch = false;

  groups.forEach((group) => {
    const links = Array.from(group.querySelectorAll('a[data-doc]')).map((a) => {
      const hay = (a.getAttribute('data-hay') || '').toLowerCase();
      const score = q ? fuzzyScore(q, hay) : 0;
      const match = !q || score <= FUZZY_THRESHOLD;
      a.dataset.score = match ? score.toFixed(3) : '99';
      a.style.display = match ? '' : 'none';
      setLinkMatchState(a, match, q ? q.split(/\s+/)[0] : '');
      return { a, score, match };
    });

    const matched = links.filter((l) => l.match);
    matched.sort((x, y) => x.score - y.score || x.a.textContent.localeCompare(y.a.textContent));
    const body = group.querySelector('.accordion-body');
    if (body && matched.length) matched.forEach((l) => body.appendChild(l.a));

    group.dataset.best = matched.length ? matched[0].score : '99';
    const groupMatch = matched.length > 0;
    group.style.display = groupMatch ? '' : 'none';
    if (groupMatch) anyMatch = true;

    const panel = group.querySelector('.accordion-collapse');
    const btn = group.querySelector('.accordion-button');
    if (!panel || !btn) return;

    if (q && groupMatch) {
      panel.classList.add('show');
      btn.classList.remove('collapsed');
      btn.setAttribute('aria-expanded', 'true');
    } else if (q) {
      panel.classList.remove('show');
      btn.classList.add('collapsed');
      btn.setAttribute('aria-expanded', 'false');
    }
  });

  if (q && container) {
    groups
      .filter((g) => g.style.display !== 'none')
      .sort((x, y) => parseFloat(x.dataset.best) - parseFloat(y.dataset.best))
      .forEach((g) => container.appendChild(g));
  }

  if (emptyMsg) emptyMsg.hidden = !(q && !anyMatch);
  if (!q && activeDocPath) highlightActiveDoc(activeDocPath);
}

const ALLOWED_DOCS = new Set([
  'home.md',
  'web/linear-search.md',
  'web/bubble-sort.md',
  'web/selection-sort.md',
  'web/insertion-sort.md',
  'web/big-o-notation.md',
  'web/space-complexity.md',
  'web/recursion.md',
  'web/array-traversing.md',
  'web/string-reversal.md',
  'web/palindrome-check.md',
  'web/fibonacci-sequence.md',
  'web/factorial-calculation.md',
  'web/stack-basics.md',
  'web/queue-basics.md',
  'web/linked-list-basics.md',
  'web/find-maximum.md',
  'web/set-operations.md',
  'web/matrix-summation.md',
  'web/two-pointers-technique.md',
  'web/sliding-window-basics.md',
  'web/hash-table-basics.md',
  'web/ascii-unicode-handling.md',
  'web/bitwise-and-or-xor.md',
  'web/euclidean-algorithm.md',
  'web/linear-regression-basics.md',
  'web/binary-search.md',
  'web/merge-arrays.md',
  'web/frequency-counter.md',
  'web/remove-duplicates.md',
  'web/circular-queue.md',
  'web/quick-sort.md',
  'web/merge-sort.md',
  'web/heap-sort.md',
  'web/binary-search-tree.md',
  'web/breadth-first-search.md',
  'web/depth-first-search.md',
  'web/dijkstras-algorithm.md',
  'web/prims-algorithm.md',
  'web/kruskals-algorithm.md',
  'web/memoization.md',
  'web/tabulation.md',
  'web/backtracking.md',
  'web/trie.md',
  'web/doubly-linked-list.md',
  'web/shell-sort.md',
  'web/bucket-sort.md',
  'web/radix-sort.md',
  'web/jump-search.md',
  'web/interpolation-search.md',
  'web/topological-sort.md',
  'web/longest-common-subsequence.md',
  'web/knapsack-problem.md',
  'web/coin-change-problem.md',
  'web/sieve-of-eratosthenes.md',
  'web/lru-cache-implementation.md',
  'web/binary-tree-traversal.md',
  'web/graph-cycle-detection.md',
  'web/sudoku-solver.md',
  'web/bit-manipulation.md',
  'web/disjoint-set-union.md',
  'web/k-nearest-neighbors.md',
  'web/k-means-clustering.md',
  'web/level-order-traversal.md',
  'web/max-flow-min-cut.md',
  'web/flood-fill-algorithm.md',
  'web/bellman-ford-algorithm.md',
  'web/floyd-warshall.md',
  'web/a-search-algorithm.md',
  'web/segment-tree.md',
  'web/fenwick-tree.md',
  'web/avl-tree.md',
  'web/red-black-tree.md',
  'web/knuth-morris-pratt.md',
  'web/rabin-karp.md',
  'web/boyer-moore.md',
  'web/suffix-array.md',
  'web/tarjans-algorithm.md',
  'web/ford-fulkerson.md',
  'web/edmonds-karp.md',
  'web/johnsons-algorithm.md',
  'web/fast-fourier-transform.md',
  'web/convex-hull.md',
  'web/z-algorithm.md',
  'web/matrix-chain-multiplication.md',
  'web/minimax-algorithm.md',
  'web/bloom-filter.md',
  'web/skip-list.md',
  'web/b-trees.md',
  'web/levenshtein-distance.md',
  'web/miller-rabin-primality-test.md',
  'web/rsa-encryption-algorithm.md',
  'web/huffman-coding.md',
  'web/burrows-wheeler-transform.md',
  'web/hopcroft-karp-algorithm.md',
  'web/heavy-light-decomposition.md',
  'web/centroid-decomposition.md',
  'web/persistent-data-structures.md',
  'web/pagerank-algorithm.md',
  'web/gradient-descent.md',
  'web/traveling-salesperson-problem.md'
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

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

const docsRenderer = (function buildRenderer() {
  if (typeof marked === 'undefined' || typeof marked.Renderer !== 'function') return null;
  const renderer = new marked.Renderer();
  renderer.code = ({ text: code, lang }) => {
    const language = (lang || '').toLowerCase();
    let highlighted = escapeHtml(code);
    let cls = 'markdown-code';
    if (typeof hljs !== 'undefined') {
      try {
        if (language && hljs.getLanguage(language)) {
          highlighted = hljs.highlight(code, { language }).value;
          cls = `hljs language-${language}`;
        } else if (code.trim()) {
          highlighted = hljs.highlightAuto(code).value;
          cls = 'hljs';
        }
      } catch (err) { /* fall through to escaped plain text */ }
    }
    return `<pre><code class="${cls}">${highlighted}</code></pre>`;
  };
  return renderer;
})();

const SKELETON_APP_HTML = `
  <div class="docs-skeleton-wrap">
    <div class="skeleton skeleton-title"></div>
    <div class="skeleton skeleton-line" style="width:78%"></div>
    <div class="skeleton skeleton-line" style="width:56%"></div>
    <div class="skeleton skeleton-code"></div>
    <div class="skeleton skeleton-line" style="width:90%"></div>
    <div class="skeleton skeleton-line" style="width:62%"></div>
    <div class="skeleton skeleton-line" style="width:70%"></div>
  </div>`;

const SKELETON_SIDEBAR_HTML = Array.from({ length: 4 }, () => [
  '<div class="skeleton skeleton-group"></div>',
  '<div class="skeleton skeleton-link" style="width:82%"></div>',
  '<div class="skeleton skeleton-link" style="width:68%"></div>',
  '<div class="skeleton skeleton-link" style="width:74%"></div>',
  '<div class="skeleton skeleton-link" style="width:58%"></div>'
].join('')).join('');

async function loadDoc(path) {
  const app = document.getElementById('app');
  if (!app) return;

  app.classList.remove('markdown-body');
  app.innerHTML = SKELETON_APP_HTML;

  let mdPath = path.replace(/^\//, '').replace(/\/$/, '') || 'home.md';
  if (!mdPath.endsWith('.md')) mdPath += '.md';

  activeDocPath = mdPath.replace(/\.md$/, '');

  try {
    const text = await loadDocFromSource(mdPath);
    if (typeof marked === 'undefined' || typeof marked.parse !== 'function') {
      throw new Error('marked-missing');
    }

    app.classList.add('markdown-body');
    app.innerHTML = marked.parse(text, { renderer: docsRenderer });

    highlightActiveDoc(activeDocPath);
  } catch (err) {
    if (err && err.message === 'marked-missing') {
      app.innerHTML = '<p>' + escapeHtml(ti18n('docs.rendererError', 'Renderer error: the Markdown library is unavailable.')) + '</p>';
    } else {
      app.innerHTML = '<p>' + escapeHtml(ti18n('docs.pageNotFound', 'Page not found. 404')) + '</p>';
    }
    highlightActiveDoc(null);
  }
}

function highlightActiveDoc(path) {
  const links = document.querySelectorAll('#docsSidebar a[data-doc]');
  let activeEl = null;

  links.forEach(link => {
    const active = path && link.getAttribute('data-doc') === path;
    link.classList.toggle('active', active);
    if (active) activeEl = link;
  });

  if (!activeEl) return;

  const panel = activeEl.closest('.accordion-collapse');
  if (panel && !panel.classList.contains('show')) {
    panel.classList.add('show');
    const btn = document.querySelector('.accordion-button[data-bs-target="#' + panel.id + '"]');
    if (btn) {
      btn.classList.remove('collapsed');
      btn.setAttribute('aria-expanded', 'true');
    }
  }

  activeEl.scrollIntoView({ block: 'nearest' });
}

document.addEventListener('click', e => {
  const a = e.target.closest('a[data-doc]');
  if (!a) return;
  e.preventDefault();
  const path = a.getAttribute('data-doc');
  // keep the ?lang= parameter so the link stays shareable in the same language
  const langParam = new URLSearchParams(window.location.search).get('lang');
  history.pushState(null, '', `?=${path}${langParam ? `&lang=${encodeURIComponent(langParam)}` : ''}`);
  loadDoc(path);
  document.body.classList.remove('docs-sidebar-open');
});

const themeBtn = document.getElementById('dark-mode-toggle');
const hljsDark = document.getElementById('hljs-dark');

function syncHljsTheme() {
  if (hljsDark) {
    hljsDark.disabled = !document.body.classList.contains('dark-mode');
  }
}

function applyThemeMode(dark) {
  document.body.classList.toggle('dark-mode', dark);
  document.documentElement.classList.toggle('dark-mode', dark);
  document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
  syncHljsTheme();
}

applyThemeMode(localStorage.getItem("theme") === "dark");

if (themeBtn) {
  themeBtn.onclick = () => {
    document.body.classList.toggle('dark-mode');
    const dark = document.body.classList.contains('dark-mode');
    document.documentElement.classList.toggle('dark-mode', dark);
    document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
    localStorage.setItem('theme', dark ? 'dark' : 'light');
    syncHljsTheme();
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

const docsSearch = document.getElementById('docsSearch');
if (docsSearch) {
  docsSearch.addEventListener('input', () => filterSidebar(docsSearch.value));
  docsSearch.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      docsSearch.value = '';
      filterSidebar('');
      docsSearch.blur();
    }
  });
}

(function showSidebarSkeleton() {
  const container = document.getElementById('sidebarAccordion');
  if (container) container.innerHTML = SKELETON_SIDEBAR_HTML;
})();

// تحميل أول صفحة بعد جاهزية ملف اللغة (حتى تظهر العناوين مترجمة)
const param = new URLSearchParams(location.search).get('');
const i18nBoot = window.i18nReady || Promise.resolve();

i18nBoot.then(() => {
  getSidebarGroups().then((groups) => {
    if (renderSidebar(groups)) {
      if (docsSearch && docsSearch.value) {
        filterSidebar(docsSearch.value);
      }
    } else {
      const container = document.getElementById('sidebarAccordion');
      if (container) container.innerHTML = '';
    }
  });

  loadDoc(param || 'home.md');
});

// إعادة رسم الشريط الجانبي عند تغيير اللغة (بدون إعادة تحميل الصفحة)
if (window.I18N && I18N.onChange) {
  I18N.onChange(() => {
    const container = document.getElementById('sidebarAccordion');
    if (!container || container.dataset.rendered !== '1') return;
    getSidebarGroups().then((groups) => {
      if (renderSidebar(groups) && docsSearch && docsSearch.value) {
        filterSidebar(docsSearch.value);
      }
    });
  });
}
