---
name: EMN Club Site
colors:
  emn-black: "#221f20"
  emn-offwhite: "#f1f1f1"
  emn-green: "#6ebf46"
  emn-green-mid: "#469042"
  emn-green-dark: "#18512d"
typography:
  display:
    fontFamily: Candu
    fontWeight: 700
    textTransform: uppercase
  body:
    fontFamily: Schibsted Grotesk
    fontSize: 16px
    fontWeight: 400
  title:
    fontSize: 96px
    lineHeight: 1
  heading:
    fontSize: 36px
    lineHeight: 1
  mheading:
    fontSize: 24px
    lineHeight: 1
  description:
    fontSize: 24px
    lineHeight: 1.2
rounded:
  section: 30px
  header: 23px
  pill: 28px
  button: 0.75em
---

# Design System

## Overview
Light, energetic identity for the Emerging Markets Network — a University of Melbourne student club.
Off-white background, bold green accents, chunky 3D buttons, and motion-rich hero sections.
Candu display font for impact, Schibsted Grotesk for readability.

## Colors
- **emn-black** (#221f20): Primary text, dark section backgrounds, button borders/shadows
- **emn-offwhite** (#f1f1f1): Page background, light text on dark sections
- **emn-green** (#6ebf46): Primary accent — CTA buttons, active nav states, social hover
- **emn-green-mid** (#469042): CTA card background
- **emn-green-dark** (#18512d): Events section background, dark green accents

## Typography
- **Display**: Candu (local woff2), all-caps, tight tracking — used for all section titles and the hero marquee
- **Body**: Schibsted Grotesk (Google Fonts), regular weight — paragraphs, nav links, buttons
- **Title**: 96px desktop / 56px mobile, line-height 1
- **Description**: 24px desktop / 18px mobile, line-height 1.2
- **Labels**: 13px, bold — footer newsletter label

## Layout
- **Max content width**: 1190px (sections), 1236px (header), 1197px (CTA card)
- **Page padding**: 16px mobile, 18px desktop
- **Section gap**: 64px mobile, 96px desktop
- **Body background**: emn-offwhite (#f1f1f1)

## Components

### Button
3D "press" button — a colored face floats above its outline/shadow layer.
- Outer wrapper uses `outlineColor` as its background (visible as the 3D shadow edge)
- Inner face has a 2px border matching `outlineColor`, background set to `color`
- Hover lifts the face higher, active/click pushes it flush
- Renders as `<Link>` when `href` is provided, `<button>` otherwise
- Common variants: green face/green-dark outline (primary CTA), black face/black outline, offwhite face/green-dark outline

### SectionContainer
Full-width colored section with 30px rounded corners and centered content.
Background options: `black` (emn-black), `green-dark`, `green-mid`.

### Header
- Floating nav bar: white background, 23px rounded corners, drop shadow
- Desktop: horizontal nav links with pill-shaped active indicator (Button component)
- Mobile: hamburger toggles a full-screen dark overlay with centered links and green underline on active
- Logo: EMN-logo.svg at 125x29px

### Footer
- White background with 40px rounded top corners
- Three rows: UMSU Affiliated badge, internal links + newsletter form, social icons
- Newsletter input: 16px rounded border, overlapping subscribe button on the right
- Social icons: Lucide icons at 25x25px (Instagram, LinkedIn, Facebook, YouTube)

## Iconography
All icons from Lucide React. Used for: social links, mobile menu toggle (Menu/X), animation pause/play (Pause/Play).

## Do's and Don'ts
- Do keep emn-green for primary CTAs only — avoid using it for decorative elements
- Don't mix Candu and Schibsted Grotesk within the same text block
- Do use SectionContainer for any full-width colored section to keep border-radius and spacing consistent
- Don't use hard black (#000000) for text — use emn-black (#221f20) instead
- Do wrap animated components in AnimationProvider so the pause/play toggle works globally
- Don't import 3D/three.js components from server components — keep them inside "use client" boundaries
