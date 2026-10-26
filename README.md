# ivanlekangho.github.io

Personal site. Built from scratch — no template.

**Stack:** Vite · React 19 · TypeScript · plain CSS custom properties.
No CSS framework and no animation library: the scroll-driven centerpiece is
hand-rolled SVG, which is both smaller and more honest than crossfading three
graphics (see below).

---

## Running it locally

```bash
npm install
npm run dev
```

Then open the URL it prints (usually http://localhost:5173).

Useful during development: **`/?p=0.42`** pins the centerpiece's scroll progress
to any value between 0 and 1, so you can look at a specific moment of the morph
without scrolling to it. Dev-only; it does nothing in the built site.

```bash
npm run build      # type-checks, then builds to dist/
npm run preview    # serves dist/ so you can check the real build
npm run typecheck  # types only
```

---

## Where the content lives

Everything you'll want to edit is a plain file. No CMS.

| What | File |
|---|---|
| The centerpiece phrase (notes, syllables, tones) | `src/data/phrase.ts` |
| Colours, type scale, spacing, both modes | `src/styles/tokens.css` |
| Tone systems (Mandarin; Hakka stub) | `src/data/tones.ts` |
| About / bio | `src/sections/About.tsx` |
| Work experience | `src/sections/Work.tsx` |
| Cancer Society | `src/sections/Impact.tsx` |
| Projects | `src/sections/Projects.tsx` |
| Recital room | `src/sections/Recital.tsx` |
| Education, skills, contact | `src/sections/{Education,Skills,Contact}.tsx` |
| How I think | `src/pages/HowIThink.tsx` |
| Now page | `src/pages/Now.tsx` |
| Log posts | `src/content/log/*.md` |

Anything still needing your words renders as a loud dashed **needs your
content** box. If a reader ever sees one of those, something shipped early.

### Adding a log post

Drop a `.md` file in `src/content/log/`:

```markdown
---
title: What I learned
date: 2026-09-01
summary: One line for the index page.
tags: python, music
draft: false
---

Body in normal markdown.
```

Filename becomes the URL (`my-post.md` → `/log/my-post`). Posts sort by date,
newest first. `draft: true` still renders but is labelled.

### Adding audio to the recital room

Put files in `public/audio/`. **Use m4a or mp3, not WAV.** A three-minute WAV is
~30 MB; the same take as m4a is ~3 MB. Git keeps every version of every binary
you ever commit forever, so a few re-uploads of WAVs will bloat the repo
permanently — and GitHub starts warning past 1 GB. Compressed audio also means
the page actually loads on a phone.

---

## Deploying to GitHub Pages

This deploys through GitHub Actions, which builds the site on GitHub's machines
and publishes the result. You never commit the `dist/` folder, and there's no
`gh-pages` branch to maintain.

### One-time setup

**1. Push the code.** The repo already exists at
`github.com/ivanlekangho/ivanlekangho.github.io`, so from this folder:

```bash
git init -b main
git add .
git commit -m "Initial site scaffold"
git remote add origin git@github.com:ivanlekangho/ivanlekangho.github.io.git
git push -u origin main
```

**2. Turn on Pages — this is the step everyone misses.**
Go to the repo on GitHub → **Settings** → **Pages** → under *Build and
deployment*, set **Source** to **GitHub Actions**.

It defaults to "Deploy from a branch", and if you leave it there, the workflow
will run, go green, and publish nothing. If your first deploy appears to succeed
but the site 404s, this is why.

**3. Watch it run.** The **Actions** tab shows the workflow (`.github/workflows/deploy.yml`).
It installs dependencies, builds, and publishes. First run takes a few minutes;
after that it's usually under a minute.

**4. Visit https://ivanlekangho.github.io/**

### After that

Every push to `main` redeploys. That's the whole loop:

```bash
git add . && git commit -m "Write the About section" && git push
```

### Two details worth understanding

**Why `base: '/'` in `vite.config.ts`.** Because the repo is named
`<username>.github.io`, the site is served from the domain root. If you ever
move this to a normal project repo — say `github.com/ivanlekangho/website` — the
site would live at `/website/` and you'd have to change `base` to `'/website/'`.
Forgetting that is the single most common cause of a first GitHub Pages deploy
loading a blank white page with console errors about missing assets.

**Why the build copies `index.html` to `404.html`.** GitHub Pages serves static
files, so it has no idea that `/how-i-think` is a route this app handles — it
looks for a file at that path, doesn't find one, and serves `404.html`. Making
`404.html` a copy of `index.html` means React Router boots and handles the URL
correctly. Without it, the site works when you navigate from the homepage but
breaks when someone opens a deep link directly. That's the `postbuild` script in
`package.json`.

(No `.nojekyll` file is needed — that's only for the older branch-based deploy.
The Actions flow doesn't run Jekyll at all.)

---

## How the centerpiece works

`src/components/Centerpiece.tsx`. One note array in `src/data/phrase.ts` is the
only source of truth. Three projections of it — bass-clef notation, Mandarin
tone contours, a pitch-and-tone data series — are all indexed by a single
`progress` value from 0 to 1.

The important part: **the same `<ellipse>` elements are the noteheads, the tone
contour onsets, and the data points.** Nothing crossfades between three separate
graphics; the objects themselves move. The section is claiming that music,
language, and code are three views of one thing, so that had better be literally
true in the DOM.

Notation is engraved from note *names*, not MIDI numbers, so F♯ and F land on
the same staff line and the key signature does its job. Positions are diatonic:
bass clef, bottom line G2, one staff step = half a line gap.

The scroll driver (`src/lib/useScrollProgress.ts`) uses a passive `scroll`
listener as the reliable signal and a `requestAnimationFrame` loop as the
smoothing layer. Either alone has a failure mode — rAF gets throttled in
background tabs and freezes the morph part-way; scroll events arrive in clumps
during iOS momentum scrolling and make it stutter. `prefers-reduced-motion`
snaps to three discrete states instead of animating.

## The two modes

`musician` (default) and `engineer`, toggled in the nav and remembered in
`localStorage`. Both modes read the same tokens from `src/styles/tokens.css`;
only the weighting changes — accent hue, Fraunces' `SOFT` and `WONK` axes,
weight, tracking, easing duration, and the background motif (staff lines vs
graph paper). Section order never changes, so anchors and deep links can't break.

## Known gaps

- The eight pitches in `src/data/phrase.ts` are a **placeholder** descending
  B-minor line, not Schubert's actual notes. The syllable and tone mapping is real.
- Chinese text falls back to a system CJK face. Ship a subsetted `LXGW WenKai`
  containing only the glyphs used — the full font is several megabytes.
- `react-markdown` is most of the ~128 KB gzipped bundle. If the log stays
  small, hand-rolling the subset of markdown you actually use would cut that
  substantially.
- `npm audit` reports two moderate advisories in `react-router-dom`. Worth a
  version bump; neither is exploitable in a static site with no server-side
  routing.
