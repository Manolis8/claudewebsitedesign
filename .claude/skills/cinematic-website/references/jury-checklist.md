# Design-jury checklist

Score every section /10 on design, usability, creativity, content. Then check these — each one actually happened on Haven:

**Scroll & timing**
- [ ] Colour journey lands on the right sections (a dark/night colour too early = triggers created before the pin).
- [ ] Nav "active" item matches the section on screen.
- [ ] Pinned section: first panel fully readable at pin start, counter matches the visible step, nothing stuck half-revealed.

**Composition**
- [ ] No section is "one floating image + empty space" — text and image should compose (side by side / overlapping intentionally).
- [ ] Gaps between sections feel like breathing room, not missing content.
- [ ] Text never sits on busy imagery without a veil (e.g. quote over flowers — move it off or add a gradient).

**Chrome**
- [ ] Logo/nav readable on every background, light and dark (give the logo a frosted pill; add an `is-dark` state for dark sections).
- [ ] No stray cursor ring at (0,0) before the first mouse move.
- [ ] Edge decorations never cover text (dim them while content slides beneath).

**Mobile (390 px)**
- [ ] `scrollWidth === clientWidth` (no horizontal scroll).
- [ ] Headlines don't collide with the fixed nav.
- [ ] Pinned section is stacked; edges hidden; CTAs reachable.

**Robustness**
- [ ] No page errors / console errors; fonts loaded.
- [ ] Reduced-motion mode: posters, stacked story, everything visible.
- [ ] Videos: poster = first frame; lazy videos load near viewport.

Stop when every section is ≥8 and nothing above fails.
