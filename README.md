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
| The piece, on parchment | `src/components/stage/PieceSheet.tsx` |
| Bravura's outlines, inlined | `src/lib/bravura.ts` · `tools/extract-bravura.py` |
| Engraving thicknesses and the glyph renderer | `src/lib/smufl.tsx` |
| The horizontal axis they share | `src/lib/beatmap.ts` |
| The terminal at the engineer stop | `src/components/stage/Terminal.tsx` |
| Why a chord sounds the way it does | `src/lib/acoustics.ts` |
| Does the melody move the way the tone does | `src/lib/toneMelody.ts` |
| Scrolling the hall instead of the page | `src/lib/hallScroll.ts` |
| Tone systems (Mandarin; Hakka stub) | `src/data/tones.ts` |
| Bio, languages, study, honours, stack, the palette legend | `src/sections/About.tsx` |
| Voice, instruments, composition, the saxophone research | `src/sections/Music.tsx` |
| Roles, Cancer Society, projects, service | `src/sections/Work.tsx` |
| The essay, what he's reading toward, the log index | `src/sections/Writing.tsx` |
| Contact | `src/sections/Contact.tsx` |
| A log post on its own page | `src/pages/Post.tsx` |
| The menu bar and its section list | `src/components/Menu.tsx` |
| Log posts | `src/content/log/*.md` |

**One page, five anchors.** `#about`, `#music`, `#work`, `#writing`, `#contact`
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

One scrolling page. The first screen is the **recital room** (the hall, the
home page — the same thing by any of those names) — a Steinway, a baritone, and
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

## How the recital room works

One number drives it: the rail position, 0 to 1.

| Rail | Voice | Piano | The room |
|---|---|---|---|
| **musician** | bass-clef notation | grand staff | house lights down, one warm pool |
| **linguist** | Mandarin tone against the melody | chord symbols over roman numerals | half light, plum dusk |
| **engineer** | the terminal | the terminal | full cold wash, measured grid |

The room makes one argument: that music, language and code are three
descriptions of the same object. So the three stops are not three subjects —
they are three vocabularies pointed at the same nine notes.

**The score is in front and the performers are behind it.** The piano and the
baritone are softened, dimmed and slightly desaturated by one SVG filter
(`#depth` in `StageScene.tsx`) applied to the group that holds them; the room's
own light is untouched, because blurring the pool as well just looks like a
smeared page. The score casts a soft shadow back onto the room
(`.score-system::before`) so it has something to sit in front of.

**It is one system, not two ribbons.** The voice staff sits directly above the
piano's two, bracketed at the left the way a vocal score is, and neither staff
lays itself out: both read their horizontal positions out of
`src/lib/beatmap.ts`. A note sounded on beat three is at the same x on both.

**The engraving is Bravura's.** Clefs, accidentals, rests, flags, the brace and
the time signature are the reference SMuFL font's own outlines, inlined as SVG
paths by `tools/extract-bravura.py`. They are paths rather than a web font
because the glyphs live in the Private Use Area, and a subset woff2 rendered
cut common as a blank with the wrong advance in Chromium while every font tool
read it back intact — eleven shapes are not worth a font request and a FOUT.
Noteheads stay geometry, because on the stage they morph; their proportions
come from the font instead (1.18 staff spaces by one). Rule weights are
Bravura's too, in `ENG` in `src/lib/smufl.tsx`: a 0.13-space staff line, a
0.12-space stem, a half-space beam. A staff ruled at one device pixel beside a
half-space beam is most of why amateur notation looks amateur.

The important part: **the same `<ellipse>` elements are the noteheads, the tone
contour onsets, and the data points.** Nothing crossfades between three separate
graphics; the objects themselves move.

The frame closes in and opens out as the rail moves (`FRAME` in `Score.tsx`).
Notation is two compact staves; the language reading needs nearly a third more
height. A viewBox big enough for the tallest reading left the staves shrunk and
letterboxed at the stop most people land on.

### The piece, on parchment

The credit over the stage — *Franz Schubert · Der Wanderer, D.489* — is a
button. It lifts the piece out of the room as a sheet of aged paper: the vocal
line engraved on its own, the three readings of the text, the Wang Wei echo,
what the harmony is doing and how often the melody agrees with the Mandarin
tone. An overlay rather than a section, because it is about the thing you are
already looking at; sending a reader down the page to find it would be sending
them away.

The sheet takes the wheel from the room while it is open, and re-scopes the
colour variables to fixed paper values — parchment does not change colour when
the house lights come up. On its own page the voice line spaces its own onsets
(`soloAxis` in `beatmap.ts`) rather than borrowing the system's grid, which
would leave air wherever only the pianist plays.

### The linguist stop

Two things happen here that are worth stating plainly.

**Tone against melody.** Mandarin carries part of a word in the pitch contour
of the syllable, so a melody that falls where the tone rises can make a sung
line ambiguous — a real problem for anyone setting a tone language to music,
and one Schubert, writing in German in 1816, obviously did not have. Over each
syllable the room draws the Mandarin tone as a solid line and where the melody
actually goes next as a dashed one. `src/lib/toneMelody.ts` compares the two
and counts: **two of the seven syllables move the way their tone does, two move
the opposite way.** That is a measured coincidence, not a claim, which is
exactly why it is measured rather than asserted.

**Two registers of harmony.** Above the staff, the chord symbol — `Bm`, `B+`,
`Em`, `C♯°7`, `D/A`, `A7`, `D` — which names the object. Below it, the roman
numeral, which names what the chord is *doing* to the key. The progression and
the word for each move (`secondary dominant`, `pivot`, `cadential six-four`)
live in `PROGRESSION` and `HARMONY` in `src/data/piano.ts`, and read out in the
piece sheet.

### The engineer stop: the terminal

At the engineer stop the staves have said what they can, and a REPL takes their
place rather than crowding in beside them. It answers one question — why does
this sound the way it does — with arithmetic instead of adjectives.

```
>>> chord 7
freqs = [73.42, 185.00, 220.00, 293.66]
y = sum(np.sin(2*np.pi*f*t) for f in freqs)
  [the summed waveform]
D2     73.42 Hz   1/1     root
F♯3   185.00 Hz   5/2     +14¢ from just
A3    220.00 Hz   3/1      −2¢ from just
D4    293.66 Hz   4/1      +0¢ from just
repeats every 2 periods of D2 — locked
```

Commands: `melody`, `chords`, `wave <note>`, `chord <1-7>`, `beats <a> <b>`,
`why`, `help`, `clear`. They are clickable as well as typeable, because typing
in a fake terminal on a phone is nobody's idea of a good time.

**It is not CPython, and `help` says so.** It is a small interpreter over that
command set. What *is* real is every number it prints: `src/lib/acoustics.ts`
computes them from the same pitches the score is engraved from, so changing a
note in `piano.ts` changes the answers here too. The Python it prints beside
each answer is the code that expresses the same calculation.

The interesting one is `periodicity`. Write every frequency in a chord as a
whole number over a common denominator; the sum of those sines repeats at the
greatest common divisor of those numbers. Small ratios mean the repeat comes
round in two or three periods and the ear hears one thing with a pitch; stretch
them and the repeat period runs away and the same notes turn into roughness.
`beats F#3 G3` draws the other half of that: two notes 11 Hz apart, and you can
see the amplitude envelope going in and out eleven times a second.

The caveat the terminal states itself: `ratioTo` snaps to the *nearest* simple
ratio, so the ratio column is the interval the ear is listening for, not the
tempered one the piano actually plays. The cents column is the gap — and it is
why the major third in that chord reads +14¢, which is the familiar error of
equal temperament.

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

## What was left out, and why

Ivan's activity list ran to five years of school. The site carries the part
that would still mean something to a reader in ten years — a world placing, two
national firsts, three olympiad medals, the leadership roles that came with
something to run — and deliberately not the rest. Form prizes, competition
distinctions, Duke of Edinburgh Bronze, two aerospace "virtual work
experiences" and the sports teams are all real and are all absent. A portfolio
that lists everything tells a reader you could not tell which parts counted.

If any of those matter more to him than they look from here, they are one line
each to put back.

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
