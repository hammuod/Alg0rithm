const btn = document.getElementById('dark-mode-toggle');

if (btn) {
    if (localStorage.getItem("theme") === "dark") {
        document.body.classList.add("dark-mode");
    } else {
        document.body.classList.remove("dark-mode");
    }

    btn.onclick = () => {
        document.body.classList.toggle('dark-mode');
        localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
    };
}

(function() {
    const header = document.getElementById('header');
    let lastScrollY = window.scrollY;
    let scrollTimeout;
    const SCROLL_THRESHOLD = 10;
    const HIDE_DELAY = 5000;

    function updateHeader() {
        const currentScrollY = window.scrollY;
        const scrollDelta = currentScrollY - lastScrollY;

        clearTimeout(scrollTimeout);

        if (Math.abs(scrollDelta) < SCROLL_THRESHOLD) {
            lastScrollY = currentScrollY;
            return;
        }

        header.classList.remove('header--hidden');
        scrollTimeout = setTimeout(() => {
            header.classList.add('header--hidden');
        }, HIDE_DELAY);

        lastScrollY = currentScrollY;
    }

    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                updateHeader();
                ticking = false;
            });
            ticking = true;
        }
    });

    if (window.scrollY < 50) {
        header.classList.remove('header--hidden');
    }
})();

const navLinks = document.querySelectorAll('nav ul li a');

navLinks.forEach(link => {
    link.addEventListener('click', function() {
        navLinks.forEach(l => l.classList.remove('active'));
        this.classList.add('active');
    });
});

document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', function(e) {
    e.preventDefault();
    const selector = this.getAttribute('href');
    const section = document.querySelector(selector);
    if (!section) return;
    section.scrollIntoView({ behavior: 'smooth' });
    history.pushState(null, '', selector);
  });
});

const EMAILJS_CONFIG = {
  serviceId: "service_1tsrqgc",
  templateId: "template_p7c8n6s"
};

(function() {
  // ملاحظة أمان: مفتاح EmailJS العام يُكشف عمدًا في الكود الأمامي (وهو مصمم لذلك).
  // فعّل خيار "Spam Protection" في لوحة تحكم EmailJS، وانقل هذه القيم إلى إعدادات
  // الخادم/متغيرات البيئة إذا أضفت أي Backend مستقبلًا.
  emailjs.init("hsg7cNO1yXmdYkde7");
})();

document.addEventListener("DOMContentLoaded", function() {
  const form = document.getElementById("contact-form");
  const statusText = document.getElementById("status");

  form.addEventListener("submit", function(event) {
    event.preventDefault(); 
    
    statusText.className = "status";
    statusText.textContent = "Sending...";

    emailjs.sendForm(EMAILJS_CONFIG.serviceId, EMAILJS_CONFIG.templateId, this)
      .then(function() {
        statusText.className = "status status--success";
        statusText.textContent = "Message sent successfully!";
        form.reset();
      }, function(error) {
        statusText.className = "status status--error";
        statusText.textContent = "Failed to send message. Please try again.";
        console.error('Error:', error);
      });
  });
});

// --- معالجة الستارة عند تحميل الصفحة (Transition In) ---
const currentPath = window.location.pathname;

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

// --- استخدام Event Delegation لضمان عمل الانتقال على كل الروابط ---
document.addEventListener('click', e => {
    const link = e.target.closest('a'); // البحث عن أقرب وسم رابط للعنصر المنقور
    if (!link) return;
    
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