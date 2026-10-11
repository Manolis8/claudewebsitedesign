# Tattoo Studio Website: Plan

**Goal:** make one homepage, good enough for Awwwards, for a tattoo studio that has a 4.9★ Google rating, an Instagram account and no website. Use it as a spec pitch: show the homepage, ask what they want, then hand them a full plan and quote.

**Status:** planning only. Nothing gets built until Phase 2 is signed off.

---

## Phase 0: What I need from you (blocking)

| # | Item | Why |
|---|------|-----|
| 1 | Studio name + city | Sets the tone, the language (EN/NL/GR?) and local SEO |
| 2 | Google Maps link | To pull the rating, review count and the best review quotes |
| 3 | Instagram handle | To pull their style, artists and best pieces |
| 4 | The tattoo photos you have (full resolution if possible) | They are the star of the site. Quality decides everything |
| 5 | Artists: how many, names, specialties (fine-line, blackwork, realism, traditional...) | Decides whether the homepage is "one studio" or "a roster" |
| 6 | Your Pinterest board(s), 15–30 pins | Pinterest blocks automated fetching, so you collect these yourself |

## Phase 1: Research (about 1 evening)

1. **Pinterest (you):** make a board called `tattoo-site-mood` with 3 sections:
   - *Type & posters*: condensed serif and blackletter type, film posters, flash sheets
   - *Photography*: moody studio shots, macro skin and ink, grainy film colour grades
   - *Layouts*: editorial magazine spreads, portfolio grids
2. **Awwwards (me):** look through `awwwards.com/websites/tattoo/`, `/fashion/`, `/portfolio/` and the Sites of the Day. Tattoo entries already listed there to start from:
   - Momday Club Tattoo: about, artists and contact sections by byfugu.com
   - Wonderkin Tattoo: gallery element
   - La Tatuajería: desktop element by Dominiozero
   For each site, write **one line on the mechanism that makes it work**, not "looks cool".
3. **motionsites.ai (me):** pull 2–3 prompts each for hero, gallery and CTA. Read them for structure (how they describe motion and pacing). Don't paste them verbatim.
4. **Google Maps (me, from the link):** rating, review count, and the 6–10 best quotes. Tag each quote by theme (*hygiene*, *made me feel at ease*, *fine detail*, *cover-up saved*, *healed well*). The themes become the site's copy angles.
5. **Instagram (me):** pick the 12–20 strongest pieces and group them by style and artist. Note which ones get the most likes, since those prove what people want.

**Output:** `STYLE-BRIEF.md` with mood, palette (hex + role), type pairing, ONE signature move, and about 10 references, each with its mechanism.

## Phase 2: Pick a direction (you choose 1 of 3)

| Direction | Mood | Palette | Type | Signature move |
|---|---|---|---|---|
| **A · Darkroom** (cinematic) | moody, intimate, confident | near-black `#0E0D0C`, bone `#EDE6DA`, one ink-red accent `#9E1B1B` | condensed serif display (e.g. *PP Editorial*, *Canela Condensed*) + grotesk body | Hero video of ink blooming in water and needle macro. Gallery images "ink-bleed" in on scroll (WebGL displacement) |
| **B · Flash Sheet** (traditional, playful) | bold, graphic, warm | paper `#F1E9D8`, black, red, mustard | heavy display serif / blackletter + mono | Homepage laid out as a living flash sheet. Hovering a piece shows the healed photo |
| **C · Editorial** (fine-line, gallery-like) | quiet, premium, airy | off-white, graphite, a single sage or rust | high-contrast serif + thin grotesk | Big negative space and a horizontal scroll gallery like turning magazine pages |

Pick based on **their actual work**. Blackwork and realism suit A, traditional suits B, fine-line suits C.

## Phase 3: Assets

- **Their photos come first.** Clean them up: same colour grade on all, Higgsfield upscale for low-res IG crops, crop to consistent ratios. **Never generate fake tattoo work.** It's dishonest and clients will notice.
- **Higgsfield for atmosphere only:** a 6–8 s hero loop (ink in water, needle in slow motion, studio light through smoke), plus texture plates (paper grain, skin macro). Prompts quote the hex palette and mood from the brief. **I'll quote the credit cost before generating anything.**
- **Fonts:** licensed or free foundry alternatives (Google Fonts / Fontshare).

## Phase 4: Homepage structure (draft, to adjust after the brief)

1. **Preloader:** studio logo drawn as a single needle line (≤1.5 s)
2. **Hero:** full-bleed video, a huge studio name, one line of copy, `Book a consult` button
3. **Proof strip:** `4.9★ · N reviews on Google` with a marquee of short real quotes
4. **The work:** gallery with filters by style and artist. This is where the signature move goes
5. **Artists:** portraits with a specialty, and hovering shows their best piece
6. **Process:** idea → consult → design → session → aftercare, 4–5 steps that reveal on scroll
7. **Reviews:** 3 long quotes, large editorial type, first name + date
8. **Studio:** photos of the space, hygiene and safety note (the thing nervous first-timers look for)
9. **Contact / booking:** form (idea, placement, size, reference upload, budget), Instagram DM link, map, hours
10. **Footer:** big type, socials, address

**Stack:** Next.js (or plain Vite) + GSAP ScrollTrigger + Lenis smooth scroll, plus three.js/OGL only for the signature effect. Deploy on Vercel or Higgsfield. Most of their traffic will come from Instagram, so **build mobile-first**. Targets: Lighthouse ≥90, LCP <2.5 s, `prefers-reduced-motion` supported.

## Phase 5: Pitch

1. Deploy to an **unlisted** URL. It uses their name and photos, so don't make it public until they agree.
2. Send a short Instagram DM, then visit in person with the homepage on a phone.
3. Ask them a short questionnaire:
   - Booking: DM only, form, deposit, or a calendar (Calendly / Fresha / Setmore)?
   - Pages: artists, aftercare, FAQ, pricing guide, flash/available designs, gift cards?
   - Languages? Domain name? Who updates the gallery?
4. Send the full plan: sitemap, timeline, price (build + monthly care), based on their answers.

## Definition of "best-looking"

- [ ] The tattoos are the hero. The design frames them and never competes with them
- [ ] One signature interaction, done perfectly, instead of ten gimmicks
- [ ] Real reviews and real numbers, no lorem ipsum, no stock tattoos
- [ ] Type at poster scale and one accent colour
- [ ] Feels smooth on a mid-range phone
- [ ] Booking takes ≤3 taps from anywhere

## Sources and notes

- In this cloud environment, awwwards.com and motionsites.ai couldn't be fetched directly (blocked by the network policy). The references above came from web search. The full live pass happens in Phase 1.
- Tattoo entries on Awwwards: [Momday Club, about](https://www.awwwards.com/inspiration/about-the-studio-momday-club-tattoo), [Momday Club, contact](https://www.awwwards.com/inspiration/contact-us-momday-club-tattoo), [Wonderkin gallery](https://www.awwwards.com/inspiration/gallery-wonderkin-tattoo)
- Common patterns in tattoo templates (to *avoid* copying, but useful as a baseline): [WHANGOD (Framer)](https://www.framer.com/marketplace/templates/whangod-tattoo/), [Inked Soul (Framer)](https://www.framer.com/marketplace/templates/74473/)
- motionsites.ai overview: [rar.design review](https://rar.design/posts/motionsites-ai-prompt-library)
