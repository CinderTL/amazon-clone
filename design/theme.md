---
name: 'Black & White — Signal Red'
runtime:
  dark: blackwhite-dark
  light: blackwhite-light
variants:
  dark:
    foundation:
      canvas: "#050505"
      surface: "#0D0D0D"
      signal: "#ff2600"
      muted: "#6E6E6E"
      subtext: "#b3b3b3"
      border: "#2E2E2E"
      elevated: "#121212"
      disabled: "#525252"
  light:
    foundation:
      canvas: "#FCFCFC"
      surface: "#F7F7F7"
      elevated: "#F1F1F1"
      border: "#C8C8C8"
      disabled: "#B0B0B0"
      muted: "#8A8A8A"
      signal: "#ff2600"
typography:
  headline-xl:
    fontFamily: 'Inter'
    fontSize: '48px'
    fontWeight: '700'
    lineHeight: '56px'
    letterSpacing: '-0.02em'
  headline-lg:
    fontFamily: 'Inter'
    fontSize: '32px'
    fontWeight: '600'
    lineHeight: '40px'
    letterSpacing: '-0.01em'
  headline-lg-mobile:
    fontFamily: 'Inter'
    fontSize: '28px'
    fontWeight: '600'
    lineHeight: '36px'
  headline-md:
    fontFamily: 'Inter'
    fontSize: '24px'
    fontWeight: '600'
    lineHeight: '32px'
  body-lg:
    fontFamily: 'Inter'
    fontSize: '18px'
    fontWeight: '400'
    lineHeight: '28px'
  body-md:
    fontFamily: 'Inter'
    fontSize: '16px'
    fontWeight: '400'
    lineHeight: '24px'
  label-md:
    fontFamily: 'Inter'
    fontSize: '14px'
    fontWeight: '500'
    lineHeight: '20px'
    letterSpacing: '0.01em'
  label-sm:
    fontFamily: 'Inter'
    fontSize: '12px'
    fontWeight: '600'
    lineHeight: '16px'
    letterSpacing: '0.05em'
rounded:
  sm: '0.125rem'
  DEFAULT: '0.25rem'
  md: '0.375rem'
  lg: '0.5rem'
  xl: '0.75rem'
  full: '9999px'
spacing:
  base: '4px'
  xs: '4px'
  sm: '8px'
  md: '16px'
  lg: '24px'
  xl: '40px'
  gutter: '24px'
  margin-mobile: '16px'
  margin-desktop: '48px'
---

## Brand & Style

### Dark

The design system is a monochrome-plus-signal framework built for editorial clarity, documentation, and distraction-free reading. Contrast is achieved through eight luminance steps, with a single chromatic accent (`signal`) reserved for emphasis, actions, and focus states.

The aesthetic is **Pure Minimalism** with a **Swiss editorial** sensibility, punctuated by a high-alert red. Near-white text on a near-black canvas (`canvas`), with `signal` (`#ff2600`) marking anything that demands attention. The emotional response is calm authority and precision, cut with urgency wherever `signal` appears.

### Light

The design system is a monochrome-plus-signal framework built for editorial clarity, documentation, and distraction-free reading. Contrast is achieved through eight luminance steps, with a single chromatic accent (`signal`) reserved for emphasis, actions, and focus states.

The aesthetic is **Pure Minimalism** with a **Swiss editorial** sensibility, punctuated by a high-alert red. Ink-dark text on a bright canvas (`canvas`), with `signal` (`#ff2600`) marking anything that demands attention. The emotional response is clarity and professionalism, cut with urgency wherever `signal` appears.

## Colors

The palette uses exactly seven foundation tokens per variant. Every UI color derives from these values.

### Dark

| Token | Value | Role |
|-------|-------|------|
| `canvas` | `#050505` | App background |
| `surface` | `#0D0D0D` | Cards, modals, panels |
| `signal` | `#ff2600` | Primary text, buttons, focus |
| `muted` | `#6E6E6E` | Secondary text |
| `border` | `#2E2E2E` | Dividers, card borders |
| `elevated` | `#121212` | Hovered cards, dropdowns |
| `disabled` | `#525252` | Disabled controls |

### Light

| Token | Value | Role |
|-------|-------|------|
| `canvas` | `#FCFCFC` | App background |
| `surface` | `#F7F7F7` | Cards, modals, panels |
| `elevated` | `#F1F1F1` | Hovered cards, dropdowns |
| `border` | `#C8C8C8` | Dividers, card borders |
| `disabled` | `#B0B0B0` | Disabled controls |
| `muted` | `#8A8A8A` | Secondary text |
| `signal` | `#ff2600` | Primary text, buttons, focus |

## Typography & Scale

The type scale is optimized for information density. Large headlines use tighter letter-spacing and heavier weights to feel "architectural" and grounded. Labels and small captions use a slightly increased letter-spacing to ensure readability against varied backgrounds.

## Elevation & Depth

Depth is communicated through **tonal layering** rather than shadows.

### Dark

- **Level 0 (`canvas`):** `#050505` — the app shell.
- **Level 1 (`surface`):** `#0D0D0D` — cards and panels on the canvas.
- **Level 2 (`elevated`):** `#121212` — modals, dropdowns, and hover states.
- **Buttons & focus:** `signal` (`#ff2600`) fill with `canvas` (`#050505`) label text; focus rings use `signal` at 8% opacity.

### Light

- **Level 0 (`canvas`):** `#FCFCFC` — the app shell.
- **Level 1 (`surface`):** `#F7F7F7` — cards and panels on the canvas.
- **Level 2 (`elevated`):** `#F1F1F1` — modals, dropdowns, and hover states.
- **Buttons & focus:** `signal` (`#ff2600`) fill with `canvas` (`#FCFCFC`) label text; focus rings use `signal` at 8% opacity.

## Shapes

The shape language is **Soft** but disciplined. A 0.25rem (4px) radius is the standard for most components. Larger containers like cards may use 0.5rem (8px) for a slightly more approachable feel.

## Components

### Dark

- **Buttons:** Primary buttons use `signal` (`#ff2600`) fill with `canvas` (`#050505`) text. Secondary buttons use a transparent background with a 1px `border`.
- **Inputs:** Fields use `surface` with a 1px `border`. On focus, the border shifts to `signal` with a subtle glow from `signal` at 8% opacity.
- **Chips:** Low-profile containers with `elevated` backgrounds and `muted` text. Selected chips use `signal` fill with `canvas` text.
- **Cards:** `surface` background with `border` edge — no shadow.
- **Lists:** Clean rows with 1px `border` dividers. Hover states shift to `elevated`.
- **Disabled:** All disabled controls use `disabled` (`#525252`).

### Light

- **Buttons:** Primary buttons use `signal` (`#ff2600`) fill with `canvas` (`#FCFCFC`) text. Secondary buttons use a transparent background with a 1px `border`.
- **Inputs:** Fields use `surface` with a 1px `border`. On focus, the border shifts to `signal` with a subtle glow from `signal` at 8% opacity.
- **Chips:** Low-profile containers with `elevated` backgrounds and `muted` text. Selected chips use `signal` fill with `canvas` text.
- **Cards:** `surface` background with `border` edge — no shadow.
- **Lists:** Clean rows with 1px `border` dividers. Hover states shift to `elevated`.
- **Disabled:** All disabled controls use `disabled` (`#B0B0B0`).
