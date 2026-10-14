# COMMIT

Landing site for COMMIT (working name), a social network for GitHub repos: the feed is the Instagram part, the daily launch leaderboard is the Product Hunt part. Built from the brief "COMMIT: website design brief", with the orange swapped for electric blue #0047FF.

- Static: `index.html`, `styles.css`, `main.js`. No build step. GSAP 3.13 + ScrollTrigger and Lenis 1.3.4 in `assets/vendor/`; JetBrains Mono NL (OFL) in `assets/fonts/`.
- Two typefaces only: the block-built wordmark (SVG squares, 49 × 11 blocks) and one mono at one size.
- Ramp: #111111 → #0D1E4C → #092C88 → #0439C3 → #0047FF (straight steps from ink to blue).
- The big animation is a canvas: the T's pixels rain down, snap into a phone that follows the page through sections 04–07, then fly up to rebuild the T. Phones and reduced motion get a phone inside each section instead.
- All names and numbers are placeholders.
