# Haven

**A cinematic homepage for an AI design studio, set in one meadow from morning mist to dusk.**

**Live:** [haven-puce-tau.vercel.app](https://haven-puce-tau.vercel.app)

> Design with ease. Great design is like nature: it grows, breathes and feels effortless. AI is the breeze that makes it move.

Haven is a portfolio piece. I made it to show that AI-assisted design can reach Awwwards level when you treat the AI like a studio team with a real process, not like a one-shot prompt box. Everything here, from the art direction to the video loops to the code, was made with Claude and Higgsfield.

---

## What you see when you scroll

The whole page is one walk through one meadow. The background colour follows the light of the day, and every animation uses the same slow, soft "breeze".

| # | Section | Time of day | What moves |
|---|---|---|---|
| 1 | **Hero:** *Design with ease.* | Morning | A seamless video of wildflowers in a breeze fades in from blur. The headline slides up line by line. On scroll you "walk into" the field |
| 2 | **Seed:** *Every great design starts as a seed.* | Mist | The image opens like a curtain of grass parting. Seeds drift off to the right |
| 3 | **Statement:** *Meet Haven.* | Mist to dawn | Words fill from grey to green one by one as you scroll |
| 4 | **How design grows** | Dawn | A pinned section that scrolls sideways through Seed, Sprout, Bloom and Breeze. One stem line draws itself through all four panels |
| 5 | **Features** | Dawn to honey | A bento grid of cards that rise in with a stagger, with magnetic arrow buttons |
| 6 | **Quote** | Golden hour | The background turns honey gold and the quote reveals word by word |
| 7 | **Footer:** *Take a breath.* | Dusk | A dusk meadow loop with fireflies and a lit cottage window. Links ripple on hover |
| ∞ | **Edges** | Always | Thin SVG grass stems and a dandelion on the screen edges draw themselves as you scroll, sway when idle and bend away from your cursor |

It also respects `prefers-reduced-motion` (still posters, no scroll effects), works at phone width with no horizontal scroll, and has no console errors.

## How I made it

I didn't write this site by hand. I directed Claude like a creative studio, step by step, and made the key calls myself.

1. **Brief.** One sentence and one metaphor: *design grows like nature, and AI is the breeze.* Every headline, image and animation had to be explainable by that metaphor.
2. **References.** About 10 Awwwards and motion references. For each one I wrote down *the trick that makes it work*, not just "looks cool". See [PLAN.md](PLAN.md).
3. **Art direction before code.** The palette was sampled straight from the hero image (mist, haze, dawn peach, honey, moss green, one poppy red). Fonts: Instrument Serif, Inter Tight and JetBrains Mono. Then a mood paragraph and a plan for every section. See [ART-DIRECTION.md](ART-DIRECTION.md).
4. **Assets with Higgsfield.** 11 stills and 4 seamless video loops, all in the same light and colour grade, for **168 credits**. Video variants were picked by *measuring* the motion per frame, not by eye, and the loop seams were crossfaded with ffmpeg until they were invisible. Every prompt and cost is in [ASSETS.md](ASSETS.md).
5. **Build.** Plain HTML, CSS and JavaScript with GSAP, ScrollTrigger, SplitText and Lenis smooth scroll. No framework and no build step.
6. **Design-jury review.** Claude took real screenshots on desktop (1440 px) and phone (390 px) and scored every section like an Awwwards juror. Two rounds of fixes took the weakest sections from 6 to 8+ (the full score table is in [ART-DIRECTION.md](ART-DIRECTION.md#jury-review-2-rounds-desktop-1440--mobile-390-real-fonts-and-media)).
7. **Deploy** on Vercel as a static site.

The whole process is saved as a reusable Claude skill, **`cinematic-website`**, so I can make the next site the same way. It lives in [`.claude/skills/cinematic-website/`](.claude/skills/cinematic-website/) and is explained in [WEBSITE-PROCESS.md](WEBSITE-PROCESS.md).

**Tools:** Claude (Claude Code), Higgsfield (GPT Image, FLUX Video, MiniMax), GSAP, Lenis, ffmpeg, Playwright, Vercel.

## Make your own site like this

Open Claude Code in this repo (the skill loads automatically) and say:

> Make me a cinematic website for **[what it is]**. Mood: **[3–4 words]**. Here's my hero image [attach] and a site whose layout I like [attach a screen recording or link].

Bring a great hero image (high resolution, no text), a layout reference, real words for the copy, and about 150–200 Higgsfield credits. Claude checks in with you before it spends any credits.

## Run it locally

```bash
git clone https://github.com/Manolis8/claudewebsitedesign
cd claudewebsitedesign/site
python3 -m http.server 8080
# open http://localhost:8080
```

Images and videos load from the Higgsfield CDN, so you need an internet connection.

## Files

```
site/                  the website (index.html, styles.css, main.js, vendor/ GSAP + Lenis)
vercel.json            serves site/ as a static site
PLAN.md                the first plan and the references
ART-DIRECTION.md       palette, type, mood, section plan, jury scores
ASSETS.md              every Higgsfield prompt, the credit cost and the video loop process
WEBSITE-PROCESS.md     the 6-step process in short
.claude/skills/cinematic-website/   the reusable Claude skill
```

## Credits

Designed and directed by [Manos](https://github.com/Manolis8), built with Claude and Higgsfield. All imagery is AI-generated for this project. "Haven" is a fictional brand made for this portfolio piece.
