# Higgsfield assets — templates, costs, procedure

## Models & typical cost (Oct 2026 — re-check with `get_cost: true`)
| Job | Model | Settings | Credits |
|---|---|---|---|
| Stills (hero plate, sections) | `gpt_image_2_5` | quality `high`, resolution `2k` | 2.75 each |
| Hero loop | `flux_3_video` | 1080p, 6 s, `generate_audio: false`, start_image = end_image | 54 each |
| Ambient loops | `minimax_h3_max` | 768p, 6 s, start_image = end_image | 15 each |

Haven total: 11 stills + 2 hero loops + 2 ambient loops = **168.25 credits**.

Batch independent stills with `generate_image_batch` (up to 12). `gpt_image_2_5` rate-limits (429) when many run at once — resubmit only the failed indices. Wait with `jobs_wait` (≤15 s per call, repeat). A preset suggestion ("IN THE DARK" etc.) can block a literal prompt — resend with `declined_preset_id`.

## Prompt templates

**Hero plate** (when the supplied hero is small or has UI on it):
> Photoreal cinematic landscape, wide 16:9, no text, no people, no UI. [Scene, left → right, with the exact landmarks of the reference]. Sky: [colour words + sampled hex], very clean, lots of calm empty sky in the upper center for headline text. Foreground: [texture/subject band], shallow depth of field. Muted, soft, slightly desaturated film colour grade, gentle haze, Kodak Portra feel, [mood words], editorial photography, extremely detailed.

Reserve empty space where the headline goes — say so in the prompt.

**Hero loop** (start = end = plate):
> Locked-off static camera, no camera movement, no cuts, no zoom. [Gentle motion that matches the metaphor — e.g. a soft breeze moves through the meadow: flowers and grass tilt and sway in waves rolling left to right, a few petals drift]. [Everything else] stays completely still. Calm, slow, photoreal, seamless loop: the final frame matches the first frame exactly.

**Section still** (hero plate as `image_references`):
> Use the reference only for light, colour grade and mood. [Subject, close-up/macro or same-location variant], [background tones from the palette], shallow depth of field, photoreal, muted film grade, no text.
- For an element that floats on the page background, ask for "isolated against a plain, smooth background (#hex of the page bg)".
- For time-of-day variants (golden hour, dusk), say "the same [place] as the reference, same [landmarks], but at [time]: [light description]" — it keeps the world consistent.

## Pick variants by measurement
`python3 scripts/measure_loop.py a.mp4 b.mp4` prints per-video:
- **meadow motion** — mean frame-to-frame change in the lower part (what you want visible; Haven picked 0.89 over 0.20),
- **sky motion** — should stay ≈0.05–0.1 (still background),
- **seam** — difference between last and first frame. If it is clearly above the normal per-frame motion, the loop jumps.

## Make it seamless
`scripts/make_loop.sh in.mp4 out_base WIDTH XFADE` drops the first XFADE seconds and crossfades the tail into them, so the last frame flows into the first. Use 0.8 s for 6 s clips (0.6 s for small loops). Re-measure: the seam should fall within the normal per-frame range. It also writes `out_base.mp4` (H.264, faststart, no audio), `out_base.webm` (VP9) and `out_base-poster.webp` (first frame, so the poster→video swap doesn't jump).

Size targets: hero ≈ 2.5–3 MB at 1920 (crf 28), ≈1.3 MB at 1280 for mobile; ambient loops < 1 MB. Stills: WebP q≈78, 800 w and 1600 w (+2400 w for full-bleed).

## Upload & serve
- From a machine that can reach Higgsfield: `media_upload` (batch ≤20 files) → `curl -X PUT -H 'Content-Type: …' -H 'If-None-Match: *' --upload-file f '<upload_url>'` → `media_confirm`. The `url` in the upload response is the permanent CDN URL.
- The CDN rewrites `.webm` to `.mp4`/`video/mp4` — ship MP4 only there (or host WebM elsewhere).
- If the local network blocks `upload.higgsfield.ai` / the CDN, do download→encode→upload inside the Higgsfield sandbox (`sandbox_exec`, has ffmpeg/ImageMagick/Playwright). Commands are limited to 16 000 chars, so ~4 signed PUTs per call.
- Keep the token→file map in a JSON so the HTML substitution is scripted (write the HTML with `{{HERO_MP4}}`-style tokens, replace at the end).
