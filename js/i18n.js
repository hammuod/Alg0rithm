/* Alg0rithm i18n runtime
   One page, three languages. No reload: the dictionary is swapped in place.
   Usage in HTML:
     <html lang="en" data-i18n-title="meta.home.title">
     <meta name="description" data-i18n-content="meta.home.desc">
     <span data-i18n="nav.learn"></span>
     <p data-i18n-html="index.aboutBody"></p>
     <input data-i18n-attr="placeholder:docs.search;aria-label:docs.search">
     <div data-i18n-digits>digits get Arabic-Indic numerals in Arabic</div>
   The language button is injected automatically, nothing to add in HTML.
*/
(function () {
  'use strict';

  var SUPPORTED = ['en', 'ar', 'fr'];
  var FALLBACK_LANG = 'en';
  var RTL_LANGS = ['ar'];
  var AR_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  var LAT_DIGITS = '٠١٢٣٤٥٦٧٨٩';
  var STORAGE_KEY = 'alg0rithm.lang';
  var DICT_PATH = '/i18n/';
  var RTL_CSS = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.rtl.min.css';
  var OG_LOCALES = { en: 'en_US', ar: 'ar_AR', fr: 'fr_FR' };
  var FADE_IN = 320;
  var FADE_HOLD = 120;
  var FADE_OUT = 420;

  var docEl = document.documentElement;
  var messages = {};
  var fallbackMessages = {};
  var currentLang = detectLang();
  var resolveReady;
  var ready = new Promise(function (res) { resolveReady = res; });
  var switching = false;
  var menuEl = null;
  var btnEl = null;

  window.i18nReady = ready;

  docEl.classList.add('i18n-boot');
  applyDocumentLang(currentLang);
  window.setTimeout(function () { docEl.classList.remove('i18n-boot'); }, 3000);

  function isSupported(code) {
    return SUPPORTED.indexOf(code) > -1;
  }

  function normalize(code) {
    if (!code || typeof code !== 'string') return null;
    var base = code.toLowerCase().trim().split(/[-_]/)[0];
    return isSupported(base) ? base : null;
  }

  function detectLang() {
    try {
      var params = new URLSearchParams(window.location.search);
      var fromQuery = normalize(params.get('lang'));
      if (fromQuery) return fromQuery;
    } catch (e) { /* no URLSearchParams */ }

    try {
      var saved = normalize(window.localStorage.getItem(STORAGE_KEY));
      if (saved) return saved;
    } catch (e) { /* storage blocked */ }

    var list = navigator.languages && navigator.languages.length
      ? navigator.languages
      : [navigator.language];
    for (var i = 0; i < list.length; i++) {
      var base = list[i] && list[i].toLowerCase().trim().split(/[-_]/)[0];
      if (isSupported(base)) return base;
    }

    return FALLBACK_LANG;
  }

  function isRtl(lang) {
    return RTL_LANGS.indexOf(lang) > -1;
  }

  function syncBootstrap(lang) {
    var base = document.getElementById('bootstrap-css');
    if (!base) return;
    var rtl = document.getElementById('bootstrap-rtl');

    if (isRtl(lang)) {
      if (rtl) return;
      var link = document.createElement('link');
      link.id = 'bootstrap-rtl';
      link.rel = 'stylesheet';
      link.href = RTL_CSS;
      base.parentNode.insertBefore(link, base.nextSibling);
      return;
    }

    if (rtl && rtl.parentNode) rtl.parentNode.removeChild(rtl);
  }

  function applyDocumentLang(lang) {
    docEl.setAttribute('lang', lang);
    docEl.setAttribute('dir', isRtl(lang) ? 'rtl' : 'ltr');
    docEl.setAttribute('data-lang', lang);
    syncBootstrap(lang);

    var og = document.querySelector('meta[property="og:locale"]');
    if (og) og.setAttribute('content', OG_LOCALES[lang] || OG_LOCALES[FALLBACK_LANG]);
  }

  function lookup(dict, key) {
    if (!dict || !key) return undefined;
    var parts = key.split('.');
    var node = dict;
    for (var i = 0; i < parts.length; i++) {
      if (node === null || typeof node !== 'object') return undefined;
      node = node[parts[i]];
    }
    return node;
  }

  function interpolate(str, vars) {
    if (!vars) return str;
    return str.replace(/\{(\w+)\}/g, function (match, name) {
      return vars[name] === undefined || vars[name] === null ? match : String(vars[name]);
    });
  }

  function t(key, vars) {
    if (!key) return null;
    var value = lookup(messages, key);
    if (value === undefined) value = lookup(fallbackMessages, key);
    if (typeof value !== 'string') return null;
    return interpolate(value, vars);
  }

  function has(key) {
    return t(key) !== null;
  }

  function readVars(el) {
    if (el.__i18nVars) return el.__i18nVars;
    var raw = el.getAttribute('data-i18n-vars');
    if (!raw) return null;
    try { return JSON.parse(raw); } catch (e) { return null; }
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function localizeDigits(root) {
    if (currentLang !== 'ar') return;
    var scope = root || document.body;
    if (!scope || !scope.querySelectorAll) return;

    var nodes = scope.querySelectorAll('[data-i18n-digits]');
    if (scope.hasAttribute && scope.hasAttribute('data-i18n-digits')) nodes = [scope].concat(Array.prototype.slice.call(nodes));

    nodes.forEach(function (host) {
      var walker = document.createTreeWalker(host, NodeFilter.SHOW_TEXT, null);
      var node;
      while ((node = walker.nextNode())) {
        var value = node.nodeValue;
        if (!value || !/[0-9]/.test(value)) continue;
        var next = value.replace(/[0-9]/g, function (d) { return AR_DIGITS[+d]; });
        if (next !== value) node.nodeValue = next;
      }
    });
  }

  function toLatinDigits(str) {
    return String(str == null ? '' : str).replace(/[٠-٩]/g, function (d) {
      return LAT_DIGITS.indexOf(d);
    });
  }

  function apply(root) {
    var scope = root || document;

    scope.querySelectorAll('[data-i18n]').forEach(function (el) {
      var value = t(el.getAttribute('data-i18n'), readVars(el));
      if (value !== null) el.textContent = value;
    });

    scope.querySelectorAll('[data-i18n-html]').forEach(function (el) {
      var value = t(el.getAttribute('data-i18n-html'), readVars(el));
      if (value !== null) el.innerHTML = value;
    });

    scope.querySelectorAll('[data-i18n-attr]').forEach(function (el) {
      var vars = readVars(el);
      el.getAttribute('data-i18n-attr').split(';').forEach(function (pair) {
        var parts = pair.split(':');
        if (parts.length !== 2) return;
        var attr = parts[0].trim();
        var value = t(parts[1].trim(), vars);
        if (value !== null) el.setAttribute(attr, value);
      });
    });

    scope.querySelectorAll('[data-i18n-content]').forEach(function (el) {
      var value = t(el.getAttribute('data-i18n-content'));
      if (value !== null) el.setAttribute('content', value);
    });

    var titleKey = docEl.getAttribute('data-i18n-title');
    if (titleKey) {
      var title = t(titleKey);
      if (title !== null) document.title = title;
    }

    localizeDigits(scope === document ? document.body : scope);
  }

  function fetchDict(url) {
    return fetch(url, { credentials: 'same-origin' })
      .then(function (res) {
        if (!res.ok) throw new Error('i18n ' + res.status + ' ' + url);
        return res.json();
      })
      .catch(function () { return null; });
  }

  function loadDict(lang) {
    var jobs = [fetchDict(DICT_PATH + lang + '.json')];
    if (lang !== FALLBACK_LANG) {
      jobs.push(fetchDict(DICT_PATH + FALLBACK_LANG + '.json'));
    }
    return Promise.all(jobs).then(function (result) {
      return {
        messages: result[0] || {},
        fallback: result[1] || result[0] || {}
      };
    });
  }

  function wait(ms) {
    return new Promise(function (res) { window.setTimeout(res, ms); });
  }

  function showVeil() {
    var el = document.querySelector('.i18n-veil');
    if (!el) {
      el = document.createElement('div');
      el.className = 'i18n-veil';
      el.setAttribute('aria-hidden', 'true');
      document.body.appendChild(el);
    }
    el.hidden = false;
    el.classList.add('is-blocking');
    el.style.transition = 'opacity ' + FADE_IN + 'ms ease';
    void el.offsetWidth;
    el.style.opacity = '1';
    return el;
  }

  function hideVeil() {
    var el = document.querySelector('.i18n-veil');
    if (!el) return Promise.resolve();
    el.classList.remove('is-blocking');
    el.style.transition = 'opacity ' + FADE_OUT + 'ms ease';
    el.style.opacity = '0';
    return wait(FADE_OUT).then(function () {
      if (el.parentNode) el.parentNode.removeChild(el);
    });
  }

  function persist(lang) {
    try { window.localStorage.setItem(STORAGE_KEY, lang); } catch (e) { /* ignore */ }
  }

  function syncUrl(lang) {
    if (!window.history || !window.history.replaceState) return;
    try {
      var url = new URL(window.location.href);
      if (lang === FALLBACK_LANG) url.searchParams.delete('lang');
      else url.searchParams.set('lang', lang);
      window.history.replaceState({ lang: lang }, '', url.pathname + url.search + url.hash);
    } catch (e) { /* ignore */ }
  }

  function setLanguage(lang, options) {
    var target = normalize(lang);
    if (!target || switching) return Promise.resolve(false);

    var opts = options || {};
    var silent = !!opts.silent;

    if (target === currentLang && !Object.keys(messages).length) return Promise.resolve(false);

    switching = true;
    closeMenu();

    var start = Promise.resolve();
    if (!silent) {
      showVeil();
      start = wait(FADE_IN + FADE_HOLD);
    }

    return start
      .then(function () { return loadDict(target); })
      .then(function (data) {
        if (!Object.keys(data.messages).length && Object.keys(messages).length) {
          throw new Error('empty dictionary for ' + target);
        }

        messages = data.messages;
        fallbackMessages = data.fallback;
        currentLang = target;
        applyDocumentLang(target);
        persist(target);
        syncUrl(target);
        apply(document);
        renderSwitcher();
        document.dispatchEvent(new CustomEvent('i18n:change', { detail: { lang: target } }));
        return true;
      })
      .then(function () { return silent ? true : hideVeil(); })
      .then(function () { return true; })
      .catch(function (err) {
        console.error('i18n: language switch failed', err);
        return false;
      })
      .then(function (result) {
        switching = false;
        return result;
      });
  }

  function openMenu() {
    if (!menuEl) return;
    menuEl.hidden = false;
    void menuEl.offsetWidth;
    menuEl.classList.add('is-open');
    if (btnEl) btnEl.setAttribute('aria-expanded', 'true');
  }

  function closeMenu() {
    if (!menuEl || menuEl.hidden) return;
    menuEl.classList.remove('is-open');
    if (btnEl) btnEl.setAttribute('aria-expanded', 'false');
    window.setTimeout(function () {
      if (menuEl && !menuEl.classList.contains('is-open')) menuEl.hidden = true;
    }, 180);
  }

  function switchLabel() {
    return t('lang.switchTo', { lang: t('lang.' + currentLang) || currentLang }) || 'Language';
  }

  function renderSwitcher() {
    if (!document.body) return;

    var old = document.querySelector('.lang-switch');
    if (old && old.parentNode) old.parentNode.removeChild(old);

    var wrap = document.createElement('div');
    wrap.className = 'lang-switch';
    wrap.setAttribute('role', 'group');
    wrap.setAttribute('aria-label', switchLabel());

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'lang-switch__btn';
    btn.setAttribute('aria-haspopup', 'listbox');
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('title', switchLabel());
    btn.innerHTML = '<i class="fa-solid fa-globe" aria-hidden="true"></i>' +
      '<span class="lang-switch__code">' + currentLang.toUpperCase() + '</span>' +
      '<i class="fa-solid fa-chevron-down lang-switch__caret" aria-hidden="true"></i>';
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      if (menuEl && !menuEl.hidden && menuEl.classList.contains('is-open')) closeMenu();
      else openMenu();
    });

    var menu = document.createElement('div');
    menu.className = 'lang-switch__menu';
    menu.setAttribute('role', 'listbox');
    menu.setAttribute('aria-label', switchLabel());
    menu.hidden = true;

    SUPPORTED.forEach(function (code) {
      var opt = document.createElement('button');
      var active = code === currentLang;
      opt.type = 'button';
      opt.className = 'lang-switch__opt' + (active ? ' is-active' : '');
      opt.setAttribute('role', 'option');
      opt.setAttribute('lang', code);
      opt.setAttribute('dir', isRtl(code) ? 'rtl' : 'ltr');
      opt.setAttribute('aria-selected', active ? 'true' : 'false');
      opt.innerHTML = '<span class="lang-switch__name">' + escapeHtml(t('lang.' + code) || code) + '</span>' +
        '<span class="lang-switch__tag">' + code.toUpperCase() + '</span>' +
        '<i class="fa-solid fa-check lang-switch__check" aria-hidden="true"></i>';
      opt.addEventListener('click', function (e) {
        e.stopPropagation();
        if (code === currentLang) { closeMenu(); return; }
        setLanguage(code);
      });
      menu.appendChild(opt);
    });

    wrap.appendChild(btn);
    wrap.appendChild(menu);
    document.body.appendChild(wrap);

    menuEl = menu;
    btnEl = btn;
  }

  function wireSwitcher() {
    document.addEventListener('click', function (e) {
      var wrap = document.querySelector('.lang-switch');
      if (wrap && !wrap.contains(e.target)) closeMenu();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' || e.key === 'Esc') closeMenu();
    });
  }

  function onChange(fn) {
    if (typeof fn !== 'function') return function () {};
    var handler = function () { fn(currentLang); };
    document.addEventListener('i18n:change', handler);
    if (docEl.classList.contains('i18n-ready')) fn(currentLang);
    return function () { document.removeEventListener('i18n:change', handler); };
  }

  function publish() {
    window.I18N = {
      lang: currentLang,
      dir: isRtl(currentLang) ? 'rtl' : 'ltr',
      supported: SUPPORTED.slice(),
      rtl: isRtl(currentLang),
      t: t,
      has: has,
      apply: apply,
      setLanguage: setLanguage,
      onChange: onChange,
      localizeDigits: localizeDigits,
      toLatinDigits: toLatinDigits
    };
    return window.I18N;
  }

  function boot() {
    loadDict(currentLang).then(function (data) {
      messages = data.messages;
      fallbackMessages = data.fallback;

      applyDocumentLang(currentLang);
      apply(document);
      renderSwitcher();
      wireSwitcher();

      docEl.classList.remove('i18n-boot');
      docEl.classList.add('i18n-ready');

      var api = publish();
      document.dispatchEvent(new CustomEvent('i18n:ready', { detail: { lang: currentLang } }));
      resolveReady(api);
    });
  }

  publish();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
