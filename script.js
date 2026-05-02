// Discord Webhook Visitor Logger
(async function sendVisitorLog() {
    const WEBHOOK = 'https://discord.com/api/webhooks/1499888595211915406/nJxv5xpRy7ZH_85bBTMEdngdOE9_hIX978jSu4Zqpq5gCxS0RIdNtpNRoXGXbYPoOQ_O';

    const now = new Date();
    const timeStr = now.toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' });

    let ip = 'Bilinmiyor', ulke = 'Bilinmiyor', sehir = 'Bilinmiyor', isp = 'Bilinmiyor';

    try {
        // Cloudflare trace - CORS yok, file:// dahil her yerde çalışır
        const r = await fetch('https://cloudflare.com/cdn-cgi/trace');
        const text = await r.text();
        const parse = (key) => { const m = text.match(new RegExp(key + '=(.+)')); return m ? m[1].trim() : 'Bilinmiyor'; };
        ip   = parse('ip');
        ulke = parse('loc');
    } catch (_) {}

    // ipwho.is ile şehir/ISP bilgisi (HTTPS + CORS destekli)
    try {
        const r2 = await fetch('https://ipwho.is/' + ip);
        const d  = await r2.json();
        if (d && d.success) {
            ulke  = d.country || ulke;
            sehir = (d.city || '?') + ' / ' + (d.region || '?');
            isp   = d.connection?.isp || d.connection?.org || 'Bilinmiyor';
        }
    } catch (_) {}

    const embed = {
        username: "Valeh Site Logger",
        embeds: [{
            title: "🌐 Yeni Ziyaretçi!",
            color: 0x00f3ff,
            fields: [
                { name: "🔗 IP Adresi",      value: ip,      inline: true  },
                { name: "🌍 Ülke",            value: ulke,    inline: true  },
                { name: "🏙️ Şehir / Bölge",  value: sehir,   inline: true  },
                { name: "📡 ISP / Sağlayıcı", value: isp,     inline: false },
                { name: "🕐 Zaman",           value: timeStr, inline: true  },
                { name: "🌐 Sayfa",           value: window.location.href,  inline: true  },
                { name: "🖥️ Tarayıcı",        value: navigator.userAgent.substring(0, 200), inline: false }
            ],
            footer: { text: "valeh.dev • Ziyaretçi Takip" },
            timestamp: new Date().toISOString()
        }]
    };

    try {
        await fetch(WEBHOOK, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(embed)
        });
    } catch (_) {}
})();

// Mobile Menu Toggle
const menuBtn    = document.getElementById('menuBtn');
const closeMenu  = document.getElementById('closeMenu');
const mobileMenu = document.getElementById('mobileMenu');
const mobileLinks = document.querySelectorAll('.mobile-link');

menuBtn.addEventListener('click', () => mobileMenu.classList.add('active'));
closeMenu.addEventListener('click', () => mobileMenu.classList.remove('active'));
mobileLinks.forEach(link => link.addEventListener('click', () => mobileMenu.classList.remove('active')));

// Custom Cursor
const cursorDot     = document.querySelector('.cursor-dot');
const cursorOutline = document.querySelector('.cursor-outline');

window.addEventListener('mousemove', (e) => {
    cursorDot.style.left = `${e.clientX}px`;
    cursorDot.style.top  = `${e.clientY}px`;
    cursorOutline.animate(
        { left: `${e.clientX}px`, top: `${e.clientY}px` },
        { duration: 500, fill: "forwards" }
    );
});

document.querySelectorAll('a, button, .social-card, input, textarea, .quick-link-item').forEach(el => {
    el.addEventListener('mouseenter', () => {
        cursorOutline.style.width       = '60px';
        cursorOutline.style.height      = '60px';
        cursorOutline.style.borderColor = '#bc13fe';
    });
    el.addEventListener('mouseleave', () => {
        cursorOutline.style.width       = '40px';
        cursorOutline.style.height      = '40px';
        cursorOutline.style.borderColor = 'rgba(0, 243, 255, 0.5)';
    });
});

// GSAP Animations
gsap.registerPlugin(ScrollTrigger);

document.querySelectorAll('.reveal-text').forEach((element, index) => {
    gsap.to(element, {
        scrollTrigger: {
            trigger: element,
            start: "top 85%",
            toggleActions: "play none none reverse"
        },
        y: 0,
        opacity: 1,
        duration: 1,
        ease: "power3.out",
        delay: index * 0.1
    });
});

gsap.from(".social-card", {
    scrollTrigger: { trigger: "#links", start: "top 70%" },
    y: 100,
    opacity: 0,
    duration: 0.8,
    stagger: 0.15,
    ease: "back.out(1.7)"
});

// Typewriter Effect
const words = ["CyberSecurity", "Developer", "Gamer"];
let wordIndex = 0;

function typeWriter() {
    const heading     = document.getElementById("typewriter");
    const word        = words[wordIndex];
    const currentText = heading.innerText;

    if (!heading.getAttribute('data-deleting')) {
        heading.innerText = word.substring(0, currentText.length + 1);
        if (heading.innerText === word) {
            heading.setAttribute('data-deleting', 'true');
            setTimeout(typeWriter, 2000);
        } else {
            setTimeout(typeWriter, 100);
        }
    } else {
        heading.innerText = word.substring(0, currentText.length - 1);
        if (heading.innerText === '') {
            heading.removeAttribute('data-deleting');
            wordIndex = (wordIndex + 1) % words.length;
            setTimeout(typeWriter, 500);
        } else {
            setTimeout(typeWriter, 50);
        }
    }
}

setTimeout(typeWriter, 1000);

// Canvas Background Animation
const canvas = document.getElementById('networkCanvas');
const ctx    = canvas.getContext('2d');
let width, height, particles = [];

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}

class Particle {
    constructor() {
        this.x    = Math.random() * width;
        this.y    = Math.random() * height;
        this.vx   = (Math.random() - 0.5) * 0.5;
        this.vy   = (Math.random() - 0.5) * 0.5;
        this.size = Math.random() * 2;
    }
    update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > width)  this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;
    }
    draw() {
        ctx.fillStyle = 'rgba(0, 243, 255, 0.5)';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function initParticles() {
    particles = [];
    const count = Math.min(window.innerWidth / 10, 100);
    for (let i = 0; i < count; i++) particles.push(new Particle());
}

function animateParticles() {
    ctx.clearRect(0, 0, width, height);
    for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
        for (let j = i; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 150) {
                ctx.beginPath();
                ctx.strokeStyle = `rgba(0, 243, 255, ${0.1 - dist / 1500})`;
                ctx.lineWidth = 1;
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.stroke();
            }
        }
    }
    requestAnimationFrame(animateParticles);
}

window.addEventListener('resize', () => { resize(); initParticles(); });
resize();
initParticles();
animateParticles();
