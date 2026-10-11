# Haven: Art Direction

**Product:** Haven, designing with ease using AI.
**Metaphor:** great design is like nature. It grows, breathes and feels effortless, and AI is the breeze that makes it move.
**One-line idea:** the homepage is a single walk through one meadow, from morning mist to dusk. The background colour follows the light, and every motion uses the same soft, slow breeze.

## Palette (sampled from the hero image)

| Token | Hex | Role |
|---|---|---|
| `--mist` | `#EEE6E1` | Morning background, the default page colour |
| `--haze` | `#D1D1D3` | Lavender-grey sky. Borders, muted text on light backgrounds, card fills |
| `--dawn` | `#F4CEBC` | Peach horizon glow. Second background, gradients |
| `--honey` | `#B8906D` | Golden-hour grass. Background of the golden section, warm details |
| `--moss` | `#23382C` | Deep grass. Main ink colour (text on light) and dark cards |
| `--poppy` | `#BA4E2A` | Single accent: primary buttons, active states, the one red flower |
| `--dusk` | `#1A211E` | Footer and night background (derived from moss) |

Contrast: moss on mist is about 11.6:1 and mist on moss the same. White text over the hero video sits on a soft radial veil (≥4.5:1 measured on the sky area).

## Type

- **Headlines:** *Instrument Serif* (Google Fonts). An elegant, slightly condensed editorial serif, with italics for the "breath" words. Set at `clamp(3.5rem, 10vw, 11rem)`, line-height 0.92, tracking −0.02em.
- **Body:** *Inter Tight*, 400/500, 16–18px, line-height 1.55.
- **Labels:** *JetBrains Mono*, 11–12px uppercase, tracking +0.12em. A nod to the mono labels in the layout reference ("01", "S/01").

## Mood statement

Early light over an alpine meadow, the moment before anyone else is awake. Nothing shouts. The page is mostly air: pale lavender sky, peach haze, and a band of flowers that is always gently moving. Type is large but soft-spoken, like a title card in a slow film. Motion never starts; it *arrives*, like wind reaching you across a field. Long ease-outs and staggered words make everything sway in rather than snap. As you scroll, the day gets older: mist, then peach, then honey gold, then dusk. You end in the evening with the cottage window lit, and the message has landed without anyone raising their voice: designing can feel like this.

## Section-by-section plan

The structure follows the layout reference (*Sentra*): centered pill nav, a hero with a small paragraph bottom-left and a button bottom-right, a floating flower visual, a split statement, a card grid, and back to a full-bleed close. Its dark, technical style is replaced with the meadow.

| # | Section | Headline / copy | Visual | Motion |
|---|---|---|---|---|
| 0 | **Nav** (fixed) | Haven · Work · Features · Pricing · Journal + `Start designing` | White frosted pill, centered. The button sits top-right like in the reference | Slides down after the hero headline. Turns moss on mist once you leave the hero |
| 1 | **Hero**, morning | Eyebrow: `AI DESIGN STUDIO — SEASON 02` · H1: *Design with ease.* · Sub: "Design smarter with AI that understands you, so you can take a breath." · Bottom-left: a small paragraph · Bottom-right: `Start designing` | Full-bleed meadow loop (FLUX 3 Video, start frame = end frame) | Video fades in from blur(24px) to 0. H1 lines slide up through masks. On scroll the video scales 1 → 1.18 and moves up 12%, like walking into the field, while the headline drifts up and fades |
| 2 | **Seed**, mist | *Every great design starts as a seed.* + "Describe a feeling. Haven turns it into a first layout in seconds…" + `See how it grows` | Dandelion seed head floating on the right (the reference's black flower, now a meadow seed) | Image reveals through a grass-curtain clip-path. Parallax inside the frame. Seeds drift from the image towards the right edge |
| 3 | **Statement**, mist to dawn | Left: "Meet Haven. Built to **grow your ideas** and **let them breathe.**" Right: "AI works like a breeze: **you set the direction**, it handles the **thousand small movements.**" | Backlit petal close-up overlapping from above | Words start at haze grey and fill to moss one by one as you scroll (scrubbed). Petals parallax at a different speed |
| 4 | **How design grows**, dawn, *pinned horizontal* | 01 Seed: *Say it plainly.* · 02 Sprout: *Watch it take shape.* · 03 Bloom: *Make it yours.* · 04 Breeze: *Let it move.* | 4 panels: seed, sprout, dew, poppy. One continuous stem line runs through all panels | Pinned. Vertical scroll moves the track horizontally. The stem draws along (stroke-dashoffset) and each panel's image parts like grass. Stage counter `01 → 04` |
| 5 | **Grid**, dawn to honey | *Everything you need, nothing that rustles.* · Cards: `01` "Understands you" · dark `S/01` "Breathes with your brand" · dew loop card · `B/03` "Always in season" · `W/04` "Ship in a breath" | Bento grid mirroring the reference's cards (light, dark and image cards with arrow buttons) | Cards rise with a stagger (y 60 → 0, opacity). Arrow buttons are magnetic |
| 6 | **Golden hour quote**, honey | "It feels less like using a tool and more like taking a walk." — a design lead | Wide golden-hour meadow, parallax | Background turns honey. Quote words reveal staggered. The image scales slightly as you pass |
| 7 | **Footer**, dusk | *Take a breath.* / *Start designing.* · links · © | Full-bleed dusk meadow loop (lit cottage window, fireflies) | Background goes to dusk. Huge closing line splits in. Links ripple on hover (a letter wave) |
| ∞ | **Edges** | none | Left: three grass stems + a botanical frond. Right: a dandelion stem + drifting seed fluff (SVG) | Draw themselves with total scroll progress. Idle sway (sine, 4–7 s). Stems near the cursor bend away from it |

**Where I changed the reference, and why:** I added the golden-hour quote (section 6) between the grid and the footer. Without it the light jumps from dawn straight to dusk, and the "time of day" journey only works if there's a real golden hour in the middle.
