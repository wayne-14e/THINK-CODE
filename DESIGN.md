# THINK//CODE Design System

## Overview

THINK//CODE is a dark indigo arcade: a cool, low-light canvas lit by a slow green-to-Blurple mesh, punctuated by compact cards, full-bleed media, and restrained accent light. It should feel like a place where serious algorithmic practice is also playful — competitive, warm, and human, never like a school portal or a corporate course centre.

The primary accent is **electric green** (`{colors.primary}` — `#35ed7e`). It owns primary actions, active navigation, the brand's `//`, the trace-check surface, and the highest-intent moments. **Blurple** (`{colors.secondary}` — `#5865f2`) is the secondary accent: it carries workshop surfaces, secondary actions, links, focus, and quiet brand support. There is no pink or magenta in the system.

Surfaces stack in cool near-black indigos: the canvas, a raised panel, a lighter overlay, and pure black for code and media wells. Typography is loud and top-heavy: **Space Grotesk** display headings set in all caps, **Inter** for UI and body copy, and **JetBrains Mono** for code, metrics, and technical labels.

Geometry is compact and restrained. Controls round at 6–10px; cards and small panels at 12–16px; feature panels, media frames, and GIFs at 20px. Media is never boxed in with padding — animated GIFs bleed to the rounded edge of their frame.

**Key characteristics:**

- Dark indigo canvas (`{colors.canvas}`) with a static atmospheric mesh in the workspace and an animated green-to-Blurple mesh in the landing hero.
- Electric green (`{colors.primary}`) is the primary action and accent colour; Blurple (`{colors.secondary}`) is secondary.
- Surfaces are darker than the accents. Green and Blurple appear as borders, glows, labels, and fills — never as large flat page backgrounds.
- All-caps Space Grotesk display type at 700, tracked tight, over compact rounded media.
- Tight, modern geometry: 6–10px controls, 12–16px cards, 20px media and feature panels.
- Full-bleed animated GIFs in the hero, trace-check section, and workshop showcase, with rounded corners and no interior padding.
- Page rhythm: indigo hero → dark marquee band → green trace practice → dark green/indigo tracks panel → Blurple workshop showcase → dark CTA panel → giant wordmark footer.

## Colors

All colour tokens live in `app/globals.css`. Components consume the semantic variables, never raw hex values.

### Brand & accent

- **Electric Green** (`{colors.primary}` — `#35ed7e`): the primary accent. Primary buttons, active navigation, the `//` in the wordmark, the trace-check surface, live/positive emphasis, and the brand's high-intent action. Hover: `#5cf295`. Text on green: `{colors.primary-ink}` (`#04140a`).
- **Blurple** (`{colors.secondary}` — `#5865f2`): the secondary accent. Workshop surfaces, secondary buttons, links, focus outlines, and quiet brand support. Hover: `#727bf5`. Text on Blurple: white.
- **Blurple Soft** (`{colors.secondary-soft}` — `#8b95ff`): link and metadata tint on dark surfaces. Also the `--brand-link` and `--accent-cyan` alias.
- **Brand Lime** (`{colors.logo}` — `#97f805`): the logo mark's original lime, used only inside `public/assets/logo.svg`.

### Surface

- **Indigo Canvas** (`{colors.canvas}` — `#06081c`): the page base, washed by the brand mesh.
- **Raised Indigo** (`{colors.surface-indigo}` — `#0e1230`): feature cards, sidebar, modals, media frames.
- **Indigo Overlay** (`{colors.surface-overlay}` — `#171c3d`): hover fills, active rows, nested controls.
- **Indigo Border** (`{colors.border}` — `#252c55`): hairlines and card outlines.
- **Black** (`{colors.surface-black}` — `#000000`): code blocks and GIF wells.

### Text

- **White** (`{colors.ink}` — `#ffffff`): all display and body text on dark surfaces.
- **Secondary** (`{colors.ink-secondary}` — `#b6bcdc`): supporting copy and labels.
- **Tertiary** (`{colors.ink-tertiary}` — `#7b83ab`): fine print, metadata, placeholders.
- **Ink** (`{colors.ink-dark}` — `#04140a`): text on green fills.

### Status

- **Success** — `#35ed7e` (green, same as the primary accent).
- **Warning** — `#f8a502` (functional amber; never used decoratively).
- **Error** — `#ff5c5c`.
- **Info** — `#8b95ff` (same as Blurple Soft).

Difficulty labels use the accent palette rather than the warning amber: easy is success green, medium is Blurple Soft, and hard is error red.

### Atmosphere

The landing hero rides an animated mesh that sweeps between electric green and Blurple, resolving into the dark indigo canvas at the edges. It is the brand's atmospheric signature. The workspace uses a static, low-intensity version of the same mesh so long practice sessions stay calm and readable.

## Typography

### Font families

- **Space Grotesk** — display face for all headings. Weight 700, all caps, tracked tight. Substitute for the proprietary heavy geometric grotesques used by gaming brands.
- **Inter** — interface and body copy. Weights 400–700.
- **JetBrains Mono** — code, metrics, timestamps, eyebrow labels, and technical tags. Weights 400–700.

Fonts load from Google Fonts in `app/globals.css` with system fallbacks. Do not add a second display face.

### Hierarchy

| Token | Size | Weight | Case | Use |
|---|---|---|---|---|
| `{typography.display-hero}` | clamp(2.75rem, 7vw, 5.25rem) | 700 | UPPER | Landing hero |
| `{typography.display-band}` | clamp(2rem, 5vw, 3.5rem) | 700 | UPPER | CTA bands, marquee |
| `{typography.heading-xl}` | 2.25rem (36px) | 700 | UPPER | Page title |
| `{typography.heading-lg}` | 1.875rem (30px) | 700 | UPPER | Section heading |
| `{typography.heading-md}` | 1.5rem (24px) | 700 | UPPER | Card heading |
| `{typography.heading-sm}` | 1.125rem (18px) | 700 | UPPER | Small card / step label |
| `{typography.body-lg}` | 1.125rem (18px) | 400 | Sentence | Lead paragraph |
| `{typography.body}` | 0.875rem (14px) | 400 | Sentence | Default UI copy |
| `{typography.label}` | 0.75rem (12px) | 500 | UPPER | Eyebrow, metadata |
| `{typography.mono}` | 0.75rem (12px) | 500 | As written | Code, metrics |

### Principles

- Headings are all caps and heavy. The display-to-body weight jump is deliberate: 700 display against 400 body.
- Keep display tracking tight (`-0.02em` to `-0.035em`); never add positive tracking to headings.
- Body copy stays sentence case. Do not set paragraphs in caps or mono.
- Mono is for technical truth (code, XP, dates, IDs), not decoration.

## Layout

### Spacing

- Base unit: 8px.
- Practical steps: 4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 48 · 64 · 96px.
- Card interiors use 20–32px; section rhythm uses 64–96px on desktop and 48–64px on mobile.
- Buttons pad 10–12px vertical by 20–28px horizontal.

### Grid & container

- Marketing pages centre a 1280px column on the full-bleed canvas.
- The signed-in workspace centres a 1440px content region beside a collapsible 240px sidebar.
- Feature sections use two-column 12-column splits (text + media) or stacked full-width panels.
- Bands (marquee, CTA, showcase) are dark fields with their own rounded inner containers.

### Responsive strategy

| Name | Width | Key changes |
|---|---|---|
| Mobile | < 768px | Single column; nav collapses to brand + actions; CTAs stack; bottom tab bar appears in the workspace |
| Tablet | 768–1023px | Two-column splits begin stacking; media spans full width |
| Laptop | 1024–1279px | Sidebar appears; multi-column grids retained |
| Desktop | ≥ 1280px | Full grids; 1280px marketing / 1440px workspace column |

- Touch targets stay ≥ 44px on mobile.
- The workspace is desktop-first; mobile remains functional but is not the optimisation target.
- GIFs scale fluidly and keep their 20px radius at every width.

### Image behaviour

- Animated GIFs are full-bleed inside a rounded frame: no padding, no matte, no inner card.
- Use `object-cover` and an explicit aspect ratio so the frame never jumps while the GIF loads.
- Next.js `<Image>` must use `unoptimized` for GIFs so animation is preserved.
- Static product mockups may sit inside dark indigo cards; character art may overlap card edges for depth.

## Elevation & depth

| Level | Treatment | Use |
|---|---|---|
| 0 — Flat | No shadow; separation by colour field and radius | Most cards, bands, rows |
| 1 — Soft float | Wide, low-opacity green- or Blurple-tinted glow | Hero media, feature panels, modals |
| 2 — Focus | 1px accent border + tinted fill | Active nav, selected options, live trace |

Depth comes primarily from colour, gradient, and radius. Shadows are wide, low-opacity, and tinted by the local accent; never hard black drop shadows.

## Shapes

| Token | Value | Use |
|---|---|---|
| `{rounded.xs}` | 4px | Compact chips, tiny controls |
| `{rounded.sm}` | 6px | Small chips, tags |
| `{rounded.md}` | 8px | Inputs, compact controls |
| `{rounded.lg}` | 10px | Buttons, links, table cells |
| `{rounded.xl}` | 12px | Small cards, track cards |
| `{rounded.2xl}` | 16px | Cards, media frames, modals |
| `{rounded.3xl}` | 20px | Feature panels, GIF frames |
| `{rounded.4xl}` | 24px | Oversized signature panels |
| `{rounded.full}` | 9999px | Avatars, icon buttons, pills |

The Tailwind radius scale is remapped in `app/globals.css`. Use `rounded-lg` for controls, `rounded-xl`/`rounded-2xl` for cards, and `rounded-2xl`/`rounded-3xl` for feature panels and media. Do not use arbitrary 40px radii.

## Components

### Buttons

**`button-primary`** — the default green action
- Background `{colors.primary}`, text `{colors.primary-ink}`, type 14px/600–700, `rounded-lg`, padding 10px 20px. Hover `{colors.primary-hover}`.

**`button-secondary`** — Blurple action
- Background `{colors.secondary}`, text white, type 14px/600–700, `rounded-lg`, padding 10px 20px. Hover `{colors.secondary-hover}`. Used for the workshop RSVP/join action.

**`button-white`** — white solid button
- Background white, text indigo canvas, type 14px/600, `rounded-lg`, padding 10px 20px. Used for "Sign in" on the marketing header.

**`button-ghost`** — secondary action on dark surfaces
- Transparent or `{colors.surface-overlay}`, white text, 1px `{colors.border}`, `rounded-lg`. Hover raises border contrast.

### Cards & containers

**`hero`**
- Dark indigo canvas with animated green-to-Blurple mesh, centred all-caps display headline, green primary CTA, ghost secondary, then a 20px-rounded full-bleed GIF.

**`feature-card-dark`**
- `{colors.surface-indigo}`, white text, `rounded-xl`/`rounded-2xl`, 20–32px padding, 1px border. The default in-app card.

**`feature-card-green`**
- Raised indigo with a green-tinted border and soft green glow. Used for the landing trace-check surface.

**`feature-card-blurple`**
- Raised indigo with a Blurple-tinted border and soft Blurple glow. Used for the landing workshop showcase.

**`feature-panel-dark-gradient`**
- Deep emerald-to-indigo gradient (`#052a1b → #071a33 → #0a1029`), 1px green border, green numeral, white heading. Used for the "Four core tracks" panel.

**`gif-frame`**
- `{colors.surface-black}` well, 1px border, 20px radius, `overflow-hidden`, no padding. The image fills the frame with `object-cover`.

**`stat-card`**
- Raised-indigo surface, large mono number, uppercase label, `rounded-lg`/`rounded-xl`.

**`step-card`**
- Raised indigo with a green or Blurple accent, numbered label in mono, uppercase heading, `rounded-lg`.

**`cta-band`**
- Dark raised panel with a green border, green and Blurple ambient glows, centred `{typography.display-band}`, and a green primary CTA. Never a flat green page field.

**`marquee-band`**
- Dark raised strip with green top/bottom hairlines, green all-caps technical topics paired with Blurple Soft icons, slow horizontal loop. Disabled under `prefers-reduced-motion`.

### Navigation

**`nav-bar`** — marketing header
- Indigo canvas at 85% opacity with blur, 1px border, lime brand mark, wordmark with a green `//`, uppercase mono nav links, language toggle, white "Sign in".

**`app-header`** — workspace top bar
- Same treatment at 56px height: brand, quiet streak/XP summary, language toggle, profile and sign-out.

**`sidebar`**
- Raised indigo, 240px expanded / 64px collapsed. Active row uses a green tint, green border, and green icon. Community links sit below the nav.

**`mobile-tab-bar`**
- Raised indigo, 44px+ targets, green active icon/label.

### Inputs & forms

- Inputs use `{colors.surface-deep}` or `{colors.surface-overlay}` fills, 1px `{colors.border}`, `rounded-md`, white text, tertiary placeholders.
- Focus uses a 2px Blurple Soft outline with 2px offset.
- Error text uses `{colors.status-error}`; success uses `{colors.status-success}`.

### Signature components

**`trace-check`**
- A raised-indigo panel with a green-tinted border, green eyebrow and dot, black code well, 2-up option buttons, and a green verify action. Selected options use a green border and green tint. Correct/incorrect feedback uses green/red status text.

**`track-card`**
- Raised indigo, `rounded-xl`, order number in mono, uppercase title, segmented module nodes tinted by the card accent (green and Blurple alternating), and an arrow that inherits the accent.

**`workshop-showcase`**
- Split `rounded-2xl` panel with a Blurple border and glow: full-bleed workshop GIF on one side, Blurple date/topic eyebrow and Blurple join action on the other.

**`leaderboard-row` / `profile-card`**
- Raised indigo surfaces, mono rank and XP, uppercase names, semantic difficulty colours.

## Motion

- Landing hero: 24s alternating mesh drift.
- Marquee: 30s linear loop.
- UI transitions: 150–220ms ease-out for colour, border, and opacity.
- Card hover: 2px lift plus an accent-tinted glow; no bounce.
- Respect `prefers-reduced-motion`: stop the mesh and marquee, remove hover lift.

## Do's and don'ts

### Do

- Lead with the dark indigo canvas and let the green-to-Blurple mesh carry atmosphere.
- Make green the primary accent: primary actions, active states, the `//`, and the trace-check surface.
- Use Blurple as the secondary accent for workshops, links, focus, and supporting actions.
- Set headings in all-caps Space Grotesk 700 with tight tracking.
- Keep geometry compact: 6–10px controls, 12–16px cards, 20px media and feature panels.
- Let animated GIFs bleed to the rounded edge of their frame.
- Use mono for code, XP, dates, and technical labels.
- Keep body copy sentence case and generously spaced.

### Don't

- Don't reintroduce pink, magenta, or violet accents.
- Don't flatten the canvas to neutral grey or pure black; the indigo is the brand.
- Don't make green or Blurple a large flat page background; keep surfaces dark and use accent light.
- Don't use green for destructive or error states.
- Don't set headings in a timid mid-weight or sentence case.
- Don't square off media or cards.
- Don't use 40px+ radii on cards or media.
- Don't put GIFs inside padded cards, mattes, or double frames.
- Don't lean on hard drop shadows; depth comes from colour, gradient, and diffuse accent glow.
- Don't introduce a fourth loud accent.

## Implementation notes

- Tokens live in `:root` and `@theme inline` in `app/globals.css`. Tailwind's radius scale is remapped there (`rounded-xl` = 12px, `rounded-2xl` = 16px, `rounded-3xl` = 20px).
- Global `h1`–`h4` styling applies the display face, 700 weight, and uppercase casing across marketing and workspace screens.
- `.hero-stage` provides the animated mesh; `.app-canvas` provides the static workspace atmosphere.
- `.gif-frame` is the only approved GIF container. Add `unoptimized` to Next.js images for animated GIFs.
- Monaco uses a custom `thinkcode-dark` theme defined in `components/views/sandbox-view.tsx`: near-black indigo editor background, green keywords, Blurple Soft strings, light-green numbers, and a green cursor.
- Existing components use the semantic variables (`--surface-*`, `--text-*`, `--brand-*`, `--accent-*`, `--status-*`); prefer them over new hex values.
