# Haven: Asset list (Higgsfield)

**Total spent: 168.25 credits** (594 → 425.75)

| | Count | Each | Total |
|---|---|---|---|
| Stills, GPT Image 2.5 (high quality, 2K) | 11 | 2.75 | 30.25 |
| Hero loop, FLUX 3 Video (1080p, 6 s, start = end frame, no audio) | 2 | 54 | 108 |
| Ambient loops, MiniMax H3 Max (768p, 6 s, start = end frame) | 2 | 15 | 30 |

All final files are served from the Higgsfield CDN (`d2ol7oe51mr4n9.cloudfront.net`, URLs in `site/index.html`).

## Why the hero is regenerated, not your screenshot

Your hero reference is a 600×492 screenshot with UI baked in (nav, headline, buttons). It's too small for a full-bleed background and can't be animated cleanly. This environment also blocks uploads to Higgsfield. So the hero plate was regenerated as a clean 2688×1520 image from a detailed description of the reference: the same valley, cottage, amber tree, sky colours and wildflowers.

## Prompts

### Hero plate (2 variants → picked B, closest to the reference)
> Photoreal cinematic landscape, wide 16:9, no text, no people, no UI. An alpine valley at soft early-morning golden light. Left: a tall pale lilac-grey limestone mountain massif with vertical cliffs catching warm pink light, green grassy slopes below it, and a small old stone cottage with a dark slate roof sitting on the hillside. Right: soft hazy rolling hills fading into peach-pink atmospheric haze, distant mountain silhouettes, one round autumn-amber deciduous tree on a hill, a few smaller rust-coloured trees in the middle distance. Sky: pale misty lavender-grey (#CED1D6) blending into a warm peach glow at the horizon (#F4CEBC), very clean, lots of calm empty sky in the upper center for headline text. Foreground: a lush wildflower meadow filling the bottom third, dense tall grass with purple cranesbill, white daisies, lavender and orange poppies, shallow depth of field, petals in crisp focus at the very bottom. Muted, soft, slightly desaturated film colour grade, gentle haze, Kodak Portra feel, calm and peaceful, editorial photography, extremely detailed.

### Hero loop (2 variants → picked A)
> Locked-off static camera, no camera movement, no cuts, no zoom. A gentle natural breeze moves through the wildflower meadow: flowers and tall grass tilt and sway in soft waves that roll across the frame from left to right, a few loose petals and seeds drift slowly through the air, very subtle shimmer of morning light and haze. Mountains, cottage, trees and sky stay completely still. Calm, slow, peaceful, photoreal, seamless loop: the final frame matches the first frame exactly.

Variants were measured, not eyeballed:

| | Meadow motion (avg change per frame) | Sky motion | Loop seam |
|---|---|---|---|
| A | 0.89 | 0.08 | 3.93 |
| B | 0.20 (nearly static) | 0.09 | 2.66 |

I picked A for the visible breeze. Its seam was then cut with a 0.8 s crossfade (ffmpeg `xfade`), which brought it down to 1.94, inside A's normal frame-to-frame range (max 2.20). So the loop is seamless.

### Section stills (all use the hero plate as a style reference: "use the reference only for light, colour grade and mood")
| File | Section | Prompt (short) |
|---|---|---|
| seed | 01 The seed | Dandelion seed head, seeds lifting off to the upper right, isolated on a smooth pale mist background (#EEE6E1) fading to peach |
| petals | Statement | Extreme close-up: violet cranesbill and translucent orange poppy petal, backlit, fine veins, lavender/peach bokeh |
| sprout | Stage 01 Plant | Tiny two-leaf sprout in dark soil at the meadow edge, low angle, warm side light |
| fern | Stage 02 Grow | Young fern frond unfurling, backlit pale green, hazy peach and lavender bokeh |
| poppy | Stage 03 Bloom | One orange poppy in full bloom, low golden backlight, cranesbill and daisies around it |
| breeze | Stage 04 Breeze | Tall feathery grasses bending in soft wind, seed tufts and petals carried through the air |
| dew | Bento card | Morning dew drops on one curved grass blade, each refracting the peach sky |
| golden | Quote | Same valley at golden hour: low sun on the right, honey light, long soft shadows |
| dusk | Footer | Same valley at blue hour: violet sky, ember horizon line, first stars, lit cottage window, fireflies |

### Ambient loops
- **Footer dusk loop** (from `dusk`):
  > Locked-off static camera … soft evening breeze makes flowers and grass sway in slow waves, a few fireflies glow and drift, the cottage window light flickers subtly, stars twinkle faintly. Seamless loop.
- **Dew card loop** (from `dew`):
  > Locked-off static macro … the grass blade with dew drops bobs very gently, drops shimmer, background bokeh drifts slightly. Seamless loop.

Both got the same crossfade loop treatment (0.8 s and 0.6 s).

## Delivery formats

| Asset | Files | Size |
|---|---|---|
| Hero video | `hero.mp4` 1920w H.264, plus `hero-1280.mp4` served to screens ≤900 px | 2.8 MB / 1.3 MB |
| Footer loop | `dusk.mp4`, 1344w | 0.8 MB |
| Dew loop | `dew-loop.mp4`, 720w | 0.3 MB |
| Posters | WebP: hero 1920 and 1280, dusk, dew | — |
| Stills | WebP at 800 w and 1600 w via `srcset` (golden also at 2400 w) | 20–370 KB each |

WebM (VP9) versions were encoded too (about 10–45% smaller). The Higgsfield CDN rewrites `.webm` uploads to `.mp4`/`video/mp4`, though, so the site ships H.264 MP4 only, which plays everywhere. If you move hosting (e.g. Vercel or Cloudflare), add the WebM `<source>` back first.
