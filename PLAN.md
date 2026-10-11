# Cinematic Nature Website: Plan

**Goal:** a calm, cinematic, nature-led website at Awwwards level. It's a showcase piece for the portfolio, and the same template can later be pitched to real retreats, cabins, spas and wellness brands.

**Status:** planning only. Nothing gets built until Phase 2 is signed off.

---

## Phase 0: The concept (decide first)

A nature site needs a *subject*, otherwise it ends up as pretty pictures with nothing to hold them together. Three options:

| # | Concept | What it is | Good for pitching to |
|---|---------|------------|----------------------|
| **A** | **A day in the valley** *(recommended)* | A fictional cabin retreat, e.g. "Stillwater". Scrolling the homepage takes you **from dawn to night** in one landscape | retreats, cabins, glamping, eco-hotels |
| B | **Breathe** | A meditation/slow-living experience. The page breathes with you (inhale/exhale pacing, sound) | wellness apps, yoga studios, spas |
| C | **Field notes** | An editorial journal of one place through 4 seasons, like a photo book | photographers, outdoor brands, tourism boards |

A is the strongest pick. It has an obvious signature move (time of day = scroll), it's easy to understand in 5 seconds, and it maps directly onto paying clients.

## Phase 1: Research (about 1 evening)

Follow the `/cinematic-design-research` skill.

1. **Pinterest (you):** make a board called `calm-cinematic` with 3 sections:
   - *Light*: fog at dawn, golden hour through trees, blue hour lakes, film grain
   - *Type & layout*: quiet editorial spreads, film title cards, big serif with lots of empty space
   - *Texture*: paper, moss, water surface, linen
2. **Awwwards (me):** look through `/websites/sites_of_the_day/`, `/websites/architecture/` and `/websites/hotel-restaurant/`, filtered for calm and nature. Starting references:
   - [Rainforest Food by Immersive Garden](https://immersive-g.com/projects/rain-forest-food): Site of the Day and Site of the Month. WebGL photo montage and sound tie a product to nature
   - [Ark Shelter, Nature](https://www.awwwards.com/inspiration/ark-shelter-nature): an architecture cabin brand, close to concept A
   - [Nature Parallax](https://www.awwwards.com/inspiration/nature-parallax-project-parallax) and [Soul Aether cinematic transitions](https://www.awwwards.com/inspiration/cinematic-transitions-soul-aether): layering and transitions
   - [Hybrid Forest (Maxon)](https://www.maxon.net/es/article/studio-website-in-3d): the whole site lives inside one 360° landscape
   - [Ocean scroll shader (Framer)](https://www.framer.com/marketplace/components/ocean-scroll-shader/): scroll moves the scene from dawn to midday to night. This is the exact mechanism for concept A
   For each site, write **one line on the mechanism that makes it work**.
3. **motionsites.ai (me):** pull 2–3 prompts each for video hero, scroll storytelling and footer. Read them for how they describe pacing, then rewrite them in our own words.
4. **Film stills (both):** search image sites for "Terrence Malick golden hour" and "Nordic noir landscape grade". The aim is to note the recurring grammar: low sun, haze, desaturated greens and one warm accent.

**Output:** `STYLE-BRIEF.md` with mood, palette (hex + role), type pairing, ONE signature move, and about 10 references, each with its mechanism.

## Phase 2: Provisional style brief (to confirm after research)

- **Mood:** still, warm, unhurried, a bit melancholic
- **Palette:** the colours shift with the time of day, so they're tokens rather than fixed values:
  - Dawn: mist `#DCE3E1`, sage `#9AA89A`, peach light `#E9C9A8`
  - Day: linen `#F2EEE6`, moss `#4F5D45`, ink text `#1E211C`
  - Dusk: amber `#C98A4B`, plum haze `#5A4756`
  - Night: deep pine `#0F1714`, moonlight `#C9D2D6`
- **Type:** a soft high-contrast serif for display (*Canela*, *PP Editorial New*, or the free *Fraunces*) + a quiet grotesk for body (*Inter Tight* / *Satoshi*). Display text at 10–14 vw, with lots of air around it
- **Signature move:** **scroll = time of day.** A Higgsfield-generated landscape video is turned into an image sequence and scrubbed frame by frame as you scroll. Fog lifts, the sun crosses the sky and stars come out, while the UI colours fade between the palette tokens above
- **Supporting details** (kept subtle):
  - Ambient sound, **off by default** with a toggle: birds, then stream, then crickets
  - A cursor that slightly ripples water and haze (WebGL displacement)
  - Slow text reveals line by line, nothing faster than 0.8 s
  - A soft film-grain overlay

## Phase 3: Assets (Higgsfield)

All prompts cite the palette and mood from the brief. **I'll quote the credit cost and get your OK before generating anything.**

1. **Master landscape keyframe:** one valley with a lake, a cabin and a forest, locked as the reference image so every shot matches
2. **Time-of-day video:** dawn → day → dusk → night of that same valley, 4 clips of about 8 s, or one long locked-camera shot. This gets exported as an image sequence (about 150–200 WebP frames, plus a mobile set)
3. **Detail loops:** steam from a mug, a ripple on water, wind in grass, a fire crackling (one per section)
4. **Stills:** cabin interior, hands, a book, texture plates
5. **Sound:** a free licensed ambience (freesound / Epidemic) or Higgsfield audio

## Phase 4: Homepage structure (concept A, "Stillwater")

| # | Section | Time | What happens |
|---|---------|------|--------------|
| 1 | **Intro** | pre-dawn | Black screen, "Put your phone down for a minute" fades in, then a `Enter · sound on/off` button |
| 2 | **Hero** | dawn | Fog lifts off the lake, a huge "Stillwater" title, one line of copy |
| 3 | **The place** | morning | 3 short lines of story that reveal as you scroll, with pinned parallax layers of the trees |
| 4 | **The cabins** | midday | A horizontal scroll of 3 cabins (interior stills + a detail loop) |
| 5 | **Rituals** | afternoon | Sauna, swim, read, walk: a grid of looping videos that come into focus on hover |
| 6 | **Slow quote** | dusk | One full-screen sentence in large serif type |
| 7 | **Stay** | blue hour | Booking call to action: dates, guests, `Check availability` (a dummy for the showcase) |
| 8 | **Footer** | night | Stars, a huge wordmark, "Goodnight." and the socials |

**Stack:** Vite (or Next.js) + GSAP ScrollTrigger + Lenis, with a canvas image sequence for the scrub and OGL/three.js only for the haze and ripple shader. Deploy on Vercel or Higgsfield.

**Performance and access targets:**
- Lighthouse ≥90 and LCP <2.5 s
- Frames are lazy-loaded in chunks, with a smaller set for mobile
- `prefers-reduced-motion` swaps the scrub for crossfading stills
- Sound never autoplays

## Phase 5: Polish and launch

1. Test on a real mid-range phone and on Safari. Most cinematic sites break there
2. Do a pass with the `improve-animations` and `design-taste-frontend` skills, and remove anything that feels templated
3. Write a case-study page (concept, process, Higgsfield workflow) and submit to Awwwards, CSSDA and Godly
4. Reuse it as a pitch template: swap the landscape and copy for a real retreat or spa

## Definition of "best-looking"

- [ ] One signature idea (scroll = time of day), done perfectly
- [ ] Nothing moves fast. Every animation ≥0.8 s with soft easing
- [ ] Same landscape, light and grade in every asset, with no AI "mismatch" between shots
- [ ] Type at poster scale with lots of negative space
- [ ] Smooth at 60 fps on a mid-range phone
- [ ] Still beautiful with motion and sound turned off

## Notes

- In this cloud environment, awwwards.com and motionsites.ai couldn't be fetched directly (blocked by the network policy). The references above came from web search, and the full live pass happens in Phase 1.
- Pinterest blocks automated fetching, so the board is your part.
