/* The Long Ride East
   Scroll-driven: tear transitions, text, map route + empire fill, timeline bar.
   Timer-driven: the rider loop, the clips, the sword clash, flames, rain, elephants' gait. */
(() => {
  gsap.registerPlugin(ScrollTrigger);

  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isPhone = () => innerWidth < 900;
  const root = document.documentElement;
  if (RM) root.classList.add('rm');

  /* ───────── helpers ───────── */
  const NS = 'http://www.w3.org/2000/svg';
  const C = { cream: '#E6DACB', light: '#F9E7D5', terra: '#C5764F', red: '#9C5745', green: '#2C372D', olive: '#736C51', umber: '#5C4139', ink: '#1F100D' };
  function el(tag, attrs = {}, parent) {
    const n = document.createElementNS(NS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }
  function div(cls, parent) { const d = document.createElement('div'); d.className = cls; parent.appendChild(d); return d; }
  function mix(a, b, t) {
    const p = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
    const [x, y] = [p(a), p(b)];
    return '#' + x.map((v, i) => Math.round(v + (y[i] - v) * t).toString(16).padStart(2, '0')).join('');
  }
  function rng(seed) {
    return () => {
      seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const toD = pts => 'M' + pts.map(p => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join('L') + 'Z';
  const ellipse = (cx, cy, rx, ry, n = 28) => Array.from({ length: n }, (_, i) => [cx + rx * Math.cos(i / n * 2 * Math.PI), cy + ry * Math.sin(i / n * 2 * Math.PI)]);

  /* ───────── torn paper ───────── */
  function tornLine(x0, x1, y, r, amp = 6, step = 7) {
    const pts = [];
    for (let x = x0; x < x1; x += step * (0.6 + r() * 0.8)) pts.push([x, y + (r() - 0.5) * 2 * amp]);
    pts.push([x1, y + (r() - 0.5) * 2 * amp]);
    return pts;
  }
  function tornStrip(w, h, seed = 1, amp = 6) {
    const r = rng(seed);
    return toD([...tornLine(0, w, 0, r, amp), ...tornLine(0, w, h, r, amp).reverse()]);
  }
  function hillPath(w, h, y0, amp, waves, seed, rough = 8) {
    const r = rng(seed), top = [];
    for (let x = -40; x <= w + 40; x += 9 * (0.6 + r() * 0.8))
      top.push([x, y0 + Math.sin((x / w) * Math.PI * waves + seed) * amp + (r() - 0.5) * rough]);
    return toD([...top, [w + 40, h + 40], [-40, h + 40]]);
  }
  function paper(parent, d, fill, { fibre = true, shadow = true, grain = true } = {}) {
    const g = el('g', shadow ? { filter: 'url(#shadow)' } : {}, parent);
    if (fibre) el('path', { d, fill: C.light, stroke: C.light, 'stroke-width': 5, filter: 'url(#rough)' }, g);
    el('path', grain ? { d, fill, filter: 'url(#grain)' } : { d, fill }, g);
    return g;
  }
  function sun(parent, cx, cy, r) {
    const g = el('g', {}, parent);
    el('circle', { cx, cy, r: r + 6, fill: C.light, filter: 'url(#rough)' }, g);
    el('circle', { cx, cy, r, fill: C.terra, filter: 'url(#grain)' }, g);
    return g;
  }
  /* jagged clip-path polygon in % for a torn rectangle */
  function tornRect(seed, j = 1.4, n = 18) {
    const r = rng(seed), side = (fn) => Array.from({ length: n }, (_, i) => fn(i / n, (r() - 0.5) * 2 * j));
    const pts = [
      ...side((t, e) => [t * 100, e + j]),
      ...side((t, e) => [100 - j + e * .6, t * 100]),
      ...side((t, e) => [100 - t * 100, 100 - j + e]),
      ...side((t, e) => [j + e * .6, 100 - t * 100]),
    ];
    return 'polygon(' + pts.map(([x, y]) => `${x.toFixed(2)}% ${y.toFixed(2)}%`).join(',') + ')';
  }

  /* ───────── mosaic ───────── */
  let clipN = 0;
  function mosaicPart(parent, pts, colors, { tile = 7, gap = 0.8, seed = 3, shade = 0.3, grout = mix(C.cream, C.light, .5) } = {}) {
    const id = 'mc' + (++clipN);
    const cp = el('clipPath', { id }, parent);
    el('path', { d: toD(pts) }, cp);
    const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
    const box = { x: Math.min(...xs) - 2, y: Math.min(...ys) - 2, w: Math.max(...xs) - Math.min(...xs) + 4, h: Math.max(...ys) - Math.min(...ys) + 4 };
    const r = rng(seed);
    const g = el('g', { 'clip-path': `url(#${id})` }, parent);
    el('rect', { x: box.x, y: box.y, width: box.w, height: box.h, fill: grout }, g);
    for (let row = 0, y = box.y; y < box.y + box.h; row++, y += tile) {
      const off = (row % 2) * tile * 0.5;
      for (let x = box.x - off; x < box.x + box.w; x += tile) {
        const s = tile - gap - r() * 0.6;
        const depth = (y - box.y) / box.h;
        const idx = Math.min(colors.length - 1, Math.floor((r() * (1 - shade) + depth * shade) * colors.length));
        el('rect', {
          x: (x + r() * .8).toFixed(1), y: (y + r() * .8).toFixed(1), width: s.toFixed(1), height: s.toFixed(1),
          transform: `rotate(${((r() - .5) * 8).toFixed(1)} ${(x + s / 2).toFixed(1)} ${(y + s / 2).toFixed(1)})`, fill: colors[idx],
        }, g);
      }
    }
    return g;
  }
  const legPoly = (x, y) => [[x - 7, y], [x + 7, y], [x + 5, y + 40], [x + 6, y + 66], [x + 9, y + 70], [x - 7, y + 70], [x - 5, y + 40]];
  const PAL = {
    horse: [mix(C.light, C.umber, .5), mix(C.umber, C.red, .35), C.umber, mix(C.umber, C.ink, .45)],
    farHorse: [mix(C.umber, C.ink, .2), mix(C.umber, C.ink, .45), mix(C.umber, C.ink, .6)],
    mane: [mix(C.umber, C.ink, .4), mix(C.umber, C.ink, .65), C.ink],
    skin: [C.light, mix(C.light, C.terra, .45), mix(C.light, C.red, .55), C.red],
    armour: [mix(C.olive, C.light, .3), C.olive, mix(C.olive, C.green, .5), C.green],
    cloak: [C.terra, C.red, mix(C.red, C.umber, .5)],
    hair: [C.umber, mix(C.umber, C.ink, .5), C.ink],
    blade: [C.light, C.cream, mix(C.cream, C.olive, .35)],
  };

  /* The mosaic horse (with or without Alexander). Pivots live in data-origin for svgOrigin rotations. */
  function buildHorse(host, seed = 1, { rider = true } = {}) {
    const svg = el('svg', { viewBox: '30 -40 280 260', 'aria-hidden': 'true' }, host);
    const rear = el('g', { filter: 'url(#cutout)', 'data-origin': '112 212' }, svg);
    let s = seed * 100;
    const part = (parent, pts, pal, o = {}) => mosaicPart(parent, pts, pal, { seed: ++s, ...o });
    const leg = (x, y, pal) => { const g = el('g', { 'data-origin': `${x} ${y}` }, rear); part(g, legPoly(x, y), pal); return g; };

    part(rear, [[86, 106], [62, 120], [48, 152], [52, 176], [64, 152], [76, 132], [92, 120]], PAL.mane);
    const backFar = leg(104, 140, PAL.farHorse), frontFar = leg(206, 138, PAL.farHorse);
    part(rear, ellipse(150, 122, 78, 36), PAL.horse);
    const head = el('g', { 'data-origin': '204 120' }, rear);
    part(head, [[188, 114], [202, 80], [222, 56], [240, 50], [248, 70], [234, 98], [220, 132]], PAL.horse);
    part(head, [[236, 46], [252, 48], [272, 62], [292, 80], [290, 95], [276, 97], [258, 89], [244, 75]], PAL.horse);
    part(head, [[238, 50], [243, 31], [250, 49]], PAL.mane);
    part(head, [[198, 88], [212, 60], [236, 44], [226, 66], [212, 92]], PAL.mane);
    el('rect', { x: 260, y: 62, width: 5, height: 5, fill: C.ink }, head);
    const backNear = leg(114, 142, PAL.horse), frontNear = leg(196, 140, PAL.horse);
    let swordArm = null;
    if (rider) {
      part(rear, [[150, 60], [112, 72], [94, 102], [124, 98], [146, 94]], PAL.cloak);
      part(rear, [[146, 96], [162, 96], [172, 128], [158, 134]], PAL.armour);
      part(rear, [[138, 102], [168, 102], [172, 64], [156, 52], [140, 62]], PAL.armour);
      part(rear, ellipse(158, 38, 13, 14, 16), PAL.skin, { tile: 6 });
      part(rear, [[143, 36], [148, 22], [162, 18], [174, 26], [172, 34], [162, 29], [152, 42]], PAL.hair, { tile: 5 });
      el('rect', { x: 165, y: 34, width: 4, height: 4, fill: C.ink }, rear);
      swordArm = el('g', { 'data-origin': '162 62' }, rear);
      part(swordArm, [[160, 57], [192, 47], [195, 55], [163, 68]], PAL.skin, { tile: 6 });
      part(swordArm, [[189, 45], [247, 8], [251, 13], [195, 53]], PAL.blade, { tile: 5, gap: .9 });
      part(swordArm, [[184, 42], [197, 55], [193, 58], [181, 46]], PAL.mane, { tile: 4, gap: .6 });
    }
    return { svg, rear, head, swordArm, legs: [frontNear, frontFar, backNear, backFar] };
  }

  /* ───────── stop-motion ───────── */
  function boil(target, { amp = 1.2, fps = 12 } = {}) {
    return gsap.to(target, {
      rotation: () => gsap.utils.random(-amp, amp), x: () => gsap.utils.random(-amp, amp), y: () => gsap.utils.random(-amp, amp),
      duration: 1 / fps, ease: 'steps(1)', repeat: -1, repeatRefresh: true, paused: true,
    });
  }
  const GALLOP = [[-30, 20, 25, -15], [10, 35, -10, 20], [35, -10, -25, 30], [-5, -25, 15, -20]];
  function gaitCycle(legs, { frames = GALLOP, fps = 12, bodyEl, bob = 3, onFrame } = {}) {
    let f = 0;
    return gsap.to({}, {
      duration: 1 / fps, repeat: -1, paused: true,
      onRepeat() {
        f = (f + 1) % frames.length;
        legs.forEach((leg, k) => gsap.set(leg, { rotation: frames[f][k], svgOrigin: leg.dataset.origin }));
        if (bodyEl) gsap.set(bodyEl, { y: f % 2 ? -bob : 0 });
        if (onFrame) onFrame(f);
      },
    });
  }
  /* 0–4.5 gallop to 80% · 4.5–5.7 rear + sword up (0.35 up, 0.5 hold, 0.35 down) · 5.7–6.7 exit · 6.7–8.2 empty */
  function riderLoop({ stage, rider, rear, swordArm, gait }, { repeat = -1, gallop = 4.5, up = .35, hold = .5, down = .35, exit = 1, empty = 1.5 } = {}) {
    const W = () => stage.clientWidth, w = () => rider.getBoundingClientRect().width;
    const tl = gsap.timeline({ repeat, paused: true });
    tl.set(rider, { x: () => -w() - 30 })
      .call(() => gait.play())
      .to(rider, { x: () => W() * 0.8 - w(), duration: gallop, ease: 'none' })
      .call(() => { gait.pause(); gsap.set(rear, { y: 0 }); })
      .to(rear, { rotation: -25, svgOrigin: rear.dataset.origin, duration: up, ease: 'power2.out' })
      .to(swordArm, { rotation: -55, svgOrigin: swordArm.dataset.origin, duration: up, ease: 'power2.out' }, '<')
      .to({}, { duration: hold })
      .to([rear, swordArm], { rotation: 0, duration: down, ease: 'power2.in' })
      .call(() => gait.play())
      .to(rider, { x: () => W() + 30, duration: exit, ease: 'none' })
      .call(() => gait.pause())
      .to({}, { duration: repeat ? empty : 0 });
    return tl;
  }
  function scraps(panel, x, y, { n = 8, colors = ['', 'scrap--terra', 'scrap--red'], spread = 1 } = {}) {
    for (let i = 0; i < n; i++) {
      const d = div('scrap ' + colors[i % colors.length], panel);
      const a = Math.random() * Math.PI * 2, v = (40 + Math.random() * 90) * spread;
      gsap.fromTo(d, { x, y, rotation: Math.random() * 90, scale: .6 + Math.random() * .8 },
        { x: x + Math.cos(a) * v, y: y + Math.sin(a) * v - 20, rotation: '+=' + (90 + Math.random() * 160), opacity: 0, duration: .6 + Math.random() * .4, ease: 'power2.out', onComplete: () => d.remove() });
    }
  }

  /* ───────── DOM ───────── */
  const stages = [...document.querySelectorAll('.stage')];
  const panels = stages.map(s => s.querySelector('.panel'));
  const BASE_FILL = [C.cream, C.light, C.cream, C.light, C.cream, C.green, C.cream];
  const barH = () => document.querySelector('.timebar').offsetHeight;

  /* static paper scenery, rebuilt at the panel's pixel size */
  function drawScenery() {
    panels.forEach((p, k) => {
      const W = p.clientWidth, H = p.clientHeight, B = barH();
      const base = p.querySelector('.base'), scene = p.querySelector('.scene');
      base.innerHTML = ''; scene.innerHTML = '';
      base.setAttribute('viewBox', `0 0 ${W} ${H + 40}`);
      scene.setAttribute('viewBox', `0 0 ${W} ${H}`);
      const r = rng(50 + k);
      // the sheet itself, torn along the top
      const top = tornLine(-10, W + 10, 40, r, k ? 9 : 0, 8);
      const g = el('g', { filter: k ? 'url(#shadowUp)' : '' }, base);
      if (k) el('path', { d: toD([...top.map(([x, y]) => [x, y - 4]), [W + 10, H + 50], [-10, H + 50]]), fill: C.light, filter: 'url(#rough)' }, g);
      el('path', { d: toD([...top, [W + 10, H + 50], [-10, H + 50]]), fill: BASE_FILL[k], filter: 'url(#grain)' }, g);
      const art = el('g', { transform: 'translate(0 40)' }, base);
      const vw = W / 100, vh = H / 100;

      if (k === 0) { // fallback scene under the hero clip
        sun(art, W * (isPhone() ? .9 : .8), H * (isPhone() ? .2 : .25), Math.min(W, H) * .17);
        paper(art, hillPath(W, H, H * .66, H * .05, 2.2, 3), C.olive);
        paper(art, hillPath(W, H, H * .74, H * .04, 1.6, 5), C.umber);
        paper(art, hillPath(W, H, H * .82, H * .03, 1.2, 7), C.green);
        groundOf.hero = H - B - 6 * vh;
        paper(scene, hillPath(W, H, groundOf.hero, 6, 1.1, 11, 6), C.light);
      }
      if (k === 1) {
        groundOf.prince = H - (B + 13 * vh);
        paper(art, hillPath(W, H, H * .7, H * .04, 1.8, 13), C.olive);
        paper(art, hillPath(W, H, H * .78, H * .03, 1.4, 14), C.green);
        paper(art, hillPath(W, H, groundOf.prince - 4, 5, 1, 15, 6), C.cream);
        const strip = el('g', { transform: `translate(-40 ${groundOf.prince + 5 * vh}) rotate(-1.5)` }, art);
        paper(strip, tornStrip(W + 80, 3 * vh, 16, 5), C.terra);
      }
      if (k === 2) {
        sun(art, W * (isPhone() ? .82 : .6), H * .17, Math.min(W, H) * .07);
        paper(art, hillPath(W, H, H * .8 - B, H * .025, 1.3, 21), C.olive);
        const strip = el('g', { transform: `translate(-40 ${H * .9 - B}) rotate(-2)` }, art);
        paper(strip, tornStrip(W + 80, 2.4 * vh, 22, 4), C.terra);
      }
      if (k === 3) {
        paper(art, hillPath(W, H, H * .78 - B, H * .03, 1.6, 31), C.umber);
        paper(art, hillPath(W, H, H * .88 - B, H * .02, 1.1, 32), C.olive);
      }
      if (k === 4) {
        paper(art, hillPath(W, H, H * .83 - B, H * .025, 1.9, 41), C.olive);
        paper(art, hillPath(W, H, H * .9 - B, H * .015, 1.2, 42), C.green);
      }
      if (k === 5) {
        const s1 = el('g', { transform: `translate(${W * .55} ${-2 * vh}) rotate(8)` }, art);
        paper(s1, tornStrip(W * .6, 5 * vh, 51, 6), C.umber);
        const s2 = el('g', { transform: `translate(${W * .62} ${5 * vh}) rotate(4)` }, art);
        paper(s2, tornStrip(W * .5, 2.4 * vh, 52, 4), C.olive);
      }
      if (k === 6) {
        sun(art, W * (isPhone() ? .78 : .58), H * .2, Math.min(W, H) * .1);
        paper(art, hillPath(W, H, H * .79, H * .03, 2, 61), C.olive);
        paper(art, hillPath(W, H, H * .85, H * .02, 1.5, 62), C.green);
        groundOf.finale = H - B - 7 * vh;
        paper(scene, hillPath(W, H, groundOf.finale, 6, 1.1, 63, 6), C.light);
      }
    });
    placeFigures();
  }
  const groundOf = {};
  function placeFigures() {
    const P = panels[0].clientHeight;
    document.getElementById('rider').style.bottom = (P - groundOf.hero - 8) + 'px';
    document.getElementById('rider2').style.bottom = (panels[6].clientHeight - groundOf.finale - 8) + 'px';
  }

  /* torn frames for the video windows */
  document.querySelectorAll('.clip').forEach((c, i) => {
    c.style.setProperty('--edge-inner', tornRect(70 + i, 1.1));
    c.style.setProperty('--edge-outer', tornRect(90 + i, .9));
  });

  /* ───────── figures & props ───────── */
  const R1 = buildHorse(document.getElementById('rider'), 1);
  const R2 = buildHorse(document.getElementById('rider2'), 2);
  const HORSE = buildHorse(document.getElementById('horse'), 3, { rider: false });

  function prop(panel, cls, viewBox) {
    const d = div('prop ' + cls, panel);
    const svg = el('svg', { viewBox, 'aria-hidden': 'true' }, d);
    return { d, svg };
  }
  // 2 · sun and the horse's shadow
  const P2 = panels[1];
  const sun2 = prop(P2, 'prop--sun', '0 0 200 200'); sun(sun2.svg, 100, 100, 88);
  const shadow = prop(P2, 'prop--shadow', '0 0 300 40');
  shadow.svg.setAttribute('preserveAspectRatio', 'none');
  { const r = rng(9); el('path', { d: toD(ellipse(150, 20, 146, 15, 40).map(([x, y]) => [x + (r() - .5) * 5, y + (r() - .5) * 3])), fill: C.umber, opacity: .55 }, shadow.svg); }

  // 3 · two paper swords
  function sword(host, mirror) {
    const svg = mirror ? el('g', { transform: 'translate(300 0) scale(-1 1)' }, host) : host;
    paper(svg, toD([[92, 24], [278, 25], [298, 30], [278, 35], [92, 36]]), C.light);
    el('path', { d: 'M100 30 L268 30', stroke: mix(C.cream, C.olive, .45), 'stroke-width': 2 }, svg);
    paper(svg, toD([[78, 4], [92, 8], [92, 52], [78, 56]]), C.umber);
    paper(svg, toD([[36, 25], [78, 24], [78, 36], [36, 35]]), mix(C.umber, C.ink, .4));
    paper(svg, toD(ellipse(28, 30, 10, 10, 12)), C.terra);
  }
  const P3 = panels[2];
  const swordL = prop(P3, 'prop--sword prop--sword-l', '0 0 300 60'), swordR = prop(P3, 'prop--sword prop--sword-r', '0 0 300 60');
  sword(swordL.svg); sword(swordR.svg, true);
  const sparkAt = div('prop prop--spark', P3);

  // 4 · columns of Persepolis and paper flames
  const P4 = panels[3];
  const columns = [0, 1, 2].map(i => {
    const c = prop(P4, 'prop--col prop--col-' + i, '0 -40 60 290');
    const drums = [];
    const cap = el('g', {}, c.svg);
    paper(cap, toD([[0, 6], [60, 6], [56, 22], [4, 22]]), C.light);
    el('circle', { cx: 8, cy: 14, r: 5, fill: 'none', stroke: C.umber, 'stroke-width': 2 }, cap);
    el('circle', { cx: 52, cy: 14, r: 5, fill: 'none', stroke: C.umber, 'stroke-width': 2 }, cap);
    drums.push(cap);
    for (let d = 0; d < 4; d++) {
      const g = el('g', {}, c.svg), y = 24 + d * 46;
      paper(g, toD([[9, y], [51, y + 1], [50, y + 45], [10, y + 44]]), d % 2 ? C.cream : C.light, { fibre: false });
      [20, 30, 40].forEach(x => el('path', { d: `M${x} ${y + 4}V${y + 41}`, stroke: C.umber, 'stroke-width': 1.4, opacity: .35 }, g));
      drums.push(g);
    }
    const baseG = el('g', {}, c.svg);
    paper(baseG, toD([[3, 210], [57, 210], [60, 226], [0, 226]]), C.light);
    const flames = [[C.terra, 1], [C.red, 0], [mix(C.terra, C.light, .35), 2]].map(([fill, j], n) => {
      const r = rng(i * 10 + n + 3), x0 = -6 + n * 18, w = 36, h = 95 + r() * 70, pts = [[x0, 226]];
      for (let t = 1; t < 8; t++) {
        const env = Math.pow(Math.sin((t / 8) * Math.PI), .7);
        pts.push([x0 + (w * t) / 8 + (r() - .5) * 4, 226 - h * env * (t % 2 ? 1 - r() * .15 : .45 + r() * .15)]);
      }
      pts.push([x0 + w, 226]);
      const g = el('g', {}, c.svg);
      paper(g, toD(pts), fill, { shadow: false });
      return g;
    });
    return { ...c, drums, flames };
  });

  // 5 · elephants and paper rain
  const P5 = panels[4];
  function elephant(svg, seed) {
    const r = rng(seed), body = mix(C.umber, C.olive, .25);
    const leg = (x) => { const g = el('g', { 'data-origin': `${x + 8} 92` }, svg); paper(g, toD([[x, 88], [x + 17, 88], [x + 16, 140], [x + 1, 140]]), body, { fibre: true, shadow: false }); return g; };
    const far = [leg(62), leg(138)];
    paper(svg, toD([[56, 66], [60, 56], [150, 54], [160, 66], [152, 82], [62, 82]]), body, { shadow: false });
    const bodyG = el('g', {}, svg);
    paper(bodyG, toD(ellipse(104, 76, 62, 34, 30)), body);
    paper(bodyG, toD([[150, 42], [176, 36], [190, 56], [194, 84], [200, 118], [192, 120], [182, 90], [170, 78], [150, 76]]), body);
    paper(bodyG, toD([[148, 44], [170, 50], [168, 86], [146, 82]]), C.red);
    paper(bodyG, toD([[180, 78], [204, 74], [206, 70], [182, 72]]), C.light, { shadow: false });
    el('rect', { x: 178, y: 54, width: 4, height: 4, fill: C.ink }, bodyG);
    paper(bodyG, toD([[72, 30], [130, 30], [128, 58], [74, 58]]), C.terra);
    paper(bodyG, toD([[82, 36], [120, 36], [119, 52], [83, 52]]), C.olive, { shadow: false });
    paper(bodyG, toD([[100, 0], [101, 30], [104, 30], [103, 0]]), C.umber, { shadow: false });
    paper(bodyG, toD([[103, 1], [122, 6], [104, 14]]), C.terra, { shadow: false });
    const near = [leg(70), leg(148)];
    return { bodyG, legs: [near[0], far[0], near[1], far[1]] };
  }
  const elephants = [0, 1].map(i => { const e = prop(P5, 'prop--eleph prop--eleph-' + i, '30 -4 186 148'); return { ...e, ...elephant(e.svg, 80 + i) }; });
  const rain = div('prop prop--rain', P5);
  const drops = Array.from({ length: 34 }, (_, i) => {
    const d = div('drop', rain), r = rng(200 + i);
    d.style.left = (r() * 100).toFixed(1) + '%';
    d.style.height = (3 + r() * 6).toFixed(1) + 'vh';
    return d;
  });

  /* ───────── map ───────── */
  const BOUNDS = { lon0: 15, lon1: 80, lat0: 20, lat1: 45 };
  const VB = { w: 1000, h: Math.round(1000 * (BOUNDS.lat1 - BOUNDS.lat0) / ((BOUNDS.lon1 - BOUNDS.lon0) * Math.cos(33 * Math.PI / 180))) };
  const project = ([lat, lon]) => [(lon - BOUNDS.lon0) / (BOUNDS.lon1 - BOUNDS.lon0) * VB.w, (BOUNDS.lat1 - lat) / (BOUNDS.lat1 - BOUNDS.lat0) * VB.h];
  const SEAS = {
    med: [[40.2,15],[39.8,18.5],[40.8,19.4],[39.6,20.2],[38.3,21.1],[37.0,21.6],[36.4,22.6],[36.9,23.2],[37.6,23.2],[38.0,24.0],[39.3,22.9],[40.6,22.9],[40.9,24.5],[40.9,26.0],[40.0,26.3],[39.0,26.8],[38.2,26.3],[37.2,27.3],[36.7,28.2],[36.3,30.0],[36.8,30.8],[36.3,32.8],[36.6,34.6],[36.9,36.1],[36.1,35.8],[34.6,35.9],[33.2,35.2],[32.1,34.8],[31.3,34.2],[31.2,32.3],[31.5,30.4],[30.9,29.0],[31.6,25.2],[32.6,23.1],[32.9,22.0],[32.1,20.0],[30.4,19.1],[30.9,17.6],[32.2,15.4],[32.8,15]],
    black: [[41.2,28.9],[42.5,27.9],[43.5,28.6],[44.8,29.7],[45,30.5],[45,33],[44.4,33.5],[45,35.5],[45,36.6],[44.2,38.5],[43.2,40.2],[41.6,41.6],[41.0,39.5],[41.4,37.2],[42.0,35.0],[41.9,33.5],[41.2,31.5]],
    caspian: [[45,47],[44.0,47.4],[42.6,47.8],[41.0,49.3],[40.2,50.2],[38.8,48.9],[37.4,49.2],[36.8,51.5],[37.0,53.9],[38.2,53.9],[39.8,53.4],[40.8,52.8],[41.6,52.4],[42.6,52.6],[44.2,50.4],[45,51.5]],
    red: [[29.9,32.5],[27.0,34.0],[24.0,35.6],[20,37.2],[20,40.0],[22.5,39.1],[24.5,37.5],[27.5,35.5],[29.5,34.9],[28.0,34.4]],
    gulf: [[30.0,48.0],[29.0,48.3],[27.0,49.8],[25.5,50.6],[24.3,51.6],[24.2,54.2],[25.6,56.3],[26.6,56.4],[27.1,54.5],[28.4,51.2],[29.6,50.2]],
    arabian: [[20,57.8],[22.5,59.8],[24.6,57.0],[25.4,57.4],[25.3,61.6],[25.2,63.5],[25.3,66.5],[24.8,67.3],[23.6,68.2],[22.7,68.9],[22.2,69.4],[23.0,70.4],[21.5,72.6],[20,72.8]],
  };
  const LANDS = {
    greece:   { color: C.green, label: 'His kingdom', pts: [[41.8,20.0],[41.5,24.5],[40.5,26.0],[38.5,24.0],[36.5,23.0],[37.0,21.5],[39.5,20.0]] },
    anatolia: { color: C.olive, label: '334–333 BC', pts: [[41.5,26.5],[42.0,35.0],[41.0,41.0],[37.5,41.0],[36.6,36.5],[36.2,30.0],[37.0,27.2],[40.0,26.2]] },
    persia:   { color: C.terra, label: '332–330 BC', pts: [[37.5,41.0],[37.5,48.0],[38.5,57.0],[36.0,61.0],[30.0,61.5],[25.5,58.0],[27.0,54.5],[29.5,50.0],[30.5,48.0],[29.0,47.5],[31.0,39.5],[29.5,34.8],[27.0,34.0],[24.0,33.0],[24.0,30.0],[31.0,29.0],[31.3,32.0],[33.0,35.0],[36.5,36.0]] },
    east:     { color: C.red,   label: '329–325 BC', pts: [[38.5,57.0],[40.5,63.0],[41.0,68.5],[38.5,71.0],[35.5,74.5],[32.0,75.5],[29.5,71.5],[25.0,68.5],[24.5,66.0],[25.5,61.5],[30.0,61.5],[36.0,61.0]] },
  };
  const STOPS = [
    ['Pella', 40.8, 22.5], ['Granicus', 40.2, 27.3], ['Gordium', 39.7, 32.0], ['Issus', 36.8, 36.2],
    ['Tyre', 33.3, 35.2], ['Alexandria', 31.2, 29.9], ['Gaugamela', 36.4, 43.3], ['Babylon', 32.5, 44.4], ['Persepolis', 29.9, 52.9],
    ['Bactra', 36.8, 66.9], ['Maracanda', 39.7, 67.0], ['Hydaspes', 32.9, 73.7], ['', 25.5, 62.0], ['Babylon', 32.5, 44.4],
  ];
  const LABEL_POS = {
    Pella: [-9, -8, 'end'], Granicus: [0, -12, 'middle'], Gordium: [0, 22, 'middle'], Issus: [10, 4, 'start'],
    Tyre: [10, 4, 'start'], Alexandria: [-10, 18, 'end'], Babylon: [-10, 18, 'end'], Hydaspes: [-10, -10, 'end'],
  };
  function smoothPath(pts) {
    let d = `M${pts[0][0]},${pts[0][1]}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
      const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
      const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
      d += ` C${c1.map(n => n.toFixed(1))} ${c2.map(n => n.toFixed(1))} ${p2.map(n => n.toFixed(1))}`;
    }
    return d;
  }
  const mapEl = document.querySelector('.map'), mapSvg = document.querySelector('.map__svg');
  const M = {};
  (function buildMap() {
    mapSvg.setAttribute('viewBox', `0 0 ${VB.w} ${VB.h}`);
    const seas = el('g', { filter: 'url(#rough)' }, mapSvg);
    Object.values(SEAS).forEach(s => el('path', { d: toD(s.map(project)), fill: C.cream }, seas));
    M.lands = {};
    Object.entries(LANDS).forEach(([k, v]) => {
      const g = el('g', {}, mapSvg);
      paper(g, toD(v.pts.map(project)), v.color, { shadow: false });
      M.lands[k] = g;
    });
    const pts = STOPS.map(s => project([s[1], s[2]]));
    M.route = el('path', { d: smoothPath(pts), fill: 'none', stroke: C.terra, 'stroke-width': 5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, mapSvg);
    const tmp = el('path', {}, mapSvg);
    M.lengths = pts.map((_, i) => (i ? (tmp.setAttribute('d', smoothPath(pts.slice(0, i + 1))), tmp.getTotalLength()) : 0));
    tmp.remove();
    M.L = M.route.getTotalLength();
    const labels = el('g', { 'font-family': 'Jost, sans-serif', 'font-weight': 500, 'font-size': 17, 'letter-spacing': 2, fill: C.ink }, mapSvg);
    STOPS.forEach((s, i) => {
      if (!s[0] || i === 13) return;
      const [x, y] = pts[i];
      el('rect', { x: x - 4, y: y - 4, width: 8, height: 8, fill: C.ink, transform: `rotate(45 ${x} ${y})` }, labels);
      const [dx, dy, anchor] = LABEL_POS[s[0]] || [9, -8, 'start'];
      const t = el('text', { x: x + dx, y: y + dy, 'text-anchor': anchor }, labels); t.textContent = s[0].toUpperCase();
    });
    M.marker = el('g', { filter: 'url(#cutout)' }, mapSvg);
    mosaicPart(M.marker, [[-14, 4], [-10, -6], [6, -7], [12, -16], [18, -14], [14, -4], [12, 8], [-12, 8]], PAL.horse, { tile: 4, gap: .7, seed: 77 });
    document.querySelector('.map__legend').innerHTML = Object.values(LANDS).map(v => `<span><i style="background:${v.color}"></i>${v.label}</span>`).join('');
  })();
  function setRoute(len) {
    M.route.style.strokeDasharray = M.L;
    M.route.style.strokeDashoffset = M.L - len;
    const p = M.route.getPointAtLength(Math.max(0.01, len));
    M.marker.setAttribute('transform', `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)})`);
  }

  /* ───────── timeline devices ───────── */
  const BAR = { from: 356, to: 323 };
  const barPct = y => (BAR.from - y) / (BAR.from - BAR.to);
  const BAR_MARKS = [[356, 'Born in Pella'], [336, 'King at 20'], [334, 'The war begins']];
  const track = document.querySelector('.timebar__track'), fill = document.querySelector('.timebar__fill');
  const chip = document.querySelector('.timebar__chip'), endR = document.querySelector('.timebar__end--r');
  BAR_MARKS.slice(1).forEach(([y]) => { const t = div('timebar__tick', track); t.style.left = (barPct(y) * 100) + '%'; });
  let chipText = '';
  function setBar(p, done) {
    gsap.set(fill, { scaleX: p });
    const year = BAR.from - p * (BAR.from - BAR.to);
    const txt = done ? 'Today · Still famous, 2,300+ years later'
      : BAR_MARKS.filter(([y]) => year <= y + .01).map(([y, l]) => `${y} BC · ${l}`).pop();
    if (txt !== chipText) { chip.textContent = chipText = txt; endR.textContent = done ? 'Today' : '323 BC'; }
  }

  const NOW = new Date().getFullYear();
  const TSTOPS = [
    { y: -323, mark: '323 BC', label: 'Dies in Babylon, aged 32' },
    { y: -100, mark: 'c. 100 BC', label: 'His mosaic is laid in a house in Pompeii' },
    { y: 79, mark: 'AD 79', label: 'Vesuvius buries the mosaic' },
    { y: 1831, mark: '1831', label: 'The mosaic is dug up again' },
    { y: NOW, mark: 'Today', label: 'Still famous, 2,300+ years later' },
  ];
  const big = document.querySelector('.timebig'), bigYear = document.querySelector('.timebig__year'),
    bigLabel = document.querySelector('.timebig__label'), bigFill = document.querySelector('.timebig__fill'),
    stamp = document.querySelector('.timebig__stamp');
  document.querySelector('.timebig__marks').innerHTML = TSTOPS.map((s, i) => `<span style="left:${(i / (TSTOPS.length - 1)) * 100}%"><b>${s.mark}</b></span>`).join('');
  const fmtYear = y => (y >= NOW ? 'Today' : y < 0 ? `${-y} BC` : y < 1000 ? `AD ${y}` : String(y));
  let bigLast = '';
  function setBig(c) { // c: 0 … TSTOPS.length-1, evenly spaced marks squeeze the 2,300 years
    const n = TSTOPS.length, k = Math.min(n - 2, Math.floor(c)), f = c - k;
    let y = Math.round(TSTOPS[k].y + (TSTOPS[k + 1].y - TSTOPS[k].y) * f);
    if (y === 0) y = 1;
    const exact = TSTOPS.find(s => Math.abs(TSTOPS.indexOf(s) - c) < .02);
    const txt = exact ? (exact.y === NOW ? 'Today' : exact.mark) : fmtYear(y);
    if (txt !== bigLast) { bigYear.textContent = bigLast = txt; }
    bigLabel.textContent = TSTOPS[Math.min(n - 1, Math.round(c))].label;
    gsap.set(bigFill, { scaleX: c / (n - 1) });
  }
  function drawPapers() {
    const tb = document.querySelector('.timebar__paper'), w = innerWidth, h = barH();
    tb.setAttribute('viewBox', `0 0 ${w} ${h}`); tb.setAttribute('preserveAspectRatio', 'none');
    tb.innerHTML = '';
    const g = el('g', { filter: 'url(#shadowUp)' }, tb);
    el('path', { d: toD([...tornLine(-6, w + 6, 6, rng(31), 3, 9), [w + 6, h + 10], [-6, h + 10]]), fill: C.light }, g);
    const bp = document.querySelector('.timebig__paper'), bw = big.offsetWidth, bh = big.offsetHeight;
    bp.setAttribute('viewBox', `0 0 ${bw} ${bh}`); bp.innerHTML = '';
    const r = rng(33);
    const g2 = el('g', { filter: 'url(#shadow)' }, bp);
    const pts = [...tornLine(0, bw, 6, r, 6), ...tornLine(0, bw, bh - 4, r, 4).reverse()];
    el('path', { d: toD(pts), fill: C.light, stroke: C.light, 'stroke-width': 4, filter: 'url(#rough)' }, g2);
    el('path', { d: toD(pts), fill: C.cream, filter: 'url(#grain)' }, g2);
  }

  /* ───────── scroll geometry ───────── */
  let S = [], VH = innerHeight;
  function measure() {
    VH = innerHeight;
    S = stages.map(s => s.offsetTop);
  }
  const range = k => [S[k] - VH, k + 1 < S.length ? S[k + 1] : Infinity];

  /* ───────── timer loops (separate from scroll) ───────── */
  const loops = [];
  function timerRange(k, start, stop, pad = 0) {
    const st = ScrollTrigger.create({
      start: () => (k === 0 ? -1 : Math.max(0, range(k)[0] - pad * VH)),  // -1 keeps the hero active at scrollY 0
      end: () => (k + 1 < S.length ? range(k)[1] + pad * VH : ScrollTrigger.maxScroll(window) + 10),
      onToggle: self => (self.isActive ? start() : stop()),
    });
    loops.push(st);
    return st;
  }

  /* lazy videos: load near the section, play while it's on screen */
  function wireVideos() {
    document.querySelectorAll('.clip video').forEach(v => {
      const k = stages.indexOf(v.closest('.stage'));
      const src = v.dataset.src;
      if (!src || src.includes('{{')) return;
      timerRange(k, () => {
        if (!v.src) { v.src = src; v.load(); }
        const p = v.play(); if (p) p.catch(() => {});
      }, () => v.pause(), .6);
    });
  }

  function startTimers() {
    // 1 · hero rider, 8.2 s, forever
    const hero = panels[0];
    const dust = f => {
      if (f % 2) return;
      const b = R1.svg.getBoundingClientRect(), h = hero.getBoundingClientRect();
      scraps(hero, b.left - h.left + b.width * .25, b.bottom - h.top - 10, { n: 2, spread: .5, colors: ['', 'scrap--terra'] });
    };
    const gait1 = gaitCycle(R1.legs, { bodyEl: R1.rear, onFrame: dust });
    const loop = riderLoop({ stage: hero, rider: document.getElementById('rider'), rear: R1.rear, swordArm: R1.swordArm, gait: gait1 });
    loop.play();
    timerRange(0, () => loop.resume(), () => { loop.pause(); gait1.pause(); });

    // 2 · the horse boils while it panics
    const hb = boil(HORSE.svg, { amp: 1 });
    timerRange(1, () => hb.play(), () => hb.pause());

    // 3 · sword clash at 12 fps, sparks on each hit
    const inL = swordL.svg, inR = swordR.svg;
    const clash = gsap.timeline({ repeat: -1, paused: true })
      .to(inL, { rotation: -9, duration: .25, ease: 'steps(3)' })
      .to(inR, { rotation: 9, duration: .25, ease: 'steps(3)' }, '<')
      .to([inL, inR], { rotation: 0, duration: .08, ease: 'steps(1)' })
      .call(() => {
        const a = sparkAt.getBoundingClientRect(), p = P3.getBoundingClientRect();
        if (gsap.getProperty(swordL.d, 'opacity') > .5) scraps(P3, a.left - p.left, a.top - p.top, { n: 9 });
      })
      .to({}, { duration: .42 });
    timerRange(2, () => clash.play(), () => clash.pause());

    // 4 · flames flicker
    const flick = columns.flatMap(c => c.flames.map(f => boil(f, { amp: 2.2 })));
    timerRange(3, () => flick.forEach(t => t.play()), () => flick.forEach(t => t.pause()));

    // 5 · paper rain + elephants' stomp
    const rainTw = drops.map((d, i) => gsap.fromTo(d, { y: '-12vh' }, { y: '112vh', duration: 1 + (i % 5) * .12, ease: 'steps(12)', repeat: -1, delay: -(i * .37) % 1.4, paused: true }));
    const STOMP = [[12, -8, -10, 8], [0, 0, 0, 0], [-10, 8, 12, -8], [0, 0, 0, 0]];
    const gaits = elephants.map(e => gaitCycle(e.legs, { frames: STOMP, fps: 6, bodyEl: e.bodyG, bob: 2 }));
    timerRange(4, () => { rainTw.forEach(t => t.play()); gaits.forEach(g => g.play()); }, () => { rainTw.forEach(t => t.pause()); gaits.forEach(g => g.pause()); });

    // 7 · the last ride, once per visit, then the closing card
    const gait2 = gaitCycle(R2.legs, { bodyEl: R2.rear });
    const finale = riderLoop({ stage: panels[6], rider: document.getElementById('rider2'), rear: R2.rear, swordArm: R2.swordArm, gait: gait2 }, { repeat: 0 });
    const closing = panels[6].querySelector('.closing');
    finale.to(closing, { autoAlpha: 1, y: 0, duration: 1, ease: 'expo.out' });
    gsap.set(closing, { autoAlpha: 0, y: 24 });
    ScrollTrigger.create({
      start: () => S[6] - VH * .25, end: () => ScrollTrigger.maxScroll(window) + 10,
      onEnter: () => finale.restart(), onLeaveBack: () => { finale.pause(0); gait2.pause(); gsap.set(closing, { autoAlpha: 0, y: 24 }); },
    });

    // ambient: the hero clouds of the fallback scene don't exist on video; nothing else to loop
    addEventListener('resize', () => { loop.invalidate(); finale.invalidate(); });
  }

  /* ───────── the scroll story: one scrubbed timeline in pixels ───────── */
  let master = null, lenis = null;
  function buildStory() {
    if (master) { master.scrollTrigger && master.scrollTrigger.kill(); master.kill(); }
    measure();
    const max = ScrollTrigger.maxScroll(window);
    master = gsap.timeline({ paused: true, defaults: { ease: 'none' } });
    const at = (a, b, target, from, to) => master.fromTo(target, from, { ...to, duration: Math.max(1, b - a), immediateRender: false }, a);
    const sec = k => S[k], vh = f => f * VH;

    // text arrives as each sheet lands; the sheet below darkens slightly
    panels.forEach((p, k) => {
      if (k) {
        const items = [...p.querySelectorAll('.panel__text > *')];
        items.forEach((n, i) => at(sec(k) - vh(.5) + i * vh(.06), sec(k) - vh(.02) + i * vh(.06), n, { autoAlpha: 0, y: 34 }, { autoAlpha: 1, y: 0, ease: 'power3.out' }));
      }
      if (k < panels.length - 1) {
        let veil = p.querySelector('.veil'); if (!veil) veil = div('veil', p);
        at(sec(k + 1) - vh(1), sec(k + 1), veil, { opacity: 0 }, { opacity: .28 });
      }
    });
    // hero text drifts up a little as the second sheet tears in
    at(0, vh(1), panels[0].querySelector('.panel__text'), { y: 0 }, { y: -vh(.12) });

    // 2 · Bucephalus: panic → the sun swings round → shadow gone → calm, head lowered
    const s2 = sec(1), phone = isPhone();
    const sunPath = phone ? [[0, 0], [22, -10], [42, -2]] : [[0, 0], [17, -18], [33, -3]];
    at(s2 - vh(.55), s2 + vh(.15), HORSE.rear, { rotation: 0, svgOrigin: HORSE.rear.dataset.origin }, { rotation: -25, svgOrigin: HORSE.rear.dataset.origin, ease: 'power2.out' });
    at(s2 - vh(.55), s2 + vh(.15), HORSE.legs[0], { rotation: 0, svgOrigin: HORSE.legs[0].dataset.origin }, { rotation: 45, svgOrigin: HORSE.legs[0].dataset.origin });
    at(s2 - vh(.55), s2 + vh(.15), HORSE.legs[1], { rotation: 0, svgOrigin: HORSE.legs[1].dataset.origin }, { rotation: 28, svgOrigin: HORSE.legs[1].dataset.origin });
    at(s2 - vh(.55), s2 + vh(.15), HORSE.head, { rotation: 0, svgOrigin: HORSE.head.dataset.origin }, { rotation: -12, svgOrigin: HORSE.head.dataset.origin });
    at(s2 + vh(.05), s2 + vh(.8), sun2.d, { x: 0 }, { x: sunPath[2][0] * innerWidth / 100 });
    at(s2 + vh(.05), s2 + vh(.42), sun2.d, { y: 0 }, { y: sunPath[1][1] * VH / 100, ease: 'sine.out' });
    at(s2 + vh(.42), s2 + vh(.8), sun2.d, { y: sunPath[1][1] * VH / 100 }, { y: sunPath[2][1] * VH / 100, ease: 'sine.in' });
    at(s2 + vh(.25), s2 + vh(.85), shadow.d, { scaleX: 1, opacity: 1 }, { scaleX: -.35, opacity: 0, ease: 'power1.in' });
    at(s2 + vh(.75), s2 + vh(1.05), HORSE.rear, { rotation: -25, svgOrigin: HORSE.rear.dataset.origin }, { rotation: 0, svgOrigin: HORSE.rear.dataset.origin, ease: 'power2.inOut' });
    at(s2 + vh(.75), s2 + vh(1.0), HORSE.legs.slice(0, 2), { rotation: (i) => [45, 28][i] }, { rotation: 0 });
    at(s2 + vh(.8), s2 + vh(1.1), HORSE.head, { rotation: -12, svgOrigin: HORSE.head.dataset.origin }, { rotation: 16, svgOrigin: HORSE.head.dataset.origin, ease: 'power2.out' });

    // 3 · the swords come in and lock; then the map tears in, large, and the route starts
    const s3 = sec(2);
    at(s3 - vh(.6), s3 + vh(.1), swordL.d, { x: -innerWidth * .5, rotation: -50, opacity: 0 }, { x: 0, rotation: -30, opacity: 1, ease: 'power3.out' });
    at(s3 - vh(.6), s3 + vh(.1), swordR.d, { x: innerWidth * .5, rotation: 50, opacity: 0 }, { x: 0, rotation: 30, opacity: 1, ease: 'power3.out' });
    at(s3 + vh(1.05), s3 + vh(1.35), [swordL.d, swordR.d], { opacity: 1 }, { opacity: .25 });

    const mw = mapEl.offsetWidth, mh = mapEl.offsetHeight;
    const bigScale = phone ? 1 : Math.min(innerWidth * .62 / mw, (VH * .78) / mh);
    const rightGap = parseFloat(getComputedStyle(mapEl).right);
    const topGap = parseFloat(getComputedStyle(mapEl).top);
    const bigX = -((innerWidth - mw * bigScale) / 2 - rightGap);
    const bigY = (VH - mh * bigScale) / 2 - topGap;
    root.style.setProperty('--map-h', (mh + topGap) + 'px');
    root.classList.add('has-map');

    const routeObj = { len: 0 };
    const routeTo = (a, b, fromI, toI) => master.fromTo(routeObj, { len: M.lengths[fromI] }, { len: M.lengths[toI], duration: b - a, immediateRender: false, onUpdate: () => setRoute(routeObj.len) }, a);
    const landIn = (a, k) => at(a, a + vh(.3), M.lands[k], { opacity: 0, scale: .9, rotation: -3, transformOrigin: '50% 50%' }, { opacity: .92, scale: 1, rotation: 0, ease: 'power3.out' });

    gsap.set(mapEl, { autoAlpha: 0, x: bigX, y: bigY + 40, scale: bigScale * .92, rotation: -5 });
    Object.entries(M.lands).forEach(([k, g]) => gsap.set(g, { opacity: k === 'greece' ? .92 : 0, x: 0, y: 0, rotation: 0, scale: 1, transformOrigin: '50% 50%' }));
    setRoute(0);
    const mapIn = s3 + vh(.95);
    at(mapIn, mapIn + vh(.2), mapEl, { autoAlpha: 0, x: bigX, y: bigY + 40, scale: bigScale * .92, rotation: -5 }, { autoAlpha: 1, x: bigX, y: bigY, scale: bigScale, rotation: 0, ease: 'power3.out' });
    landIn(mapIn + vh(.15), 'anatolia');
    routeTo(mapIn + vh(.12), mapIn + vh(.62), 0, 3);
    const s4 = sec(3);
    at(s4 - vh(.95), s4 - vh(.5), mapEl, { x: bigX, y: bigY, scale: bigScale, rotation: 0 }, { x: 0, y: 0, scale: 1, rotation: 0, ease: 'power2.inOut' });

    // 4 · route on to Persepolis, the empire turns terracotta, the columns burn and crumble
    landIn(s4 - vh(.15), 'persia');
    routeTo(s4 - vh(.3), s4 + vh(1.0), 3, 8);
    columns.forEach((c, i) => {
      c.flames.forEach((f, n) => at(s4 - vh(.1) + (i + n) * vh(.05), s4 + vh(.45) + (i + n) * vh(.05), f, { scaleY: 0, transformOrigin: '50% 100%' }, { scaleY: 1, transformOrigin: '50% 100%', ease: 'power2.out' }));
      c.drums.forEach((d, n) => {
        const r = rng(i * 20 + n), a = s4 + vh(.7) + (4 - n) * vh(.04) + i * vh(.06);
        at(a, a + vh(.35), d, { y: 0, x: 0, rotation: 0, opacity: 1, transformOrigin: '50% 50%' },
          { y: 140 + (4 - n) * 22 + r() * 30, x: (r() - .5) * 60, rotation: (r() - .5) * 90, opacity: 0, ease: 'power2.in' });
      });
      c.flames.forEach((f, n) => at(s4 + vh(1.05), s4 + vh(1.35), f, { opacity: 1 }, { opacity: 0 }));
    });

    // 5 · route through Central Asia to India and back; the elephants stomp across
    const s5 = sec(4);
    landIn(s5 - vh(.15), 'east');
    routeTo(s5 - vh(.3), s5 + vh(.75), 8, 11);
    routeTo(s5 + vh(.75), s5 + vh(1.2), 11, 12);
    elephants.forEach((e, i) => at(s5 - vh(.7) - i * vh(.12), s5 + vh(1.5) - i * vh(.12), e.d, { x: -innerWidth * .3 }, { x: innerWidth * 1.15 }));

    // 6 · back to Babylon; full empire for a moment, then it tears apart; the bar takes over
    const s6 = sec(5);
    routeTo(s6 - vh(.6), s6 - vh(.15), 12, 13);
    const r = rng(5);
    Object.values(M.lands).forEach(g => at(s6 + vh(.3), s6 + vh(.75), g, { x: 0, y: 0, rotation: 0 }, { x: (r() - .5) * 260, y: (r() - .5) * 160, rotation: (r() - .5) * 30, ease: 'power2.out' }));
    at(s6 + vh(.6), s6 + vh(.95), mapEl, { autoAlpha: 1, rotation: 0 }, { autoAlpha: 0, rotation: 4 });

    const bar = document.querySelector('.timebar');
    at(s6 - vh(.2), s6 + vh(.05), bar, { autoAlpha: 1, y: 0 }, { autoAlpha: 0, y: 10 });
    at(s6 - vh(.12), s6 + vh(.25), big, { autoAlpha: 0, scaleY: .08 }, { autoAlpha: 1, scaleY: 1, ease: 'power3.out' });
    const bc = { c: 0 };
    master.fromTo(bc, { c: 0 }, { c: TSTOPS.length - 1, duration: vh(1.5), ease: 'power2.inOut', immediateRender: false, onUpdate: () => setBig(bc.c) }, s6 + vh(.25));
    at(s6 + vh(1.72), s6 + vh(1.88), stamp, { opacity: 0, scale: 1.6, rotation: -16 }, { opacity: 1, scale: 1, rotation: -8, ease: 'power3.out' });

    // 7 · the bar shrinks back, full
    const s7 = sec(6);
    at(s7 - vh(.9), s7 - vh(.55), big, { autoAlpha: 1, scaleY: 1 }, { autoAlpha: 0, scaleY: .08, ease: 'power2.in' });
    at(s7 - vh(.6), s7 - vh(.3), bar, { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, ease: 'power3.out' });

    // the slim bar: 356 → 336 → 334 → 330 → 325, then full in section 7
    const bp = { p: 0, done: 0 };
    const seg = (a, b, p0, p1) => master.fromTo(bp, { p: p0 }, { p: p1, duration: b - a, immediateRender: false, onUpdate: () => setBar(bp.p, bp.done) }, a);
    seg(0, sec(1), 0, barPct(336));
    seg(sec(1), sec(2), barPct(336), barPct(334));
    seg(sec(2), sec(4) - vh(1), barPct(334), barPct(330));
    seg(sec(4) - vh(1), sec(5) - vh(1), barPct(330), barPct(325));
    master.fromTo(bp, { done: 0 }, { done: 1, duration: 1, immediateRender: false, onUpdate: () => setBar(bp.done ? 1 : bp.p, bp.done > .5) }, s7 - vh(.6));
    master.set({}, {}, max);

    master.scrollTrigger = ScrollTrigger.create({ start: 0, end: () => ScrollTrigger.maxScroll(window), scrub: .6, animation: master });
    setBar(0, false);
  }

  /* reduced motion: still collages, everything readable, no loops and no video */
  function stillCollage() {
    measure();
    gsap.set('#rider', { x: () => innerWidth * (isPhone() ? .3 : .45) });
    gsap.set(R1.rear, { rotation: -25, svgOrigin: R1.rear.dataset.origin });
    gsap.set(R1.swordArm, { rotation: -55, svgOrigin: R1.swordArm.dataset.origin });
    gsap.set('#rider2', { x: () => innerWidth * (isPhone() ? .3 : .4) });
    gsap.set(R2.rear, { rotation: -25, svgOrigin: R2.rear.dataset.origin });
    gsap.set(R2.swordArm, { rotation: -55, svgOrigin: R2.swordArm.dataset.origin });
    gsap.set(HORSE.head, { rotation: 16, svgOrigin: HORSE.head.dataset.origin });
    gsap.set(sun2.d, { x: innerWidth * (isPhone() ? .42 : .33), y: -VH * .03 });
    gsap.set(shadow.d, { opacity: 0 });
    gsap.set(swordL.d, { rotation: -30 }); gsap.set(swordR.d, { rotation: 30 });
    gsap.set(elephants.map(e => e.d), { x: innerWidth * .5 });
    setRoute(M.L);
    Object.values(M.lands).forEach(g => gsap.set(g, { opacity: .92 }));
    const bar = document.querySelector('.timebar');
    setBig(TSTOPS.length - 1); gsap.set(stamp, { opacity: 1, rotation: -8 });
    gsap.set(mapEl, { autoAlpha: 0 }); gsap.set(big, { autoAlpha: 0, scaleY: 1 });
    root.style.setProperty('--map-h', (mapEl.offsetHeight + 10) + 'px'); root.classList.add('has-map');
    const show = (k0, k1, on, off) => ScrollTrigger.create({ start: () => S[k0] - VH * .5, end: () => S[k1] - VH * .5, onToggle: s => (s.isActive ? on() : off()) });
    show(3, 5, () => gsap.set(mapEl, { autoAlpha: 1 }), () => gsap.set(mapEl, { autoAlpha: 0 }));
    show(5, 6, () => { gsap.set(big, { autoAlpha: 1 }); gsap.set(bar, { autoAlpha: 0 }); }, () => { gsap.set(big, { autoAlpha: 0 }); gsap.set(bar, { autoAlpha: 1 }); });
    const RM_BAR = [0, barPct(336), barPct(334), barPct(330), barPct(325), 1, 1];
    const rmBar = () => { const y = scrollY + VH * .5; let k = 0; S.forEach((s, i) => { if (y >= s) k = i; }); setBar(RM_BAR[k], k === 6); };
    addEventListener('scroll', rmBar, { passive: true }); rmBar();
  }

  /* ───────── boot ───────── */
  function boot() {
    drawScenery();
    drawPapers();
    measure();
    if (RM) {
      stillCollage();
    } else {
      lenis = new Lenis({ lerp: .1 });
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(t => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
      buildStory();
      startTimers();
      wireVideos();
    }
    ScrollTrigger.sort();
    ScrollTrigger.refresh();

    let lastW = innerWidth, lastH = innerHeight, t;
    addEventListener('resize', () => {
      clearTimeout(t);
      t = setTimeout(() => {
        if (innerWidth === lastW && Math.abs(innerHeight - lastH) < 120) return;
        lastW = innerWidth; lastH = innerHeight;
        drawScenery(); drawPapers(); measure();
        if (!RM) buildStory();
        ScrollTrigger.refresh();
      }, 200);
    });
    document.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const y = target.offsetTop;
      lenis ? lenis.scrollTo(y, { duration: 1.6 }) : scrollTo(0, y);
    }));
  }
  (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(boot);
})();
