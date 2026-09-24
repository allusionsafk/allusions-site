---
name: ALLUSIONS studio site
description: An achromatic publisher's list in which each product arrives as its own real window on its own ground.
colors:
  paper: "oklch(96.4% 0 0)"
  ink: "oklch(17% 0 0)"
  muted: "oklch(44% 0 0)"
  rule: "oklch(80% 0 0)"
  rule-strong: "oklch(17% 0 0)"
  night: "oklch(14.5% 0 0)"
  night-ink: "oklch(95% 0 0)"
  night-muted: "oklch(74% 0 0)"
  night-rule: "oklch(34% 0 0)"
  ground-afk: "#eee8dc"
  ground-demimedia: "#080b0d"
  ground-valclips: "#141719"
typography:
  display:
    fontFamily: "Bricolage Grotesque, Segoe UI Variable Display, Segoe UI, system-ui, sans-serif"
    fontSize: "min(19.25rem, calc((100vw - 2 * var(--gutter)) / 4.62))"
    fontWeight: 560
    lineHeight: 0.8
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Bricolage Grotesque, Segoe UI Variable Display, Segoe UI, system-ui, sans-serif"
    fontSize: "clamp(2.5rem, 4.6vw, 4rem)"
    fontWeight: 560
    lineHeight: 0.95
    letterSpacing: "-0.03em"
  headline-night:
    fontFamily: "Bricolage Grotesque, Segoe UI Variable Display, Segoe UI, system-ui, sans-serif"
    fontSize: "clamp(2.2rem, 4.4vw, 3.75rem)"
    fontWeight: 540
    lineHeight: 1
    letterSpacing: "-0.03em"
  title:
    fontFamily: "Bricolage Grotesque, Segoe UI Variable Display, Segoe UI, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 560
    letterSpacing: "-0.01em"
  lede:
    fontFamily: "Segoe UI Variable Text, Segoe UI, system-ui, -apple-system, Helvetica Neue, sans-serif"
    fontSize: "clamp(1.25rem, 1.9vw, 1.6rem)"
    lineHeight: 1.4
  job:
    fontFamily: "Segoe UI Variable Text, Segoe UI, system-ui, -apple-system, Helvetica Neue, sans-serif"
    fontSize: "clamp(1.125rem, 1.5vw, 1.3rem)"
    fontWeight: 600
    lineHeight: 1.4
  body:
    fontFamily: "Segoe UI Variable Text, Segoe UI, system-ui, -apple-system, Helvetica Neue, sans-serif"
    fontSize: "1.0625rem"
    lineHeight: 1.6
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
    letterSpacing: "0"
    fontFeature: "tnum"
spacing:
  gutter: "clamp(1.25rem, 3.4vw, 3rem)"
  measure: "38rem"
  shell: "88rem"
  column-gap: "clamp(1.5rem, 3vw, 3rem)"
  product-block: "clamp(2.75rem, 6vw, 5.5rem)"
  standard-block: "clamp(3.5rem, 8vw, 7rem)"
  plate-mat: "clamp(0.75rem, 2.4vw, 2rem)"
  plate-mat-wide: "clamp(1.5rem, 4vw, 4.5rem)"
  plate-mat-phone: "0.5rem"
  target: "44px"
components:
  nav-link:
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    height: "{spacing.target}"
  contents-entry:
    textColor: "{colors.ink}"
    typography: "{typography.title}"
    height: "{spacing.target}"
  contents-status:
    textColor: "{colors.muted}"
    typography: "{typography.label}"
  destination-link:
    textColor: "{colors.ink}"
    typography: "{typography.body}"
  destination-unlinked:
    textColor: "{colors.muted}"
    typography: "{typography.body}"
  plate-afk:
    backgroundColor: "{colors.ground-afk}"
    padding: "{spacing.plate-mat}"
  plate-demimedia:
    backgroundColor: "{colors.ground-demimedia}"
    padding: "{spacing.plate-mat-wide}"
  plate-valclips:
    backgroundColor: "{colors.ground-valclips}"
    padding: "{spacing.plate-mat}"
  plate-caption:
    textColor: "{colors.muted}"
    typography: "{typography.caption}"
  standard:
    backgroundColor: "{colors.night}"
    textColor: "{colors.night-ink}"
    padding: "{spacing.standard-block} 0"
  skip-link:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    padding: "0.6rem 1rem"
---

# Design System: ALLUSIONS studio site

## Overview

**Creative North Star: "The Publisher's List"**

The studio is typography, hairline rules and white space; the products are the subjects. The frame is fully achromatic (neutral near-white paper, near-black ink, two greys) so that the only colour anywhere on a page is inside a product plate: a real, unretouched capture of the product's own window set on that product's own ground. The page reads as a catalogue of titles with their state, not as a SaaS landing page. There are no feature cards, gradient hero art or uniform product tiles.

Scale does the work. The ALLUSIONS wordmark is set as the H1 across the full measure. Product names are large grotesque titles, and everything else is plain Windows UI prose at a comfortable reading size. Depth comes from rules and one dark reversal, never from surfaces lifting off the page. Each product gets its own composition, so the list does not repeat one template three times.

**Key Characteristics:**

- A zero-chroma frame; colour lives only inside the product plates.
- The wordmark is sized from the viewport so it spans the measure.
- Three product compositions, one per product, instead of a repeated tile.
- Rule-built structure: strong ink rules between products and hairline rules inside fact lists.
- One dark reversal (the working standard) on the whole page.
- Mono appears only in short machine spans for versions and commit IDs.
- Each plate settles into its frame as it scrolls into view, but only when the visitor has not asked for reduced motion.

## Colors

The palette is fully neutral, with every frame value at OKLCH chroma 0. The three product grounds are the only hues, and they appear only as mats around real captures.

### Neutral

- **Paper** (paper): the continuous page field and the text colour on reversed elements (the skip link, selection).
- **Ink** (ink): all primary lettering, strong structural rules (rule-strong carries the same value), the focus ring and the skip-link fill.
- **Pencil Grey** (muted): the imprint, the handle, status words in the contents line, fact labels, figure captions and the footer.
- **Hairline Grey** (rule): the thin rules that divide facts inside a product's fact list.
- **Night** (night), **Night Ink** (night-ink), **Night Pencil** (night-muted), **Night Hairline** (night-rule): the working-standard section only. Night Ink carries principle names and the heading; Night Pencil carries the explanatory text and the strong top rule; Night Hairline divides the principles.

### Product grounds

- **AFK Warm Paper** (ground-afk): the mat around the AFK AI capture.
- **DemiMedia Cinema Black** (ground-demimedia): the mat around the DemiMedia capture.
- **ValClips Charcoal** (ground-valclips): the mat around the ValClips capture.

These grounds come from the products, not the studio. They are applied through the plate's own ground variable and never appear on text, rules, links or sections.

### Named Rules

**The Colour Lives in the Plates Rule.** Every frame colour has zero chroma. Hue enters a page only through a product's real capture and the product ground around it.

**The One Reversal Rule.** The working-standard section is the only dark band in the frame. Dark product grounds are mats inside a plate, not sections.

## Typography

**Display Font:** Bricolage Grotesque (self-hosted variable 400–800, with Segoe UI Variable Display, Segoe UI and system-ui as fallbacks)
**Body Font:** Segoe UI Variable Text (system stack with Segoe UI, system-ui, -apple-system and Helvetica Neue)
**Label/Mono Font:** IBM Plex Mono (self-hosted 400 and 500, with Cascadia Mono and Consolas as fallbacks)

**Character:** A broad, slightly quirky grotesque at editorial scale sits over the plain Windows UI voice, so the studio sounds like the software it makes. Mono is a small technical aside, not a stylistic register.

### Hierarchy

- **Display** (560, viewport-derived size capped at 19.25rem, 0.8 leading, -0.035em): the ALLUSIONS wordmark only. Its size is calculated so the set word, about 4.62 em wide, fills the shell. It is nudged left (-0.045em) so the A's stem aligns optically with the gutter. On the 404 page it drops to clamp(2.5rem, 9vw, 7rem).
- **Headline** (560, clamp to 4rem, 0.95): product names. The working-standard heading uses a slightly lighter variant (540, clamp to 3.75rem, leading 1, max 12ch), and the 404 H1 uses the same family at 560, clamp to 4rem, max 16ch.
- **Title** (560, 1.25rem): product names in the contents line.
- **Lede** (clamp 1.25–1.6rem, 1.4): the two-line studio statement under the wordmark.
- **Job** (600, clamp 1.125–1.3rem, 1.4): each product's one-line job, set in the text face at semibold.
- **Body** (1.0625rem, 1.6): prose, held to the 38rem measure.
- **Label** (0.9375rem): imprint, navigation, status words, fact rows, footer.
- **Caption** (0.875rem, 1.5): plate captions carrying date, build and redaction provenance.
- **Machine** (Plex Mono 400, 0.86em of its context, tabular numerals, no wrap): versions and commit IDs inline in prose and captions.

### Named Rules

**The Machine Span Rule.** Monospace sets only literal machine strings, such as a version number or a commit ID, inline and at 0.86em of the surrounding text. It never sets labels, status words, headings or prose.

**The Wordmark Spans the Measure Rule.** The wordmark's size is derived from the viewport and gutter, not picked from a scale. If the shell or gutter changes, the divisor (4.62) changes with it.

## Layout

A single centred shell (up to 88rem, with fluid gutters) carries the masthead, opening, products and footer. Reading text is held to a 38rem measure. From 64rem up, products and the working standard sit on a 12-column grid with a fluid column gap. Below that, everything is one column.

The three products use different compositions on the 12-column grid:

- **AFK AI (text-led):** text in columns 1–4, the plate in columns 5–12.
- **DemiMedia (plate-led, full width):** the plate spans all 12 columns with a wider mat. Underneath it, the text forms its own 12-column row: the name in columns 1–4, the job and description in columns 5–8, and the facts and link in columns 9–12.
- **ValClips (plate-led, left):** the plate in columns 1–8, with the text answering in columns 9–12.

Breakpoints: below 40rem, plates bleed to the viewport edge (negative gutter margin, 0.5rem mat) and serve portrait phone crops through `<picture>`/`<source>`, cropped to the part of the window that carries the evidence. From 48rem, the footer becomes a three-part row. From 64rem, the 12-column compositions apply. At 64rem and wider with a height of 50rem or less, the opening tightens so the top edge of the first product plate shows in the first viewport.

Vertical rhythm is generous between products (clamp 2.75–5.5rem) and around the working standard (clamp 3.5–7rem), and tight inside a product (1rem gaps, 0.6rem fact rows).

## Elevation & Depth

The frame is entirely flat, with no box shadows or card surfaces. Structure comes from rules and one tonal reversal. A 1px ink rule opens the masthead's lower edge and each product. 1px hairline-grey rules divide fact rows. Inside the working standard, a Night Pencil rule opens the list and Night Hairline rules divide the principles. Plates are flat mats of product ground with no border and no shadow. Any depth inside a capture belongs to the product, not the frame.

### Named Rules

**The Rule-Built Depth Rule.** Separate information with line weight and space. Strong ink rules divide subjects, hairlines divide facts, and nothing is lifted with a shadow or boxed in a card.

## Shapes

The frame is square-edged throughout: no border radius on any element, including plates, links and the skip link. The only recurring geometry is the horizontal rule and the rectangular plate mat. The capture's own window chrome supplies any corners the page shows.

## Components

### Masthead and navigation

A single row sits above a 1px ink rule: the imprint in Pencil Grey at the left and three quiet text links at the right. The links are at least 44px tall, with the underline hidden (transparent decoration) until hover. The footer navigation uses the same treatment.

### Contents line

A publisher's contents line under the opening lists each product name in display type (Title) with its maturity as a plain status word in Pencil Grey beside it: Beta, In development, Private development. Status is always words, never colour or pills. Each entry is a 44px anchor to its product.

### Product entry

Each entry opens on a 1px ink rule and contains a large display name, a semibold one-line job, a prose paragraph and a fact list, followed by the destination. Fact rows are a two-column grid (a 7.5rem Pencil Grey term, then the value) divided by hairlines. The destination is an underlined semibold text link. If a product has no public destination, the line states that plainly in Pencil Grey, unlinked.

### Plate

A plate is a figure: a real capture on its product's ground mat, followed by a Pencil Grey caption that states the date, the build (as a machine span) and any redaction. Plates never frame a mock-up. Every shipped capture has an entry in `assets/captures/PROVENANCE.md`. Desktop captures are served at 800w and 1600w, with a separate phone crop.

**Settle motion:** under `prefers-reduced-motion: no-preference`, and only where `animation-timeline: view()` is supported, each capture animates from a 4%/3% inset clip and a 1.5rem downward offset to full and in place, from 5% into entry through 28% cover. Content is fully visible without the animation.

### Links and focus

Links inherit their colour and carry a 1px underline at 0.22em offset, which thickens to 2px on hover (140ms ease-out). Every focusable element gets a 2px solid ink outline at 4px offset. Inside the working standard the outline turns Night Ink. Selection reverses ink and paper, and the working standard reverses it again.

### Working standard

This is the one Night band. It holds the headline at the left (columns 1–4) and an ordered list of four principles (columns 5–11). Each principle has a bold Night Ink name followed by Night Pencil explanation, divided by Night Hairline rules, and rows grow to 1.15rem type on desktop.

### Skip link

An ink block with paper text, hidden above the viewport until focused.

## Do's and Don'ts

### Do:

- **Do** keep every frame colour at zero chroma, and let product colour appear only inside a plate on its product ground.
- **Do** give each product its own composition on the 12-column grid rather than a shared tile.
- **Do** caption every plate with date, build ID in a machine span, and any redaction, and log it in the captures provenance file.
- **Do** state maturity in words (contents line status, Status fact row), and state a missing destination plainly instead of linking nowhere.
- **Do** keep standalone navigation targets (masthead, contents line, footer) at least 44px tall, and every focus state a 2px ink outline at 4px offset.
- **Do** gate any motion on `prefers-reduced-motion: no-preference`, with content fully visible without it.
- **Do** keep the wordmark's size tied to the shell width so it spans the measure.

### Don't:

- **Don't** add hue to the frame: no tinted neutrals, accent colours or coloured links.
- **Don't** add cards, box shadows or radius to the frame. Divide with rules.
- **Don't** add a second dark band. The working standard is the only reversal.
- **Don't** use monospace outside literal version strings and commit IDs.
- **Don't** put mock-ups, retouched screens or illustrations in a plate. Plates hold real captures only.
- **Don't** show status as colour, pills or badges.
