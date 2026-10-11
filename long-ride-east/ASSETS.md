# The Long Ride East · assets

Everything on the page is inline SVG built in `main.js` (torn paper, the mosaic rider and horse, swords, columns, elephants, the map, the timeline), except the five background clips below, which were made with Higgsfield.

## How the clips were made
1. **Still** (`gpt_image_2_5`, 16:9, 2K): one paper-craft collage per scene, in the site palette only.
2. **Loop** (`minimax_h3_max`, 6 s, 768p): the still as both the start and the end frame, with a locked camera, so the clip returns to where it began.
3. **Seamless + stop-motion:** a 0.5–0.6 s crossfade from the end into the start, then re-timed to **12 fps** so it moves like hand-animated paper. H.264 MP4 with no audio, plus a WebP poster from the first frame.
4. Hosted on the Higgsfield CDN (`d2ol7oe51mr4n9.cloudfront.net`), lazy-loaded when a section comes near, paused once it's off screen, and never loaded with reduced motion (the poster shows instead).

Shared prompt: *Paper-craft stop-motion animation, torn paper collage, cut-out figures, visible paper grain and rough white torn edges, slightly jerky 12 fps movement, locked static camera, flat side view, no blue, no realism, seamless loop.* + scene:

| Clip | Section | Scene | Shown as | Size |
|---|---|---|---|---|
| 1 | The Rider | Torn paper clouds and dust scraps drifting past the terracotta sun, hills still | full-bleed hero background (the code rider rides in front) | 1344 px, 0.77 MB |
| 3 | The War Begins | Two cut-out armies surging, spears and swords flashing, scraps flying | torn-paper window | 1024 px, 1.2 MB |
| 4 | Conquering an Empire | Torn orange and terracotta paper flames licking up the columns, embers rising | torn-paper window | 1024 px, 0.57 MB |
| 5 | To the Edge of the World | Elephants marching in place, cream paper-strip rain | torn-paper window | 1024 px, 0.64 MB |
| 7 | Why He's Still Famous | The mosaic rider galloping toward a torn-paper horizon, hills sliding past | torn-paper window | 1024 px, 0.68 MB |

Measured motion / seam (mean pixel difference at 160×90): clip 1 0.43 / 0.48 (gentle on purpose), clip 3 5.03 / 1.25, clip 4 1.25 / 0.97, clip 5 1.03 / 1.07, clip 7 2.83 / 0.89.

## Credits
5 stills × 2.75 + 5 loops × 15 = **88.75 credits**.
