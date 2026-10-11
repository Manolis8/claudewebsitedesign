---
name: cinematic-website
description: End-to-end process for designing, building, reviewing and shipping an Awwwards-level cinematic website (calm or bold, nature, product, studio, portfolio) — art direction from a hero image, AI-generated imagery and seamless video loops with Higgsfield, a GSAP + ScrollTrigger + SplitText + Lenis static build, a screenshot-based design-jury review loop, and a live Vercel deploy. Use this whenever the user wants a "cool looking", "stunning", "cinematic", "Awwwards", "Site of the Day", scroll-animated or video-hero website or landing page, wants to "make a site like Haven", hands over a hero image or layout reference video to turn into a site, or asks for a repeatable process for designing beautiful websites — even if they don't name any of these tools.
---

# Cinematic website

A repeatable pipeline that produced **Haven** (a meadow-themed AI design studio homepage, live on Vercel). It has six phases. Each phase ends with a small, concrete artifact so the work stays accountable and the person can steer early:

| # | Phase | Artifact |
|---|---|---|
| 1 | Brief & inputs | one-sentence brief + collected inputs |
| 2 | References | ~10 references with *mechanisms* |
| 3 | Art direction | `ART-DIRECTION.md` (palette, type, mood, section table) |
| 4 | Assets | stills + seamless loops on a CDN, `ASSETS.md` with prompts & credits |
| 5 | Build | static site in `site/` from `assets/template/` |
| 6 | Jury review → deploy | ≥2 scored review rounds, then a live URL |

Why this order: the expensive parts (paid generations, code) come after cheap decisions (brief, palette, section plan) are locked. Most "AI-looking" sites skip phases 2–3 and it shows.

---

## Phase 1 — Brief & inputs

Get, in one batched question if anything is missing:
- **What it is** (product/brand, audience) and the **one metaphor** the page carries (Haven: "design grows like nature; AI is the breeze"). The metaphor drives copy, imagery *and* motion — everything should be explainable by it.
- **3–4 mood words** (e.g. calm, cinematic, editorial).
- **Hero image** (the visual DNA) and optionally a **layout reference** (screenshot or screen recording of a site whose structure they like).

For a reference video, extract a contact sheet to read its structure: `ffmpeg -i ref.mp4 -vf "fps=2,scale=480:-1,tile=4x4" -frames:v 1 sheet.jpg`. Keep the reference's *structure and rhythm*, replace its *style* with the hero image's.

## Phase 2 — References

If the `cinematic-design-research` skill is available, run it. Otherwise: search Awwwards (Sites of the Day, matching category), motionsites.ai prompts, and film-still moods. For each reference write **one line on the mechanism** ("scroll moves the scene from dawn to night"), never "looks cool". Pinterest blocks automated fetching — ask the person for a board instead. If sites can't be fetched (network policy), say so and use web search results; don't invent content.

## Phase 3 — Art direction (write before any code)

Create `ART-DIRECTION.md`:
1. **Palette** — sample it from the hero image with `scripts/palette.py <image>` (prints point samples + a quantized palette). Pick 5–7 tokens with roles: background(s), ink, one accent, one dark for the finale. Check text contrast (≥4.5:1 body).
2. **Type** — an editorial serif for huge headlines + a clean grotesk for body (+ optional mono for labels). Haven: Instrument Serif / Inter Tight / JetBrains Mono (all Google Fonts).
3. **Mood statement** — one paragraph.
4. **Section table** — headline, sub-copy, visual, motion for every section. Map the layout reference's sections onto the metaphor. If you change the reference, say why in one line.
5. **One signature move** — the bespoke thing people remember (Haven: background colour follows the time of day, morning → golden hour → dusk). Everything else stays quiet.

Show the person the art direction before spending credits.

## Phase 4 — Assets (Higgsfield)

Read `references/higgsfield-assets.md` before generating — it has the prompt templates, model choices, costs, the loop-measuring/crossfade procedure and the upload steps. The short version:

1. **Quote credits first** (`balance` + `get_cost: true`) and list every prompt with its expected cost. Generate only after the person agreed (an explicit "go" in the brief counts).
2. **Hero plate**: if the given hero is small or has UI baked in, regenerate a clean 16:9 2K plate from a detailed description (2 variants, pick the closest).
3. **Hero loop**: image-to-video with the plate as *both* start and end frame, locked camera, gentle motion, no audio, 2 variants. **Measure, don't eyeball**: `scripts/measure_loop.py` reports motion amount, sky stillness and seam jump. Pick the variant with visible motion; then make it seamless with `scripts/make_loop.sh` (crossfade tail into head).
4. **Section stills**: same light/grade by passing the hero plate as a style reference ("use the reference only for light, colour grade and mood"). One distinct image per section — don't reuse.
5. **Ambient loops** (1–2): footer + one card, same start=end trick.
6. **Encode**: H.264 MP4 (1920 + 1280 mobile), WebP stills at 800/1600 w, WebP posters from the first loop frame. Upload to a CDN and wire URLs into the HTML.
7. Write `ASSETS.md`: every prompt, the variant picked and why, credits spent.

## Phase 5 — Build

Start from `assets/template/` (the Haven site: `index.html`, `styles.css`, `main.js`). It already implements the whole motion system; adapt content, tokens and sections rather than starting from zero. Vendor libraries with npm (`gsap@3.13.0` includes SplitText; `lenis@1.3.4`) into `site/vendor/`.

Read `references/motion-system.md` for the rules and the code map. Non-negotiables, each learned the hard way:
- Long soft ease-outs (expo/power3.out), 0.8–1.4 s, staggered words, nothing bouncy.
- **Create the pinned ScrollTrigger before any trigger below it on the page** (and call `ScrollTrigger.sort()` before refresh) — otherwise every colour change/reveal after the pin fires far too early.
- `prefers-reduced-motion`: posters instead of video, simple fades, no pin.
- Mobile: no pin (stack), hide edge decorations, no horizontal scroll.
- Real text, keyboard focus styles, contrast over video (soft veil behind headlines).

## Phase 6 — Design-jury review, then deploy

**Review like an Awwwards juror, with real screenshots — never from the code alone.** Use `scripts/shoot.js` (Playwright): it wheel-scrolls like a person, waits for animations, captures every section at desktop 1440×900 and mobile 390×844, and reports JS errors, horizontal overflow and loaded fonts. Score each section /10 (design, usability, creativity, content), list the 5 weakest points, fix, re-shoot. Do **at least two rounds**; stop only when every section looks intentional. `references/jury-checklist.md` lists the failures that actually showed up on Haven — check them every round.

If the local machine can't load the CDN media or fonts (network policy), run the review where it can (e.g. the Higgsfield sandbox: write files there as plain-text heredocs; it refuses base64 blobs). Headless Chromium can't play H.264, so screenshots show posters — say so.

**Deploy to Vercel** (static, no build): put `vercel.json` (`assets/template/vercel.json.example`, `outputDirectory: "site"`) at the repo root, push, then either
- **Vercel connector**: `create_project` with `gitRepository` → `create_deployment` with `gitSource` + `target: "production"` → `get_deployment` until READY. If calls with an explicit `teamId` return 403 "not authorized for scope", retry *without* teamId — that worked.
- or the person imports the repo at vercel.com/new (Framework: Other).

Then **verify publicly** from a clean browser: 200s for page/CSS/JS/vendor, no console errors, ScrollTrigger count > 0, screenshot the hero. Report the real URL (`<name>.vercel.app` is often taken → Vercel adds a suffix).

---

## Guardrails
- Paid generations: always quote first. Never generate fake work a client would present as real (e.g. fake portfolio pieces, fake reviews).
- Don't touch other Vercel projects, env vars or domains without explicit approval.
- Commit and push after each phase — cloud containers are ephemeral.
- Report honestly what wasn't verified (Lighthouse, video playback in headless, WebM not shipped, etc.).
