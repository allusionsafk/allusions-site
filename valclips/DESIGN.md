---
name: ValClips product page
description: The page is the product's reduction; a long session becomes three ranked stories becomes one vertical edit, and the real edit stays the focal object.
colors:
  charcoal: "#141719"
  panel: "#1b1f22"
  ink: "#f0f1ed"
  support: "#b2b8ba"
  rule: "#343b3f"
  segment: "#4a5357"
  coral: "#ff796d"
  on-coral: "#1a0f0d"
typography:
  display:
    fontFamily: "Bricolage Grotesque, Segoe UI Variable Display, Segoe UI, system-ui, sans-serif"
    fontSize: "clamp(2.6rem, 6vw, 5.25rem)"
    fontWeight: 650
    lineHeight: 0.98
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Bricolage Grotesque, Segoe UI Variable Display, Segoe UI, system-ui, sans-serif"
    fontSize: "clamp(2rem, 3.8vw, 3.1rem)"
    fontWeight: 650
    lineHeight: 1.02
    letterSpacing: "-0.03em"
  figure:
    fontFamily: "Bricolage Grotesque, Segoe UI Variable Display, Segoe UI, system-ui, sans-serif"
    fontSize: "clamp(1.9rem, 3.4vw, 2.8rem)"
    fontWeight: 650
    lineHeight: 1
    letterSpacing: "-0.03em"
    fontFeature: "tnum"
  rank:
    fontFamily: "Bricolage Grotesque, Segoe UI Variable Display, Segoe UI, system-ui, sans-serif"
    fontSize: "clamp(2.2rem, 4vw, 3.4rem)"
    fontWeight: 600
    lineHeight: 1
    fontFeature: "tnum"
  story-title:
    fontFamily: "Bricolage Grotesque, Segoe UI Variable Display, Segoe UI, system-ui, sans-serif"
    fontSize: "clamp(1.45rem, 2.6vw, 2.2rem)"
    fontWeight: 650
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  step-title:
    fontFamily: "Bricolage Grotesque, Segoe UI Variable Display, Segoe UI, system-ui, sans-serif"
    fontSize: "clamp(1.6rem, 2.6vw, 2.25rem)"
    fontWeight: 650
    lineHeight: 1.08
    letterSpacing: "-0.025em"
  wordmark:
    fontFamily: "Bricolage Grotesque, Segoe UI Variable Display, Segoe UI, system-ui, sans-serif"
    fontSize: "1.35rem"
    fontWeight: 700
    letterSpacing: "-0.02em"
  lede:
    fontFamily: "Segoe UI Variable Text, Segoe UI, system-ui, -apple-system, Helvetica Neue, sans-serif"
    fontSize: "clamp(1.1rem, 1.5vw, 1.25rem)"
    lineHeight: 1.55
  title:
    fontFamily: "Segoe UI Variable Text, Segoe UI, system-ui, -apple-system, Helvetica Neue, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 650
  body:
    fontFamily: "Segoe UI Variable Text, Segoe UI, system-ui, -apple-system, Helvetica Neue, sans-serif"
    fontSize: "1.0625rem"
    lineHeight: 1.65
  label:
    fontFamily: "Segoe UI Variable Text, Segoe UI, system-ui, -apple-system, Helvetica Neue, sans-serif"
    fontSize: "0.9375rem"
  caption:
    fontFamily: "Segoe UI Variable Text, Segoe UI, system-ui, -apple-system, Helvetica Neue, sans-serif"
    fontSize: "0.875rem"
    lineHeight: 1.5
  machine:
    fontFamily: "IBM Plex Mono, Cascadia Mono, Consolas, monospace"
    fontSize: "0.86em"
    fontWeight: 400
    fontFeature: "tnum"
rounded:
  edit: "10px"
spacing:
  gutter: "clamp(1.25rem, 3vw, 3rem)"
  section: "clamp(4rem, 9vw, 7.5rem)"
  measure: "34rem"
  column-gap: "clamp(2rem, 4vw, 4rem)"
  frame-mat: "clamp(0.4rem, 1.2vw, 1rem)"
  step-gap: "clamp(3.5rem, 8vw, 6rem)"
components:
  vertical-edit:
    backgroundColor: "{colors.panel}"
    rounded: "{rounded.edit}"
    height: "min(80vh, 44rem)"
  frame:
    backgroundColor: "{colors.panel}"
    padding: "clamp(0.4rem, 1.2vw, 1rem)"
    width: "100%"
  frame-caption:
    textColor: "{colors.support}"
    typography: "{typography.caption}"
    width: "34rem"
  reduction-bar:
    backgroundColor: "{colors.segment}"
    height: "10px"
    width: "100%"
  reduction-bar-stories:
    backgroundColor: "{colors.support}"
    height: "10px"
    width: "max(3px, 1.0829%)"
  reduction-bar-edit:
    backgroundColor: "{colors.coral}"
    height: "10px"
    width: "max(3px, 0.5806%)"
  progress-segment:
    backgroundColor: "{colors.segment}"
    height: "4px"
  progress-segment-current:
    backgroundColor: "{colors.coral}"
    height: "4px"
  rank-first:
    textColor: "{colors.coral}"
    typography: "{typography.rank}"
  rank:
    textColor: "{colors.support}"
    typography: "{typography.rank}"
  treatment-first:
    textColor: "{colors.coral}"
    typography: "{typography.title}"
  nav-link:
    textColor: "{colors.support}"
    typography: "{typography.label}"
    height: "44px"
  nav-link-hover:
    textColor: "{colors.ink}"
  skip-link:
    backgroundColor: "{colors.coral}"
    textColor: "{colors.on-coral}"
    padding: "0.6rem 1rem"
---

# Design System: ValClips product page

Scope: the `/valclips/` route only (`valclips/index.html`, `valclips/valclips.css`, `valclips/captures/`). The studio page's system lives in the repository root `DESIGN.md` and DemiMedia's in `demimedia/DESIGN.md`; neither governs this route. The three share only the Bricolage Grotesque / Windows UI text family and the self-hosted font files.

## Overview

**Creative North Star: "The Reduction"**

The page is the product's own reduction, running top to bottom. A 57-minute sitting becomes three ranked stories, and the three become one 20-second vertical edit. The first viewport draws the reduction to scale: a full-width bar for the session, then two slivers of what survives it. The real rendered 9:16 edit stands beside that as the payoff. The page then covers the three stories at page scale and walks one of them from Preview through Treatment to Ready, and the edit stays in view the whole time. The palette is the app's charcoal and coral, so the page and the Director captures read as one surface.

The page is kinetic and time-driven, but its motion only shows a real length or a real position; nothing decorates. Bars keep their true proportions and only their reveal animates. A five-segment progress bar over each step says where that part of the page sits in the product's flow. On desktop with scroll timelines, the pinned edit changes to the beat that belongs to the step being read. Structure comes from 1px rules and a single tonal panel step; there are no boxes, cards or shadows. The page runs no JavaScript.

The world refuses the category default: highlight-reel hype, fake kill counters, RGB gamer styling and "AI clips" feature grids. It also refuses the DemiMedia sibling's screen-and-text chapters.

**Key Characteristics:**
- Real Director captures and frames taken from the real rendered edit are the only imagery.
- Headings are Bricolage Grotesque 650, and everything else is Windows UI text. Mono is reserved for machine values.
- Flat and rule-divided on charcoal. Coral marks the current thing and nothing else.
- Every length is to scale: the reduction bars use true ratios, with a 3px floor so they stay visible.
- Motion is layered as progressive enhancement. The static layout is complete, the draw-in needs motion allowed, and the pinned beats need motion, scroll timelines and a desktop viewport.

## Colors

The app's charcoal family: a dark ground, one panel step, two inks, two rule tones and one coral signal.

### Primary
- **Current Coral** (`coral`): the current or chosen thing. It marks the current segment of each progress bar, the rank-1 numeral, the first treatment's name ("As planned"), and the edit's reduction bar. As interaction state it also marks focus outlines, text selection, the link-underline colour on hover, and the skip link's background. It never fills a section, never colours running text, and never appears twice in one row of a list.
- **On Coral** (`on-coral`): text on coral fills (selection, skip link).

### Neutral
- **Charcoal** (`charcoal`): the page background everywhere, plus `theme-color` and the scrollbar track.
- **Panel** (`panel`): the mat behind every Director capture and the fill behind each vertical-edit frame while it loads. It is the only raised tone.
- **Ink** (`ink`): headings, the wordmark, the reduction figures, the rank-1 story title, footer links, and nav links on hover.
- **Supporting Ink** (`support`): the lede, paragraphs, captions, labels, nav links at rest, the rank 2 and 3 numerals, lengths, list items, the unit suffixes on reduction figures, and the stories bar in the reduction.
- **Rule** (`rule`): the 1px rules under the top bar, between sections, list rows and treatment rows, and above the footer.
- **Segment** (`segment`): progress segments at rest, the full-session reduction bar, and the scrollbar thumb.

### Named Rules
**The Current Thing Rule.** In any group, coral marks exactly one member: the current progress segment, rank 1, the first treatment, or the edit's bar. If two siblings are coral, one is wrong.

**The Panel Is for Pictures Rule.** Panel appears only behind a capture or a frame of the edit. Sections, lists and steps sit directly on charcoal.

## Typography

**Display Font:** Bricolage Grotesque (self-hosted variable woff2, 400-800), falling back to Segoe UI Variable Display, Segoe UI, system-ui
**Body Font:** Segoe UI Variable Text, falling back to Segoe UI, system-ui, -apple-system, Helvetica Neue
**Label/Mono Font:** IBM Plex Mono 400 (self-hosted), falling back to Cascadia Mono, Consolas

**Character:** The ALLUSIONS family grotesque, set heavier here (650) and tight so the headings and figures move with some push. Under it sits the native Windows text face the app itself uses.

### Hierarchy
- **Display** (650, fluid 2.6-5.25rem, line-height 0.98, -0.035em, balanced, 13ch max): the single H1, which sets on two lines.
- **Headline** (650, fluid 2-3.1rem, line-height 1.02, -0.03em, balanced): section H2s.
- **Figure** (650, fluid 1.9-2.8rem, line-height 1, tabular numerals): the reduction's numbers. Each unit ("min", "s") is set at max(0.45em, 0.875rem), weight 600, in Supporting Ink.
- **Rank** (600, fluid 2.2-3.4rem, tabular numerals): the ranked-story numerals, with rank 1 in coral and the others in Supporting Ink.
- **Story title** (650, fluid 1.45-2.2rem, line-height 1.1, -0.02em): ranked story names.
- **Step title** (650, fluid 1.6-2.25rem, line-height 1.08, -0.025em, balanced): the Preview, Treatment and Ready H3s.
- **Wordmark** (Bricolage 700, 1.35rem, -0.02em): "ValClips" in the top bar only.
- **Lede** (Windows text, fluid 1.1-1.25rem, line-height 1.55, Supporting Ink, 40rem max, pretty wrap).
- **Title** (Windows text 650, 1.0625rem): plain H3s ("It is", "It is not") and treatment names.
- **Body** (1.0625rem, line-height 1.65): running copy in Supporting Ink, with step-head copy capped at 44rem.
- **Label** (0.9375rem): nav, the status line, reduction labels, lengths, treatment descriptions, footer.
- **Caption** (0.875rem, line-height 1.5, Supporting Ink, 34rem measure): figure captions and the reduction note. Captions for the vertical edit are centred at line-height 1.45.
- **Machine** (IBM Plex Mono 400, 0.86em, tabular numerals): inline spans only.

### Named Rules
**The Mono Is for Machines Rule.** Mono is set inline and only for values a machine produced: the build ID (`83568e4`) and the edit durations in the ranked list (`20.0s`, `7.9s`, `9.4s`). It never sets labels, headings, figures or decoration.

**The One Weight Rule.** Bricolage headings, figures and titles are set at 650. The exceptions are rank numerals at 600 and the wordmark at 700.

## Layout

A single centred wrap, `min(100% - 2 * gutter, 84rem)`, holds everything. Every section after the first is separated by a 1px Rule top border and padded with the `section` rhythm (4-7.5rem). The first section, the reel, has shorter top padding (clamp 2-4rem).

- **Reel (first viewport):** stacked below 64rem (2.5rem gap). At 64rem and up it becomes a 7fr / 5fr grid, with the copy and reduction on the left and the vertical edit on the right, both centred vertically. The edit is capped at `min(80vh, 44rem)` tall (70vh below 64rem), stays 9:16, and is centred in its cell.
- **Reduction:** an ordered list, 38rem max, with a 1.1rem gap between stages. Each stage puts its figure in a 7.5rem column beside its label, and the bar spans the full row underneath. The bars are drawn to scale: the session's 3,444.4 recorded seconds are the full track. The stories bar is 37.3/3444.4 of the track (`1.0829%`), the edit bar is 20/3444.4 (`0.5806%`), and each is floored at a visible 3px, never rounded up further.
- **Ranked stories:** one rule-divided list with a 3.5rem numeral column. At 48rem and up that column widens to 5rem and a right-aligned length column is added. The Director capture follows at full wrap width.
- **Editor:** the title spans the wrap, and the steps stack with a fluid 3.5-6rem gap. The baseline layout, which is the one everyone gets, puts the three real frames of the edit (beat 2, beat 3, payoff) in a row of three equal columns (0.75rem gap, 44rem max) above the steps. Only when motion is allowed, scroll timelines are supported and the viewport is at least 64rem does the editor switch to a 4fr / 8fr grid. There the frames stack in one sticky cell (`top: 1.5rem`), each capped at `min(84vh, 40rem)`, beside the steps.
- **Treatments:** a rule-divided definition list, which becomes two columns (1.5rem gap) at 48rem.
- **What it is / is not:** the two lists stack, sit side by side from 48rem, and move into the 8fr column beside a 4fr heading at 64rem.
- **Phone sources:** below 48rem (`max-width: 47.99rem`) each Director capture serves the Director's own phone layout through a `source`, and the frame is capped at 26rem wide and centred.
- The top bar, nav and name links keep 44px minimum targets, and the bar row is at least 4rem tall.

### Named Rules
**The To-Scale Rule.** A bar that stands for time is exactly the ratio of that time to the session, floored at 3px. Its length never changes to make a point.

**The Everyone-Gets-The-Row Rule.** Without motion or timeline support, the edit's three frames sit in a row above the steps. The pinned single frame is an enhancement, never the baseline.

## Elevation & Depth

The page is flat. There is no `box-shadow`, blur, gradient or glow anywhere in the stylesheet. Depth is one tonal step, charcoal to panel, behind captures and edit frames; every other division is a 1px Rule. The only layering is the sticky edit on desktop, and it is a position, not a shadow.

### Named Rules
**The Tonal Step Rule.** Depth is charcoal to panel and nothing more.

## Shapes

The page is square by default, and so are the frames: Director captures sit square-cornered on a panel mat. The one radius is gentle 10px corners on each vertical-edit frame, which marks it as a phone-shaped output rather than a screen capture. Rules are 1px Rule. Bars are flat rectangles, 10px tall for the reduction and 4px for progress segments, with no rounding.

## Components

### Vertical edit (signature)
A real frame extracted from the rendered 1080x1920 edit.
- **Structure:** a figure with a 9:16 image (540w / 810w `srcset`, intrinsic 810x1440) and a centred caption giving its timecode.
- **Shape:** 10px corners, with panel as the fill while it loads.
- **Lead instance:** the payoff frame in the reel, loaded with `fetchpriority="high"`. The beat instances in the editor are lazy and decode asynchronously.

### Reduction bars (signature)
The session-to-story reduction drawn to scale.
- Three stages, each a figure, a label and a 10px bar. The session bar is full width in Segment, the stories bar is `max(3px, 1.0829%)` in Supporting Ink, and the edit bar is `max(3px, 0.5806%)` in Coral.
- **Motion:** under `prefers-reduced-motion: no-preference`, each bar draws from the left (`scaleX` 0 to 1, 620ms, `cubic-bezier(0.16, 1, 0.3, 1)`) in order: the session first, then the stories at 520ms, then the edit at 760ms. Only the reveal animates; the true lengths are fixed.
- A caption-sized note underneath says the bars are to scale and gives the real counts behind them.

### Progress bar (signature)
Five segments standing for Session, Stories, Preview, Treatment and render, and Ready and publish.
- A 5-column grid of 4px segments with a 4px gap, `min(100%, 15rem)` wide, sitting above a step's heading. Segments are Segment at rest; the one for this part of the page is Coral (`at-2` to `at-5`).
- It is decorative to assistive technology (`aria-hidden`). The heading carries the meaning.

### Ranked list
- Rule-divided rows, each holding a large numeral, a story title with a one-line reason, and a length whose duration is in Machine.
- The rank-1 numeral is coral and its title is Ink. The rank 2 and 3 numerals are Supporting Ink. Numerals are `aria-hidden` because the ordered list carries the order.

### Pinned beats (motion branch)
- The branch applies only inside `@media (prefers-reduced-motion: no-preference)`, `@supports (animation-timeline: view()) and (timeline-scope: --a)`, and `@media (min-width: 64rem)`, all three.
- The editor declares `timeline-scope` for the three steps, and each step exposes a block `view-timeline`. The frames share one grid area and cross-fade on opacity, linearly with fill both. Beat 2 follows Preview (cover 0-100%, fading out at the end), beat 3 follows Treatment (fading in and out), and the payoff follows Ready (cover 0-55%, holding once in).

### Frame (Director capture)
- A `picture` with a phone `source` below 48rem and a 800w / 1600w `srcset` above it, on a panel mat with fluid 0.4-1rem padding, full width. Phone sources are capped at 26rem.
- **Caption:** Supporting Ink caption type at a 34rem measure, 0.85rem below the image. It says what was captured, from which build (in Machine), and what is blurred.

### Treatments
- A definition list in rule-divided rows: the name is Title weight 650 and the description is label size in Supporting Ink. The first treatment's name is coral.

### Top bar
- The wordmark link, then "by ALLUSIONS" in Supporting Ink, then three in-page links. It has a 4rem minimum height and a 1px Rule below.
- Nav links are label size, Supporting Ink at rest and Ink on hover, with no underline and 44px targets. On phones the links wrap under the name and are never hidden.

### Links and focus
- Inline links inherit their colour and have a 1px underline at a 0.22em offset. The underline turns Coral on hover.
- Focus is a 2px solid Coral outline at a 3px offset on every focusable element. The skip link uses an Ink outline, because it sits on coral.

### Skip link
- A Coral fill with On Coral text, square, kept off-screen until it receives keyboard focus.

## Do's and Don'ts

### Do:
- **Do** use only real imagery: Director captures of a named build, and frames taken read-only from a real render. Blur names, channels and paths visibly, and record provenance in `captures/PROVENANCE.md`.
- **Do** draw every time bar to its true ratio of the session track (the `max(3px, ratio%)` pattern) and state in a note that the bars are to scale.
- **Do** mark exactly one member of a group in Coral: the current progress segment, rank 1, the first treatment, or the edit's bar.
- **Do** keep the static layout complete. The three beat frames sit in a row above the steps, and motion only reveals or pins.
- **Do** gate the pinned beats on motion allowed, `animation-timeline: view()` plus `timeline-scope` support, and a viewport of at least 64rem.
- **Do** serve the Director's phone layout below 48rem and cap it at 26rem.
- **Do** keep the page static: no JavaScript, and a default-deny Content-Security-Policy that allows only same-origin styles, fonts and images.

### Don't:
- **Don't** add shadows, glows, gradients or raised panels. Depth is the charcoal-to-panel step only.
- **Don't** round a reduction bar up beyond its 3px floor, and don't animate its length. Only the reveal animates.
- **Don't** use Coral for running text, section fills or more than one member of a group.
- **Don't** use the mono face for anything but machine values (the build ID, edit durations).
- **Don't** add kill counters, view or virality metrics, feature grids, icon rows or RGB gamer styling.
- **Don't** hide the top-bar links on phones.
