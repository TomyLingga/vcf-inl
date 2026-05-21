---
version: "atmospheric-glass"
name: "VCF System - Atmospheric Glass"
description: "Atmospheric Glass design system customized for VCF (Vehicle Control Form) truck tracking system at PT. Industri Nabati Lestari. Features vibrant gradient backdrop with frosted translucent interface layers, dynamic theme switching, and premium glassmorphism aesthetics optimized for industrial operations."
colors:
  background: "#0b1326"
  surface: "#0b1326"
  surface-container: "#171f33"
  surface-container-high: "#222a3d"
  surface-container-highest: "#2d3449"
  primary: "#ffffff"
  on-primary: "#2f3131"
  secondary: "#adc9eb"
  on-surface: "#dae2fd"
  on-surface-variant: "#c4c7c8"
  outline: "#8e9192"
  outline-variant: "#444748"
  error: "#ffb4ab"
  # Background gradient for atmospheric effect
  gradient-1: "#1E3A8A"
  gradient-2: "#7E22CE"
  gradient-3: "#DB2777"
  # Light theme variant
  light-background: "#F8FAFC"
  light-surface: "#FFFFFF"
  light-surface-container: "#F1F5F9"
  light-primary: "#0F172A"
  light-on-primary: "#FFFFFF"
  light-secondary: "#64748B"
  light-on-surface: "#0F172A"
  light-on-surface-variant: "#475569"
typography:
  display-lg:
    fontFamily: "Inter"
    fontSize: "84px"
    fontWeight: 700
    lineHeight: "90px"
    letterSpacing: "-0.04em"
  headline-lg:
    fontFamily: "Inter"
    fontSize: "32px"
    fontWeight: 600
    lineHeight: "40px"
    letterSpacing: "-0.02em"
  headline-md:
    fontFamily: "Inter"
    fontSize: "24px"
    fontWeight: 500
    lineHeight: "32px"
    letterSpacing: "normal"
  body-lg:
    fontFamily: "Inter"
    fontSize: "18px"
    fontWeight: 400
    lineHeight: "28px"
    letterSpacing: "normal"
  body-md:
    fontFamily: "Inter"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: "24px"
    letterSpacing: "normal"
  label-sm:
    fontFamily: "Inter"
    fontSize: "12px"
    fontWeight: 600
    lineHeight: "16px"
    letterSpacing: "0.05em"
spacing:
  unit: "8px"
  container-padding: "24px"
  card-gap: "16px"
  section-margin: "40px"
  glass-padding: "20px"
rounded:
  sm: "0.25rem"
  DEFAULT: "0.5rem"
  md: "0.75rem"
  lg: "1rem"
  xl: "1.5rem"
  full: "9999px"
components:
  card:
    background: "rgba(255, 255, 255, 0.1) for standard, rgba(255, 255, 255, 0.2) for elevated"
    radius: "rounded-lg (1rem) for standard, rounded-xl (1.5rem) for elevated"
  button:
    background: "primary (#ffffff) for main actions"
    radius: "rounded-xl (1.5rem) for softer tactile feel"
---
# VCF System Design System — Atmospheric Glass

## Project Context

**VCF System** — Vehicle Control Form for PT. Industri Nabati Lestari, an industrial plant tracking truck movements through a 4-step workflow:
1. Gate Masuk (Entry Gate)
2. Weighbridge Masuk (Incoming Weighbridge)
3. Weighbridge Keluar (Outgoing Weighbridge)
4. Gate Keluar (Exit Gate)

This design system combines Atmospheric Glass aesthetics with enterprise-grade data density, optimized for industrial operations where clarity and quick information access are critical.

## Design Philosophy

### Atmospheric Glass with Industrial Precision

The system uses Atmospheric Glass's ethereal, high-fidelity glass aesthetic adapted for industrial operations:
- **Vibrant gradient backdrop** (deep blue, purple, pink) provides visual energy
- **Frosted translucent interface layers** behave like crystalline panes above the canvas
- **Strong contrast ratios** for readability on top of shifting gradients
- **Generous spacing** so each panel feels like a floating object
- **Depth through blur, edge highlights, and soft shadows** instead of dark stacking

The intended emotional tone is serene, modern, and slightly futuristic — perfect for a modern industrial tracking system.

### Dynamic Theme Switching

**Admin-configurable themes** allow the system to adapt to different operational contexts:

**Dark Theme (Default - Atmospheric)**
- Background: `#0b1326` (Deep atmospheric canvas)
- Surface: `#171f33` (Contained panel background)
- Primary: `#ffffff` (Main foreground and high-contrast action)
- Text: `#dae2fd` / `#c4c7c8` (Primary and secondary text)
- Gradient: `#1E3A8A` → `#7E22CE` → `#DB2777` (Atmospheric blend)

**Light Theme**
- Background: `#F8FAFC` (Clean industrial white)
- Surface: `#FFFFFF` (White glass panels)
- Primary: `#0F172A` (Dark foreground for contrast)
- Text: `#0F172A` / `#475569` (Readable dark hierarchy)

**Custom Theme Support**
- Admin can override any color token via settings API
- Theme preferences stored per-user or system-wide
- Smooth transitions between themes (200-300ms ease)

## Color System

### Dark Theme (Atmospheric - Default)

| Token | Value | Role |
|---|---|---|
| `background` | `#0b1326` | Base atmospheric canvas |
| `surface-container` | `#171f33` | Main contained panel background |
| `surface-container-high` | `#222a3d` | Elevated panel layer |
| `primary` | `#ffffff` | Main foreground and high-contrast action |
| `secondary` | `#adc9eb` | Cool accent for secondary emphasis |
| `on-surface` | `#dae2fd` | Primary text on dark glass |
| `on-surface-variant` | `#c4c7c8` | Secondary labels and metadata |
| `outline` | `#8e9192` | Edge and border guidance |
| `error` | `#ffb4ab` | Error state |

### Background Gradient

The atmospheric gradient uses three colors for the vibrant backdrop:
- `gradient-1`: `#1E3A8A` (Deep blue)
- `gradient-2`: `#7E22CE` (Purple)
- `gradient-3`: `#DB2777` (Pink)

### Light Theme

| Token | Value | Role |
|---|---|---|
| `light-background` | `#F8FAFC` | Clean canvas |
| `light-surface` | `#FFFFFF` | White glass panels |
| `light-primary` | `#0F172A` | Dark foreground for contrast |
| `light-secondary` | `#64748B` | Secondary accent |
| `light-on-surface` | `#0F172A` | Primary text |
| `light-on-surface-variant` | `#475569` | Secondary labels |

### Glassmorphism Effects

**Translucency**:
- Standard glass layers: `rgba(255, 255, 255, 0.1)`
- Elevated layers: `rgba(255, 255, 255, 0.2)`

**Backdrop Blur**:
- Level 2 (Standard): `backdrop-filter: blur(20px)`
- Level 3 (Elevated): `backdrop-filter: blur(40px)`

**Edge Treatment**:
- Border: `1px solid rgba(255, 255, 255, 0.2)`
- Inner shine on top/left edges for refraction effect
- Shadow: `0 8px 32px 0 rgba(0, 0, 0, 0.1)`

## Typography

**Primary Font**: Inter across all roles (display, headline, body, label)

The system increases weight slightly on frosted surfaces to maintain clarity against blurred and colorful backgrounds.

| Token | Font | Size | Weight | Line height | Letter spacing | Usage |
|---|---|---:|---:|---:|---:|---|
| `display-lg` | Inter | 84px | 700 | 90px | -0.04em | Large metrics and hero focal values |
| `headline-lg` | Inter | 32px | 600 | 40px | -0.02em | Section-leading titles |
| `headline-md` | Inter | 24px | 500 | 32px | normal | Secondary headings |
| `body-lg` | Inter | 18px | 400 | 28px | normal | Prominent body copy |
| `body-md` | Inter | 16px | 400 | 24px | normal | Standard body text |
| `label-sm` | Inter | 12px | 600 | 16px | 0.05em | Metrics, small labels, uppercase metadata |

### Type Treatment

- Large numeric values should act as the main visual anchor
- Smaller labels may use a subtle text shadow: `0px 2px 4px rgba(0,0,0,0.15)` for contrast
- Secondary metadata should use `on-surface-variant` rather than pure white

## Layout & Spacing

Base grid: 8px rhythm with floating glass containers inside generous safe areas

| Token | Value | Usage |
|---|---|---|
| `unit` | 8px | Base rhythm |
| `container-padding` | 24px | Outer page or shell padding |
| `card-gap` | 16px | Gaps between related cards or metrics |
| `section-margin` | 40px | Separation between larger blocks |
| `glass-padding` | 20px | Internal padding for glass cards |

### Layout Guidance

- Keep outer margins at 24px or more so the background remains visible
- Group related metrics into grids or flex rows with 16px gaps
- Use contextual floating containers instead of rigid heavy panels

### Dashboard Structure

- **Sidebar**: 280px fixed, collapsible on mobile
- **Header**: 64px fixed, contains search, user menu, theme toggle
- **Main Content**: Flexible grid, responsive breakpoints
- **Cards**: Glass panels with consistent padding and radius

## Radius and Shape

The shape language is soft and approachable, matching the fluid background

| Token | Value | Usage |
|---|---|---|
| `sm` | 0.25rem | Small chips and compact details |
| `DEFAULT` | 0.5rem | General purpose rounding |
| `md` | 0.75rem | Interactive rows and medium elements |
| `lg` | 1rem | Standard cards |
| `xl` | 1.5rem | Buttons, inputs, larger tactile controls |
| `full` | 9999px | Pills and fully rounded elements |

Cards should generally use 1rem rounding, while buttons and search-style controls should use `rounded-xl` for a softer tactile feel.

## Components

### Glass Cards

**Glass Card Standard**
- Background: `rgba(255, 255, 255, 0.1)`
- Text color: `primary` (#ffffff)
- Radius: `rounded.lg` (1rem)
- Padding: `spacing.glass-padding` (20px)
- Backdrop: `blur(20px)`

**Glass Card Elevated**
- Background: `rgba(255, 255, 255, 0.2)`
- Text color: `primary` (#ffffff)
- Radius: `rounded.xl` (1.5rem)
- Padding: `spacing.glass-padding` (20px)
- Backdrop: `blur(40px)`

### Buttons

**Primary Button**
- Background: `primary` (#ffffff)
- Text: `on-primary` (#2f3131)
- Typography: `label-sm` (12px, 600)
- Radius: `rounded.xl` (1.5rem)
- Height: 48px
- Padding: `0 24px`

**Ghost Button**
- Background: `rgba(255, 255, 255, 0.05)`
- Text: `primary` (#ffffff)
- Typography: `label-sm` (12px, 600)
- Radius: `rounded.xl` (1.5rem)

### Inputs

**Input Field**
- Background: `rgba(255, 255, 255, 0.1)`
- Text: `primary` (#ffffff)
- Typography: `body-md` (16px, 400)
- Radius: `rounded.xl` (1.5rem)
- Padding: 20px
- Height: 48px

**Interactive List Item**
- Default background: `transparent`
- Radius: `rounded.md` (0.75rem)
- Padding: 12px
- Hover background: `rgba(255, 255, 255, 0.1)`

### Status Indicators

- **Success**: Green glass with green text
- **Warning**: Yellow glass with yellow text
- **Error**: Red glass with red text (use `error` token: #ffb4ab)
- **Info**: Blue glass with blue text

## VCF-Specific Components

### Workflow Step Indicator

Horizontal progression bar showing 4 steps:
- Active step: Primary color, filled
- Completed: Primary color, outlined
- Pending: Secondary color, outlined
- Current: Pulsing glow effect

### Truck Card

Compact card showing:
- Truck plate (large, mono font)
- Driver name
- Current workflow step
- Timestamp
- Status badge
- Quick actions (view, edit, print)

### Data Table

Glass-based table with:
- Row hover: `rgba(255, 255, 255, 0.05)`
- Header: Slightly darker glass
- Sort indicators: Subtle icons
- Pagination: Glass buttons

## Motion & Animation

- **Theme transition**: 200ms ease-in-out
- **Card hover**: 150ms ease-out, subtle lift
- **Button press**: 100ms ease-in, scale 0.98
- **Modal open**: 300ms ease-out, fade + scale
- **Loading**: Skeleton with shimmer effect

## Accessibility

- Minimum contrast ratio: 4.5:1 for text
- Focus indicators: 2px solid #6D5DFB
- Keyboard navigation: Full tab support
- Screen reader: Proper ARIA labels
- Color blindness: Patterns + colors for status

## Implementation Notes

### Backend (Laravel)

- Theme configuration stored in `settings` table
- API endpoint: `GET /api/settings/theme`
- Theme update: `PUT /api/settings/theme` (admin only)
- Default theme: Dark (Atmospheric)
- Supported themes: `dark`, `light`, `custom`

### Frontend (Next.js)

- Theme context: React Context for theme state
- Tailwind: Custom config with CSS variables for dynamic theming
- Local storage: Persist user theme preference
- API sync: Fetch theme settings on mount
- Gradient background: CSS gradient using `gradient-1`, `gradient-2`, `gradient-3` tokens

### Tailwind Configuration

The Tailwind configuration should mirror the core primitives:
- Colors: Map Atmospheric Glass color tokens to Tailwind colors
- Typography: Inter font family with type scale
- Border radius: Use the rounded tokens
- Spacing: 8px base grid with spacing tokens

## Guardrails

- **Do not** break the 4-step workflow visual hierarchy
- **Do not** remove glassmorphism effects (they define the system identity)
- **Do not** use pure black or pure white (always use tinted variants)
- **Do not** add excessive motion (industrial context requires focus)
- **Do** maintain contrast ratios in all themes (minimum 4.5:1)
- **Do** preserve the vibrant gradient background in dark theme
- **Do** keep the relationship between vibrant background energy and restrained translucent foreground surfaces
- **Do** use Inter font family consistently across all typography

## Design Tokens Reference

Base design system: [Atmospheric Glass](https://designmd.ai/brunopetrovic/atmospheric-glass) by brunopetrovic

Customized for VCF System with:
- Dynamic theme switching capability
- Industrial operation optimization
- VCF-specific component patterns
- Enhanced accessibility for factory environments

---

*Last updated: May 2026 — VCF Design System v1.0*
