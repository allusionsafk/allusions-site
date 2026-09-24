---
name: DemiMedia product page
description: A screening room, not a spec sheet; each chapter is one large real screen on the viewing canvas with a few light lines beside it.
colors:
  ground: "#101417"
  canvas: "#080b0d"
  ink: "#edf0f1"
  support: "#b3bdc2"
  separator: "#3e494f"
  focus: "#a9d3eb"
typography:
  display:
    fontFamily: "Bricolage Grotesque, Segoe UI Variable Display, Segoe UI, system-ui, sans-serif"
    fontSize: "clamp(2.6rem, 6.4vw, 5.5rem)"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Bricolage Grotesque, Segoe UI Variable Display, Segoe UI, system-ui, sans-serif"
    fontSize: "clamp(2rem, 3.8vw, 3.1rem)"
    fontWeight: 420
    lineHeight: 1.04
    letterSpacing: "-0.03em"
  wordmark:
    fontFamily: "Bricolage Grotesque, Segoe UI Variable Display, Segoe UI, system-ui, sans-serif"
    fontSize: "1.3rem"
    fontWeight: 600
    letterSpacing: "-0.01em"
  lede:
    fontFamily: "Segoe UI Variable Text, Segoe UI, system-ui, -apple-system, Helvetica Neue, sans-serif"
    fontSize: "clamp(1.1rem, 1.6vw, 1.3rem)"
    lineHeight: 1.55
  title:
    fontFamily: "Segoe UI Variable Text, Segoe UI, system-ui, -apple-system, Helvetica Neue, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 600
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
  control: "4px"
  screen: "6px"
spacing:
  gutter: "clamp(1.25rem, 3vw, 3rem)"
  chapter: "clamp(4rem, 9vw, 8rem)"
  mat: "clamp(0.5rem, 1.6vw, 1.25rem)"
  column-gap: "clamp(2rem, 4vw, 4.5rem)"
components:
  screen:
    backgroundColor: "{colors.canvas}"
    rounded: "{rounded.screen}"
    padding: "clamp(0.5rem, 1.6vw, 1.25rem)"
    width: "100%"
  screen-caption:
    textColor: "{colors.support}"
    typography: "{typography.caption}"
    width: "34rem"
  nav-link:
    textColor: "{colors.support}"
    typography: "{typography.label}"
    height: "44px"
  nav-link-hover:
    textColor: "{colors.ink}"
  truth-cell:
    textColor: "{colors.support}"
    typography: "{typography.body}"
    padding: "0.9rem 0 0"
  fact-row:
    textColor: "{colors.support}"
    padding: "0.9rem 0"
  skip-link:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.canvas}"
    rounded: "{rounded.control}"
    padding: "0.6rem 1rem"
---

# Design System: DemiMedia product page

Scope: the `/demimedia/` route only (`demimedia/index.html`, `demimedia/demimedia.css`, `demimedia/captures/`). The studio page's system lives in the repository root `DESIGN.md` and does not govern this route; the two share only the Bricolage Grotesque / Windows UI text family and the self-hosted font files.

## Overview

**Creative North Star: "The Screening Room"**

The page is a dark room with the picture on the wall. Every chapter is one real DemiMedia capture set on the near-black viewing canvas, and it is the largest thing in that chapter; the words sit lightly beside or above it in supporting ink. The palette is the app's own cinema palette, so the page and the captures read as one surface rather than a marketing frame around a product.

Density is low and rhythm is slow: tall chapter padding, one screen per chapter, a few short paragraphs capped at a reading measure. Structure comes from thin separator rules, never from boxes, cards or shadows. The only facts presented as a list are fenced into one "does / does not claim" section and one status table; the rest of the page lets the captures carry the argument. There is no JavaScript; the only motion is the opening screen fading up once, the way a picture comes in.

The world refuses the category default for media software pages: feature grids, codec badges, glowing HDR gradients and CSS-drawn player chrome.

**Key Characteristics:**
- Real captures on the canvas mat are the imagery; nothing is illustrated or simulated.
- Headings set light (400 / 420) in Bricolage Grotesque; everything else in Windows UI text.
- Flat, rule-divided, dark; one accent (light-blue focus) reserved for interaction state.
- Chapters alternate screen and text on wide viewports; everything stacks on phones.
- One entrance animation, gated on `prefers-reduced-motion: no-preference`.

## Colors

A cool, near-neutral cinema palette taken from the app: two darks for room and screen, two inks, one rule tone, one light-blue signal.

### Primary
- **Projector Blue** (`focus`): focus outlines (2px solid, 3px offset) and text selection background. It is an interaction signal, not a decorative accent; it never fills a surface or colours text at rest.

### Neutral
- **Room Dark** (`ground`): the page background everywhere, plus `theme-color` and the scrollbar track.
- **Screen Black** (`canvas`): the mat behind every capture, and the text colour on inverted elements (skip link, selection). Darker than the ground so each capture reads as a lit screen set into the room.
- **Title Ink** (`ink`): headings, wordmark, `dt` labels, inline links that must stand out (status line, facts, footer), and hovered navigation.
- **Supporting Ink** (`support`): all running paragraphs, the lede, captions, list items, nav links at rest, link underlines at rest, and the one heavier rule above each Requested / Planned / Observed / Health column.
- **Separator** (`separator`): 1px rules between the top bar, chapters, list items, fact rows and footer; scrollbar thumb.

### Named Rules
**The Canvas Is for Screens Rule.** Screen Black appears only as the mat behind a real capture (and as inverted text). Sections, lists and panels sit directly on Room Dark.

**The Signal Rule.** Projector Blue marks focus and selection only. If it appears at rest, something is wrong.

## Typography

**Display Font:** Bricolage Grotesque (self-hosted variable woff2, 400-800), falling back to Segoe UI Variable Display, Segoe UI, system-ui
**Body Font:** Segoe UI Variable Text, falling back to Segoe UI, system-ui, -apple-system, Helvetica Neue
**Label/Mono Font:** IBM Plex Mono 400 (self-hosted), falling back to Cascadia Mono, Consolas

**Character:** A light, slightly quirky grotesque for the few large lines, over the native Windows text face the product itself uses. The display face is set thin and tight so it stays quieter than the captures.

### Hierarchy
- **Display** (400, fluid 2.6-5.5rem, line-height 1, -0.035em, balanced): the single opening H1.
- **Headline** (420, fluid 2-3.1rem, line-height 1.04, -0.03em, balanced): one per chapter or section.
- **Wordmark** (Bricolage 600, 1.3rem, -0.01em): "DemiMedia" in the top bar only.
- **Lede** (Windows text, fluid 1.1-1.3rem, line-height 1.55, supporting ink, 40rem max): the opening paragraph.
- **Title** (Windows text 600, 1.0625rem): `h3` column heads and `dt` labels in the truth row and status table.
- **Body** (1.0625rem, line-height 1.65, supporting ink, `text-wrap: pretty`): chapter copy, capped at a 34rem measure.
- **Label** (0.9375rem): nav links, status line, chapter notes, footer.
- **Caption** (0.875rem, line-height 1.5, supporting ink, 34rem max): screen captions.
- **Machine** (IBM Plex Mono 400, 0.86em, tabular numerals): inline spans for build IDs, commit hashes and branch names.

### Named Rules
**The Light Heading Rule.** Headings in Bricolage never go above 420; weight 600 in Bricolage belongs to the wordmark alone.

**The Mono Is for Machines Rule.** Mono is used only inline, for strings a machine produced (commit IDs, branch names). Never for labels, headings or decoration.

## Layout

A single centered wrap, `min(100% - 2 * gutter, 84rem)`, holds everything; opening and playback-details screens span the full wrap. Sections are separated by a 1px top rule and padded by the `chapter` rhythm (4-8rem).

- **Opening:** left-aligned copy block (44rem max), then the start-screen capture across the full wrap, entering the lower half of the first viewport.
- **Chapters:** one column on phones and tablets (2rem gap). At 64rem and up, a 4fr / 8fr grid with copy vertically centered beside the screen; the next chapter reverses to 8fr / 4fr with copy second, so screen and text alternate sides.
- **Playback details:** heading block, then the widest screen, then the truth row: stacked below 48rem, four equal columns at 48rem and up.
- **Claims and status:** heading in the 4fr column, content in the 8fr column at 64rem. Claims split into two columns at 48rem. Fact rows become a 9rem label column plus value at 40rem.
- **Footer:** stacked, then two columns (text / aside) at 56rem.
- Interactive targets in the bar and facts hold a 44px minimum height.

### Named Rules
**The One Screen Per Chapter Rule.** Each chapter carries exactly one capture, and the capture gets the larger share of the grid (8fr against 4fr, or the full wrap).

## Elevation & Depth

Flat. There is no `box-shadow`, blur, gradient or glow anywhere in the stylesheet. Depth comes from one tonal step: captures sit on Screen Black, which is darker than the Room Dark ground, so the screen reads as recessed and lit. Every other division is a 1px rule.

### Named Rules
**The Tonal Step Rule.** Depth is ground to canvas and nothing else. No shadows, no glows, no raised panels.

## Shapes

Square by default: sections, lists, fact rows and columns have no corners because they have no boxes, only rules. Two small radii exist: gentle 6px corners on the capture mat, and 4px on the skip link. Rules are 1px, in Separator, except the heavier-toned rule above each truth-row column, drawn in Supporting Ink to mark those four as the page's key answers.

## Components

### Screen (signature)
A real app capture set on the viewing canvas.
- **Structure:** a figure holding a `picture` (a phone-specific crop as a `source` below 40rem; 800w / 1600w `srcset` above) and a caption.
- **Mat:** Screen Black background, fluid 0.5-1.25rem padding, 6px corners, full width of its grid cell.
- **Caption:** caption type in Supporting Ink, 34rem max, 0.85rem below the image; states what was captured, when and from which build, with IDs in the machine face.
- **Loading:** the opening screen uses `fetchpriority="high"`; the rest are `loading="lazy"`, `decoding="async"`, with intrinsic width and height declared.
- **Motion:** the opening screen alone fades up once (900ms, `cubic-bezier(0.16, 1, 0.3, 1)`, from opacity 0.25 and brightness 0.6), only under `prefers-reduced-motion: no-preference`. It is fully visible without the animation.

### Top bar
The top bar is quiet, like the player's own chrome.
- Wordmark link plus "by ALLUSIONS" in Supporting Ink, three in-page section links on the right, 4rem minimum height, 1px Separator rule below.
- Nav links: label size, Supporting Ink at rest, Title Ink on hover, no underline, 44px targets.
- **Mobile:** the links are never hidden; the row wraps and they flow under the name with a slightly tighter gap.

### Truth row
The Requested / Planned / Observed / Health definition list.
- Four columns at 48rem and up, stacked below; each column is a Supporting Ink top rule, a Title Ink `dt`, and a Supporting Ink `dd`. No boxes or icons.

### Claims fence
The "does / does not claim" section is the only place codec and hardware facts are listed.
- Two headed lists (Does, Does not claim), each item a Supporting Ink line under a 1px Separator rule; no bullets, no checkmarks, no badges.

### Status facts
- A definition list of label/value rows between Separator rules; labels in Title Ink 600, values in Supporting Ink, links in Title Ink with 44px targets.

### Links and focus
- Inline links inherit colour, 1px underline offset 0.22em in Supporting Ink, turning Title Ink on hover.
- Focus: 2px solid Projector Blue outline, 3px offset, on every focusable element.

### Skip link
- Title Ink background, Screen Black text, 4px corners; off-screen until keyboard focus.

## Do's and Don'ts

### Do:
- **Do** make every chapter image a real capture of the shipped app, with a phone crop and a caption naming the build; record its provenance in `captures/PROVENANCE.md`.
- **Do** set every capture on the Screen Black mat (6px corners, fluid 0.5-1.25rem padding) over the Room Dark ground.
- **Do** divide sections, list items and fact rows with 1px Separator rules instead of boxes.
- **Do** keep headings in Bricolage at 400 (display) or 420 (headline), and running text in Supporting Ink at a 34rem measure.
- **Do** gate any motion on `prefers-reduced-motion: no-preference` and keep content fully visible without it.
- **Do** keep the page static: no JavaScript, and the default-deny Content-Security-Policy meta allowing only same-origin styles, fonts and images.

### Don't:
- **Don't** add shadows, glows, gradients or raised panels; depth is the ground-to-canvas step only.
- **Don't** add codec badges, feature grids or icon rows; technical facts belong in the claims fence.
- **Don't** draw player chrome, meters or telemetry in CSS or with simulated captures; the only player UI on the page is what a real capture shows.
- **Don't** use Projector Blue at rest, or Screen Black as a section background.
- **Don't** use the mono face outside inline machine strings.
- **Don't** hide the top-bar links on phones.
