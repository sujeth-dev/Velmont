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

## Status — 8 of 14 sourced (2026-07-05)

Downloaded from Wikimedia Commons (public-domain / trademark-tagged files, free to reuse for
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

## Still to source manually (6)

| Client | Why not auto-sourced |
|---|---|
| **Allianz** | Was on Wikimedia Commons (`File:Allianz.svg`) but the CDN returned a persistent error during download — retry the same URL later, or grab from [Allianz's press/brand page](https://www.allianz.com/en/mediacenter.html). |
| **Shangri-La** | Logo exists on English Wikipedia but is flagged non-free there (not mirrored to Commons) — source from [Shangri-La's official site](https://www.shangri-la.com) media kit instead. |
| **Apollo Hospitals** | Not found on Wikimedia Commons. Source from Apollo Hospitals' official press kit. |
| **Kauvery Hospital** | Only building photos on Commons, no logo mark. Source from kauveryhospital.com. |
| **Shibaura Machine** | Search only surfaced an unrelated company ("IHI Shibaura") — do not use it, wrong brand. Source from shibaura-machine.co.jp. |
| **Gopalan Enterprises** | No usable public source found. Source from gopalanenterprises.com. |

Confirm usage rights before publishing (most brands permit factual "our clients" reference,
but always worth a quick check against each brand's own guidelines).
