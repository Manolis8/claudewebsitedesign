# How to make a cinematic website (the Haven process)

This is the exact process behind **haven-puce-tau.vercel.app**, saved as a Claude skill called **`cinematic-website`** (`.claude/skills/cinematic-website/`).

## How to start one

Open Claude Code in this repo, or install the skill in claude.ai, and say something like:

> Make me a cinematic website for **[what it is]**. Mood: **[3–4 words]**. Here's my hero image [attach] and a site whose layout I like [attach a screen recording or link].

Claude follows the six steps below and checks in with you at the key decision points.

## The 6 steps

| Step | What happens | You decide |
|---|---|---|
| **1. Brief** | One sentence: what it is, who it's for, the one metaphor (Haven: "design grows like nature, AI is the breeze") | The metaphor and the mood words |
| **2. References** | ~10 Awwwards / motionsites references, each with *the trick that makes it work* | Optional: your Pinterest board |
| **3. Art direction** | Palette sampled from your hero image, font pairing, mood paragraph, a plan for every section, and ONE signature move | Approve before any money is spent |
| **4. Assets** | Higgsfield stills and seamless video loops, all in the same light and colour grade. Cost quoted first (Haven: 168 credits) | Approve the credit quote |
| **5. Build** | Starts from the Haven template: smooth scroll, word-by-word headlines, grass-wipe image reveals, pinned story, colour journey, edge animations, magnetic buttons | — |
| **6. Review + launch** | Real screenshots on desktop and phone, scored like an Awwwards jury, at least 2 rounds of fixes, then a live deploy on Vercel | Look at the live link |

## What to bring for the best result
- **A great hero image.** It sets the palette and mood for the whole site. High resolution and no text on it is best.
- **A layout reference.** A screen recording of a site you love, so Claude copies its rhythm, not its style.
- **Real words.** The product name, 3 benefits, a real quote if you have one.
- **A budget:** about 150–200 Higgsfield credits for a full homepage.

## What's inside the skill
- `SKILL.md`: the process Claude follows.
- `references/`: prompt templates and costs, motion rules, and the jury checklist of every mistake caught on Haven.
- `scripts/`:
  - `palette.py`: colours from an image.
  - `measure_loop.py`: picks the best video variant by measuring motion.
  - `make_loop.sh`: makes video loops seamless and web-sized.
  - `shoot.js`: takes the review screenshots.
- `assets/template/`: the full Haven site code to start from.
