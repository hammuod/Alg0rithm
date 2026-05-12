
const btn = document.getElementById('dark-mode-toggle');

if(localStorage.getItem("theme") == "dark"){
    document.body.classList.add("dark-mode")
}else{
    document.body.classList.remove("dark-mode")
};

btn.onclick = () => {
    document.body.classList.toggle('dark-mode');

    localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
};

(function() {
    const header = document.getElementById('header');
    let lastScrollY = window.scrollY;
    let scrollTimeout;
    const SCROLL_THRESHOLD = 10;
    const HIDE_DELAY = 800; // ms to hide after scroll stops

    function updateHeader() {
        const currentScrollY = window.scrollY;
        const scrollDelta = currentScrollY - lastScrollY;

        clearTimeout(scrollTimeout);

        if (Math.abs(scrollDelta) < SCROLL_THRESHOLD) {
            lastScrollY = currentScrollY;
            return;
        }

        if (scrollDelta > 0) {
            // Scrolling down → hide
            header.classList.add('header--hidden');
        } else {
            // Scrolling up → show
            header.classList.remove('header--hidden');
            scrollTimeout = setTimeout(() => {
                header.classList.add('header--hidden'); // Hide when scroll stops
            }, HIDE_DELAY);
        }

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

    // Show header at top of page
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
    const section = document.querySelector(this.getAttribute('href'));
    section.scrollIntoView({ behavior: 'smooth' });
    history.pushState(null, '', window.location.pathname);
  });
});


(function() {
  emailjs.init("hsg7cNO1yXmdYkde7"); 
})();
document.addEventListener("DOMContentLoaded", function() {
  const form = document.getElementById("contact-form");
  const statusText = document.getElementById("status");

  form.addEventListener("submit", function(event) {
    event.preventDefault(); 
    
    // Reset classes
    statusText.className = "status";
    statusText.textContent = "Sending...";

    emailjs.sendForm("service_1tsrqgc", "template_p7c8n6s", this)
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
            curtain.style.zIndex = "-1";
            localStorage.setItem('transitioning', null);
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