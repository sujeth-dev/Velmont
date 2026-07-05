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
2. Prefer **SVG** (or a transparent-background PNG/WebP, ~120px tall). The carousel shows logos
   at full color and size at rest, with a subtle scale-up on hover.
3. No build step needed for SVG/PNG/WebP here; they are served straight from `public/`.

## Status — 13 of 14 sourced (2026-07-05)

8 downloaded from Wikimedia Commons (public-domain / trademark-tagged files, free to reuse for
factual "our clients" reference — the marks themselves remain each owner's trademark):

| Client | File | Source |
|---|---|---|
| Marriott International | `marriott.svg` | [File:Marriott_International.svg](https://commons.wikimedia.org/wiki/File:Marriott_International.svg) |
| Taj (IHCL) | `taj.svg` | [File:Taj_Hotels_logo.svg](https://commons.wikimedia.org/wiki/File:Taj_Hotels_logo.svg) |
| ITC Hotels | `itc.svg` | [File:ITC_Hotels_logo.svg](https://commons.wikimedia.org/wiki/File:ITC_Hotels_logo.svg) |
| Hyatt | `hyatt.svg` | [File:Grand_Hyatt_logo.svg](https://commons.wikimedia.org/wiki/File:Grand_Hyatt_logo.svg) |
| Wells Fargo | `wells-fargo.svg` | [File:Wells_Fargo_Logo_(2020).svg](https://commons.wikimedia.org/wiki/File:Wells_Fargo_Logo_(2020).svg) |
| Shell | `shell.svg` | [File:Shell.svg](https://commons.wikimedia.org/wiki/File:Shell.svg) |
| Embassy Group | `embassy.png` | [File:Embassy_Group_Logo.png](https://commons.wikimedia.org/wiki/File:Embassy_Group_Logo.png) |
| Ministry of External Affairs | `mea.svg` | [File:Ministry_of_External_Affairs_India.svg](https://commons.wikimedia.org/wiki/File:Ministry_of_External_Affairs_India.svg) |

5 more supplied directly by the client and wired in (identified by inspecting each file's actual
content, not filename, to avoid a wrong-brand mix-up):

| Client | File |
|---|---|
| Allianz | `allianz.svg` |
| Apollo Hospitals | `apollo.svg` |
| Shangri-La | `shangri-la.webp` |
| Shibaura Machine | `shibaura.webp` |
| Gopalan Enterprises | `gopalan.svg` |

## Still to source manually (1)

| Client | Why not auto-sourced |
|---|---|
| **Kauvery Hospital** | Only building photos on Commons, no logo mark. Source from kauveryhospital.com. |

Confirm usage rights before publishing (most brands permit factual "our clients" reference,
but always worth a quick check against each brand's own guidelines).
