/* Alg0rithm Lab
   The visualization engine is fetched from Firebase, so the local file only
   boots it and keeps the step text + numbers readable in every language. */

// دالة جلب وتنفيذ المحرك عبر REST API المباشرة
async function loadRemoteEngine() {
    const RTDB_REST_URL = 'https://alg0rithm-databese-default-rtdb.europe-west1.firebasedatabase.app/engines/lapCode.json';

    try {
        console.log("جاري جلب أحدث نسخة للمحرك سحابياً...");
        const response = await fetch(RTDB_REST_URL, { cache: 'no-cache' });

        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

        const data = await response.json();

        if (data && data.code) {
            const script = document.createElement('script');
            script.type = 'text/javascript';
            script.text = data.code;
            document.head.appendChild(script);

            console.log("تم تحميل وتشغيل المحرك السحابي بنجاح!");
        } else {
            throw new Error("لم يتم العثور على الكود في قاعدة البيانات");
        }
    } catch (err) {
        console.warn("تعذر الاتصال بالسيرفر، لا يوجد محرك محلي احتياطي.", err);
    }
}

// دالة كتابة النصوص داخل الـ DOM بأمان لحماية الموقع
function safeUpdateActionText(containerElement, stepNumber, descriptionText) {
    if (!containerElement) return;

    containerElement.replaceChildren();

    const stepSpan = document.createElement('span');
    stepSpan.className = 'step-word';
    const stepPrefix = (window.I18N && I18N.t('lap.step', { n: stepNumber })) || `Step ${stepNumber}: `;
    stepSpan.textContent = stepPrefix;

    const textNode = document.createTextNode(descriptionText);

    containerElement.appendChild(stepSpan);
    containerElement.appendChild(textNode);
}

/* ---------- مطابقة نص المحرك مع لغة الصفحة ---------- */

const STEP_RE = /^(?:step|خطوة)\s*([0-9٠-٩]+)\s*[:：\-–]\s*([\s\S]*)$/i;

let lastStep = null;
let paintedLang = null;

function stepPrefix(n) {
    if (window.I18N && I18N.t) return I18N.t('lap.step', { n });
    return `Step ${n}: `;
}

function flat(str) {
    return String(str || '').replace(/\s+/g, ' ').trim();
}

function paintStep() {
    const el = document.getElementById('actionText');
    if (!el || !lastStep) return;

    const lang = (window.I18N && I18N.lang) || 'en';
    const next = flat(stepPrefix(lastStep.n) + ' ' + lastStep.desc);
    const current = window.I18N && I18N.toLatinDigits ? I18N.toLatinDigits(flat(el.textContent)) : flat(el.textContent);

    if (paintedLang === lang && current === next) return;

    const stepSpan = document.createElement('span');
    stepSpan.className = 'step-word';
    stepSpan.textContent = stepPrefix(lastStep.n);

    el.replaceChildren(stepSpan, document.createTextNode(' ' + lastStep.desc));
    paintedLang = lang;

    if (window.I18N && I18N.localizeDigits) I18N.localizeDigits(el);
}

function readActionText() {
    const el = document.getElementById('actionText');
    if (!el) return;

    const match = STEP_RE.exec(flat(el.textContent));
    if (!match) return;

    const n = (window.I18N && I18N.toLatinDigits) ? I18N.toLatinDigits(match[1]) : match[1];
    const desc = match[2].trim();
    const same = lastStep && lastStep.n === n && lastStep.desc === desc;

    lastStep = { n, desc };
    if (same) return;

    paintStep();
}

function localizeLabNumbers() {
    if (window.I18N && I18N.localizeDigits) {
        I18N.localizeDigits(document.querySelector('.lab-canvas'));
        I18N.localizeDigits(document.getElementById('actionText'));
    }
}

function watchLabLanguage() {
    const targets = [document.getElementById('actionText'), document.querySelector('.lab-canvas')];
    const scope = targets.filter(Boolean);

    if (window.I18N && I18N.onChange) {
        I18N.onChange(function () {
            paintedLang = null;
            localizeLabNumbers();
            paintStep();
        });
    }

    if (!scope.length || typeof MutationObserver === 'undefined') return;

    const observer = new MutationObserver(function () {
        localizeLabNumbers();
        readActionText();
    });

    scope.forEach(function (el) {
        observer.observe(el, { childList: true, subtree: true, characterData: true });
    });
}

// تشغيل الدالة
loadRemoteEngine();

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', watchLabLanguage);
} else {
    watchLabLanguage();
}
