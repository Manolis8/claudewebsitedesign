#!/usr/bin/env node
/* Design-jury screenshots: scroll like a person, let animations settle, capture every section.
   Usage: node shoot.js URL [WIDTH=1440] [HEIGHT=900] [TAG=d] [OUTDIR=shots] [--reduced-motion]
   Captures the hero, then each <section>/<footer> top (and the pinned section at 0/45/97%),
   and prints: JS errors, horizontal overflow, page height and loaded fonts.
   Needs Playwright (local `npm i playwright` or a global install). */
let pw;
try { pw = require('playwright'); } catch { pw = require('/usr/local/lib/node_modules/playwright'); }
const fs = require('fs');

const [url, W = 1440, H = 900, tag = 'd', out = 'shots'] = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const reduced = process.argv.includes('--reduced-motion');
if (!url) { console.error('usage: node shoot.js URL [W] [H] [TAG] [OUTDIR] [--reduced-motion]'); process.exit(1); }

(async () => {
  fs.mkdirSync(out, { recursive: true });
  const w = +W, h = +H, mobile = w < 600;
  const b = await pw.chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH, args: ['--headless=new'] } : {});
  const p = await b.newPage({ viewport: { width: w, height: h }, isMobile: mobile, hasTouch: mobile, reducedMotion: reduced ? 'reduce' : 'no-preference' });
  const errs = [];
  p.on('pageerror', (e) => errs.push('PAGEERROR ' + e.message));
  p.on('console', (m) => m.type() === 'error' && !/Failed to load resource/.test(m.text()) && errs.push('CONSOLE ' + m.text()));
  await p.goto(url, { waitUntil: 'networkidle' });
  await p.waitForTimeout(3500);
  const shot = (name) => p.screenshot({ path: `${out}/${tag}-${name}.jpg`, type: 'jpeg', quality: 62 });
  await shot('00-hero');

  const wheelTo = async (y) => {
    for (let i = 0; i < 500; i++) {
      const cur = await p.evaluate(() => window.scrollY);
      if (Math.abs(cur - y) < 30) break;
      const d = Math.max(-260, Math.min(260, y - cur));
      if (mobile) await p.evaluate((dd) => window.scrollBy(0, dd), d); else await p.mouse.wheel(0, d);
      await p.waitForTimeout(45);
    }
    await p.waitForTimeout(2300);
  };

  // Section tops are read live because pin spacers shift everything below them.
  const count = await p.evaluate(() => document.querySelectorAll('main > section, main > .pin-spacer > section, body > footer').length);
  for (let i = 1; i < count; i++) {
    const info = await p.evaluate((k) => {
      const el = document.querySelectorAll('main > section, main > .pin-spacer > section, body > footer')[k];
      const pin = window.ScrollTrigger && ScrollTrigger.getAll().find((t) => t.pin && (t.trigger === el || el.contains(t.trigger)));
      return { y: el.getBoundingClientRect().top + scrollY, name: el.id || el.className.split(' ')[0], pin: pin ? [pin.start, pin.end] : null };
    }, i);
    const label = String(i).padStart(2, '0') + '-' + info.name;
    if (info.pin && !mobile) {
      for (const [f, s] of [[0.02, 'a'], [0.45, 'b'], [0.97, 'c']]) { await wheelTo(info.pin[0] + (info.pin[1] - info.pin[0]) * f); await shot(label + s); }
    } else { await wheelTo(info.y); await shot(label); }
  }
  await wheelTo(await p.evaluate(() => document.documentElement.scrollHeight - innerHeight));
  await shot('99-end');

  const meta = await p.evaluate(() => ({
    overflowX: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    height: document.documentElement.scrollHeight,
    triggers: window.ScrollTrigger ? ScrollTrigger.getAll().length : 0,
    fonts: [...new Set([...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family))].join(', '),
  }));
  console.log(`[${tag} ${w}x${h}${reduced ? ' reduced-motion' : ''}]`, JSON.stringify(meta));
  console.log(errs.length ? errs.join('\n') : 'no errors');
  await b.close();
})();
