# Architecture Decision Log

Significant decisions that shaped the project. Add a new entry here **before** writing code for any Major or Breaking change. See `plan/CHANGE_GUIDE.md §10` for the entry template.

---

## 2026-06-21 — Vanilla HTML/CSS/JS over Next.js

**What:** Build the site with Vanilla HTML/CSS/JS + Vite instead of Next.js.
**Why:** Original client plan specified vanilla stack. Simplicity, no framework overhead, easy hand-off to any developer without framework knowledge.
**Alternatives considered:** Next.js 15 (App Router) — better built-in image optimization and TypeScript support, but introduces framework dependency and complexity not needed for a static brochure site.
**Impact:** Testing via Vitest + Playwright (not Jest + React Testing Library). Image optimization handled by a separate `sharp` conversion script + `<picture>` tags rather than `next/image`. No server-side rendering.
**Rollback plan:** N/A — this is the starting decision.
**Status:** Done

---

## 2026-06-21 — Hybrid image strategy: local WebP/AVIF + Firebase Storage

**What:** Local project images (committed to repo) are converted to WebP/AVIF and served via Vercel CDN. Admin-uploaded images go to Firebase Storage bucket.
**Why:** Launch images are known and finite — committing them gives fast CDN serving with no external dependency. Future admin uploads need a persistent store that survives deploys, so Firebase Storage is the right home for those.
**Alternatives considered:** Cloudinary CDN for all images — adds cost and an external dependency for images that are already in the repo. Pure local-only — would require a new deploy every time the client adds a project image via admin.
**Impact:** `scripts/convert-images.js` runs before build. All `<img>` tags use `<picture>` with AVIF → WebP → JPEG fallback. Firebase Storage URLs used only for admin-uploaded content.
**Constraints:** No blur placeholder or LQIP on any image — use standard `loading="lazy"` only.
**Rollback plan:** Remove `<picture>` tags and revert to plain `<img src="*.jpg">` if conversion pipeline causes issues.
**Status:** Done

---

## 2026-06-21 — No responsive/mobile design

**What:** Site is desktop-only, min-width: 1200px. No mobile breakpoints will be implemented in the initial build.
**Why:** The approved reference design has zero mobile breakpoints. Adding responsive design requires additional design decisions (typography scaling, grid collapse, touch interactions) that are outside the current approved scope.
**Alternatives considered:** Build responsive from the start — would require new design decisions not yet approved by client.
**Impact:** `body { min-width: 1200px }` in `src/css/base.css`. Lighthouse mobile scores will be lower than desktop scores — this is acceptable and expected. Lighthouse CI thresholds are set for desktop only.
**Rollback plan:** Remove `min-width` and add `@media` queries — this is a Major change class and requires a feature branch when/if it happens.
**Status:** Done

---

## 2026-06-21 — Firebase as full backend (Firestore + Auth + Storage)

**What:** Firebase handles all three backend concerns: Firestore for data, Firebase Auth for admin login, Firebase Storage for image uploads.
**Why:** Serverless, free tier covers launch scale, admin panel requires no backend server, tight integration between all three services, no separate deployment needed.
**Alternatives considered:** Supabase — similar serverless approach but less mature Storage integration. Node + SQLite — requires a server deployment alongside Vercel, adds ops complexity.
**Impact:** All backend SDK code lives in `src/lib/firebase.js`. Firestore security rules must be deployed separately via `firebase.json`. Admin panel is client-side only (no server).
**Rollback plan:** If Firebase is migrated, all fetch calls in `src/js/*.js` and the admin panel must be rewritten. This is a Breaking change.
**Status:** Done

---

## 2026-06-21 — EmailJS for contact form (no backend)

**What:** Contact form submissions are sent via EmailJS client SDK directly to Info@velmontdesign.com.
**Why:** No backend server, no API routes — pure client-side solution that works with the vanilla stack and Vercel static hosting. Free tier covers expected enquiry volume.
**Alternatives considered:** Formspree — similar free tier, slightly less control over email template. Vercel Serverless Functions — adds a server layer that is unnecessary for a single contact form.
**Impact:** `VITE_EMAILJS_*` environment variables required in Vercel. Honeypot field added to form for spam protection (Phase 7).
**Rollback plan:** Replace `src/js/contact.js` EmailJS calls with a Vercel Function endpoint. Moderate change class.
**Status:** Done

---

<!-- Add new entries above this line, newest first -->
