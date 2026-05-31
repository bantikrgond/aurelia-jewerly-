// ==========================================
// AURELIA ANIMATION ENGINE
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
  initPageLoader();
  initScrollReveal();
  initFloatingParticles();
  initScrollToTop();
  initCursorTrail();
  initSectionTitleReveal();
  initNavActiveHighlight();
});

// ==========================================
// PAGE LOADER
// ==========================================
function initPageLoader() {
  // Build and inject loader
  const loader = document.createElement('div');
  loader.className = 'page-loader';
  loader.id = 'pageLoader';
  loader.innerHTML = `
    <div class="loader-ring"></div>
    <div class="loader-text">AURELIA.</div>
  `;
  document.body.prepend(loader);

  // Fade out after assets load
  const dismiss = () => {
    loader.classList.add('done');
    setTimeout(() => loader.remove(), 700);
  };

  if (document.readyState === 'complete') {
    setTimeout(dismiss, 600);
  } else {
    window.addEventListener('load', () => setTimeout(dismiss, 600));
  }
}

// ==========================================
// SCROLL REVEAL (IntersectionObserver)
// ==========================================
function initScrollReveal() {
  // Add reveal classes to key elements
  const selectors = [
    { sel: '.section-title',       cls: 'reveal' },
    { sel: '.category-card',       cls: 'reveal-scale' },
    { sel: '.product-card',        cls: 'reveal' },
    { sel: '.review-card',         cls: 'reveal' },
    { sel: '.trust-card',          cls: 'reveal-scale' },
    { sel: '.google-rating',       cls: 'reveal' },
    { sel: '.footer-col',          cls: 'reveal' },
  ];

  selectors.forEach(({ sel, cls }) => {
    document.querySelectorAll(sel).forEach((el, i) => {
      // Only add if not already tagged
      if (!el.classList.contains('reveal') && !el.classList.contains('reveal-scale') &&
          !el.classList.contains('reveal-left') && !el.classList.contains('reveal-right')) {
        el.classList.add(cls);
      }
    });
  });

  // Observe everything that needs revealing
  const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        io.unobserve(entry.target); // fire only once
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  revealEls.forEach(el => io.observe(el));
}

// ==========================================
// SECTION TITLE UNDERLINE REVEAL
// ==========================================
function initSectionTitleReveal() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.3 });

  document.querySelectorAll('.section-title').forEach(el => io.observe(el));
}

// ==========================================
// FLOATING GOLD PARTICLES (Hero Section)
// ==========================================
function initFloatingParticles() {
  const hero = document.querySelector('.hero');
  if (!hero) return;

  // Create container
  let container = hero.querySelector('.hero-particles');
  if (!container) {
    container = document.createElement('div');
    container.className = 'hero-particles';
    hero.appendChild(container);
  }

  const count = 18;
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = Math.random() * 6 + 2; // 2-8px
    const left  = Math.random() * 100;
    const dur   = (Math.random() * 8 + 6).toFixed(1);  // 6-14s
    const delay = (Math.random() * 8).toFixed(1);       // 0-8s
    const bottom = Math.random() * 20;                  // start position

    p.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      left: ${left}%;
      bottom: ${bottom}%;
      --dur: ${dur}s;
      --delay: -${delay}s;
      opacity: 0;
    `;
    container.appendChild(p);
  }
}

// ==========================================
// SCROLL-TO-TOP BUTTON
// ==========================================
function initScrollToTop() {
  const btn = document.createElement('button');
  btn.className = 'scroll-top-btn';
  btn.id = 'scrollTopBtn';
  btn.setAttribute('aria-label', 'Scroll to top');
  btn.innerHTML = '<i class="fa-solid fa-chevron-up"></i>';
  document.body.appendChild(btn);

  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ==========================================
// SUBTLE CURSOR TRAIL (Gold Sparkle)
// ==========================================
function initCursorTrail() {
  // Only on desktop
  if (window.innerWidth < 1024) return;

  let lastX = 0, lastY = 0;
  const throttle = 80; // ms between sparks
  let lastTime = 0;

  document.addEventListener('mousemove', (e) => {
    const now = Date.now();
    if (now - lastTime < throttle) return;
    lastTime = now;

    const spark = document.createElement('div');
    spark.style.cssText = `
      position: fixed;
      left: ${e.clientX}px;
      top: ${e.clientY}px;
      width: 6px; height: 6px;
      border-radius: 50%;
      background: rgba(197,160,89,0.7);
      pointer-events: none;
      z-index: 99998;
      transform: translate(-50%,-50%) scale(1);
      animation: sparkFade 0.8s ease forwards;
    `;
    document.body.appendChild(spark);
    setTimeout(() => spark.remove(), 800);
  });

  // Inject sparkFade keyframes once
  if (!document.getElementById('sparkFadeStyle')) {
    const style = document.createElement('style');
    style.id = 'sparkFadeStyle';
    style.textContent = `
      @keyframes sparkFade {
        0%   { transform: translate(-50%,-50%) scale(1); opacity: 1; }
        100% { transform: translate(-50%,-50%) scale(0); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }
}

// ==========================================
// NAV ACTIVE LINK HIGHLIGHT ON SCROLL
// ==========================================
function initNavActiveHighlight() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link[data-scroll]');
  if (!sections.length || !navLinks.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(link => link.classList.remove('active'));
        const activeLink = document.querySelector(`.nav-link[data-scroll="${entry.target.id}"]`);
        if (activeLink) activeLink.classList.add('active');
      }
    });
  }, { threshold: 0.35 });

  sections.forEach(sec => io.observe(sec));
}
