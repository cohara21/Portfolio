# DESIGN.md: carsonohara.com

One light theme. Slate neutrals, one blue accent, Inter. Every value on the site
comes from this file; `css/styles.css` defines these as custom properties in its
`:root` block, and component rules use only those properties. If something needs
a value that isn't here, change this file first.

The values were picked from what the site already used most, not invented.

## Colour

| Token | Value | Use |
|---|---|---|
| `--ink` | `#0f172a` | Body text, headings (17.9:1 on white) |
| `--ink-muted` | `#64748b` | Captions, labels, meta, secondary copy (4.8:1; never lighter, never below 12px) |
| `--accent` | `#1E4FFF` | Links, primary button, current state, focus rings (5.8:1 both ways) |
| `--accent-soft` | accent at 35% on white | Quote rule |
| `--surface` | `#ffffff` | Page, cards, controls |
| `--surface-sunken` | `#eef2f7` | Image placeholders, contact band, embed frames |
| `--line` | `rgba(15,23,42,.08)` | Dividers, control and chip borders |
| `--line-subtle` | `rgba(15,23,42,.04)` | Card borders on white |
| `--glass` | `rgba(255,255,255,.25)` + `blur(12px)` | Header pills over light pages |
| `--glass-dark` | `rgba(15,23,42,.45)` | Header pills over a dark hero |
| `--scrim` | `rgba(15,23,42,.88)` | Image zoom overlay |

No other colours. No black, no teal. Shadows use the ink colour only.

## Type: Inter 400 / 500 / 600 / 700

| Token | Size | Use |
|---|---|---|
| `--fs-12` | 12px | Labels: 600, uppercase, `--ls-caps`, muted. The only uppercase style on the site |
| `--fs-14` | 14px | Captions, meta, footer, chips, small links |
| `--fs-16` | 16px | Body and UI text (600 for buttons and nav) |
| `--fs-20` | 20px | h3, card titles, sub-heads (600) |
| `--fs-24` | 24px | Section titles on Home and Work (700) |
| `--fs-32` | 32px | Page h1 (Work, galleries), case study h2 |
| `--fs-40` | 40px | Case study h1 |
| `--fs-56` | 56px | About h1 (clamped from 40) |

- Line height: `--lh-display` 1.1 (32px and up), `--lh-heading` 1.25, `--lh-ui` 1.5, `--lh-prose` 1.6.
- Tracking: -0.02em at 32px and up, `--ls-caps` .08em on labels, 0 elsewhere.
- Measure: prose stops at 68ch. Images may run the full 800px case study column.
- The home hero heading keeps its own fluid size; it has to stay on one line.

## Spacing: 8-based, 4 for hairline adjustments

`--space-4` 4 · `--space-8` 8 · `--space-16` 16 · `--space-24` 24 · `--space-32` 32 · `--space-48` 48 · `--space-64` 64 · `--space-96` 96

- Control padding 8/16. Card text padding 16. Grid gap 16 (24 on desktop).
- Section padding 48. Case study sections 64 apart. Page top offset 96.
- A caption sits 8 below its image. Paragraphs are 16 apart. Heading to body is 16 (24 under a case study h2).
- Don't pad beyond these. If something needs more air, cut content instead.

## Radius

`--r-4` focus rings, tiny tags · `--r-8` images inside a card, inputs · `--r-12` cards, case images, galleries, thumbnails · `--r-24` feature cards (profile card, bio photo) · `--r-pill` every button, nav item, chip and icon button.

Nested rule: inner radius = outer radius − padding. Exception: app-icon tiles keep 20px because they copy OS icons.

## Elevation: one shadow colour (ink)

| Token | Value | Use |
|---|---|---|
| `--shadow-1` | `0 2px 8px` at .06 | Controls: pills, icon buttons |
| `--shadow-2` | `0 6px 18px` at .06 | Cards at rest |
| `--shadow-3` | `0 16px 36px` at .10 | Hover lift, popovers |
| `--shadow-4` | `0 24px 64px` at .24 | Lightbox image, feature photos |

Case study images have no shadow. Screenshots with white edges get a 1px `--line` frame instead (`.case-image--framed`).

## Motion

`--motion-speed` 180ms and `--motion-slow` 260ms, both on `--motion-ease`. Overlays fade and scale from .96 over `--motion-speed`. Press is always `scale(.96)`. Anything that travels sits behind `prefers-reduced-motion: no-preference`; with reduced motion, content keeps its colour and shadow cues and loses the movement.

## Components

- **Button** `.btn`: pill, 44px min height, 8/16 padding, 16/600. `primary` = accent fill, white text. `outline` = 1px accent border, accent text. Hover lifts 2px and adds `--shadow-3`; press is `scale(.96)`. There are no other button styles.
- **Icon button**: 44px circle, surface, `--shadow-1`, ink icon turning accent on hover. Used for carousel arrows, lightbox arrows and both close buttons.
- **Nav pill**: the header's logo, nav, back arrow and Resume. Glass on light pages, `--glass-dark` with white text while over a dark hero. Once the page scrolls, the header bar behind the pills turns frosted white so text never shows through.
- **Card**: surface, `--line-subtle` border, `--r-12`, `--shadow-2`, lifting 4px to `--shadow-3` on hover. Text panel padding 16: a meta line in the Label style (type · your role · status), title 20/600, description 14 muted, clamped to two lines. Cards sit in a static grid; nothing auto-scrolls.
- **Chip**: pill, 8/16 padding, 14/400, `--line` border, no shadow, no hover unless it does something.
- **Figure**: `<figure class="case-media">` holding the image, then `<figcaption>` at 14 muted, 8 below. `.case-pair` puts two same-shaped figures side by side from 769px; each gets a short Label-style caption, and any shared sentence sits 16 below as a normal caption.
- **Stat row** `.stat-row`: key figures as live text on `--surface-sunken`, value 40/700 accent, label 16 ink, three across from 640px. Always cited in the figure caption. Never put statistics inside images.
- **Label** `.case-phase-label`: 12/600 caps muted.
- **Links**: accent and underlined in running text. Internal links use the right arrow; external links use the up-right arrow.
- **Case study template**: hero, title row (Year · Duration · Team), overview (Overview · My Role, then a full-width Outcome with a link to try it), sections (each with a label, h2 and prose), then the closing contact line and Previous / All work / Next. The section list appears in the left margin from 1180px on every case study. Prose doesn't fade in.
