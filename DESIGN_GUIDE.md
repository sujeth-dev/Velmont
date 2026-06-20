# Velmont — Design Guide
**Source of truth extracted from approved reference files: `index.html` + `work.html`**

---

## 1. Brand Identity

| | |
|---|---|
| **Full name** | Velmont Design Studio |
| **Legal name** | Velmont Design LLP |
| **Tagline** | Defining Environments. |
| **Positioning** | Turnkey interiors studio — architectural, minimal, premium B2B |
| **Est.** | 2018 |
| **HQ** | Bengaluru, India |
| **Copyright** | © 2026 Velmont Design Studio. All rights reserved. |

---

## 2. Color Tokens

These are the exact CSS variables used in the approved reference. Use them as defined — do not substitute.

```css
:root {
  --vblack:    #1A1A1A;   /* Primary — headings, body, footer bg */
  --terracotta:#FF4015;   /* ACCENT ONLY — arrows, borders, active states */
  --slate:     #68778D;   /* Secondary text — kickers, labels, breadcrumbs */
  --concrete:  #D9DCE0;   /* Spec bar background */
  --mineral:   #BBBCC3;   /* All borders and dividers */
  --steel:     #8C92BA;   /* Supplementary — not used heavily in UI */
  --sand:      #D9CAB0;   /* Supplementary warm tone */
  --paper:     #F4F0EB;   /* Page background — warm off-white, NOT pure white */
}
```

**Usage rules:**
- `--paper` is the global page background. Never use `#fff` or `#ffffff` as a page or section bg.
- `--terracotta` is used ONLY as an accent — active nav underline (2px), CTA button border (1px), spec bar top rule (2px), arrow icons. Never fill large areas with it.
- `--mineral` is the universal divider/border color for all horizontal and vertical rules.
- `--slate` is used exclusively for kicker labels, secondary captions, breadcrumb links, and spec labels.
- Body paragraph text uses `#5a5550` (warm near-black) — not `--vblack` and not `--slate`.
- Dark section bg (Process strip, Footer): `--vblack` = `#1A1A1A`.

---

## 3. Typography

### Font Stack

| CSS Variable | Typeface(s) | Format | Source |
|---|---|---|---|
| `--display` | The Seasons → Cormorant Garamond → Georgia → serif | Local `.otf` files | `fonts/` directory in project |
| `--serif` | Cormorant Garamond → Georgia → serif | — | Google Fonts |
| `--head` | Manrope → system-ui → sans-serif | — | Google Fonts |
| `--body` | Inter → system-ui → sans-serif | — | Google Fonts |

**The Seasons font files (local):**
```
fonts/theseasons-lt.otf      weight: 300
fonts/theseasons-ltit.otf    weight: 300, italic
fonts/theseasons-reg.otf     weight: 400–500
fonts/theseasons-it.otf      weight: 400–500, italic
fonts/theseasons-bd.otf      weight: 600–700
```

**Google Fonts URL:**
```
https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500;1,600&family=Manrope:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap
```

---

### Type Scale

#### Hero H1 (Homepage)
```
font-family: var(--head)   /* Manrope */
font-weight: 600
font-size: 88px
line-height: 0.98
letter-spacing: -0.03em
color: #ffffff
```

#### Project Page H1
```
font-family: var(--head)   /* Manrope */
font-weight: 700
font-size: 68px
line-height: 1.0
letter-spacing: -0.025em
color: #ffffff
```

#### Section H2
```
font-family: var(--head)   /* Manrope */
font-weight: 600
font-size: 48px
line-height: 1.04
letter-spacing: -0.02em
color: var(--vblack)
```

#### Section H3 (Dark sections)
```
font-family: var(--head)   /* Manrope */
font-weight: 600
font-size: 44px
line-height: 1.04
letter-spacing: -0.02em
color: #ffffff
```

#### Eyebrow / Kicker Labels
```
font-family: var(--body)   /* Inter */
font-weight: 600
font-size: 10–11px
letter-spacing: 0.32–0.40em
text-transform: uppercase
color: var(--slate)        /* or rgba warm on dark bg */
```

#### Body Paragraph
```
font-family: var(--body)   /* Inter */
font-weight: 400
font-size: 14–16px
line-height: 1.72–1.80
color: #5a5550
```

#### Hero Sub-headline
```
font-family: var(--body)   /* Inter */
font-weight: 400
font-size: 16px
line-height: 1.72
color: rgba(255,255,255,0.66)
max-width: 560px
```

#### Editorial Lead (Serif Italic)
Used in project body, left column, and pull quotes.
```
font-family: var(--serif)  /* Cormorant Garamond */
font-style: italic
font-size: 28px
line-height: 1.50
letter-spacing: 0.004em
color: var(--vblack)
```

#### Work Tile / Project Name
```
font-family: var(--serif)  /* Cormorant Garamond */
font-style: italic
font-size: 28px
color: var(--vblack)
line-height: 1.18
```

#### Display Number (Stats, Counts)
```
font-family: var(--display) /* The Seasons */
font-weight: 400
font-size: 52px
letter-spacing: 0.06em
line-height: 1
color: var(--vblack)
```

#### Process Step Number
```
font-family: var(--display) /* The Seasons */
font-weight: 400
font-size: 42px
letter-spacing: 0.06em
color: rgba(255,255,255,0.14)   /* ghost — intentionally faint */
```

#### Process Step Title
```
font-family: var(--head)   /* Manrope */
font-weight: 600
font-size: 16px
letter-spacing: -0.01em
color: #ffffff
```

#### Spec Bar Value
```
font-family: var(--head)   /* Manrope */
font-weight: 500
font-size: 18px
letter-spacing: -0.01em
color: var(--vblack)
```

#### Spec Bar Label / Caption
```
font-family: var(--body)   /* Inter */
font-weight: 600
font-size: 10px
letter-spacing: 0.28–0.30em
text-transform: uppercase
color: var(--slate)
```

#### Navigation Links
```
font-family: var(--body)   /* Inter */
font-weight: 500
font-size: 13.5px
letter-spacing: 0.04em
color: #5a5550
```
Active state: `color: var(--vblack); border-bottom: 2px solid var(--terracotta)`

#### Nav CTA Button
```
font-family: var(--body)   /* Inter */
font-weight: 500
font-size: 12px
letter-spacing: 0.18em
text-transform: uppercase
color: var(--vblack)
border: 1px solid var(--terracotta)
padding: 11px 28px
border-radius: 2px
```

#### Nav Tagline (below logo)
```
font-family: var(--body)   /* Inter */
font-weight: 500
font-size: 9.5px
letter-spacing: 0.30em
text-transform: uppercase
color: var(--slate)
margin-top: -20px   /* tucks under the logo */
```

#### Footer Links
```
font-family: var(--body)   /* Inter */
font-size: 12px
letter-spacing: 0.10em
color: rgba(255,255,255,0.38)
```

#### Copyright
```
font-family: var(--body)   /* Inter */
font-size: 11px
letter-spacing: 0.04em
color: rgba(255,255,255,0.22)
```

#### Material Tags (pill badges)
```
font-family: var(--body)   /* Inter */
font-weight: 500
font-size: 11.5px
letter-spacing: 0.12em
color: #5a5550
border: 1px solid var(--mineral)
padding: 7px 16px
border-radius: 999px
```

---

## 4. Layout System

### Globals
```css
body {
  background: var(--paper);     /* #F4F0EB */
  color: var(--vblack);
  font-family: var(--body);
  -webkit-font-smoothing: antialiased;
  min-width: 1200px;
}
```

### Horizontal Rhythm
- **Standard side padding:** `80px` on both sides — applies to nav, hero content, section interiors, footer.
- **Inner column gap:** `80px` (two-column body sections).
- **Tile inner padding:** `28–44px` vertically, `40px` horizontally.

### Divider / Border Rule
All section separators and column dividers:
```css
border: 1px solid var(--mineral);   /* #BBBCC3 */
```
The terracotta 2px rule is used ONLY at the top of the spec bar on project pages.

### Grid Patterns Used

| Section | CSS Grid |
|---|---|
| Nav | `flex; justify-content: space-between` |
| Work Strip | `240px repeat(3, 1fr)` |
| Studio Intro | `1fr 1fr` |
| Disciplines | `240px repeat(4, 1fr)` |
| Process steps | `repeat(4, 1fr)` |
| Spec Bar | `repeat(4, 1fr)` |
| Project Body | `1.1fr 1fr; gap: 80px` |
| Image Grid | `1.62fr 1fr; grid-template-rows: 1fr 1fr; gap: 3px` |
| Project Nav | `1fr 1fr` |
| Footer | `flex; justify-content: space-between` |

---

## 5. Component Specifications

### Navigation
```
height: 94px
padding: 0 80px
background: var(--paper)
border-bottom: 1px solid var(--mineral)
position: sticky; top: 0; z-index: 20
```
- Logo: `height: 82px`, `transform: translateY(-8px)` (slight upward shift for optical alignment)
- Tagline sits at `margin-top: -20px` below logo
- Gap between nav links: `44px`

---

### Hero (Homepage)
```
height: 700px
padding: 70px 80px
justify-content: flex-end    /* content anchored to bottom */
overflow: hidden
```
**Background gradient (dark stone mood):**
```css
background:
  linear-gradient(125deg, rgba(255,255,255,.06), rgba(0,0,0,.30)),
  radial-gradient(120% 120% at 72% 10%, #6d6862 0%, #46433f 52%, #2b2927 100%);
```
**Overlay (bottom-up dark):**
```css
background: linear-gradient(0deg, rgba(8,8,8,.65) 0%, rgba(8,8,8,.14) 55%, transparent 100%);
```
- Hero meta (city + year) positioned: `position: absolute; right: 80px; bottom: 70px`
- Hero CTA style: inline underline link with terracotta arrow, not a button

---

### Hero (Project Page)
```
height: 520px
padding: 60px 80px
justify-content: flex-end
```
**Background gradient (travertine/warm light):**
```css
background:
  linear-gradient(118deg, rgba(255,255,255,.22), rgba(57,56,57,.16)),
  radial-gradient(130% 90% at 22% 8%, #ece5da 0%, #cfc6b7 52%, #a89a87 100%);
```

---

### Work Strip Tile
- Index label column: `padding: 34px 0 34px 80px`
- Display count: The Seasons, 52px — "24" / "100+" etc
- Work tiles: `padding: 28px 40px`, flex column, `justify-content: space-between`
- Tile footer: `border-top: 1px solid var(--mineral)` with year left, terracotta arrow right

---

### Spec Bar (Project Pages)
```
background: var(--concrete)
border-top: 2px solid var(--terracotta)
border-bottom: 1px solid var(--mineral)
```
- First item: `padding-left: 80px`
- Each item: `padding: 26px 40px`, flex column, gap 8px

---

### Process Section (Dark)
```
background: var(--vblack)
padding: 80px
display: flex; gap: 100px
```
- Left head: `flex: 0 0 340px`
- Steps: `display: grid; grid-template-columns: repeat(4,1fr)`
- Step column border: `border-left: 1px solid rgba(187,188,195,0.18)`
- Step padding: `padding: 0 36px`

---

### Image Grid (Project)
```
display: grid
grid-template-columns: 1.62fr 1fr
grid-template-rows: 1fr 1fr
height: 560px
gap: 3px
background: var(--mineral)   /* gap color shown through */
```
- Main image: `grid-row: 1 / 3`
- Caption overlay: bottom-anchored, Inter 10px 600, `letter-spacing: 0.22em`, rgba white

---

### Breadcrumb
```
padding: 18px 80px
border-bottom: 1px solid var(--mineral)
```
- Links: Inter 11.5px 500, letter-spacing 0.12em, UPPERCASE, color `var(--slate)`
- Separator `/`: color `var(--mineral)`
- Current page: color `var(--vblack)`

---

### Project Navigation (Prev / Next)
```
padding: 0 80px
grid-template-columns: 1fr 1fr
border-top: 1px solid var(--mineral)
```
- Right item: `border-left: 1px solid var(--mineral); align-items: flex-end`
- Project name: Cormorant Garamond italic 28px
- Direction label: Inter 10px 600, letter-spacing 0.28em, UPPERCASE, slate
- Industry tag: Inter 11px 500, letter-spacing 0.14em, UPPERCASE, mineral

---

### Footer (Dark)
```
background: var(--vblack)
border-top: 1px solid rgba(187,188,195,0.14)
padding: 44px 80px
display: flex; justify-content: space-between; align-items: center
```
- White logo: `assets/velmont-white.png`, height 82px
- Tagline below logo: rgba(255,255,255,0.45)

---

## 6. Logo Assets

| Use | File | Background |
|---|---|---|
| Nav (light bg) | `assets/velmont-main.png` | var(--paper) |
| Footer (dark bg) | `assets/velmont-white.png` | var(--vblack) |
| Height in both | 82px | — |

---

## 7. Interaction & Motion Tokens

From the reference — no complex animations defined. Keep motion minimal and purposeful:
- `scroll-behavior: smooth` on `html`
- Hover states on work tiles, nav links, CTAs: subtle color/opacity shift only
- Arrow icons use `var(--terracotta)` — they are the primary visual accent marker for links

---

## 8. Voice & Copy Tone

Extracted directly from approved copy in the reference files:

**Style:** Architectural, spare, confident. Short declarative statements. No marketing puff.

| Pattern | Example |
|---|---|
| Eyebrow | "DEFINING ENVIRONMENTS." / "SELECTED WORK" / "HOW WE WORK" |
| H1 style | Short, grammatically incomplete, poetic — "Spaces composed with architectural intent." |
| Studio description | "One team. Every layer. Delivered." — punchy, rhythmic three-part |
| Body copy | Measured, precise, never hyperbolic. Focus on materials, light, process. |
| Process steps | Verb-led, concise — "Understanding the programme..." / "A complete environment, delivered on programme..." |
| CTA | Understated — "View the Portfolio →" / "Our Process →" / "Enquire" |

---

## 9. Navigation Structure (Approved)

```
Work        ← primary portfolio page (was "Projects" — use "Work")
Services
About
Contact
```
CTA in nav: **"Enquire"** (not "Contact Us" or "Get in Touch")

---

## 10. Disciplines / Sectors (Approved)

| Discipline | Note |
|---|---|
| Workplace | 48,000 ft² avg. |
| Healthcare | Clinical & Wellness |
| Hospitality | Hotels & Resorts |
| Commercial | MNC Fit-out |

> Note: The original plan used "Corporate" — the approved design uses **"Workplace"**. Update all references.

---

## 11. Process Steps (Approved Copy)

| Step | Title | Description |
|---|---|---|
| 01 | Brief | Understanding the programme, budget, and the feeling the space must create. |
| 02 | Design | Architectural drawings, material boards, and spatial narratives — resolved together. |
| 03 | Build | Studio-managed construction. Every supplier, every finish, every timeline held to one standard. |
| 04 | Handover | A complete environment, delivered on programme, ready to live in from day one. |

---

## 12. Approved Hero Copy (Homepage)

```
Eyebrow:  Defining Environments.
H1:       Spaces composed
          with architectural
          intent.
Sub:      A turnkey interiors studio delivering considered, end-to-end environments 
          across healthcare, workplace, and hospitality — from initial brief to the final switch plate.
CTA:      View the Portfolio →
Meta R:   Bengaluru, India
          Est. 2018
```

---

## 13. What Changed from Original Plan

| Original Plan | Correct (from approved files) |
|---|---|
| PP Neue Montreal (headings) | **Manrope** (headings) |
| Inter only (body) | **Inter** (body/UI) + **Cormorant Garamond** (serif/italic) + **The Seasons** (display numbers) |
| White background | **#F4F0EB — var(--paper)** |
| "Projects" page | **"Work"** page |
| "Corporate" sector | **"Workplace"** sector |
| No Healthcare sector | **Healthcare** is one of 4 core disciplines |
| Button-style CTAs | **Inline underline links** with terracotta arrow (hero, studio, nav) |
| Nav CTA = filled button | **Nav CTA = outlined, terracotta border, no fill** |
| Tagline: "Design. Manufacture. Deliver." | **"Defining Environments."** |
