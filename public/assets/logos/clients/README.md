# Client logos — homepage "Trusted by" carousel

`clients.json` in this folder drives the logo carousel on the homepage (rendered by
`src/js/home.js` → `mountClients`). Each entry lists a client and the logo filename the
carousel looks for here.

## How it works
- For each entry, the carousel loads `/assets/logos/clients/<file>`.
- **If the file is missing, it falls back to a clean text wordmark of the client name** — so
  the strip works today and upgrades automatically as real logos are added.

## To add a real logo
1. Drop the logo file into this folder using the exact `file` name from `clients.json`
   (e.g. `marriott.svg`).
2. Prefer **SVG** (or a transparent-background PNG, ~120px tall). Single-colour / monochrome
   works best — the carousel renders logos greyscale by default and full-colour on hover.
3. No build step needed for SVG/PNG here; they are served straight from `public/`.

## Logos still to source (14)
Marriott · Taj (IHCL) · ITC Hotels · Hyatt · Shangri-La · Allianz · Wells Fargo ·
Apollo Hospitals · Kauvery Hospital · Shell · Embassy Group · Shibaura Machine ·
Gopalan Enterprises · Ministry of External Affairs (Govt of India emblem)

Source each from the brand's official press / media kit or Wikimedia Commons. Confirm usage
rights before publishing (most brands permit factual "our clients" reference).
