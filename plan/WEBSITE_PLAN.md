# Velmont Design LLP — Website Plan

---

## 0. Build Source of Truth

> **This is the single most important rule for the build.**

| What | Source file | Use for |
|---|---|---|
| **Design** — CSS, fonts, colors, grid, component structure, spacing, all visual code | `draft/VELMONT-handoff/velmont/project/index.html` + `work.html` | Copy CSS directly. Do not re-derive or re-implement. |
| **Content** — copy, section names, page structure, what text goes where | `velmont-website/CONTENT_PLAN.html` | Approved copy per section, per page. |
| **Design notes** | `DESIGN_GUIDE.md` | Reference only — explains decisions. Not used as code source. |

The design reference files (`index.html`, `work.html`) ARE the design. Port their CSS as-is into each page. Populate with content from `CONTENT_PLAN.html`. Do not re-interpret or re-derive design values from scratch.

---

## 1. Overview

**Client:** Velmont Design LLP  
**Type:** B2B Commercial Interior Design & Fit-Out Company  
**Location:** Bangalore, India  
**Domain:** velmontdesign.com  

**Goal:** A premium, minimal website that positions Velmont as a specialist commercial interior contracting company — B2B focused, specification-led, and quality-driven. Generates project enquiries and allows the team to manage their portfolio through a simple admin panel.

> **Tone direction (updated from final content plan):** Contractor voice — factual, professional, specification-focused. NOT design-studio editorial. Copy emphasises precision, delivery, and in-house capability over architectural poetics.

---

## 2. Brand Foundations

> **Full design spec → see `DESIGN_GUIDE.md`** (extracted from approved reference files)

### Colors
| CSS Var | Name | Hex | Usage |
|---|---|---|---|
| `--vblack` | Velmont Black | `#1A1A1A` | Headings, footer bg, primary text |
| `--terracotta` | Terracotta | `#FF4015` | Accent ONLY — arrows, active state, CTA border |
| `--slate` | Slate | `#68778D` | Kickers, labels, breadcrumbs |
| `--paper` | Paper | `#F4F0EB` | Page background (NOT white) |
| `--concrete` | Concrete | `#D9DCE0` | Spec bar bg |
| `--mineral` | Mineral | `#BBBCC3` | All borders & dividers |
| `--sand` | Sand | `#D9CAB0` | Supplementary warm |
| `--steel` | Steel | `#8C92BA` | Supplementary cool |

### Typography
| CSS Var | Typeface | Use |
|---|---|---|
| `--display` | The Seasons (local) → Cormorant Garamond | Display numbers, stat counts |
| `--serif` | Cormorant Garamond | Italic editorial text, project names, pull quotes |
| `--head` | Manrope | H1, H2, H3, process titles, spec values |
| `--body` | Inter | Nav, kickers, body copy, labels, all UI |

### Brand Direction
> Architectural · Turnkey · Minimal · Premium — **"Defining Environments."**
>
> **Tone (final, from approved content plan):** B2B contractor voice. Professional, factual, delivery-focused. Language centres on specification, precision, and in-house capability. Not a design studio — a specialist contracting company.

### Copy Changes Logged from Client-Edited Content Plan

| Section | Original (reference file) | Final (client approved) |
|---|---|---|
| Hero H1 | "Spaces composed with architectural intent." | **"Commercial interiors built to the highest standard."** |
| Hero sub | "A turnkey interiors studio delivering considered, end-to-end environments…" | **"A commercial interior contracting company delivering precision fit-outs…"** |
| 01.4 section title | Studio Introduction | **About Velmont** |
| 01.4 body | "We design environments end to end…No handoffs. No gaps." | **"Velmont is a commercial interior contracting company with an in-house manufacturing facility…"** |
| Process intro | "One accountable studio managing every discipline…" | **"One accountable team managing every phase of your project…"** |
| Process Step 02 | "Design" — spatial narratives, material boards | **"Planning"** — site assessment, procurement, programme |
| Services H1 | "End-to-end. From concept to handover." | **"Specialist services for commercial interiors."** |
| Services sub | "Velmont delivers the full spectrum…without the fragmentation of multiple contractors." | **"Turnkey fit-outs, furniture manufacturing, carpentry, joinery…delivered by one specialist contracting team."** |
| Manufacturing H | "Design. Manufacture. Deliver." | **"A state-of-the-art manufacturing facility."** |
| Manufacturing copy | "enables complete control over quality, customisation, and delivery timelines…" | **"…built to precise specifications…quality-checked under one roof before it reaches your site."** |

---

## 3. Site Architecture

```
velmont-website/
├── public/
│   ├── index.html           # Home
│   ├── about.html           # About
│   ├── services.html        # Services
│   ├── projects.html        # Projects (filterable grid)
│   ├── project-detail.html  # Single project page (dynamic)
│   └── contact.html         # Contact
│
├── admin/
│   ├── login.html           # Admin login
│   ├── dashboard.html       # Project list
│   ├── project-new.html     # Add project
│   └── project-edit.html    # Edit / delete project
│
├── assets/
│   ├── css/
│   ├── js/
│   └── images/
│       ├── logo/
│       └── projects/
│
└── data/
    └── projects.json        # Project data store (or DB)
```

---

## 4. Page-by-Page Plan

---

### 4.1 HOME

**Purpose:** First impression. Establish premium positioning, communicate what Velmont does, and direct visitors to Projects or Contact.

**Sections:**
1. **Hero** — Full-screen image/video with overlay. Logo + tagline. Primary CTA: "View Our Work" → Projects.
2. **Intro Strip** — One-liner brand statement: *"End-to-end interior solutions. Designed. Manufactured. Delivered."*
3. **Stats Bar** — 4 key numbers: 15+ Years · 100+ Projects · 5M+ Sq Ft · 200+ Workforce
4. **Services Snapshot** — 3 service cards (icons + short labels). Link to full Services page.
5. **Featured Projects** — 3–4 project thumbnails with category badges. Link to full Projects page.
6. **Manufacturing Differentiator** — Full-width section: "Design. Manufacture. Deliver." — in-house capability highlight.
7. **CTA Banner** — "Let's build something exceptional." → Contact button.
8. **Footer** — Logo, nav links, contact info, social links.

---

### 4.2 ABOUT

**Purpose:** Build trust. Tell the story, showcase credentials, and humanise the company.

**Sections:**
1. **Page Hero** — Headline: "About Velmont" with background image.
2. **Who We Are** — Full about copy + key highlight pills (End-to-End / In-House Manufacturing / Hospitality & Corporate / Quality-Driven).
3. **Trust Index / Stats** — Large number stats grid (same as homepage bar but expanded with labels).
4. **Our Approach** — Short paragraph on integrated design → manufacture → delivery philosophy.
5. **Manufacturing Capability** — Dedicated block with copy and photo grid (4–5 facility images).
6. **CTA** — "Work with us" → Contact.

---

### 4.3 SERVICES

**Purpose:** Detail what Velmont offers. One card per service with an icon, title, and description.

**Sections:**
1. **Page Hero** — "Our Services" headline.
2. **Services Grid** — 6 service cards in a 3×2 grid:
   - Commercial Interiors
   - Turnkey Fit-Outs
   - Furniture Manufacturing
   - Project Execution
   - Technical Support
   - Carpentry & Joinery
3. **Manufacturing Deep-Dive** — Expandable or standalone section on in-house capability.
4. **Sector Tags** — Hospitality · Corporate · Commercial — with brief descriptor for each sector served.
5. **CTA** — "Start your project" → Contact.

---

### 4.4 WORK

**URL:** `/work` (not `/projects` — approved nav uses "Work")  
**Purpose:** Portfolio showcase. Primary conversion driver for prospective clients.

**Sections:**
1. **Page Hero** — "Select Work" headline.
2. **Filter Bar** — Filter by discipline: All · Workplace · Healthcare · Hospitality · Commercial.
3. **Work Grid** — Tile layout matching `work-strip` pattern from reference. Each tile: discipline label (kicker), project name (Cormorant Garamond italic), location · year footer, terracotta arrow.
4. **Single Project Page (`/work/[slug]`)** — Full project detail: breadcrumb, project hero, spec bar (Industry / Area / Year / Scope), editorial lead paragraph, body copy, materials tags, image grid (1.62fr + 1fr), prev/next project nav.

**Admin-Managed Fields per Project:**
- Title
- Discipline (Workplace / Healthcare / Hospitality / Commercial)
- Location
- Year
- Area (sq ft)
- Scope (e.g., Turnkey)
- Lead paragraph (italic editorial text)
- Body copy (2–3 paragraphs)
- Materials (comma-separated tags)
- Cover image
- Gallery images (3-image grid: main + top-right + bottom-right)
- Featured on homepage (toggle)
- Published / Draft toggle

---

### 4.5 CONTACT

**Purpose:** Convert interest into enquiries.

**Sections:**
1. **Page Hero** — "Get in Touch" headline.
2. **Contact Form** — Fields: Name, Company, Email, Phone, Project Type (dropdown), Message. Submit button.
3. **Contact Details Block** — Address, Phone, WhatsApp, Email, Hours.
4. **Map Embed** — Google Maps embed for the Bangalore office.
5. **Social Links** — (To be added when available).

---

## 5. Admin Panel

**Access:** `/admin/login.html` — password-protected, single-user.

**Features:**
- **Dashboard** — List of all projects (title, category, status, created date). Buttons: Edit / Delete / Toggle Published.
- **Add Project** — Form to create a new project with all fields + image uploads.
- **Edit Project** — Same form pre-filled with existing data.
- **Delete Project** — Confirmation modal before deletion.

**Tech approach:** Projects stored in `projects.json` (static/serverless) or a lightweight backend (Node + Express + SQLite / Firebase). Admin authenticated via a simple hashed password stored server-side or via Firebase Auth.

---

## 6. Tech Stack Recommendation

| Layer | Choice | Reason |
|---|---|---|
| Frontend | Vanilla HTML/CSS/JS | Fast, no framework overhead, easy to hand off |
| Styling | Custom CSS + CSS variables | Full brand control, no Tailwind class bloat |
| Fonts | PP Neue Montreal (hosted) + Inter (Google Fonts) | Brand spec |
| Project data | JSON file or Firebase Firestore | Simple CRUD, no heavy backend needed |
| Admin auth | Firebase Auth or password hash check | Lightweight, secure |
| Hosting | Vercel / Netlify / GitHub Pages | Free tier, fast CDN |
| Contact form | Formspree or EmailJS | No backend required |
| Maps | Google Maps Embed API | Already have a Maps link |

---

## 7. Content Map (Extracted from velmont_data)

### HOME
| Section | Content |
|---|---|
| Hero tagline | *"Design. Manufacture. Deliver."* |
| Sub-tagline | End-to-end interior solutions for hospitality, corporate, and commercial environments |
| Stat 1 | 15+ Years of Industry Experience |
| Stat 2 | 100+ Projects Delivered Across India |
| Stat 3 | 5+ Million Sq Ft Delivered |
| Stat 4 | 200+ Total Workforce |

### ABOUT
| Section | Content |
|---|---|
| Main copy | "Velmont Design LLP specializes in commercial interiors, turnkey fit-outs, and custom furniture manufacturing. With an integrated approach to design, production, and execution, we deliver high-quality spaces for hospitality, corporate, and commercial clients across India." |
| Highlight 1 | End-to-End Interior Solutions |
| Highlight 2 | In-House Manufacturing Facility |
| Highlight 3 | Hospitality, Corporate & Commercial Expertise |
| Highlight 4 | Quality-Driven Project Execution |
| Manufacturing copy | "Our in-house manufacturing facility enables complete control over quality, customization, and delivery timelines. From custom furniture and joinery to specialized interior components, every product is crafted with precision and attention to detail." |

### SERVICES
| Service | Description |
|---|---|
| Commercial Interiors | End-to-end interior solutions for hospitality, corporate, and commercial environments |
| Turnkey Fit-Outs | Comprehensive project delivery from planning to handover |
| Furniture Manufacturing | Custom furniture solutions crafted through our in-house facility |
| Project Execution | Coordinated site management focused on quality and efficiency |
| Technical Support | Detailed planning and technical expertise at every stage, supporting smooth execution |
| Carpentry & Joinery | Bespoke woodwork and joinery tailored to project requirements |

### WORK (Projects)
| Project | Discipline | Location | Year |
|---|---|---|---|
| JW Marriott | Hospitality | Bangalore | — |
| Taj Hotel | Hospitality | Kochi | — |
| *(100+ total — admin to populate)* | | | |

**Disciplines (approved from reference):**
- Workplace (48,000 ft² avg)
- Healthcare (Clinical & Wellness)
- Hospitality (Hotels & Resorts)
- Commercial (MNC Fit-out)

### CONTACT
| Field | Value |
|---|---|
| Address | Site No. 60/1, Anagalapura Village, Bidarahalli Hobli, Bangalore – 560077 |
| Phone / WhatsApp | +91 93622 36718 |
| Email | Info@velmontdesign.com |
| Business Hours | 9am – 9pm |
| Google Maps | https://www.google.com/maps/place/Velmont+design+LLP/... |

---

## 8. Assets Available

| Asset | Location |
|---|---|
| Logo – Black | `design-kit/logo system/all black@10x.png` |
| Logo – White | `design-kit/logo system/all white @10x.png` |
| Logo – Orange | `design-kit/logo system/full orange@10x.png` |
| Logo – Full | `design-kit/logo system/main logo@10x.png` |
| Color Palette | `design-kit/Velmont_color_palette.png` |
| Typography Spec | `design-kit/Velmont Typography System.docx` |

---

## 9. Outstanding Items (Awaiting Client)

- [ ] Design direction / visual references (mentioned as "coming soon")
- [ ] Social media links
- [ ] Full project list beyond JW Marriott & Taj (100+ projects — select which to feature)
- [ ] Project photos / gallery images per project
- [ ] Manufacturing facility photos (placeholders shown in PDF)
- [ ] Team / leadership info (if About page needs a team section)
- [ ] Preferred backend: static JSON vs Firebase vs Node server

---

## 10. Recommended Build Order

1. Set up folder structure + assets
2. Build shared components: Header (nav) + Footer
3. Home page (HTML + CSS)
4. About page
5. Services page
6. Projects page (grid + filter)
7. Single project detail page
8. Contact page + form integration
9. Admin login + dashboard
10. Admin CRUD for projects
11. Wire projects to public Projects page
12. QA + responsiveness pass
13. Deploy
