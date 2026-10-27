# ivanlekangho.github.io

Personal site. Built from scratch — no template.

**Stack:** Vite · React 19 · TypeScript · plain CSS custom properties.
No CSS framework and no animation library. The front page is a drawn concert
hall; the scores on it are hand-rolled SVG, which is both smaller and more
honest than crossfading three graphics (see below).

---

## Running it locally

```bash
npm install
npm run dev
```

Then open the URL it prints (usually http://localhost:5173).

The page never scrolls. Everything is driven by the rail at the foot of the
room — drag it to scrub the lights and both scores continuously, or click a
stop. Your last stop is remembered in `localStorage` under `ivan-site-mode`;
clear it if you want to see the first-load state again.

```bash
npm run build      # type-checks, then builds to dist/
npm run preview    # serves dist/ so you can check the real build
npm run typecheck  # types only
```

---

## Where the content lives

Everything you'll want to edit is a plain file. No CMS.

Every section is its own route and opens as a panel over the hall, so each one
has a URL you can link to directly.

| What | Opens at | File |
|---|---|---|
| The centerpiece phrase (notes, syllables, tones) | — | `src/data/phrase.ts` |
| Type scale, spacing, per-stop typography | — | `src/styles/tokens.css` |
| Every colour, as three lighting keyframes | — | `src/lib/palette.ts` |
| The hall, the Steinway, the baritone | — | `src/components/stage/StageScene.tsx` |
| Tone systems (Mandarin; Hakka stub) | — | `src/data/tones.ts` |
| About / bio | `/about` | `src/sections/About.tsx` |
| Work experience | `/work` | `src/sections/Work.tsx` |
| Cancer Society | `/impact` | `src/sections/Impact.tsx` |
| Projects | `/projects` | `src/sections/Projects.tsx` |
| Recital room | `/recital` | `src/sections/Recital.tsx` |
| Education, skills, contact | `/education` `/skills` `/contact` | `src/sections/{Education,Skills,Contact}.tsx` |
| How I think | `/how-i-think` | `src/pages/HowIThink.tsx` |
| Now page | `/now` | `src/pages/Now.tsx` |
| Log posts | `/log` | `src/content/log/*.md` |

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

## How the room works

The front page is a hall: a Steinway, a baritone, and both their scores hanging
in the air above them. Nothing scrolls. One number — the rail position, 0 to 1 —
drives all of it at once.

| Rail | Voice score | Piano score | The hall |
|---|---|---|---|
| **musician** | bass-clef notation | grand staff | house lights down, one warm pool |
| **linguist** | Mandarin tone contours | roman numerals, key regions | half light, plum dusk |
| **engineer** | code encoding | frequency, wavelength, ratios | full cold wash, measured grid |

The important part: **the same `<ellipse>` elements are the noteheads, the tone
contour onsets, and the data points.** Nothing crossfades between three separate
graphics; the objects themselves move. The page is claiming that music, language
and code are three views of one thing, so that had better be literally true in
the DOM.

Notation is engraved from note *names*, not MIDI numbers, so F♯ and F land on
the same staff line and the key signature does its job. Positions are diatonic:
bass clef, bottom line G2, one staff step = half a line gap.

**The lighting board** is `src/lib/palette.ts`. Three keyframes, and every lit
value is interpolated between them and written onto `<html>` as a custom
property as the rail moves — so the lights come up continuously instead of
snapping at the stops. `src/styles/tokens.css` holds only what is allowed to
snap: type, motion, spacing, and the four Mandarin tone families.

**The instrument** is projected, not sketched. A grand's plan is a long straight
spine, a straight keyboard end, and one bent rim tapering to the tail; round all
of that off and you get an oval table. `StageScene.tsx` projects those plan
coordinates through one transform and builds every other part on the result. The
baritone is drawn in a 200×420 box so the classical proportions — head a seventh
and a half of the height, shoulders a quarter, legs just under half — are
numbers rather than guesses.

**On a phone** the hall would crop to the middle of the piano, so the stage
becomes a band at the foot of the room framed on the performers, and the two
scores stack.

## The three readings

`musician`, `linguist`, `engineer`, set by the rail and remembered in
`localStorage`. The rail re-weights the navigation — destinations that belong to
the current reading come forward, the rest recede — but it never hides anything,
so no visitor can miss half the site by not touching a control. Route order and
URLs never change, so deep links can't break.

`prefers-reduced-motion` turns the lighting cue into a cut: `mode.tsx` skips the
tween and the CSS collapses every transition.

## Known gaps

- The piano chord voicings in `src/data/piano.ts` are **measured off a
  screenshot, not transcribed** — see `PIANO_UNVERIFIED`. The pitches are good
  (the same pipeline reproduced the vocal line exactly) but a MusicXML or MIDI
  export would make the voicings certain. The vocal line is confirmed.
- Chinese text falls back to a system CJK face. Ship a subsetted `LXGW WenKai`
  containing only the glyphs used — the full font is several megabytes.
- `react-markdown` is most of the ~128 KB gzipped bundle. If the log stays
  small, hand-rolling the subset of markdown you actually use would cut that
  substantially.
- `npm audit` reports two moderate advisories in `react-router-dom`. Worth a
  version bump; neither is exploitable in a static site with no server-side
  routing.
