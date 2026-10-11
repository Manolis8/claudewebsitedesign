/* Haven: one consistent breeze from top to bottom.
   Every motion uses long, soft ease-outs (expo/power3.out), 0.8–1.4s. Nothing snaps. */
(() => {
  const root = document.documentElement;
  if (!window.gsap || !window.ScrollTrigger || !window.SplitText) {
    root.classList.remove('js');
    return;
  }

  gsap.registerPlugin(ScrollTrigger, SplitText);

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const clamp = gsap.utils.clamp;

  gsap.defaults({ ease: 'expo.out', duration: 1.2 });

  const nav = $('.nav');
  const edges = $('.edges');
  const cursor = $('.cursor');

  /* ── Smooth scroll ─────────────────────────────────────────── */
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ duration: 1.3, easing: (t) => 1 - Math.pow(1 - t, 4), smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      const target = id === '#top' ? 0 : $(id);
      if (target === null) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(target, { duration: 1.8 });
      else window.scrollTo({ top: target === 0 ? 0 : target.getBoundingClientRect().top + window.scrollY });
      if (target !== 0) {
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
      }
    });
  });

  /* ── Reduced motion: simple fades, still posters, nothing else ── */
  if (reduce) {
    gsap.set('.hero__eyebrow, .hero__sub, .hero__ctas, .hero__foot, .nav, .hero__poster', { opacity: 1, filter: 'none' });
    $$('.h2, .h3, .body, .card, .stage, .quote__text, .footer__title, .statement__text').forEach((el) => {
      gsap.from(el, { opacity: 0, duration: 0.6, ease: 'power1.out', scrollTrigger: { trigger: el, start: 'top 92%', once: true } });
    });
    return;
  }

  /* ── Lazy ambient videos (load near viewport, pause when away) ── */
  const loadVideo = (v) => {
    if (v.dataset.loaded) return;
    v.dataset.loaded = '1';
    [['webm', 'video/webm'], ['mp4', 'video/mp4']].forEach(([k, type]) => {
      if (!v.dataset[k]) return;
      const s = document.createElement('source');
      s.src = v.dataset[k];
      s.type = type;
      v.appendChild(s);
    });
    v.load();
  };
  const io = new IntersectionObserver((entries) => {
    entries.forEach(({ target: v, isIntersecting }) => {
      if (isIntersecting) {
        if (v.classList.contains('lazy-video')) loadVideo(v);
        v.play().catch(() => {});
      } else v.pause();
    });
  }, { rootMargin: '400px 0px' });
  $$('video').forEach((v) => io.observe(v));

  /* ── Split-text headline reveals (masked, staggered words) ──── */
  const revealWords = (el, delay = 0) =>
    SplitText.create(el, {
      type: 'lines,words', mask: 'lines', wordsClass: 'word', autoSplit: true,
      onSplit: (self) =>
        gsap.from(self.words, {
          yPercent: 115, duration: 1.35, stagger: 0.06, delay,
          scrollTrigger: { trigger: el, start: 'top 86%', once: true },
        }),
    });

  /* ── Hero intro ────────────────────────────────────────────── */
  const heroIntro = () => {
    const split = SplitText.create('.split-hero', { type: 'lines,words', mask: 'lines', wordsClass: 'word' });
    const tl = gsap.timeline();
    tl.to('.hero__video, .hero__poster', { opacity: 1, filter: 'blur(0px)', duration: 2.6, ease: 'power2.out' }, 0)
      .fromTo('.hero__video, .hero__poster', { scale: 1.08 }, { scale: 1, duration: 3.2, ease: 'power3.out' }, 0)
      .from(split.words, { yPercent: 115, duration: 1.5, stagger: 0.09 }, 0.45)
      .fromTo('.hero__eyebrow', { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 1.2 }, 0.3)
      .fromTo('.hero__sub', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 1.3 }, 0.95)
      .fromTo('.hero__ctas', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 1.3 }, 1.1)
      .fromTo('.nav', { opacity: 0, y: -24 }, { opacity: 1, y: 0, duration: 1.3 }, 1.0)
      .fromTo('.hero__foot', { opacity: 0 }, { opacity: 1, duration: 1.4, ease: 'power2.out' }, 1.4);
  };

  /* Walking into the field: video scales and drifts as the hero scrolls away */
  gsap.timeline({ scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } })
    .to('.hero__media', { scale: 1.18, yPercent: 12, ease: 'none' }, 0)
    .to('.hero__content', { yPercent: -22, opacity: 0, ease: 'none' }, 0)
    .to('.hero__note, .hero__scroll', { opacity: 0, ease: 'none', duration: 0.35 }, 0);

  /* ── Organic grass-line image reveals ──────────────────────── */
  // The top edge of the clip is a row of grass blades that rises through the frame.
  const blades = (p, n, amp, seed) => {
    const y = (1 - p) * (100 + amp * 2) - amp;
    const pts = ['0% 100%', '100% 100%'];
    for (let i = n; i >= 0; i--) {
      const x = (i / n) * 100;
      pts.push(`${x}% ${y + amp}%`);
      if (i > 0) {
        const tipX = x - 50 / n + Math.sin(i * 2.3 + seed) * (18 / n);
        const tipY = y - amp * (0.35 + 0.65 * Math.abs(Math.sin(i * 1.7 + seed)));
        pts.push(`${tipX}% ${tipY}%`);
      }
    }
    return `polygon(${pts.join(',')})`;
  };
  const grassReveal = (fig, triggerOpts) => {
    const img = $('img, video', fig);
    const seed = Math.random() * 10;
    const n = fig.offsetWidth > 500 ? 18 : 12;
    const state = { p: 0 };
    fig.style.clipPath = blades(0, n, 9, seed);
    const tl = gsap.timeline({ scrollTrigger: { ...triggerOpts, once: true } });
    tl.to(state, {
      p: 1, duration: 1.9, ease: 'power3.out',
      onUpdate: () => (fig.style.clipPath = blades(state.p, n, 9, seed)),
      onComplete: () => (fig.style.clipPath = 'none'),
    }, 0).fromTo(img, { scale: 1.28 }, { scale: 1, duration: 2.4, ease: 'expo.out' }, 0);
  };

  /* ── Pinned "design grows" story (desktop) ─────────────────── */
  const mm = gsap.matchMedia();
  mm.add('(min-width: 901px)', () => {
    const track = $('.grow__track');
    const stem = $('.grow__stem path');
    const current = $('.grow__current');
    const dist = () => Math.max(0, track.scrollWidth - window.innerWidth);
    const len = stem.getTotalLength();
    gsap.set(stem, { strokeDasharray: len, strokeDashoffset: len });

    const st = { trigger: '.grow', start: 'top top', end: () => '+=' + dist() * 1.1, scrub: 1, invalidateOnRefresh: true };
    const move = gsap.to(track, {
      x: () => -dist(), ease: 'none',
      scrollTrigger: {
        ...st, pin: true, anticipatePin: 1,
        onToggle: ({ isActive }) => edges.classList.toggle('is-quiet', isActive),
        onUpdate: (self) => { current.textContent = '0' + clamp(1, 4, 1 + Math.floor(self.progress * 4.4)); },
      },
    });
    gsap.to(stem, { strokeDashoffset: 0, ease: 'none', scrollTrigger: { ...st } });

    $$('.reveal-x').forEach((fig) => grassReveal(fig, { trigger: fig, containerAnimation: move, start: 'left 88%' }));
    $$('.stage__copy').forEach((c) => gsap.fromTo(c, { x: 40 }, { x: -20, ease: 'none', scrollTrigger: { trigger: c, containerAnimation: move, start: 'left right', end: 'right left', scrub: true } }));
  });
  mm.add('(max-width: 900px)', () => {
    $$('.reveal-x').forEach((fig) => grassReveal(fig, { trigger: fig, start: 'top 85%' }));
  });

  /* ── Background colour follows the time of day ─────────────── */
  const bgSections = $$('[data-bg]');
  bgSections.forEach((sec, i) => {
    if (!i) return;
    gsap.fromTo(document.body,
      { backgroundColor: bgSections[i - 1].dataset.bg },
      { backgroundColor: sec.dataset.bg, ease: 'none', immediateRender: false,
        scrollTrigger: { trigger: sec, start: 'top 85%', end: 'top 25%', scrub: true } });
  });

  /* Dark mode for chrome while dusk is on screen */
  ScrollTrigger.create({
    trigger: '.footer', start: 'top 55%', end: 'bottom top',
    onToggle: ({ isActive }) => [nav, edges, cursor].forEach((n) => n && n.classList.toggle('is-dark', isActive)),
  });

  /* Active nav item */
  const navLinks = $$('.nav__pill a');
  navLinks.forEach((link) => {
    const sec = $(link.getAttribute('href'));
    if (!sec) return;
    ScrollTrigger.create({
      trigger: sec, start: 'top 50%', end: 'bottom 50%',
      onToggle: ({ isActive }) => isActive && navLinks.forEach((l) => l.classList.toggle('is-active', l === link)),
    });
  });

  $$('.reveal').forEach((fig) => {
    grassReveal(fig, { trigger: fig, start: 'top 84%' });
    // parallax inside the frame
    gsap.fromTo($('.reveal__inner', fig), { yPercent: -7 }, {
      yPercent: 7, ease: 'none',
      scrollTrigger: { trigger: fig, start: 'top bottom', end: 'bottom top', scrub: true },
    });
  });

  /* ── Statement: words fill in like light reaching the field ── */
  $$('.fill').forEach((el) => {
    const split = SplitText.create(el, { type: 'words', wordsClass: 'word' });
    gsap.to(split.words, {
      opacity: 1, stagger: 0.12, ease: 'none',
      scrollTrigger: { trigger: el, start: 'top 82%', end: 'bottom 48%', scrub: true },
    });
  });
  gsap.to('.statement__figure .reveal__inner', {
    y: -60, ease: 'none',
    scrollTrigger: { trigger: '.statement', start: 'top bottom', end: 'bottom top', scrub: true },
  });

  /* ── Small fade-ups ───────────────────────────────────────── */
  $$('.fade-up, .stage__copy, .quote__by, .footer__content .btn, .features__head .eyebrow').forEach((el) => {
    gsap.from(el, { y: 28, opacity: 0, duration: 1.3, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 90%', once: true } });
  });

  /* ── Bento cards rise in a soft stagger ───────────────────── */
  gsap.from('.card', {
    y: 70, opacity: 0, duration: 1.4, stagger: 0.1,
    scrollTrigger: { trigger: '.bento', start: 'top 82%', once: true },
  });

  /* ── Edge botanicals: draw with scroll, sway on idle, bend from the cursor ── */
  const stems = $$('.edge .stem');
  const allPaths = $$('.edge path');
  allPaths.forEach((p, i) => {
    const l = p.getTotalLength();
    gsap.set(p, { strokeDasharray: l, strokeDashoffset: l });
    const inPuff = !!p.closest('.puff');
    const isBranch = p.previousElementSibling && p.previousElementSibling.tagName === 'path';
    const startF = inPuff ? 0.34 : isBranch ? 0.14 + (i % 5) * 0.025 : (i % 4) * 0.035;
    const endF = startF + (inPuff ? 0.12 : 0.3);
    gsap.to(p, {
      strokeDashoffset: 0, ease: 'none',
      scrollTrigger: {
        trigger: document.body,
        start: () => ScrollTrigger.maxScroll(window) * startF + ' top',
        end: () => ScrollTrigger.maxScroll(window) * endF + ' top',
        scrub: 1.2, invalidateOnRefresh: true,
      },
    });
  });

  const bends = stems.map((s) => {
    const origin = s.dataset.base;
    gsap.to(s, {
      rotation: gsap.utils.random(1.2, 2.4) * (Math.random() > 0.5 ? 1 : -1), svgOrigin: origin,
      duration: gsap.utils.random(4, 7), ease: 'sine.inOut', yoyo: true, repeat: -1, delay: Math.random() * -6,
    });
    const g = $('.bend', s);
    gsap.set(g, { svgOrigin: origin });
    return { s, side: s.closest('.edge--left') ? 'left' : 'right', to: gsap.quickTo(g, 'rotation', { duration: 1.4, ease: 'power3.out' }) };
  });

  // Drifting seed fluff, sparse and slow
  const seedsBox = $('.seeds');
  const fluffSVG = '<svg viewBox="0 0 18 24"><path d="M9 24 V9"/><path d="M9 9 L9 1"/><path d="M9 9 L3 3"/><path d="M9 9 L15 3"/><path d="M9 9 L1 8"/><path d="M9 9 L17 8"/></svg>';
  const spawnFluff = (i) => {
    const el = document.createElement('div');
    el.className = 'seed-fluff';
    el.innerHTML = fluffSVG;
    seedsBox.appendChild(el);
    const right = i !== 3;
    const drift = () => {
      const x0 = right ? window.innerWidth - gsap.utils.random(24, 120) : gsap.utils.random(20, 100);
      const dur = gsap.utils.random(18, 28);
      gsap.set(el, { x: x0, y: -40, rotation: gsap.utils.random(-30, 30), opacity: 0 });
      const tl = gsap.timeline({ onComplete: drift, delay: gsap.utils.random(0, 6) });
      tl.to(el, { y: window.innerHeight + 40, duration: dur, ease: 'none' }, 0)
        .to(el, { x: x0 + (right ? -1 : 1) * gsap.utils.random(20, 60), duration: dur / 3, ease: 'sine.inOut', yoyo: true, repeat: 2 }, 0)
        .to(el, { rotation: '+=' + gsap.utils.random(40, 90), duration: dur, ease: 'none' }, 0)
        .to(el, { opacity: 1, duration: 3, ease: 'power1.out' }, 0)
        .to(el, { opacity: 0, duration: 3, ease: 'power1.in' }, dur - 3);
    };
    gsap.delayedCall(i * 5 + 1.5, drift);
  };
  if (window.innerWidth > 900) [0, 1, 2, 3].forEach(spawnFluff);

  /* ── Cursor + magnetic buttons ─────────────────────────────── */
  if (finePointer) {
    root.classList.add('has-cursor');
    const dot = $('.cursor__dot');
    const ring = $('.cursor__ring');
    const dx = gsap.quickSetter(dot, 'x', 'px'), dy = gsap.quickSetter(dot, 'y', 'px');
    const rx = gsap.quickTo(ring, 'x', { duration: 0.6, ease: 'power3.out' });
    const ry = gsap.quickTo(ring, 'y', { duration: 0.6, ease: 'power3.out' });

    window.addEventListener('pointermove', (e) => {
      cursor.classList.add('is-on');
      dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY);
      // stems lean away from the cursor, falling off with distance
      const w = window.innerWidth;
      bends.forEach(({ side, to }) => {
        const d = side === 'left' ? e.clientX : w - e.clientX;
        const reach = 240;
        const strength = d < reach ? Math.pow(1 - d / reach, 1.6) : 0;
        const yFactor = clamp(0.25, 1, e.clientY / window.innerHeight);
        to((side === 'left' ? -1 : 1) * 7 * strength * yFactor);
      });
    }, { passive: true });

    $$('a, button').forEach((el) => {
      el.addEventListener('pointerenter', () => cursor.classList.add('is-hover'));
      el.addEventListener('pointerleave', () => cursor.classList.remove('is-hover'));
    });

    $$('.magnetic').forEach((el) => {
      const mx = gsap.quickTo(el, 'x', { duration: 1, ease: 'power3.out' });
      const my = gsap.quickTo(el, 'y', { duration: 1, ease: 'power3.out' });
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        mx((e.clientX - (r.left + r.width / 2)) * 0.3);
        my((e.clientY - (r.top + r.height / 2)) * 0.35);
      });
      el.addEventListener('pointerleave', () => { mx(0); my(0); });
    });
  }

  /* ── Footer links ripple like a breeze over grass ──────────── */
  $$('.ripple').forEach((a) => {
    const text = a.textContent;
    a.setAttribute('aria-label', text);
    a.innerHTML = [...text].map((c) => `<span class="char" aria-hidden="true">${c === ' ' ? '&nbsp;' : c}</span>`).join('');
    const chars = $$('.char', a);
    a.addEventListener('pointerenter', () => {
      gsap.fromTo(chars, { y: 0 }, { y: -7, duration: 0.42, ease: 'sine.out', yoyo: true, repeat: 1, stagger: 0.035, overwrite: true });
    });
  });

  /* ── Boot once fonts are ready (split text needs final metrics) ── */
  document.fonts.ready.then(() => {
    heroIntro();
    $$('.split').forEach((el) => revealWords(el));
    ScrollTrigger.sort();
    ScrollTrigger.refresh();
  });
  window.addEventListener('load', () => ScrollTrigger.refresh());
})();
