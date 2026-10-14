/* COMMIT
   The big animation (canvas): the T's pixels rain down, snap into a phone that follows the page,
   then fly back up to rebuild the T in the finale. Scroll-driven.
   Timer loops (own clock, paused off-screen): the dissolving T, the badges, upvote bursts,
   the FOLLOW burst, the orbiting cards, the countdown. */
(() => {
  gsap.registerPlugin(ScrollTrigger);

  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const FINE = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const root = document.documentElement;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const NS = 'http://www.w3.org/2000/svg';
  const RAMP = ['#111111', '#0D1E4C', '#092C88', '#0439C3', '#0047FF'];
  const C = { bg: '#EDEDEB', card: '#F6F6F4', ink: '#111111', grey: '#5A5A5A', empty: '#DCDCD9', blue: '#0047FF', bar: '#B9B9B5' };
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  function rng(seed) {
    return () => {
      seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const isPhone = () => innerWidth < 900;
  const INLINE = RM || isPhone();          // phones in each section instead of the fixed phone
  if (!INLINE) root.classList.add('has-phone');

  /* ───────── pixel icons (7 × 7 blocks) ───────── */
  const ICONS = {
    star:   ['...#...', '...#...', '#######', '.#####.', '..###..', '.##.##.', '##...##'],
    heart:  ['.##.##.', '#######', '#######', '#######', '.#####.', '..###..', '...#...'],
    fork:   ['#.....#', '#.....#', '.#...#.', '..#.#..', '...#...', '...#...', '...#...'],
    cmt:    ['#######', '#.....#', '#.....#', '#.....#', '#######', '.#.....', '#......'],
    cursor: ['#......', '##.....', '###....', '####...', '#####..', '..##...', '...##..'],
  };
  const icon = name => '<svg class="ico" viewBox="0 0 7 7" aria-hidden="true">' +
    ICONS[name].flatMap((row, y) => [...row].map((c, x) => (c === '#' ? `<rect x="${x}" y="${y}" width="1" height="1"/>` : ''))).join('') + '</svg>';
  const fillIcons = (ctx = document) => $$('i[data-ico]', ctx).forEach(i => { i.outerHTML = icon(i.dataset.ico); });

  /* ───────── covers: pixel art + code windows ───────── */
  function pixelCover(seed, cols = 8, rows = 8) {
    const r = rng(seed);
    let s = `<svg viewBox="0 0 ${cols} ${rows}" aria-hidden="true">`;
    for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
      const v = r();
      const fill = v < .14 ? C.empty : RAMP[Math.min(4, Math.floor(((v - .14) / .86) * 5.2))];
      s += `<rect x="${x}" y="${y}" width="1.02" height="1.02" fill="${fill}"/>`;
    }
    return s + '</svg>';
  }
  function codeCover(seed) {
    const r = rng(seed);
    let s = '<svg viewBox="0 0 160 90" preserveAspectRatio="none" aria-hidden="true"><rect width="160" height="9" fill="#262626"/>';
    [RAMP[2], RAMP[3], C.blue].forEach((f, i) => { s += `<rect x="${5 + i * 7}" y="3" width="4" height="3" fill="${f}"/>`; });
    for (let i = 0; i < 9; i++) {
      let x = 8 + Math.floor(r() * 4) * 6;
      const y = 15 + i * 8;
      const segs = 2 + Math.floor(r() * 3);
      for (let k = 0; k < segs && x < 150; k++) {
        const w = 8 + Math.floor(r() * 24);
        s += `<rect x="${x}" y="${y}" width="${Math.min(w, 152 - x)}" height="3" fill="${r() < .22 ? C.blue : C.grey}"/>`;
        x += w + 4;
      }
    }
    return s + '</svg>';
  }
  const fillCovers = (ctx = document) => $$('.cover--code[data-code]', ctx).forEach(c => { c.innerHTML = codeCover(+c.dataset.code); });

  /* ───────── the block wordmark ───────── */
  const L = {
    C: ['#######', '#######', '##.....', '##.....', '##.....', '##.....', '##.....', '##.....', '##.....', '#######', '#######'],
    O: ['#######', '#######', '##...##', '##...##', '##...##', '##...##', '##...##', '##...##', '##...##', '#######', '#######'],
    M: ['##########', '##########', '##..##..##', '##..##..##', '##..##..##', '##..##..##', '##..##..##', '##..##..##', '##..##..##', '##..##..##', '##..##..##'],
    I: Array(11).fill('##'),
    T: ['########', '########', '...##...', '...##...', '...##...', '...##...', '...##...', '...##...', '...##...', '...##...', '...##...'],
  };
  /* builds the word as SVG rects in block units; the T (if present) dissolves into 2 × 2 sub-blocks */
  function buildWord(host, word, seed) {
    host.innerHTML = '';
    const r = rng(seed);
    const b = BLOCK;
    let x0 = 0;
    const blocks = [], subs = [];
    const svg = document.createElementNS(NS, 'svg');
    const g = document.createElementNS(NS, 'g');
    svg.appendChild(g);
    [...word].forEach((ch, li) => {
      const rows = L[ch], w = rows[0].length;
      if (ch === 'T') {
        rows.forEach((row, y) => [...row].forEach((c, x) => {
          if (c !== '#') return;
          for (let sy = 0; sy < 2; sy++) for (let sx = 0; sx < 2; sx++) {
            const subcol = x * 2 + sx;                          // 0..15 across the T
            const edge = subcol > 6 || y < 1;
            if (edge && r() < .16 + subcol / 120) continue;       // missing blocks, more to the right
            let ux = x0 + x + sx * .5, uy = y + sy * .5;
            if (edge && r() < .14) { r() < .5 ? (ux += .5) : (uy -= .5); }   // nudged half a block
            const step = clamp(Math.floor(subcol / 16 * 5 + (r() - .5) * 1.4), 0, 4);
            subs.push({ ux, uy, color: RAMP[step], edge: subcol > 8 });
          }
        }));
        for (let k = 0; k < 11; k++) {                            // loose blocks drifting off to the right
          subs.push({ ux: x0 + 8 + Math.floor(r() * 9) * .5, uy: Math.floor(r() * 9) * .5, color: RAMP[3 + Math.floor(r() * 2)], edge: true, loose: true });
        }
      } else {
        rows.forEach((row, y) => [...row].forEach((c, x) => { if (c === '#') blocks.push({ ux: x0 + x, uy: y, li }); }));
      }
      x0 += w + 1;
    });
    const W = x0 - 1;
    svg.setAttribute('viewBox', `0 0 ${W} 11`);
    svg.setAttribute('width', W * b);
    svg.setAttribute('height', 11 * b);
    blocks.forEach(o => {
      const rc = document.createElementNS(NS, 'rect');
      rc.setAttribute('x', o.ux); rc.setAttribute('y', o.uy); rc.setAttribute('width', 1.01); rc.setAttribute('height', 1.01);
      rc.setAttribute('fill', C.ink);
      g.appendChild(rc); o.el = rc;
    });
    const tg = document.createElementNS(NS, 'g');
    svg.appendChild(tg);
    subs.forEach(o => {
      const rc = document.createElementNS(NS, 'rect');
      rc.setAttribute('x', o.ux + .03); rc.setAttribute('y', o.uy + .03); rc.setAttribute('width', .44); rc.setAttribute('height', .44);
      rc.setAttribute('fill', o.color);
      tg.appendChild(rc); o.el = rc;
    });
    host.appendChild(svg);
    return { svg, blocks, subs, tg, W };
  }

  /* ───────── sizes ───────── */
  let BLOCK = 19, PIX = 9;
  function sizes() {
    const W = innerWidth;
    BLOCK = isPhone() ? Math.max(5, Math.floor((W - 32) / 49)) : Math.max(10, Math.floor(W * .64 / 49));
    PIX = Math.round(BLOCK / 2);
    root.style.setProperty('--b', BLOCK + 'px');
    root.style.setProperty('--wmw', BLOCK * 49 + 'px');
    const ph = Math.min(680, Math.floor(innerHeight * .76 / PIX) * PIX);
    const pw = Math.round(ph / 2 / PIX) * PIX;
    root.style.setProperty('--ph', ph + 'px');
    root.style.setProperty('--pw', pw + 'px');
    root.style.setProperty('--pb', PIX + 'px');
    return { ph, pw };
  }

  /* ───────── data ───────── */
  const PROJECTS = [
    { name: 'TINYDB', pitch: 'A SMALL EMBEDDED DATABASE IN RUST.', maker: '@ANNA-K', votes: 482, gain: 46, seed: 11 },
    { name: 'PIXELSHADER', pitch: 'DITHERING EFFECTS THAT RUN ON THE GPU.', maker: '@MAYA-R', votes: 391, gain: 210, seed: 12 },
    { name: 'FLOWCHART-CLI', pitch: 'TURN A TEXT FILE INTO A DIAGRAM.', maker: '@LEO', votes: 277, gain: 24, seed: 13 },
    { name: 'LINTKIT', pitch: 'A FAST, TINY LINTER FOR CONFIG FILES.', maker: '@OPEN-TOOLS', votes: 198, gain: 30, seed: 14 },
    { name: 'RAYCASTER', pitch: 'A RETRO 3D ENGINE IN 400 LINES.', maker: '@JUNO', votes: 164, gain: 141, seed: 15 },
    { name: 'NOTEBOOK.SH', pitch: 'A NOTES APP THAT LIVES IN YOUR TERMINAL.', maker: '@KAI', votes: 120, gain: 12, seed: 16 },
  ];

  /* ───────── phone screens ───────── */
  const acts = (votes, c, s, f) => `<div class="fpost__acts"><span class="chip">▲ <b class="v">${votes}</b></span><span>${icon('cmt')} ${c}</span><span>${icon('star')} ${s}</span><span>${icon('fork')} ${f}</span><span class="tr">[ TRY IT ]</span></div>`;
  const SCREENS = {
    feed: () => `
      <div class="scr__bar"><span>[■] COMMIT</span><span>FEED · TODAY</span></div>
      <div class="stories">${[21, 22, 23, 24, 25, 26].map((s, i) => `<span class="cover${i < 4 ? ' is-new' : ''}">${pixelCover(s, 5, 5)}</span>`).join('')}</div>
      <p class="dim">SHIPPED TODAY</p>
      <div class="scr__vp"><div class="scr__scroll">
        <article class="fpost fpost--first"><div class="scr__bar"><span>@ANNA-K / TINYDB</span><span>2H</span></div>
          <div class="cover cover--code" data-code="5"></div><p>TINYDB<br><span class="dim">A SMALL EMBEDDED DATABASE IN RUST.</span></p>
          <p class="dim">RUST • DATABASE • OPEN SOURCE</p>${acts(482, 36, '2.4K', 91)}</article>
        <article class="fpost"><div class="scr__bar"><span>@MAYA-R / PIXELSHADER</span><span>5H</span></div>
          <div class="cover">${pixelCover(31, 16, 10)}</div><p>PIXELSHADER<br><span class="dim">DITHERING EFFECTS THAT RUN ON THE GPU.</span></p>${acts(391, 22, '1.1K', 40)}</article>
        <article class="fpost"><div class="scr__bar"><span>@JUNO / RAYCASTER</span><span>7H</span></div>
          <div class="cover">${pixelCover(32, 16, 10)}</div><p>RAYCASTER<br><span class="dim">A RETRO 3D ENGINE IN 400 LINES.</span></p>${acts(164, 9, '10K', 212)}</article>
        <article class="fpost"><div class="scr__bar"><span>@OPEN-TOOLS / LINTKIT</span><span>9H</span></div>
          <div class="cover cover--code" data-code="9"></div><p>LINTKIT<br><span class="dim">A FAST, TINY LINTER FOR CONFIG FILES.</span></p>${acts(198, 14, 870, 33)}</article>
      </div></div>`,
    project: () => `
      <div class="scr__bar"><span>← TINYDB</span><span>@ANNA-K</span></div>
      <div class="cover cover--code" data-code="5"></div>
      <p>A SMALL EMBEDDED DATABASE IN RUST.</p>
      <div class="scr__bar"><span class="btn btn--fill">[ TRY IT ]</span><span class="btn btn--line">[ VIEW CODE ]</span></div>
      <p class="dim">README · 5 CARDS</p>
      <div class="scr__scroll scr__cards">${['01 / WHAT IT IS', '02 / INSTALL', '03 / USAGE', '04 / BENCHMARKS', '05 / ROADMAP'].map(t => `<div class="rcard"><span>${t}</span><i></i><i></i><i></i></div>`).join('')}</div>`,
    follow: () => `
      <div class="scr__bar"><span>[■] COMMIT</span><span>MAKERS</span></div>
      <div class="prof__head"><span class="cover">${pixelCover(41)}</span><p>@MAYA-R<br><span class="dim">SHIPS SHADERS AND TINY TOOLS.</span></p></div>
      <div class="scr__bar"><span class="dim">8 REPOS</span><span class="dim">2,018 FOLLOWERS</span></div>
      <button class="follow btn btn--fill follow--phone" type="button" tabindex="-1"><span class="follow__label">[ FOLLOW ]</span></button>
      <p class="dim">LATEST</p>
      <article class="fpost"><div class="scr__bar"><span>PIXELSHADER</span><span>RELEASE</span></div><p class="dim">V2.0.0 IS OUT. DITHERING NOW RUNS ON THE GPU.</p></article>
      <article class="fpost"><div class="scr__bar"><span>PALETTE-CLI</span><span>COMMIT</span></div><div class="cover">${pixelCover(42, 16, 6)}</div></article>`,
    profile: () => `
      <div class="scr__bar"><span>[■] COMMIT</span><span>PROFILE</span></div>
      <div class="graph"></div>
      <div class="prof__head"><span class="cover">${pixelCover(51)}</span><p>@ANNA-K<br><span class="dim">12 REPOS • 1,204 FOLLOWERS</span></p></div>
      <div class="scr__bar"><span>${icon('star')} 2,431</span><span>${icon('fork')} 91</span><span>312 COMMITS</span></div>
      <p class="dim">PINNED</p>
      <article class="fpost"><div class="scr__bar"><span>TINYDB</span><span>▲ 482</span></div><p class="dim">A SMALL EMBEDDED DATABASE IN RUST.</p></article>
      <article class="fpost"><div class="scr__bar"><span>WAL-LITE</span><span>▲ 96</span></div><p class="dim">A WRITE-AHEAD LOG IN 300 LINES.</p></article>`,
  };
  function graphSVG(seed, cols = 26, rows = 7) {
    const r = rng(seed);
    let s = `<svg viewBox="0 0 ${cols * 5} ${rows * 5}" aria-hidden="true">`;
    for (let x = 0; x < cols; x++) {
      s += `<g class="gcol">`;
      for (let y = 0; y < rows; y++) {
        const v = r();
        const fill = v < .3 ? C.empty : RAMP[Math.min(4, Math.floor((v - .3) / .7 * 5.3))];
        s += `<rect x="${x * 5}" y="${y * 5}" width="4" height="4" fill="${fill}"/>`;
      }
      s += '</g>';
    }
    return s + '</svg>';
  }
  function makeScreen(name) {
    const d = document.createElement('div');
    d.className = 'scr scr--' + name;
    d.innerHTML = SCREENS[name]();
    fillCovers(d);
    const gph = $('.graph', d); if (gph) gph.innerHTML = graphSVG(61, 20, 10);
    return d;
  }

  /* ───────── page furniture ───────── */
  fillIcons();
  fillCovers();
  // README bars
  { const r = rng(7), body = $('.readme__body');
    body.innerHTML = Array.from({ length: 15 }, (_, i) => `<i class="${i % 5 === 0 ? 'h' : ''}" style="width:${i % 5 === 0 ? 30 + r() * 25 : 50 + r() * 50}%"></i>`).join(''); }
  // leaderboard
  const boardList = $('.board__list');
  const rowH = () => (isPhone() ? 72 : 80);
  PROJECTS.forEach((p, i) => {
    const li = document.createElement('li');
    li.className = 'board__row';
    li.innerHTML = `<span class="rank">0${i + 1}</span><span class="cover">${pixelCover(p.seed)}</span><p>${p.name}<br><span class="dim">${p.pitch}</span><br><span class="dim">${p.maker}</span></p><span class="vote">▲<br><span class="n">${p.votes}</span></span>`;
    boardList.appendChild(li);
    p.row = li; p.rank = i;
  });
  function setBoard(prog, animate) {
    const cur = PROJECTS.map(p => ({ p, v: Math.round(p.votes + p.gain * prog) })).sort((a, b) => b.v - a.v);
    cur.forEach(({ p, v }, rank) => {
      $('.n', p.row).textContent = v;
      $('.rank', p.row).textContent = '0' + (rank + 1);
      p.row.classList.toggle('is-top', rank === 0);
      if (rank !== p.rank || !animate) {
        p.rank = rank;
        gsap.to(p.row, { y: rank * rowH(), duration: animate ? .5 : 0, ease: 'steps(5)', overwrite: true });
      }
    });
  }
  boardList.style.height = rowH() * 6 + 'px';
  setBoard(0, false);
  // orbit cards
  const orbit = $('.orbit');
  const ORBS = PROJECTS.map((p, i) => {
    const d = document.createElement('div');
    d.className = 'orb';
    d.innerHTML = `<span class="cover">${pixelCover(70 + i, 12, 6)}</span><span>${p.name}</span><span class="dim">${p.maker}</span>`;
    orbit.appendChild(d);
    return { d, a: (i / 6) * Math.PI * 2, sp: .07, push: { x: 0, y: 0 } };
  });
  // countdown to the daily reset (00:00 UTC)
  const cd = $('.countdown');
  const tickCountdown = () => {
    const now = new Date(), end = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1);
    const s = Math.max(0, Math.floor((end - now) / 1000));
    cd.textContent = [s / 3600, (s % 3600) / 60, s % 60].map(n => String(Math.floor(n)).padStart(2, '0')).join(':');
  };
  tickCountdown(); setInterval(tickCountdown, 1000);

  /* ───────── phones: fixed (desktop) or one per section (phones, reduced motion) ───────── */
  const phone = $('.phone'), phoneScreen = $('.phone__screen'), marker = $('.phone__marker');
  const screens = {};
  if (!INLINE) {
    ['feed', 'project', 'follow', 'profile'].forEach(n => { screens[n] = makeScreen(n); phoneScreen.appendChild(screens[n]); });
  } else {
    phone.remove();
    $$('.phone-slot').forEach((slot, i) => {
      if (slot.closest('#s3')) return;                 // the phone forms in 03 on desktop only
      const p = document.createElement('div');
      p.className = 'phone phone--inline';
      p.innerHTML = '<div class="phone__screen"></div>';
      const sc = makeScreen(slot.dataset.screen);
      $('.phone__screen', p).appendChild(sc);
      slot.appendChild(p);
      screens[slot.dataset.screen + i] = sc;
    });
  }

  /* ───────── text decode: █ ▓ ▒ ░ / # 0 1 → the real words ───────── */
  const GLYPHS = '█▓▒░/#01';
  function decode(el, dur = .6) {
    if (RM || el.dataset.done) return;
    el.dataset.done = 1;
    const final = el.textContent, n = final.length, o = { t: 0 };
    gsap.to(o, { t: 1, duration: dur, ease: 'none', onUpdate() {
      const k = Math.floor(o.t * n);
      el.textContent = final.slice(0, k) + [...final.slice(k)].map(c => (c === ' ' ? ' ' : GLYPHS[(Math.random() * GLYPHS.length) | 0])).join('');
    }, onComplete() { el.textContent = final; } });
  }

  /* ───────── wordmarks ───────── */
  let WH, WC, WM;                        // hero, COM, MIT
  function buildWordmarks() {
    WH = buildWord($('#wmHero'), 'COMMIT', 3);
    WC = buildWord($('#wmCom'), 'COM', 4);
    WM = buildWord($('#wmMit'), 'MIT', 5);
  }

  /* the T keeps dissolving: 3–5 edge blocks drift 1–3 blocks right or up, step through the ramp, vanish, respawn */
  function dissolveLoop(word) {
    const pool = word.subs.filter(s => s.edge);
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 0, paused: true });
    tl.call(() => {
      const n = 3 + Math.floor(Math.random() * 3);
      for (let i = 0; i < n; i++) {
        const s = pool[Math.floor(Math.random() * pool.length)];
        if (!s || s.busy) continue;
        s.busy = true;
        const up = Math.random() < .35, d = (1 + Math.floor(Math.random() * 3)) * .5;
        gsap.timeline({ onComplete: () => { s.busy = false; } })
          .to(s.el, { x: up ? 0 : d, y: up ? -d : 0, duration: .9, ease: `steps(${Math.round(d * 2)})` })
          .to(s.el, { attr: { fill: C.blue }, duration: .3, ease: 'steps(1)' }, '<.2')
          .to(s.el, { opacity: 0, duration: .3, ease: 'steps(1)' })
          .set(s.el, { x: 0, y: 0, attr: { fill: s.color } })
          .to(s.el, { opacity: 1, duration: .2, ease: 'steps(1)' }, '+=.1');
      }
    }).to({}, { duration: 1.8 });
    return tl;
  }

  /* blocks within 120 px of the cursor shift one block away and settle back in 300 ms */
  function cursorPush(word, mx, my) {
    const box = word.svg.getBoundingClientRect();
    if (my < box.top - 140 || my > box.bottom + 140 || mx < box.left - 140 || mx > box.right + 140) {
      word.blocks.forEach(o => { if (o.off) { o.off = false; gsap.to(o.el, { x: 0, y: 0, duration: .3, ease: 'steps(2)', overwrite: true }); } });
      return;
    }
    word.blocks.forEach(o => {
      const cx = box.left + (o.ux + .5) * BLOCK, cy = box.top + (o.uy + .5) * BLOCK;
      const dx = cx - mx, dy = cy - my, near = dx * dx + dy * dy < 120 * 120;
      if (near) {
        const ox = Math.abs(dx) > Math.abs(dy) ? Math.sign(dx) : 0, oy = ox ? 0 : Math.sign(dy) || 1;
        if (o.off !== `${ox},${oy}`) { o.off = `${ox},${oy}`; gsap.to(o.el, { x: ox, y: oy, duration: .1, ease: 'steps(1)', overwrite: true }); }
      } else if (o.off) {
        o.off = false; gsap.to(o.el, { x: 0, y: 0, duration: .3, ease: 'steps(2)', overwrite: true });
      }
    });
  }

  /* ───────── bursts (upvote, follow) ───────── */
  function burst(host, x, y, { n = 14, spread = 60, colors = RAMP.slice(2), size = 10 } = {}) {
    for (let i = 0; i < n; i++) {
      const d = document.createElement('i');
      d.className = 'burst';
      d.style.width = d.style.height = size + 'px';
      d.style.background = colors[i % colors.length];
      host.appendChild(d);
      const a = Math.random() * Math.PI * 2, v = spread * (.4 + Math.random() * .8);
      const snap = q => Math.round(q / size) * size;
      gsap.timeline({ onComplete: () => d.remove() })
        .set(d, { x: snap(x), y: snap(y) })
        .to(d, { x: snap(x + Math.cos(a) * v), y: snap(y + Math.sin(a) * v), duration: .3, ease: 'steps(3)' })
        .to(d, { opacity: 0, duration: .15, ease: 'steps(1)' });
    }
  }
  function followBurst(btn) {
    const r = btn.getBoundingClientRect(), host = btn.offsetParent || btn.parentElement, hr = host.getBoundingClientRect();
    const on = !btn.classList.contains('is-on');
    const cols = r.width / r.height > 3 ? 8 : 4, rowsN = 16 / cols, bw = r.width / cols, bh = r.height / rowsN;
    const tl = gsap.timeline();
    for (let i = 0; i < 16; i++) {                         // the button breaks into 16 blocks …
      const d = document.createElement('i');
      d.className = 'burst';
      Object.assign(d.style, { width: bw + 'px', height: bh + 'px', background: RAMP[(i * 3) % 5] });
      host.appendChild(d);
      const x = r.left - hr.left + (i % cols) * bw, y = r.top - hr.top + Math.floor(i / cols) * bh;
      const a = Math.random() * Math.PI * 2;
      tl.fromTo(d, { x, y }, { x: x + Math.cos(a) * 26, y: y + Math.sin(a) * 18, duration: .2, ease: 'steps(2)' }, 0)
        .to(d, { x, y, duration: .2, ease: 'steps(2)' }, .22)
        .set(d, { opacity: 0, onComplete: () => d.remove() }, .45);
    }
    tl.set(btn, { opacity: 0 }, 0)                         // … and re-forms as FOLLOWING
      .call(() => { btn.classList.toggle('is-on', on); $('.follow__label', btn).textContent = on ? '[ FOLLOWING ]' : '[ FOLLOW ]'; btn.setAttribute('aria-pressed', on); }, null, .3)
      .set(btn, { opacity: 1 }, .42);
    return tl;
  }
  function stamp(btn) {
    const box = $('.stamp__box', btn), n = $('.stamp__n', btn);
    gsap.timeline()
      .fromTo(box, { scale: 1.8, rotation: -14 }, { scale: 1, rotation: 0, duration: .3, ease: 'steps(3)' })
      .call(() => { n.textContent = +n.textContent + 1; }, null, .3);
  }
  function forkDraw(svg) {
    const main = $('.forkline__main', svg), br = $('.forkline__branch', svg);
    [main, br].forEach(p => { const l = p.getTotalLength(); p.style.strokeDasharray = l; p.style.strokeDashoffset = l; });
    gsap.timeline()
      .to(main, { strokeDashoffset: 0, duration: .4, ease: 'power3.out' })
      .to(br, { strokeDashoffset: 0, duration: .4, ease: 'power3.out' }, '-=.05');
  }
  $('.stamp').addEventListener('click', e => stamp(e.currentTarget));
  $('.sec--acts .follow').addEventListener('click', e => followBurst(e.currentTarget));
  $('.forkline').parentElement.addEventListener('mouseenter', e => forkDraw($('.forkline', e.currentTarget)));

  /* ───────── flow diagram lines (03) ───────── */
  function drawFlow() {
    const flow = $('.flow'), svg = $('.flow__lines'), fr = flow.getBoundingClientRect();
    const st = $$('.flow__step', flow).map(s => s.getBoundingClientRect());
    const rel = (r) => ({ l: r.left - fr.left, r: r.right - fr.left, t: r.top - fr.top, b: r.bottom - fr.top, cx: (r.left + r.right) / 2 - fr.left, cy: (r.top + r.bottom) / 2 - fr.top });
    const [a, b, c] = st.map(rel);
    svg.setAttribute('viewBox', `0 0 ${fr.width} ${fr.height}`);
    svg.innerHTML = `<path d="M${a.r} ${a.cy} H${b.cx} V${b.t}"/><path d="M${b.r} ${b.cy} H${c.cx} V${c.t}"/>` +
      `<rect x="${b.cx - 3}" y="${b.t - 6}" width="6" height="6" fill="${C.ink}"/><rect x="${c.cx - 3}" y="${c.t - 6}" width="6" height="6" fill="${C.blue}"/>`;
    $$('path', svg).forEach(p => { const l = p.getTotalLength(); p.style.strokeDasharray = l; p.style.strokeDashoffset = RM ? 0 : l; });
  }

  /* ───────── cursor trail: six grid-snapped squares, collapsing into [ ] on buttons ───────── */
  const trail = $('.trail');
  const SQ = Array.from({ length: 6 }, (_, i) => { const d = document.createElement('i'); d.style.background = RAMP[4 - Math.min(4, i)]; trail.appendChild(d); return { d, x: -40, y: -40 }; });
  let mouse = { x: -200, y: -200, on: false }, hoverEl = null;
  function startTrail() {
    if (!FINE || RM) return;
    const hist = [];
    addEventListener('pointermove', e => { mouse.x = e.clientX; mouse.y = e.clientY; if (!mouse.on) { mouse.on = true; trail.classList.add('is-on'); } }, { passive: true });
    document.addEventListener('pointerleave', () => { mouse.on = false; trail.classList.remove('is-on'); });
    document.addEventListener('pointerover', e => { hoverEl = e.target.closest('a, button'); });
    gsap.ticker.add(() => {
      const now = performance.now();
      hist.push({ t: now, x: Math.round(mouse.x / 12) * 12, y: Math.round(mouse.y / 12) * 12 });
      while (hist.length && now - hist[0].t > 400) hist.shift();
      if (hoverEl) {                                          // bracket frame around the button
        const r = hoverEl.getBoundingClientRect();
        const L = Math.round((r.left - 10) / 4) * 4, R = Math.round((r.right + 6) / 4) * 4, T = r.top, B = r.bottom - 12, M = (T + B) / 2;
        [[L, T], [L, M], [L, B], [R - 8, T], [R - 8, M], [R - 8, B]].forEach(([x, y], i) => gsap.set(SQ[i].d, { x, y, width: i % 3 === 1 ? 4 : 12, height: 12 }));
        return;
      }
      SQ.forEach((s, i) => {
        const target = now - i * 40;                          // each square ~40 ms behind the one in front
        let p = hist[hist.length - 1];
        for (let k = hist.length - 1; k >= 0; k--) { if (hist[k].t <= target) { p = hist[k]; break; } }
        if (p) gsap.set(s.d, { x: p.x - 6, y: p.y - 6, width: 12, height: 12 });
      });
    });
  }

  /* ───────── the big animation ───────── */
  const cv = $('.fx'), cx = cv.getContext('2d');
  let P = [], G = {};                    // particles, geometry
  function docRect(el) { const r = el.getBoundingClientRect(); return { x: r.left + scrollX, y: r.top + scrollY, w: r.width, h: r.height }; }
  function setupFX() {
    const dpr = Math.min(2, devicePixelRatio || 1);
    cv.width = innerWidth * dpr; cv.height = innerHeight * dpr;
    cx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const W = innerWidth, H = innerHeight;
    const top = id => docRect($(id)).y;
    G = { W, H };
    G.A0 = H * .1;
    G.A1 = top('#s2') + H * .1;
    G.B0 = G.A1;
    G.B1 = top('#s3') + H * .15;
    G.D0 = top('#s8') - H * .85;
    G.D1 = Math.min(top('#s8') - H * .05, ScrollTrigger.maxScroll(window) - 4);
    // where the T pixels start (document coords) and where they land in the finale
    const hs = docRect(WH.svg), fs = docRect(WM.svg);
    const fromT = WH.subs.map(s => ({ x: hs.x + s.ux * BLOCK, y: hs.y + s.uy * BLOCK, c: s.color }));
    const toT = WM.subs.map(s => ({ x: fs.x + s.ux * BLOCK, y: fs.y + s.uy * BLOCK, c: s.color }));
    // phone outline + a few screen pixels
    const targets = [];
    if (!INLINE) {
      const pw = phone.offsetWidth, ph = phone.offsetHeight;
      const x0 = W - parseFloat(getComputedStyle(phone).right) - pw, y0 = H / 2 - ph / 2;
      const cols = Math.round(pw / PIX), rows = Math.round(ph / PIX);
      for (let i = 0; i < cols; i++) { targets.push({ x: x0 + i * PIX, y: y0, frame: 1 }); targets.push({ x: x0 + i * PIX, y: y0 + ph - PIX, frame: 1 }); }
      for (let j = 1; j < rows - 1; j++) { targets.push({ x: x0, y: y0 + j * PIX, frame: 1 }); targets.push({ x: x0 + pw - PIX, y: y0 + j * PIX, frame: 1 }); }
      const r = rng(99);
      for (let k = 0; k < 70; k++) targets.push({ x: x0 + PIX * (2 + Math.floor(r() * (cols - 4))), y: y0 + PIX * (2 + Math.floor(r() * (rows * .55))), frame: 0 });
      G.phone = { x0, y0, pw, ph };
    } else {
      for (let k = 0; k < fromT.length; k++) targets.push({ x: (k * 37) % W, y: H + 40, frame: 0 });
    }
    const r = rng(5);
    const tx0 = Math.min(...fromT.map(f => f.x)), tx1 = Math.max(...fromT.map(f => f.x));
    P = targets.map((t, i) => {
      const f = fromT[i % fromT.length], to = toT[(i * 7) % toT.length];
      const across = (f.x - tx0) / Math.max(1, tx1 - tx0);
      return {
        f, to, t,
        dA: clamp((1 - across) * .3 + r() * .2, 0, .45),                 // right-hand blocks let go first
        ex: W * (.06 + r() * .88), ey: H * (.1 + r() * .85),               // where the rain hangs
        dB: clamp((t.y - (G.phone ? G.phone.y0 : 0)) / (G.phone ? G.phone.ph : 1), 0, 1) * .55 + r() * .08,
        dD: r() * .4,
        ph: r() * 6.28, show: i < fromT.length || !INLINE,
      };
    });
  }
  const snap = v => Math.round(v / PIX) * PIX;
  let lastState = '', lastBlur = -1;
  function renderFX(time) {
    const y = scrollY, { W, H } = G;
    cx.clearRect(0, 0, W, H);
    let state = y < G.A0 ? 'top' : y < G.A1 ? 'A' : (!INLINE && y < G.B1) ? 'B' : y < G.D0 ? 'C' : y < G.D1 ? 'D' : 'end';
    if (INLINE && state === 'C' && y < G.B1) state = 'C';
    // visibility of the real wordmarks and the phone
    if (state !== lastState) {
      WH.tg.style.opacity = state === 'top' ? 1 : 0;
      WM.tg.style.opacity = state === 'end' ? 1 : 0;
      lastState = state;
    }
    let phoneA = 0;
    let soft = 0;                                                     // 0 = sharp, 1 = blurred into the background
    const draw = (x, y2, c, a = 1) => { a *= 1 - soft * .35; if (a <= 0 || y2 < -PIX || y2 > H + PIX) return; cx.globalAlpha = a; cx.fillStyle = c; cx.fillRect(snap(x), snap(y2), PIX - 1, PIX - 1); };
    const wob = p => Math.round(Math.sin(time * 1.6 + p.ph)) * PIX;   // hanging pixels twitch one block
    if (state === 'A') {
      const pA = (y - G.A0) / (G.A1 - G.A0);
      soft = clamp(pA * 2.5);                                         // the rain goes soft as soon as it leaves the T
      P.forEach(p => {
        if (!p.show) return;
        const u = clamp((pA - p.dA) / (1 - p.dA));
        const ax = p.f.x - scrollX, ay = p.f.y - y;
        const yy = lerp(ay, p.ey, Math.pow(u, 1.5)) + (u >= 1 ? wob(p) : 0);
        draw(lerp(ax, p.ex, 1 - (1 - u) * (1 - u)), yy, p.f.c, INLINE ? 1 - clamp((u - .7) / .3) : 1);
      });
    } else if (state === 'B') {
      const pB = (y - G.B0) / (G.B1 - G.B0);
      phoneA = clamp((pB - .86) / .12);
      soft = clamp(1 - (pB - .3) / .45);                              // stays soft over 03's text, sharpens as it snaps into the phone
      P.forEach(p => {
        const u = clamp((pB - p.dB) / .32), uq = Math.floor(u * 4) / 4;           // snap in 4 steps, row by row
        const c = uq >= 1 && p.t.frame ? C.ink : p.f.c;
        draw(lerp(p.ex, p.t.x, uq), lerp(p.ey, p.t.y, uq) + (u === 0 ? wob(p) : 0), c, 1 - phoneA);
      });
    } else if (state === 'C') {
      phoneA = INLINE ? 0 : 1;
    } else if (state === 'D') {
      const pD = (y - G.D0) / (G.D1 - G.D0);
      soft = Math.sin(Math.PI * clamp(pD)) * .8;                      // soft in flight, sharp when it lands in the T
      phoneA = INLINE ? 0 : 1 - clamp(pD / .06);
      P.forEach(p => {
        if (!p.show) return;
        const u = clamp((pD - p.dD) / .6), e = u < .5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2, uq = Math.floor(e * 6) / 6;
        const ty = p.to.y - y, tx = p.to.x - scrollX;
        draw(lerp(p.t.x, tx, uq), lerp(p.t.y, ty, uq), uq > .5 ? p.to.c : (p.t.frame ? C.ink : p.f.c), INLINE ? clamp(u * 3) : 1);
      });
    }
    cx.globalAlpha = 1;
    const blur = Math.round(soft * 8) / 2;                            // up to 4 px, in half-pixel steps
    if (blur !== lastBlur) { cv.style.filter = blur ? `blur(${blur}px)` : 'none'; lastBlur = blur; }
    if (!INLINE) {
      phone.style.opacity = phoneA;
      phone.style.visibility = phoneA > 0 ? 'visible' : 'hidden';
    }
  }

  /* which screen the phone shows, and the progress marker on its edge */
  let curScreen = '';
  function showScreen(name) {
    if (INLINE || name === curScreen) return;
    const prev = screens[curScreen], next = screens[name];
    curScreen = name;
    Object.values(screens).forEach(s => { if (s !== prev && s !== next) gsap.set(s, { autoAlpha: 0 }); });
    const rows = Math.ceil(next.offsetHeight / 24) || 24;
    gsap.fromTo(next, { autoAlpha: 1, clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: .5, ease: `steps(${rows})`, overwrite: true,   // pixel wipe, 24 px rows
      onComplete: () => prev && gsap.set(prev, { autoAlpha: 0 }) });
    if (prev) gsap.set(prev, { zIndex: 0 }); gsap.set(next, { zIndex: 1 });
    if (name === 'project') readmeIn();
  }
  function readmeIn() {
    const cards = $$('.rcard', screens.project);
    gsap.fromTo(cards, { x: 40, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: .5, ease: 'steps(4)', stagger: .18, overwrite: true });
  }

  /* ───────── boot ───────── */
  function boot() {
    sizes();
    buildWordmarks();
    drawFlow();

    if (RM) {
      // still: T already dissolved, everything visible, nothing moves
      $$('.board__row').forEach((r, i) => gsap.set(r, { y: i * rowH() }));
      const gph = $('.graph svg'); if (gph) gsap.set($$('.gcol', gph), { opacity: 1 });
      layoutOrbit(0);
      return;
    }

    const lenis = new Lenis({ lerp: .1 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
      const t = $(a.getAttribute('href')); if (!t) return;
      e.preventDefault(); closeMenu(); lenis.scrollTo(t, { duration: 1.4 });
    }));

    // 01: the wordmark builds itself in a diagonal wave, the card drops in and tilts
    const all = [...WH.blocks, ...WH.subs];
    all.forEach(o => gsap.fromTo(o.el, { opacity: 0 }, { opacity: 1, duration: .01, ease: 'none', delay: .15 + (o.ux + o.uy) * .022 }));   // ~1.3 s, 22 ms per diagonal step
    const heroCard = $('.card--hero');
    gsap.fromTo(heroCard, { y: -60, rotation: 0, autoAlpha: 0 }, { y: 0, rotation: isPhone() ? 5 : 7, autoAlpha: 1, duration: .9, ease: 'power3.out', delay: .9 });
    decode($('.sec--hero .kicker'));

    // badges: one turn per 14 s, 4 s on hover
    $$('.badge').forEach(b => {
      const tw = gsap.to($('.badge__ring', b), { rotation: 360, transformOrigin: '50% 50%', duration: 14, ease: 'none', repeat: -1 });
      b.addEventListener('mouseenter', () => gsap.to(tw, { timeScale: 3.5, duration: .4 }));
      b.addEventListener('mouseleave', () => gsap.to(tw, { timeScale: 1, duration: .6 }));
      ScrollTrigger.create({ trigger: b, start: 'top bottom', end: 'bottom top', onToggle: s => (s.isActive ? tw.resume() : tw.pause()) });
    });

    // cards tilt ±3° toward the cursor
    if (FINE) addEventListener('pointermove', e => {
      [[heroCard, 7], [$('.card--start'), -5]].forEach(([c, base]) => {
        const r = c.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) return;
        const dx = clamp((e.clientX - (r.left + r.width / 2)) / 500, -1, 1);
        gsap.to(c, { rotation: base + dx * 3, duration: .6, ease: 'power3.out', overwrite: 'auto' });
      });
    }, { passive: true });

    // the dissolving T loops (01 and 08), paused off-screen
    const loopH = dissolveLoop(WH), loopM = dissolveLoop(WM);
    loopH.play(); loopM.play();
    ScrollTrigger.create({ start: -1, end: () => G.A0 || innerHeight * .1, onToggle: s => (s.isActive ? loopH.resume() : loopH.pause()) });
    ScrollTrigger.create({ trigger: '#s8', start: 'top bottom', end: 'bottom top', onToggle: s => (s.isActive ? loopM.resume() : loopM.pause()) });

    // every section: revealed in 24 px rows, hairlines draw, kickers decode
    $$('.sec').forEach((sec, i) => {
      const target = sec.classList.contains('sec--feed') ? $('.sticky', sec) : sec;
      const hairs = $$('.hair', sec).filter(h => !h.closest('.hero__link'));
      if (i > 0) gsap.set(target, { clipPath: 'inset(0 0 100% 0)' });
      gsap.set(hairs, { scaleX: 0 });
      ScrollTrigger.create({
        trigger: sec, start: 'top 82%', once: true,
        onEnter() {
          const rows = Math.ceil(Math.min(target.offsetHeight, innerHeight) / 24);
          if (i > 0) gsap.to(target, { clipPath: 'inset(0 0 0% 0)', duration: .5, ease: `steps(${rows})`, onComplete: () => gsap.set(target, { clearProps: 'clipPath' }) });
          gsap.to(hairs, { scaleX: 1, duration: .8, ease: 'power3.out', stagger: .08, delay: .2 });
          $$('[data-decode]', sec).forEach((el, k) => gsap.delayedCall(.25 + k * .15, () => decode(el)));
          if (sec.id === 's3') gsap.to($$('.flow__lines path'), { strokeDashoffset: 0, duration: .8, ease: 'power3.out', stagger: .3, delay: .4 });
          if (sec.id === 's6') { stamp($('.stamp')); gsap.delayedCall(.5, () => followBurst($('.sec--acts .follow'))); gsap.delayedCall(.9, () => forkDraw($('.forkline'))); }
          if (sec.id === 's8') gsap.from(['#wmCom', '#wmMit'], { x: k => (k ? 1 : -1) * innerWidth * .5, duration: 1, ease: 'power3.out' });
        },
      });
    });
    gsap.set($$('.hero__link .hair'), { scaleX: 0 });
    gsap.to($$('.hero__link .hair'), { scaleX: 1, duration: .8, ease: 'power3.out', delay: 1.2, stagger: .1 });

    // 03: the README squeezes into a post
    gsap.timeline({ scrollTrigger: { trigger: '#s3', start: 'top 60%', end: 'top 0%', scrub: .5 } })
      .fromTo($$('.readme__body i'), { scaleX: 1 }, { scaleX: .25, ease: 'steps(4)', stagger: .03 })
      .fromTo('.post--morph', { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', ease: 'steps(12)' }, '<.2');

    // 04: leaderboard reorders, upvotes tick, the phone feed scrolls
    const feedScroll = screens.feed ? $('.scr__scroll', screens.feed) : null;
    ScrollTrigger.create({
      trigger: '#s4', start: isPhone() ? 'top 70%' : 'top top', end: isPhone() ? 'bottom 30%' : 'bottom bottom',
      onUpdate(s) {
        setBoard(s.progress, true);
        if (feedScroll) {
          const max = Math.max(0, feedScroll.scrollHeight - feedScroll.parentElement.clientHeight + 12);
          gsap.set(feedScroll, { y: -Math.round(s.progress * max / 12) * 12 });
        }
      },
    });
    // double-click upvote bursts on the first post, on their own clock
    const upvoteLoop = gsap.timeline({ repeat: -1, paused: true }).to({}, { duration: 1.6 }).call(() => {
      const scr = INLINE ? Object.entries(screens).find(([k]) => k.startsWith('feed'))?.[1] : screens.feed;
      if (!scr) return;
      const post = $('.fpost--first', scr), cov = $('.cover', post), r = cov.getBoundingClientRect(), pr = post.getBoundingClientRect();
      burst(post, r.left - pr.left + r.width / 2, r.top - pr.top + r.height / 2, { spread: 70 });
      const v = $('.v', post); v.textContent = +v.textContent + 1;
    }).to({}, { duration: 1.6 });
    ScrollTrigger.create({ trigger: '#s4', start: 'top 80%', end: 'bottom top', onToggle: s => (s.isActive ? upvoteLoop.play() : upvoteLoop.pause()) });

    // 05 → 07: which screen the fixed phone shows
    if (!INLINE) {
      [['#s3', 'feed'], ['#s4', 'feed'], ['#s5', 'project'], ['#s6', 'follow'], ['#s7', 'profile']].forEach(([id, n]) =>
        ScrollTrigger.create({ trigger: id, start: 'top 50%', end: 'bottom 50%', onToggle: s => s.isActive && showScreen(n) }));
      ScrollTrigger.create({ start: () => G.B1, end: () => G.D0, onUpdate: s => gsap.set(marker, { y: Math.round(s.progress * (phone.clientHeight - marker.offsetHeight) / PIX) * PIX }) });
    } else {
      ScrollTrigger.create({ trigger: '#s5', start: 'top 70%', once: true, onEnter: () => {
        const sc = Object.entries(screens).find(([k]) => k.startsWith('project'))?.[1];
        if (sc) gsap.fromTo($$('.rcard', sc), { x: 40, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: .5, ease: 'steps(4)', stagger: .18 });
      } });
    }
    // 06: the phone's FOLLOW button bursts on a loop
    const followLoop = gsap.timeline({ repeat: -1, paused: true }).to({}, { duration: 1.4 }).call(() => {
      const scr = INLINE ? Object.entries(screens).find(([k]) => k.startsWith('follow'))?.[1] : screens.follow;
      const b = scr && $('.follow--phone', scr); if (b) followBurst(b);
    }).to({}, { duration: 1.6 });
    ScrollTrigger.create({ trigger: '#s6', start: 'top 70%', end: 'bottom 30%', onToggle: s => (s.isActive ? followLoop.play() : followLoop.pause()) });
    // 07: contribution graph fills column by column
    const gscr = INLINE ? Object.entries(screens).find(([k]) => k.startsWith('profile'))?.[1] : screens.profile;
    if (gscr) {
      const cols = $$('.gcol', gscr);
      gsap.set(cols, { opacity: 0 });
      ScrollTrigger.create({ trigger: '#s7', start: 'top 75%', end: 'bottom 60%', onUpdate: s => cols.forEach((c, i) => { c.style.opacity = i / cols.length < s.progress * 1.15 ? 1 : 0; }) });
    }
    // 07: repo cards orbit and drift away from the cursor
    let orbitOn = false;
    ScrollTrigger.create({ trigger: '#s7', start: 'top bottom', end: 'bottom top', onToggle: s => { orbitOn = s.isActive; } });
    gsap.ticker.add((t, dt) => { if (orbitOn) layoutOrbit(dt / 1000); });

    // the big animation, every frame
    setupFX();
    gsap.ticker.add(t => renderFX(t));
    // the wordmark pushes away from the cursor
    if (FINE) gsap.ticker.add(() => { if (mouse.on) { if (scrollY < innerHeight) cursorPush(WH, mouse.x, mouse.y); if (scrollY > G.D0) { cursorPush(WC, mouse.x, mouse.y); cursorPush(WM, mouse.x, mouse.y); } } });
    startTrail();

    ScrollTrigger.sort();
    ScrollTrigger.refresh();
    setupFX();

    let lastW = innerWidth;
    let rt;
    addEventListener('resize', () => {
      clearTimeout(rt);
      rt = setTimeout(() => {
        if ((innerWidth < 900) !== (lastW < 900)) return location.reload();   // switching between fixed and inline phones
        lastW = innerWidth;
        sizes(); buildWordmarks(); drawFlow();
        loopH.kill(); loopM.kill();
        ScrollTrigger.refresh(); setupFX(); lastState = '';
      }, 200);
    });
  }

  function layoutOrbit(dt) {
    const r = orbit.getBoundingClientRect(), cx0 = r.width / 2, cy0 = r.height / 2;
    ORBS.forEach((o, i) => {
      o.a += o.sp * dt;
      const hw = o.d.offsetWidth / 2, hh = o.d.offsetHeight / 2;
      let x = cx0 + Math.cos(o.a) * (r.width * .5 - hw - 16) - hw, y = cy0 + Math.sin(o.a) * (r.height * .5 - hh - 8) - hh;
      if (mouse.on && !RM) {
        const mx = mouse.x - r.left, my = mouse.y - r.top, dx = x + hw - mx, dy = y + hh - my, d = Math.hypot(dx, dy);
        const k = d < 180 ? (180 - d) / 180 : 0;
        o.push.x = lerp(o.push.x, (dx / (d || 1)) * 90 * k, .08);
        o.push.y = lerp(o.push.y, (dy / (d || 1)) * 90 * k, .08);
      }
      gsap.set(o.d, { x: Math.round((x + o.push.x) / 4) * 4, y: Math.round((y + o.push.y) / 4) * 4 });
    });
  }

  /* ───────── mobile menu (in the blue) ───────── */
  const menu = $('#menu'), menuBtn = $('.nav__menu');
  function closeMenu() { if (!menu.hidden) { menu.hidden = true; menuBtn.setAttribute('aria-expanded', 'false'); menuBtn.focus({ preventScroll: true }); } }
  menuBtn.addEventListener('click', () => {
    menu.hidden = false; menuBtn.setAttribute('aria-expanded', 'true');
    $$('a', menu).forEach(a => a.removeAttribute('aria-current'));
    gsap.fromTo(menu, { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: RM ? 0 : .5, ease: 'steps(16)' });
    $('a', menu).focus();
  });
  $('.menu__close').addEventListener('click', closeMenu);
  $$('a', menu).forEach(a => a.addEventListener('click', () => { if (RM) closeMenu(); }));
  addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });

  (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(boot);
})();
