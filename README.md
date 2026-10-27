# ivanlekangho.github.io

Personal site. Built from scratch — no template.

**Stack:** Vite · React 19 · TypeScript · plain CSS custom properties.
No CSS framework and no animation library. The front page is a drawn concert
hall; the scores on it are hand-rolled SVG, which is both smaller and more
honest than crossfading three graphics (see below).

**Two typefaces, and no third.** Cabinet Grotesk (Fontshare, loaded in
`index.html`) sets everything that is read; Commit Mono (self-hosted via
`@fontsource/commit-mono`) sets everything that is measured. Cabinet Grotesk
ships no italic, so nothing in the CSS asks for one: `em` carries weight
instead, because a synthesised oblique on a grotesk reads as a rendering
fault.

**Mono belongs to the engineer stop.** Every label on the site reads
`--font-label`, which is Cabinet Grotesk at the musician and linguist stops
and Commit Mono at the engineer stop — so the mono face *means* something
(measured, instrumented) instead of being a texture. Only three things stay
monospaced everywhere: code, the physics annotations, and the dashed
placeholder boxes, which should look like machine output and not like
content.

---

## Running it locally

```bash
npm install
npm run dev
```

Then open the URL it prints (usually http://localhost:5173).

**The first screen is the hall, and scrolling it walks the lights** — musician,
then linguist, then engineer. Dragging the rail, clicking a stop and the arrow
keys all do the same thing. Past the last stop the wheel stops being
intercepted and the page scrolls like any other page; coming back up to the top
walks the rail in reverse, so the room is never something you can only pass
through once. Your last stop is remembered in `localStorage` under
`ivan-site-mode`; clear it if you want to see the first-load state again.

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

| What | File |
|---|---|
| The centerpiece phrase (notes, syllables, tones) | `src/data/phrase.ts` |
| The piano part, harmony, slurs | `src/data/piano.ts` |
| Where the recording lines up with the score | `src/data/timing.ts` |
| Type scale, spacing, per-stop typography | `src/styles/tokens.css` |
| Every colour, as three lighting keyframes | `src/lib/palette.ts` |
| The hall, the Steinway, the baritone | `src/components/stage/StageScene.tsx` |
| The one system both performers read | `src/components/stage/Score.tsx` |
| The horizontal axis they share | `src/lib/beatmap.ts` |
| Scrolling the hall instead of the page | `src/lib/hallScroll.ts` |
| Tone systems (Mandarin; Hakka stub) | `src/data/tones.ts` |
| The room, explained — the piece, the three readings | `src/sections/Room.tsx` |
| Bio, languages, study, stack, the palette legend | `src/sections/About.tsx` |
| Roles, Cancer Society, projects, service | `src/sections/Work.tsx` |
| The essay, what he's reading toward, the log index | `src/sections/Writing.tsx` |
| Contact | `src/sections/Contact.tsx` |
| A log post on its own page | `src/pages/Post.tsx` |
| The menu bar and its section list | `src/components/Menu.tsx` |
| Log posts | `src/content/log/*.md` |

**One page, five anchors.** `#room`, `#about`, `#work`, `#writing`, `#contact`
all live on `/`, and the menu bar — which arrives the moment the hall is behind
you — is how you get back to any of them, the hall included. Every URL this site
has ever had still works: the old panel routes redirect to the matching anchor
(see `MOVED` in `src/App.tsx`), and `/log/<slug>` redirects to
`/writing/<slug>`.

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

Filename becomes the URL (`my-post.md` → `/writing/my-post`). Posts sort by date,
newest first. `draft: true` still renders but is labelled.

### Adding a recording, and making the score follow it

Put the file in `public/audio/`. **Use m4a or mp3, not WAV.** A three-minute
WAV is ~30 MB; the same take as m4a is ~3 MB. Git keeps every version of every
binary you ever commit forever, so a few re-uploads of WAVs will bloat the repo
permanently — and GitHub starts warning past 1 GB. Compressed audio also means
the page actually loads on a phone.

**Step one: drop the file at `public/audio/der-wanderer.m4a`.** That is all.
A PLAY button appears over the score, and while it plays a playhead sweeps the
system and the notes sounding at that instant light up on *both* staves —
voice and piano together, because they share one time axis.

The page checks whether that file exists before it offers the button, so until
you add it there is nothing to see and no broken control. (It checks the
content type too: a dev server answers a missing path with `index.html` and a
200, which would otherwise light the button up for a file that isn't there.)

**Step two: teach it your rubato.** Out of the box the animation is timed by
`TEMPO` in `src/data/timing.ts` — a metronome at 66. Schubert sung to a
metronome is not Schubert, so the lights will drift off the voice within a bar.
To fix it:

1. Open the site with `?tap` on the end of the URL.
2. Press play, and tap the **space bar** on each of the nine syllables as you
   hear them: *ich — bin — ein — Fremd — (lä) — ling — ü — ber — all*.
3. The console prints a line. Paste it over `RECORDING` in `src/data/timing.ts`.

The timing map becomes piecewise linear through your own taps, so it follows
the performance instead of fighting it — and because the piano's events are
read off the same map, the accompaniment lights up in time too without any
extra numbers. Nine taps is the whole calibration.

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

## How the page is shaped

One scrolling page. The first screen is a hall — a Steinway, a baritone, and
hanging over them the one system they are both reading. Below it, five bands:
the room explained, about, work, writing, contact.

**The hall takes the wheel, once.** While you are at the top of the page the
wheel drives the rail instead of the document, so scrolling walks the three
readings (`src/lib/hallScroll.ts`). At the last stop it lets go. There is a
grace period when you arrive back at the top from below, because momentum from
a flick keeps arriving for a few hundred milliseconds and without it the rail
rewinds itself the instant you scroll back up.

**The menu bar is not there while you are in the hall.** The hall is one screen
with one control on it; a navigation bar across the top would be a second thing
to read. It arrives as soon as you leave and then never goes away, and it marks
which section you are in with an `IntersectionObserver` band in the upper third
of the viewport.

**The bands take the colour of the reading you chose.** Colour is a custom
property on `<html>`, so if you leave the hall at the engineer stop the rest of
the site is lit in steel; leave at musician and it is lit in warm gold. Nothing
special makes this happen — it is the same lighting board.

## How the room works

The hall is driven by one number: the rail position, 0 to 1.

| Rail | Voice score | Piano score | The hall |
|---|---|---|---|
| **musician** | bass-clef notation | grand staff | house lights down, one warm pool |
| **linguist** | Mandarin tone contours | roman numerals, key regions | half light, plum dusk, tone marks in the air |
| **engineer** | code encoding | frequency, wavelength, ratios | full cold wash, measured grid |

**It is one system, not two ribbons.** The voice staff sits directly above the
piano's two, bracketed at the left the way a vocal score is, and neither staff
lays itself out: both read their horizontal positions out of
`src/lib/beatmap.ts`. A note sounded on beat three is at the same x on both. The
page is claiming these two are playing together, so the geometry had better say
so — side by side, it said the opposite.

The important part: **the same `<ellipse>` elements are the noteheads, the tone
contour onsets, and the data points.** Nothing crossfades between three separate
graphics; the objects themselves move. The page is claiming that music, language
and code are three views of one thing, so that had better be literally true in
the DOM.

The frame closes in and opens out as the rail moves (`FRAME` in `Score.tsx`).
Notation is two compact staves; acoustics needs nearly twice the height. A
viewBox big enough for the tallest reading left the staves shrunk and
letterboxed at the stop most people land on.

Notation is engraved from note *names*, not MIDI numbers, so F♯ and F land on
the same staff line and the key signature does its job. Positions are diatonic:
bass clef, bottom line G2, one staff step = half a line gap. Nothing wobbles —
an earlier version jittered every line with a hash so the score looked
hand-copied, and at these sizes that just read as imprecision.

Three engraving rules in the piano part that a reader notices immediately if
you break them: two notes a second apart cannot share a column, so one of the
pair crosses the stem (`clusterShifts`); an accidental holds for the rest of its
bar at that staff position, so the D♯ on the first beamed chord is written and
the identical one on the second is not; and a pitch altered in the previous bar
gets a cautionary sign when it reverts, which is the natural on the first chord
of bar 2 undoing that D♯.

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
becomes a band at the foot of the screen framed on the performers, and the
system sits above it.

## The three readings

`musician`, `linguist`, `engineer`, set by the rail and remembered in
`localStorage`. The wheel, a vertical swipe, a drag, a click on a stop and the
arrow keys all move it. Scrubbing is continuous and releasing always lands on a
stop — leaving the house half-lit is a state nobody chose.

Nothing is gated behind a reading. Every section of the site is below the hall
whatever the rail says, so no visitor can miss half the portfolio by not
touching a control; the rail changes how the site is *lit*, not what is in it.

`prefers-reduced-motion` turns the lighting cue into a cut: `mode.tsx` skips the
tween and the CSS collapses every transition.

## Known gaps

- The piano chord voicings in `src/data/piano.ts` are **measured off a
  screenshot, not transcribed** — see `PIANO_UNVERIFIED`. The pitches are good
  (the same pipeline reproduced the vocal line exactly) but a MusicXML or MIDI
  export would make the voicings certain. The vocal line is confirmed. The one
  phrasing slur in `SLURS` is visible in Ivan's score image but where it ends
  is read, not measured.
- Chinese text falls back to a system CJK face. Ship a subsetted `LXGW WenKai`
  containing only the glyphs used — the full font is several megabytes.
- `react-markdown` is most of the ~128 KB gzipped bundle. If the log stays
  small, hand-rolling the subset of markdown you actually use would cut that
  substantially.
- `npm audit` reports two moderate advisories in `react-router-dom`. Worth a
  version bump; neither is exploitable in a static site with no server-side
  routing.
- The Cancer Society work is described without the product name, the schema, or
  anyone's name, which was Ivan's own call and is the right one. If he ever
  wants the product named, that is a one-line change and his decision to make.
- The résumé's GPA reads 4.10/4.00. That cannot be right on a 4.00 scale, and
  the figure is deliberately not on the site.
