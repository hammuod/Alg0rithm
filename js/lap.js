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
        console.warn("تعذر الاتصال بالسيرفر، جاري استخدام المحرك المحلي...", err);
        
        // Fallback: تحميل الملف المحلي إذا حدث خطأ أو عند عدم توفر الإنترنت
        const fallbackScript = document.createElement('script');
        fallbackScript.src = './lap.js';
        document.head.appendChild(fallbackScript);
    }
}

// دالة كتابة النصوص داخل الـ DOM بأمان لحماية الموقع
function safeUpdateActionText(containerElement, stepNumber, descriptionText) {
    if (!containerElement) return;

    containerElement.replaceChildren();

    const stepSpan = document.createElement('span');
    stepSpan.className = 'step-word';
    stepSpan.textContent = `Step ${stepNumber}: `;

    const textNode = document.createTextNode(descriptionText);

    containerElement.appendChild(stepSpan);
    containerElement.appendChild(textNode);
}

// تشغيل الدالة
loadRemoteEngine();