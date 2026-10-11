# Motion system & template code map

The template (`assets/template/`) is the Haven homepage. Stack: static HTML/CSS/JS, GSAP 3.13 (ScrollTrigger, SplitText), Lenis 1.3. No build step.

## Rules (one consistent "breeze")
- Eases: `expo.out` default, `power3.out` for fades; durations 0.8–1.4 s (hero intro up to 2.6 s). No back/elastic/bounce.
- Every headline: SplitText `type: 'lines,words', mask: 'lines'`, words `yPercent: 115 → 0`, stagger ≈0.06.
- Images reveal through an organic clip-path (grass-blade polygon rising) + inner scale 1.28 → 1 + parallax inside the frame.
- One pinned scroll section that tells the product story step by step (horizontal track, `containerAnimation` for inner reveals, a stem line drawn with stroke-dashoffset).
- Background colour follows the story: every section has `data-bg`; scrubbed tweens move `body` background between neighbours.
- Edge decorations are SVG strokes: drawn with scroll progress, idle sway (`sine.inOut`, 4–7 s yoyo), bend away from the cursor. Sparse, decorative, `aria-hidden`, hidden < 900 px, dimmed while content slides under them.
- Custom cursor (fine pointers only, hidden until first move) + magnetic buttons (`quickTo`, power3.out).
- Animate only transform/opacity (plus the clip-path during reveals, then set it to `none`).

## Where things live in `main.js`
| Block | What it does |
|---|---|
| Smooth scroll | Lenis wired into `gsap.ticker`; anchor links use `lenis.scrollTo` |
| Reduced motion | early return: posters, short opacity fades only |
| Lazy ambient videos | IntersectionObserver adds `<source>` from `data-mp4`, plays/pauses |
| `revealWords` | masked word reveal for every `.split` |
| `heroIntro` | blur-in video, line-by-line title, staggered UI |
| hero scrub | `.hero__media` scale 1→1.18 + drift, content fades |
| `blades` / `grassReveal` | clip-path reveal helper (defined before the pin, which uses it) |
| Pinned story | `mm.add('(min-width: 901px)')` — **must come before the bg/fill/fade triggers** |
| bg journey | `data-bg` scrubbed colour tweens |
| `.fill` | statement words opacity .2 → 1 scrubbed |
| Edges | stroke draw, sway, cursor bend, seed fluff |
| Cursor/magnetic/ripple | pointer-fine only |
| Boot | after `document.fonts.ready`: hero intro, splits, `ScrollTrigger.sort()`, refresh |

## Adapting the template
1. Replace copy, `data-bg` colours, CSS tokens in `:root`, fonts link.
2. Replace media URLs (search for `cloudfront`), keep `srcset`/`sizes`, `width`/`height` attributes (prevents layout shift).
3. Swap the edge SVG paths for the new world (stems → e.g. light rays, waves, threads). Keep them thin and sparse.
4. Keep the section skeleton (hero → intro visual → statement → pinned story → bento → quote → finale footer) unless the layout reference says otherwise.
