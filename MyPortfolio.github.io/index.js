/* =========================================
   REMOVE SPLINE WATERMARK
   ========================================= */
(function () {
  function killLogo() {
    const viewer = document.querySelector('spline-viewer');
    if (!viewer) return;
    const root = viewer.shadowRoot;
    if (!root) return;
    const logo = root.querySelector('#logo');
    if (logo) { logo.remove(); return; }
    // fallback: hide any anchor/img inside shadow root
    root.querySelectorAll('a, img').forEach(el => el.style.display = 'none');
  }
  // Try immediately and keep observing until found
  const iv = setInterval(() => {
    killLogo();
    const viewer = document.querySelector('spline-viewer');
    if (viewer && viewer.shadowRoot && viewer.shadowRoot.querySelector('#logo') === null) {
      clearInterval(iv);
    }
  }, 300);
  setTimeout(() => clearInterval(iv), 10000);
})();

/* =========================================
   SPLINE INTRO → SCROLL TRANSITION
   ========================================= */
(function () {
  gsap.registerPlugin(ScrollTrigger);

  const intro = document.getElementById('spline-intro');
  if (!intro) return;

  // Brain fades + shrinks while user scrolls through the trigger spacer.
  // Portfolio sits at its natural document position — no translateY needed.
  gsap.to(intro, {
    opacity: 0,
    scale:   0.9,
    ease:    'none',
    scrollTrigger: {
      trigger:  '#spline-trigger',
      start:    'top top',
      end:      'bottom top',
      scrub:    1,
      // Never use display:none — it kills the WebGL context
      // opacity + pointer-events are enough
      onLeave()     { gsap.set(intro, { pointerEvents: 'none' }); },
      onEnterBack() { gsap.set(intro, { pointerEvents: 'none' }); },
    },
  });

  // Scroll hint fades immediately
  gsap.to('.spline-intro__hint', {
    opacity: 0,
    ease:    'none',
    scrollTrigger: {
      trigger: '#spline-trigger',
      start:   'top top',
      end:     '8% top',
      scrub:   true,
    },
  });
})();

/* =========================================
   ABSTRACT BACKGROUND LINES (canvas)
   ========================================= */
(function () {
  const canvas = document.getElementById('bg-canvas');
  const ctx    = canvas.getContext('2d');
  let W, H, t = 0;

  // Each line: baseline position, wave params, visual style
  const DEFS = [
    { yFrac: 0.08, amp: 0.09, freq: 1.2, phase: 0.0,  spd: 0.55, op: 0.055, w: 1   },
    { yFrac: 0.18, amp: 0.06, freq: 0.7, phase: 1.1,  spd: 0.35, op: 0.030, w: 0.8 },
    { yFrac: 0.28, amp: 0.12, freq: 1.5, phase: 2.3,  spd: 0.70, op: 0.050, w: 1   },
    { yFrac: 0.38, amp: 0.07, freq: 0.9, phase: 0.8,  spd: 0.40, op: 0.025, w: 0.7 },
    { yFrac: 0.47, amp: 0.10, freq: 1.8, phase: 3.1,  spd: 0.60, op: 0.060, w: 1.2 },
    { yFrac: 0.55, amp: 0.05, freq: 0.6, phase: 1.7,  spd: 0.30, op: 0.022, w: 0.7 },
    { yFrac: 0.63, amp: 0.11, freq: 1.3, phase: 0.4,  spd: 0.65, op: 0.045, w: 1   },
    { yFrac: 0.72, amp: 0.08, freq: 2.0, phase: 2.6,  spd: 0.50, op: 0.035, w: 0.8 },
    { yFrac: 0.80, amp: 0.13, freq: 0.8, phase: 1.4,  spd: 0.45, op: 0.055, w: 1   },
    { yFrac: 0.89, amp: 0.06, freq: 1.6, phase: 3.8,  spd: 0.38, op: 0.028, w: 0.7 },
    { yFrac: 0.96, amp: 0.09, freq: 1.1, phase: 0.6,  spd: 0.58, op: 0.042, w: 1   },
  ];

  function smoothCurve(pts) {
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 0; i < pts.length - 1; i++) {
      const prev = pts[i - 1] || pts[i];
      const curr = pts[i];
      const next = pts[i + 1];
      const after = pts[i + 2] || next;
      const cp1x = curr.x + (next.x - prev.x) / 6;
      const cp1y = curr.y + (next.y - prev.y) / 6;
      const cp2x = next.x - (after.x - curr.x) / 6;
      const cp2y = next.y - (after.y - curr.y) / 6;
      ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, next.x, next.y);
    }
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    const SEG = 14;
    DEFS.forEach(d => {
      const pts = [];
      for (let i = 0; i <= SEG; i++) {
        const x = (i / SEG) * W;
        const base = d.yFrac * H;
        const w1 = Math.sin(i * d.freq + t * d.spd + d.phase) * d.amp * H;
        const w2 = Math.cos(i * d.freq * 0.45 + t * d.spd * 0.6 + d.phase * 1.4) * d.amp * 0.45 * H;
        pts.push({ x, y: base + w1 + w2 });
      }
      smoothCurve(pts);
      ctx.strokeStyle = `rgba(210,255,0,${d.op})`;
      ctx.lineWidth   = d.w;
      ctx.stroke();
    });
  }

  function tick() { t += 0.004; draw(); requestAnimationFrame(tick); }

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  window.addEventListener('resize', resize);
  resize();
  tick();
})();

/* =========================================
   LENIS SMOOTH SCROLL
   ========================================= */
// eslint-disable-next-line no-undef
const lenis = new window.Lenis({
  duration:    1.3,
  easing:      t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
});

// Connect Lenis ↔ GSAP ScrollTrigger so scroll-up works correctly
lenis.on('scroll', () => ScrollTrigger.update());
gsap.ticker.add(t => lenis.raf(t * 1000));
gsap.ticker.lagSmoothing(0);

/* =========================================
   CUSTOM CURSOR
   ========================================= */
(function () {
  const dot      = document.getElementById('cursor');
  const follower = document.getElementById('cursor-follower');
  if (!dot || !follower) return;

  let mx = -200, my = -200;

  // Dot snaps instantly
  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    gsap.set(dot, { x: mx, y: my });
  });

  // Follower lerps with GSAP ticker — much smoother than rAF lerp
  gsap.ticker.add(() => {
    gsap.to(follower, {
      x: mx, y: my,
      duration: 0.55,
      ease: 'power3.out',
      overwrite: 'auto',
    });
  });

  // Hover expand
  const hoverEls = 'a, button, .btn, .project-card, .skill-card, .contact__link';
  document.querySelectorAll(hoverEls).forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });

  // Click flash
  document.addEventListener('mousedown', () => document.body.classList.add('cursor-click'));
  document.addEventListener('mouseup',   () => document.body.classList.remove('cursor-click'));

  // Hide when leaving window
  document.addEventListener('mouseleave', () => gsap.to([dot, follower], { opacity: 0, duration: 0.3 }));
  document.addEventListener('mouseenter', () => gsap.to([dot, follower], { opacity: 1, duration: 0.3 }));
})();

/* =========================================
   PRELOADER
   ========================================= */
(function () {
  const loader = document.getElementById('preloader');
  const bar    = loader.querySelector('.preloader__bar');
  let progress = 0;

  const fill = setInterval(() => {
    progress += Math.random() * 18;
    if (progress >= 100) { progress = 100; clearInterval(fill); }
    bar.style.width = progress + '%';
  }, 60);

  window.addEventListener('load', () => {
    setTimeout(() => {
      gsap.to(loader, {
        yPercent: -100,
        duration: 0.9,
        ease: 'power3.inOut',
        onComplete: () => { loader.style.display = 'none'; introAnim(); }
      });
    }, 200);
  });
})();

/* =========================================
   INTRO ANIMATION (hero)
   ========================================= */
function introAnim() {
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  // Nav
  tl.from('.nav', { y: -60, opacity: 0, duration: 0.8 });

  // Hero split lines (each .split-line > span slides up)
  tl.to('.hero__title .split-line > span', {
    y: 0,
    duration: 1,
    stagger: 0.12,
    ease: 'power3.out',
  }, '-=0.4');

  // Eyebrow + desc + cta
  tl.to('.hero [data-anim="fade-up"]', {
    y: 0,
    opacity: 1,
    duration: 0.9,
    stagger: 0.1,
    ease: 'power3.out',
  }, '-=0.5');

  // Hero number
  tl.to('.hero__number', { opacity: 1, duration: 0.6 }, '-=0.3');
}

/* =========================================
   SCROLL ANIMATIONS (GSAP + ScrollTrigger)
   ========================================= */
gsap.registerPlugin(ScrollTrigger);

// Helper: split text into word spans for blur-reveal
function splitWords(el) {
  const text  = el.innerText;
  const words = text.split(' ');
  el.innerHTML = words.map(w =>
    `<span class="word-wrap"><span class="word">${w}</span></span>`
  ).join(' ');
  return el.querySelectorAll('.word');
}

document.querySelectorAll('[data-anim="split"]').forEach(el => {
  const words = splitWords(el);
  ScrollTrigger.create({
    trigger: el,
    start: 'top 88%',
    onEnter: () => {
      gsap.to(words, {
        y: 0,
        filter: 'blur(0px)',
        opacity: 1,
        duration: 0.9,
        stagger: 0.06,
        ease: 'power3.out',
      });
    },
    once: true,
  });
});

document.querySelectorAll('[data-anim="fade-up"]:not(.hero *)').forEach((el, i) => {
  gsap.set(el, { y: 40, opacity: 0 });
  ScrollTrigger.create({
    trigger: el,
    start: 'top 90%',
    onEnter: () => {
      gsap.to(el, {
        y: 0,
        opacity: 1,
        duration: 0.85,
        delay: i * 0.02,
        ease: 'power3.out',
      });
    },
    once: true,
  });
});

// Project cards — stagger per section
ScrollTrigger.batch('.project-card', {
  start: 'top 90%',
  onEnter: batch => gsap.to(batch, {
    y: 0,
    opacity: 1,
    duration: 0.8,
    stagger: 0.1,
    ease: 'power3.out',
  }),
  once: true,
});
gsap.set('.project-card', { y: 50, opacity: 0 });

// Skill cards
ScrollTrigger.batch('.skill-card', {
  start: 'top 90%',
  onEnter: batch => gsap.to(batch, {
    y: 0,
    opacity: 1,
    duration: 0.8,
    stagger: 0.12,
    ease: 'power3.out',
  }),
  once: true,
});
gsap.set('.skill-card', { y: 50, opacity: 0 });

// Stats
ScrollTrigger.batch('.stat', {
  start: 'top 90%',
  onEnter: batch => gsap.to(batch, {
    y: 0,
    opacity: 1,
    duration: 0.7,
    stagger: 0.1,
    ease: 'power3.out',
  }),
  once: true,
});
gsap.set('.stat', { y: 40, opacity: 0 });

/* =========================================
   PROJECT PREVIEW ON HOVER  (premium)
   ========================================= */
(function () {
  const preview = document.getElementById('project-preview');
  const img     = document.getElementById('project-preview-img');
  if (!preview || !img) return;

  // Offset so preview floats above-right of cursor
  const OX = 28, OY = -180;

  // gsap.quickTo — purpose-built for smooth cursor following, no rAF conflict
  const moveX = gsap.quickTo(preview, 'x', { duration: 0.65, ease: 'power3.out' });
  const moveY = gsap.quickTo(preview, 'y', { duration: 0.65, ease: 'power3.out' });

  // Start off-screen
  gsap.set(preview, { x: -999, y: -999, xPercent: 0, yPercent: 0,
                       scale: 0.85, opacity: 0,
                       clipPath: 'inset(100% 0 0 0)', rotateZ: -2 });

  document.addEventListener('mousemove', e => {
    moveX(e.clientX + OX);
    moveY(e.clientY + OY);
  });

  function toScreenshot(url) {
    if (url.startsWith('http')) {
      return 'https://s0.wordpress.com/mshots/v1/' + encodeURIComponent(url) + '?w=600&h=400';
    }
    return url;
  }

  document.querySelectorAll('.project-card[data-preview]').forEach(card => {

    card.addEventListener('mouseenter', e => {
      // Snap to current cursor before animating in (no lag on entry)
      gsap.set(preview, { x: e.clientX + OX, y: e.clientY + OY });

      const src = toScreenshot(card.getAttribute('data-preview'));
      if (img.dataset.src !== src) {
        img.dataset.src = src;
        gsap.to(img, {
          opacity: 0, duration: 0.15, onComplete: () => {
            img.src = src;
            img.onload = () => gsap.to(img, { opacity: 1, duration: 0.3 });
          }
        });
      }

      gsap.killTweensOf(preview);
      gsap.to(preview, {
        opacity:  1,
        scale:    1,
        clipPath: 'inset(0% 0 0% 0)',
        rotateZ:  -1.5,
        duration: 0.6,
        ease:     'expo.out',
      });
    });

    card.addEventListener('mouseleave', () => {
      gsap.killTweensOf(preview);
      gsap.to(preview, {
        opacity:  0,
        scale:    0.88,
        clipPath: 'inset(0% 0 100% 0)',
        rotateZ:  1,
        duration: 0.45,
        ease:     'expo.in',
      });
    });

    // 3D tilt follows cursor inside the card
    card.addEventListener('mousemove', e => {
      const r    = card.getBoundingClientRect();
      const relX = (e.clientX - r.left)  / r.width  - 0.5;  // -0.5 … 0.5
      const relY = (e.clientY - r.top)   / r.height - 0.5;
      gsap.to(preview, {
        rotateZ: -1.5 + relX * 8,
        rotateX: relY * -6,
        duration: 0.5,
        ease: 'power2.out',
      });
    });
  });
})();

/* =========================================
   HAMBURGER MENU
   ========================================= */
(function () {
  const nav    = document.querySelector('.nav');
  const burger = document.querySelector('.nav__burger');
  const drawer = document.querySelector('.nav__drawer');
  if (!burger || !drawer) return;

  function toggle() {
    const open = drawer.classList.toggle('open');
    nav.classList.toggle('open', open);
    lenis[open ? 'stop' : 'start']();
  }

  burger.addEventListener('click', toggle);
  drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    drawer.classList.remove('open');
    nav.classList.remove('open');
    lenis.start();
  }));
})();

/* =========================================
   PROJECT CARDS — FULL CARD CLICKABLE
   ========================================= */
(function () {
  document.querySelectorAll('.project-card[data-href]').forEach(card => {
    card.style.cursor = 'pointer';
    card.addEventListener('click', e => {
      // Don't double-fire if the ↗ link itself was clicked
      if (e.target.closest('.project-card__link')) return;
      window.open(card.dataset.href, '_blank', 'noopener');
    });
  });
})();

/* =========================================
   LANGUAGE TOGGLE — TEXT SCRAMBLE
   ========================================= */
(function () {
  let lang = 'pt';
  const btn  = document.getElementById('lang-toggle');
  const flag = btn && btn.querySelector('.lang-flag');
  const code = btn && btn.querySelector('.lang-code');
  if (!btn) return;

  const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&';

  // Scramble a single element's text to target, resolving left→right
  function scramble(el, target, delay = 0) {
    // Skip elements with HTML children (contact__title handled separately)
    if (el.classList.contains('contact__title')) {
      setTimeout(() => {
        const parts = target.split('|');
        el.innerHTML = parts.map((p, i) =>
          i === 1 ? `<span class="accent">${p}</span>` : p
        ).join('<br/>');
      }, delay);
      return;
    }

    const len      = Math.max(el.textContent.length, target.length);
    const duration = 600;           // total ms for this element
    const interval = 30;            // frame every 30ms
    const frames   = duration / interval;
    let   frame    = 0;

    setTimeout(() => {
      const timer = setInterval(() => {
        frame++;
        const progress = frame / frames;            // 0 → 1
        const resolved = Math.floor(progress * len); // chars locked in so far

        let display = '';
        for (let i = 0; i < len; i++) {
          if (i < resolved) {
            display += target[i] || '';
          } else if (i < target.length) {
            display += CHARS[Math.floor(Math.random() * CHARS.length)];
          }
        }

        el.textContent = display;

        if (frame >= frames) {
          clearInterval(timer);
          el.textContent = target;
        }
      }, interval);
    }, delay);
  }

  function switchLang(l) {
    flag.textContent = l === 'pt' ? '🇧🇷' : '🇺🇸';
    code.textContent = l === 'pt' ? 'PT' : 'EN';
    document.documentElement.lang = l === 'pt' ? 'pt-BR' : 'en';

    const els = [...document.querySelectorAll('[data-pt][data-en]')];
    els.forEach((el, i) => {
      const target = el.getAttribute('data-' + l);
      if (target) scramble(el, target, i * 55); // stagger 55ms between elements
    });
  }

  // Button spin animation on click
  btn.addEventListener('click', () => {
    lang = lang === 'pt' ? 'en' : 'pt';

    gsap.fromTo(btn,
      { rotateY: 0 },
      { rotateY: 360, duration: 0.5, ease: 'power2.inOut',
        onComplete: () => gsap.set(btn, { rotateY: 0 }) }
    );

    switchLang(lang);
  });
})();

/* =========================================
   NAV ACTIVE LINK
   ========================================= */
(function () {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav__links a');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(link => {
          link.style.color = link.getAttribute('href') === `#${id}` ? 'var(--lime)' : '';
        });
      }
    });
  }, { threshold: 0.5 });
  sections.forEach(s => observer.observe(s));
})();
