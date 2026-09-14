---
name: Allusions studio site
description: A concise, expressive project register for responsible software.
colors:
  ground: "#f2ede5"
  ground-deep: "#e8e0d5"
  ink: "#181411"
  muted: "#5e554e"
  rule: "#beb3a5"
  accent-rust: "#8c3b27"
  night: "#171311"
  night-ink: "#f3eee7"
  night-muted: "#b9aea4"
typography:
  display:
    fontFamily: "Bricolage Grotesque, system-ui, Segoe UI, sans-serif"
    fontSize: "clamp(3rem, 6.6vw, 6rem)"
    fontWeight: 520
    lineHeight: 0.92
    letterSpacing: "-0.038em"
  body:
    fontFamily: "system-ui, Segoe UI, sans-serif"
    fontSize: "1rem"
    lineHeight: 1.55
  evidence:
    fontFamily: "IBM Plex Mono, Consolas, monospace"
    fontSize: "0.78rem"
    fontWeight: 600
    letterSpacing: "0.075em"
rounded:
  status: "999px"
  favicon: "8px"
spacing:
  gutter: "clamp(1rem, 3vw, 2.5rem)"
  section: "clamp(4.5rem, 9vw, 8.5rem)"
  register-row: "clamp(1.75rem, 4vw, 3.25rem)"
components:
  status:
    borderColor: "{colors.ink}"
    borderWidth: "1px"
    rounded: "{rounded.status}"
    padding: "0 0.65rem"
---

# Design System: Allusions studio site

## Overview

**Creative North Star: "The Responsible Register"**

The site feels like a maker's register enlarged to architectural scale: warm stock, precise rules, oversized grotesque lettering, and machine-readable evidence. Its confidence comes from hierarchy and factual restraint rather than decoration. One near-black section interrupts the page to make the studio standard feel structural, not promotional.

**Key Characteristics:**

- An oversized but controlled ALLUSIONS wordmark.
- A strongly asymmetric project register with visible status and evidence.
- Rust used sparingly for focus, link detail, and directional notation.
- One dark Standard section as the only high-contrast reversal.
- Flat surfaces separated by rules; no cards or decorative shadows.

## Colors

The light field is warm and tactile; the rust accent is restrained; the Standard section is a true near-black reversal.

### Primary

- **Rust Signal**: focus, link underlines, and directional notation only.

### Neutral

- **Warm Ground**: the continuous light-page field.
- **Working Ink**: primary lettering and structural rules.
- **Register Muted**: evidence, labels, and supporting copy.
- **Night Field / Night Ink**: the Standard section's high-contrast pair.

### Named Rules

**The One Reversal Rule.** The Standard section is the only dark surface on the homepage.

**The Evidence Accent Rule.** Rust indicates focus, direction, or interaction; it does not decorate large surfaces.

## Typography

- **Display Font:** Bricolage Grotesque with system fallbacks
- **Body Font:** the operating-system UI stack
- **Label/Mono Font:** IBM Plex Mono with Consolas fallback

**Character:** Broad, mechanical display forms carry the studio voice. Plain system prose keeps explanations direct, while mono is reserved for status, indexing, and proof.

### Hierarchy

- **Display** (520, up to 6rem, 0.92): hero, project names, and the Standard statement.
- **Headline** (560, up to 2.15rem): section titles.
- **Body** (1rem, 1.55): explanations and project descriptions, kept to readable measures.
- **Evidence** (600, 0.72–0.78rem, tracked): status, project indices, and capability proof.

### Named Rules

**The Machinery Speaks Mono Rule.** Only state, sequence, and evidence use monospace.

## Layout

A centered shell tops out at 1180px with fluid gutters. Desktop uses deliberately unequal hero and register columns; tablet collapses the hero while preserving indexed two-column rows; mobile becomes one column without hiding navigation or evidence. Spacing is generous between sections and tighter within each factual group.

## Elevation & Depth

The system is entirely flat. Depth comes from scale, whitespace, strong horizontal rules, and the single tonal reversal; shadows and translucent layers are absent.

### Named Rules

**The Rule-Built Depth Rule.** Use line weight and spatial rhythm, never cards or shadows, to separate information.

## Shapes

The page is square-edged and planar. Full pills are reserved for compact status labels; the favicon alone uses a small radius required by its application-icon scale.

## Components

### Navigation

Compact text links provide at least 44px target height. Hover uses rust-toned text on the light field; keyboard focus uses a three-pixel rust outline.

### Status labels

One-pixel ink pills contain explicit text so maturity is never communicated by color alone.

### Project register

Each project row combines an indexed mono label, a large display name and role, then a separate status/evidence/destination column. Column proportions vary by project on desktop and converge responsively.

### Standard principles

An ordered four-row list pairs tabular mono numerals with bold display-led principle names and lighter explanatory text.

## Do's and Don'ts

### Do:

- **Do** preserve the asymmetric register and the single dark reversal.
- **Do** keep status text explicit and product destinations authoritative.
- **Do** use strong rules, restrained rust, and visible focus states.
- **Do** keep all runtime assets self-hosted.

### Don't:

- **Don't** turn projects into equal cards or add dashboard chrome.
- **Don't** introduce gradients, decorative shadows, remote assets, or third-party scripts.
- **Don't** use monospace for ordinary prose.
- **Don't** add unverified downloads, release claims, or private repository links.
