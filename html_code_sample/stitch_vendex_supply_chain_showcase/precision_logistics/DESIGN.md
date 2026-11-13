---
name: Precision Logistics
colors:
  surface: '#fbf9f8'
  surface-dim: '#dbdad9'
  surface-bright: '#fbf9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f3f3'
  surface-container: '#efeded'
  surface-container-high: '#e9e8e7'
  surface-container-highest: '#e4e2e2'
  on-surface: '#1b1c1c'
  on-surface-variant: '#41484b'
  inverse-surface: '#303031'
  inverse-on-surface: '#f2f0f0'
  outline: '#71787c'
  outline-variant: '#c0c8cb'
  surface-tint: '#356575'
  primary: '#002630'
  on-primary: '#ffffff'
  primary-container: '#003d4c'
  on-primary-container: '#78a8b9'
  inverse-primary: '#9ecee0'
  secondary: '#5f5e5e'
  on-secondary: '#ffffff'
  secondary-container: '#e5e2e1'
  on-secondary-container: '#656464'
  tertiary: '#1f2323'
  on-tertiary: '#ffffff'
  tertiary-container: '#353838'
  on-tertiary-container: '#9ea1a1'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#baeafd'
  primary-fixed-dim: '#9ecee0'
  on-primary-fixed: '#001f28'
  on-primary-fixed-variant: '#194d5c'
  secondary-fixed: '#e5e2e1'
  secondary-fixed-dim: '#c8c6c5'
  on-secondary-fixed: '#1c1b1b'
  on-secondary-fixed-variant: '#474646'
  tertiary-fixed: '#e1e3e3'
  tertiary-fixed-dim: '#c4c7c7'
  on-tertiary-fixed: '#191c1d'
  on-tertiary-fixed-variant: '#444748'
  background: '#fbf9f8'
  on-background: '#1b1c1c'
  surface-variant: '#e4e2e2'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 40px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 30px
    fontWeight: '600'
    lineHeight: '1.3'
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.4'
    letterSpacing: '0'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: '0'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: '0'
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
    letterSpacing: '0'
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.05em
  button:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.02em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 48px
  xl: 80px
  gutter: 24px
  margin: 32px
---

## Brand & Style
The design system is built upon the principles of **Minimalism** and **Modern Corporate** aesthetics, specifically tailored for the high-stakes environment of global supply chain management. It prioritizes clarity, efficiency, and a "paper-like" digital experience that feels as reliable as a physical ledger but as agile as modern software.

The UI avoids decorative flourishes, gradients, and soft shadows in favor of structural integrity and crisp geometric alignment. By utilizing ample whitespace and a high-contrast palette, the design system ensures that complex logistical data remains legible and actionable, evoking a sense of calm authority and professional precision.

## Colors
The palette is intentionally restrained to maintain high visual focus and print-friendliness. 

- **Primary (Midnight Teal):** A sophisticated, deep teal used for primary actions, brand moments, and critical navigation states. It provides a professional alternative to standard blue.
- **Secondary (Deep Charcoal):** Used for primary text and structural borders to ensure maximum contrast against the white background.
- **Tertiary (Cloud Gray):** A very light, cool gray used for subtle section containers and table headers to organize content without introducing heavy lines.
- **Base (Pure White):** The foundation of the UI, providing an airy and fresh backdrop that highlights the content.

Functional colors for success, warning, and error should be used sparingly and in high-saturation tones to stand out against the monochrome base.

## Typography
The design system utilizes **Inter** exclusively to ensure a systematic, utilitarian feel across all platforms. The hierarchy is established through significant size differentials and strategic use of font weights.

- **Headlines:** Use a tighter tracking (letter-spacing) and bold weights to anchor pages.
- **Body Text:** Leverages a generous 1.6 line height to prevent eye fatigue during long sessions of data entry or manifest review.
- **Labels:** Small caps or bold uppercase styles are used for metadata and table headers to distinguish them from actionable content.

## Layout & Spacing
The layout follows a **Fixed-Fluid Hybrid Grid**. Main dashboard containers are constrained to a maximum width for readability on ultra-wide monitors, while data tables are allowed to flex.

Spacing is governed by an 8px linear scale. Large "Air-Blocks" (48px to 80px) are used between major logical sections to reinforce the minimalist aesthetic and prevent the UI from feeling cluttered despite high data density. Internal component padding should remain tight and consistent (12px or 16px) to maintain a crisp, tool-like feel.

## Elevation & Depth
In alignment with the minimalist brief, this design system eschews traditional shadows. Depth is communicated through **Tonal Layering** and **High-Contrast Outlines**.

- **Level 0 (Floor):** Pure White (#FFFFFF) background.
- **Level 1 (Surface):** Cloud Gray (#F5F7F7) backgrounds for sidebars or secondary content areas.
- **Stroke-based Depth:** Active states or "raised" elements like cards use a 1px solid Deep Charcoal (#121212) border.
- **Backdrop:** When modals are required, use a high-opacity (80%) white overlay rather than a dark tint to maintain the airy, fresh feel of the platform.

## Shapes
The design system employs a **Soft** shape language. A subtle 0.25rem (4px) corner radius is applied to buttons, input fields, and containers. This creates a bridge between the clinical sharpness of a 0px radius and the overly casual nature of rounded UI.

Large cards or "Featured" containers may use a 0.5rem (8px) radius to softly distinguish them from the more rigid data grid elements. All iconography must follow a consistent stroke width of 1.5px or 2px, avoiding filled shapes unless indicating an active state.

## Components
- **Buttons:** Primary buttons are solid Midnight Teal with white text. Secondary buttons are Ghost-style (1px Charcoal border) with Charcoal text. No rounded pills; use the standard 4px radius.
- **Input Fields:** Use a 1px Cloud Gray border that transitions to a 1px Midnight Teal border on focus. Labels must sit above the field in the `label-md` style.
- **Data Tables:** The core of the platform. Use no vertical borders; only 1px Cloud Gray horizontal dividers. Row height should be generous (min-height: 48px).
- **Chips/Status Tags:** Utilize a "High-Contrast Minimalist" approach—white backgrounds with a 1px border colored by status (e.g., green for 'Delivered') and matching text color.
- **Cards:** Cards should not have shadows. Use a 1px Cloud Gray border for inactive cards and a 1px Charcoal border for active or hovered cards.
- **Supply Chain Specifics:** Progress trackers (steppers) should use thin 1px lines and solid Midnight Teal dots for completed steps, ensuring a technical, blueprint-like appearance.