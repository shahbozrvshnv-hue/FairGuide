# FairGuide — Experience Uzbekistan through its people

Community-powered tourism platform for international tourists visiting Uzbekistan.
This repository contains the **public-facing marketing website** (multilingual, responsive, SEO-friendly) and the architectural foundation for the future product.

> **TRUST · FAIRNESS · CONNECTION**

---

## Quick start

The site is fully static — no build step required.

```bash
# from the repository root
python3 -m http.server 8000
# → http://localhost:8000
```

Any static host (nginx, Netlify, Vercel, S3, GitHub Pages) works as-is.

## Language support

Five interface languages with **English as the default**:
`en` English · `uz` Oʻzbekcha · `ru` Русский · `tr` Türkçe · `zh` 中文

- Translations live in **`assets/i18n/<lang>.json`** (flat dot-namespaced keys, e.g. `"nav.getStarted"`).
- The runtime in `assets/js/main.js` fetches the dictionary and applies it to every element carrying `data-i18n`, `data-i18n-html` (trusted markup), `data-i18n-alt` (image alt text) or `data-i18n-aria` (aria-labels). `<title>` and meta description are swapped too.
- Selection is remembered in `localStorage`, exposed as `?lang=` in the URL, mirrored to `<html lang>`, and declared for SEO via `hreflang` alternates.
- **Adding a language:** create `assets/i18n/xx.json` with the same key set (see `tools/check_i18n.py`) and register it in the `LANGS` array in `main.js`.
- Run `python3 tools/check_i18n.py` to verify key parity across all files and that every key referenced in HTML/JS exists.

## Structure

```
index.html              # single-page marketing site (semantic sections, one per topic)
assets/
  css/main.css          # design system: tokens, components, sections, responsive, reduced-motion
  js/main.js            # i18n engine, sticky/compact nav, mobile menu, scroll reveals, scanner demo
  i18n/                 # en / uz / ru / tr / zh dictionaries (single source of copy)
  img/                  # hero, section and collage imagery (+ guides/, og.jpg, favicon.svg)
tools/check_i18n.py     # i18n sanity checker (key parity, usage, tag balance)
```

### Page sections (anchors)

`#home` hero → `#platform` value pillars → `#problem` transparency gap → `#tourists` guide marketplace preview → `#scanner` FairGuide Price Scanner demo → `#volunteer` student volunteer program *(planned)* → `#host` family hosting *(planned)* → `#ways` platform overview → `#uzbekistan` destinations & community → `#how` how it works → `#guides` for guides → `#students` for students → `#safety` trust & safety → `#about` vision → `#cta` final call-to-action.

Navigation: Home · How It Works · For Tourists · For Guides · Volunteer · Host · About Us, with **Get Started** (primary) and **Explore Uzbekistan** (secondary) CTAs.

## Design system

Defined as CSS custom properties at the top of `main.css`:

- **Colors** — modern tech palette with a subtle Uzbek soul: deep teal `#0E7A6F` (trust), saffron gold `#DFA22F` (fairness/warmth), warm paper background `#FAF7F1`, deep teal-ink `#0B2426` for dark bands. Traditional patterns appear only as faint geometric star motifs.
- **Type** — Fraunces (display serif) + Manrope (UI/body) + Noto Sans SC (Chinese fallback), served via Google Fonts.
- **Motion** — IntersectionObserver reveals with stagger, hover micro-interactions, one hero zoom; everything respects `prefers-reduced-motion`.

## Roadmap architecture

The marketing site is intentionally structured to grow into the full product:

| Future module | Notes |
|---|---|
| Tourist dashboard / trip planner | New pages under `/app/…`; reuse design tokens from `main.css` |
| Guide marketplace, host marketplace | Section anchors `#tourists`, `#host` already carry the content model |
| Booking, messaging, reviews | i18n copy namespaces can be extended per module |
| Product scanner (mobile) | Interactive demo lives in `#scanner`; status/result strings are fully translated |
| Volunteer dashboard & certificates | Copy in `#volunteer`, `#students`; milestone logic strings ready |
| Ministry partnership workflow | Clearly labeled as *Planned Ministry Partnership* in all 5 languages |

## Content principles

- Volunteering and hosting are always labeled **planned features**; the ministry partnership is labeled **Planned Ministry Partnership** and never presented as active.
- The price example (10,000 vs 20,000 UZS) is always marked as a simplified example; FairGuide does not accuse sellers of fraud based on price differences alone.
- No absolute safety claims (“100% safe”) are made anywhere.

© 2026 FairGuide. All rights reserved.
