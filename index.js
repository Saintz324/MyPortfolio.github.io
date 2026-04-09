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
      scrub:    0.4,
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

  let rafId, lastFrame = 0;
  const TARGET_FPS = 30, FRAME_MS = 1000 / TARGET_FPS;

  function tick(now) {
    rafId = requestAnimationFrame(tick);
    if (now - lastFrame < FRAME_MS) return;
    lastFrame = now;
    t += 0.008;
    draw();
  }

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelAnimationFrame(rafId);
    else { lastFrame = 0; rafId = requestAnimationFrame(tick); }
  });

  // Pause canvas while Spline intro is active (it covers the canvas anyway)
  const splineIntro = document.getElementById('spline-intro');
  if (splineIntro) {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) cancelAnimationFrame(rafId);
      else { lastFrame = 0; rafId = requestAnimationFrame(tick); }
    }, { threshold: 0.1 });
    obs.observe(splineIntro);
  }

  window.addEventListener('resize', resize);
  resize();
  rafId = requestAnimationFrame(tick);
})();

/* =========================================
   SCROLL — native (fastest, GPU-composited)
   ========================================= */
gsap.ticker.lagSmoothing(0);
window.addEventListener('scroll', () => ScrollTrigger.update(), { passive: true });

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
    followX(mx);
    followY(my);
  });

  // Follower uses quickTo — one tween instance, no allocation per frame
  const followX = gsap.quickTo(follower, 'x', { duration: 0.55, ease: 'power3.out' });
  const followY = gsap.quickTo(follower, 'y', { duration: 0.55, ease: 'power3.out' });

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
    document.body.style.overflow = open ? 'hidden' : '';
  }

  burger.addEventListener('click', toggle);
  drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    drawer.classList.remove('open');
    nav.classList.remove('open');
    document.body.style.overflow = '';
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
   SCROLL ORB — brain + circular progress
   ========================================= */
(function () {
  const CIRC = 2 * Math.PI * 33; // r=33 → ≈207.3

  const orb = document.createElement('div');
  orb.id = 'scroll-orb';
  orb.innerHTML = `
    <svg class="scroll-orb__ring" viewBox="0 0 72 72" aria-hidden="true">
      <circle cx="36" cy="36" r="33" fill="none" stroke="rgba(210,255,0,0.1)" stroke-width="1.5"/>
      <circle cx="36" cy="36" r="33" fill="none" stroke="#d2ff00" stroke-width="1.5"
              stroke-linecap="round"
              stroke-dasharray="${CIRC.toFixed(2)}"
              stroke-dashoffset="${CIRC.toFixed(2)}"
              transform="rotate(-90 36 36)"
              id="scroll-orb-arc"/>
    </svg>
    <svg class="scroll-orb__brain" viewBox="0 0 100 90" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <!-- Left hemisphere -->
      <path d="M48 78C33 78 17 68 13 53C9 38 16 22 30 16C37 12 43 13 48 18Z"
            stroke="currentColor" stroke-width="3" stroke-linejoin="round"/>
      <!-- Right hemisphere -->
      <path d="M52 78C67 78 83 68 87 53C91 38 84 22 70 16C63 12 57 13 52 18Z"
            stroke="currentColor" stroke-width="3" stroke-linejoin="round"/>
      <!-- Center fissure -->
      <line x1="50" y1="17" x2="50" y2="78" stroke="currentColor" stroke-width="1.5" opacity="0.6"/>
      <!-- Brain stem -->
      <path d="M41 78C40 84 42 88 46 88H54C58 88 60 84 59 78"
            stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
      <!-- Left folds -->
      <path d="M17 46C24 39 35 40 37 49" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
      <path d="M22 63C28 57 37 59 39 67" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M28 26C35 22 43 27 43 36" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <!-- Right folds -->
      <path d="M83 46C76 39 65 40 63 49" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
      <path d="M78 63C72 57 63 59 61 67" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M72 26C65 22 57 27 57 36" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    </svg>
  `;
  document.body.appendChild(orb);

  const arc = orb.querySelector('#scroll-orb-arc');

  window.addEventListener('scroll', () => {
    const pct = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
    arc.style.strokeDashoffset = CIRC * (1 - pct);
    orb.classList.toggle('visible', window.scrollY > 80);
  }, { passive: true });
})();

/* =========================================
   NAV — COMPACT ON SCROLL
   ========================================= */
(function () {
  const nav = document.querySelector('.nav');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });
})();

/* =========================================
   MAGNETIC BUTTONS
   ========================================= */
(function () {
  document.querySelectorAll('.btn').forEach(el => {
    el.addEventListener('mousemove', e => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width  / 2) * 0.28;
      const y = (e.clientY - r.top  - r.height / 2) * 0.28;
      gsap.to(el, { x, y, duration: 0.35, ease: 'power2.out' });
    });
    el.addEventListener('mouseleave', () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1, 0.4)' });
    });
  });
})();

/* =========================================
   STAT COUNT-UP
   ========================================= */
(function () {
  document.querySelectorAll('.stat__number').forEach(el => {
    const raw    = el.textContent.trim();
    const num    = parseFloat(raw);
    const suffix = raw.replace(/[\d.]/g, '');
    const obj    = { val: 0 };
    el.textContent = '0' + suffix;
    ScrollTrigger.create({
      trigger: el,
      start: 'top 88%',
      once: true,
      onEnter: () => {
        gsap.to(obj, {
          val: num, duration: 1.8, ease: 'power2.out',
          onUpdate() { el.textContent = Math.ceil(obj.val) + suffix; },
        });
      },
    });
  });
})();

/* =========================================
   HERO PARALLAX
   ========================================= */
(function () {
  gsap.to('.hero__content', {
    yPercent: 18,
    ease: 'none',
    scrollTrigger: {
      trigger: '.hero',
      start: 'top top',
      end: 'bottom top',
      scrub: true,
    },
  });
})();

/* =========================================
   MARQUEE STRIP (injected after hero)
   ========================================= */
(function () {
  const items = ['REACT', 'NEXT.JS', 'NODE.JS', 'TYPESCRIPT', 'POSTGRESQL', 'DOCKER', 'UI / UX', 'REST API', 'LINUX', 'JAVA'];
  const html  = [...items, ...items]
    .map(t => `<span>${t}</span><span class="marquee__dot">·</span>`)
    .join('');
  const strip = document.createElement('div');
  strip.className = 'marquee';
  strip.setAttribute('aria-hidden', 'true');
  strip.innerHTML = `<div class="marquee__inner">${html}</div>`;
  const hero = document.getElementById('hero');
  if (hero) hero.after(strip);
})();

/* =========================================
   PROJECT TITLE SCRAMBLE ON HOVER
   ========================================= */
(function () {
  const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  document.querySelectorAll('.project-card__body h3').forEach(el => {
    const original = el.textContent;
    let running = false;
    el.closest('.project-card').addEventListener('mouseenter', () => {
      if (running) return;
      running = true;
      let frame = 0;
      const total = 12;
      const iv = setInterval(() => {
        el.textContent = original.split('').map((ch, i) => {
          if (ch === ' ') return ' ';
          return frame / total > i / original.length
            ? original[i]
            : CHARS[Math.floor(Math.random() * CHARS.length)];
        }).join('');
        if (++frame > total) {
          clearInterval(iv);
          el.textContent = original;
          running = false;
        }
      }, 35);
    });
  });
})();

/* =========================================
   FOOTER LIVE CLOCK
   ========================================= */
(function () {
  const footer = document.querySelector('.footer');
  if (!footer) return;
  const clock = document.createElement('span');
  clock.id = 'footer-clock';
  footer.appendChild(clock);
  function tick() {
    clock.textContent = new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }
  tick();
  setInterval(tick, 1000);
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
