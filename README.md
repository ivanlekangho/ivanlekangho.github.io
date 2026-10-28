# ivanlekangho.github.io

Personal site. Built from scratch — no template.

**Stack:** Vite, React 19, TypeScript, plain CSS custom properties.
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
| Bravura's outlines, inlined | `src/lib/bravura.ts`, `tools/extract-bravura.py` |
| Engraving thicknesses and the glyph renderer | `src/lib/smufl.tsx` |
| The horizontal axis they share | `src/lib/beatmap.ts` |
| The terminal at the engineer stop | `src/components/stage/Terminal.tsx` |
| Reading a chord symbol | `src/lib/chords.ts` |
| Why a chord sounds the way it does | `src/lib/acoustics.ts` |
| Hearing the picture | `src/lib/chordSound.ts` |
| The keyboard | `src/components/stage/Keyboard.tsx` |
| The Mandarin line, word by word | `src/data/mandarin.ts` |
| Tone against tune, stress against the bar | `src/lib/prosody.ts` |
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

**The rail is down the left edge**, where a scrollbar would be, because that
is what it does. The same markup serves the vertical rail on a desktop and the
horizontal one a phone gets; the pointer maths reads whichever axis the track
is longer in rather than being told twice.

**The hall takes the wheel, once.** While you are at the top of the page the
wheel drives the rail instead of the document, so scrolling walks the three
readings (`src/lib/hallScroll.ts`). At the last stop it lets go. Nothing inside
the room keeps the wheel for itself — including the terminal, which is why it
has no scrollback. There is a
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

| Rail | What is on screen | The room |
|---|---|---|
| **musician** | the system: voice staff over grand staff | house lights down, one warm pool |
| **linguist** | the line in four notations | half light, plum dusk |
| **engineer** | the terminal | full cold wash, measured grid |

**One screen at a time.** The three share a cell and hand over in sequence —
`screens()` in `staging.ts` — rather than crossfading through each other.
The one deliberate overlap is the staves and the language table, which have
to be lit together while the words travel off their noteheads. An
overlapping fade put the staves on top of the language table halfway through
every scroll, and the earlier layout was worse than that: the staff drew the
tone contours and the chord chart while a table underneath repeated both, so
the Mandarin, the German and the harmony were each on screen twice and neither
copy had room to be read.

A consequence worth knowing: `VoiceRibbon.tsx` and `PianoRibbon.tsx` still
contain their own language and physics states, and nothing reaches them now —
`Hall.tsx` holds the score at notation (`p` clamped below the first morph) so
it does not half-change into something the next screen is about to say
properly. Stripping those branches is a tidy-up that has not been done.

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

The credit over the stage — *Franz Schubert — Der Wanderer, D.489* — is a
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

One line, written out four ways, and nothing else on the screen.

| Row | What is in it |
|---|---|
| Mandarin | 我处处皆为异客, each character under its Chao tone letter, with pinyin |
| German | the sung text by syllable, each with its IPA |
| English | *I am a stranger everywhere* |
| Harmony | `Bm B+ Em C♯°7 D/A A7 D`, each over its roman numeral and the name of the move |

The three list rows are set to one width and spread across it, so the
characters, the German and the chord symbols line up in columns down the
table. That vertical rhyme is the argument: the last row has a lexicon, an
inflection (`⁶₄`, `⁷`) and a syntax — where a dominant is allowed to go — and
it is sitting in the same table as three things nobody disputes are languages.
Nothing on the page asserts that. The table shows it.

**The words arrive from their notes.** Scroll into this stop and each
syllable starts on its own notehead — the character where the note was, the
German on the lyric line — and travels out to its slot in the row, left to
right, while the staff dissolves underneath. What you watch is the notes
becoming the words, which is the claim the room is making; the table is
just where they come to rest. The chord symbols rise out of the grand staff
the same way, since that is where that harmony was being played.

The start positions are the engraver's own: `xAt` for the beat, `noteY` for
the pitch, `lyricY` for the German, mapped through the score SVG's viewBox
exactly as the browser maps it. The resting positions are measured, because
the rows are laid out with `space-between` and where a word settles depends
on how wide all the others are — a guess lands a few pixels off, which is
the part the eye notices. Two traps worth knowing, both now commented in
`Apparatus.tsx`: a transform makes the transformed element the glyph's
`offsetParent`, so the measurement takes two hops and both elements are
positioned in CSS to keep it deterministic; and the display face arrives
over the network, so the slots are measured again on `document.fonts.ready`.
`prefers-reduced-motion` puts everything home and skips the travel.

Tone letters follow the IPA convention, contour to the left of a reference
bar, rather than a tone box with a rule across the top — that rule hides the
level tone, which runs along exactly it. The IPA lives on the notes in
`phrase.ts`, so the sung text and its transcription cannot drift apart.
`Apparatus.tsx` draws the whole thing.

What used to be here and is not any more: direction arrows over each syllable,
a metre strip under them, and a tally of how often tone agreed with the tune.
They were measurements about the line rather than the line itself, and they
crowded out the thing they were measuring. The measurements still exist —
`prosody.ts` computes them and the piece sheet reports them at length, with
the stress table and the 异客 problem written out.

**On a phone** all four rows stay; three of four is not the argument. The row
labels move above their rows, and the harmony sets itself in four even columns
instead of wrapping ragged.

### The engineer stop: the terminal

At the engineer stop a REPL has the screen, centred in the window rather than
in the column the rail leaves behind. It opens on the phrase's own final chord and answers the only question
worth asking: why does that sound like that.

You get the chord named, the summed waveform, a keyboard with it held down,
the frequencies with their ratios and their distance from pure, three lines of
Python, and a sound toggle. **The audio is the picture:** one pure sine per
note, no harmonics, no samples, so what is on screen is literally what comes
out of the speakers. It sounds like an organ rather than a Steinway, and that
is the honest trade.

**You can play it.** Every key is a button; pressing one adds or removes a
note and `identify()` in `chords.ts` names whatever is left. That is the
opposite direction from parsing, and a genuinely ambiguous one — C E♭ G♭ A is
a diminished seventh four different ways — so the rule is the one a musician
uses by default: the lowest note sounding is the root unless nothing fits that
way, and a set with no name in the table is reported as having no name rather
than forced into the nearest one. Spelling comes back through the parser, so a
chord you click is written the same way as the chord you type.

**You can hover the waveform.** The sum is what you see first; moving across
it brings the component sines up underneath, each in its own colour, with a
crosshair marking the same instant on all of them. Hovering a row of the
frequency table isolates that one note's sine. The window is a little over one
repeat where the chord repeats soon and six cycles of the bass where it does
not — past that the components cross each other too often to read as lines.

**You can change the tuning.** `lib/temperament.ts` holds four systems, each
as twelve ratios against the chord's lowest note, which is also how a choir
tunes — to the bass, not to A440.

| System | What it is | What the terminal shows |
|---|---|---|
| equal | twelve identical steps | the familiar errors: major third +14¢, fifth −2¢ |
| choral | five-limit whole-number ratios | every interval 0¢, because this is the zero |
| pythagorean | a chain of pure fifths | fifth pure, minor third −22¢ |
| meantone | fifths narrowed to buy pure thirds | third pure, fifth −5¢ |

The `JUST` table in `tuning.ts` is both the choral tuning and the reference
the cents column is measured against, so the two cannot disagree. Switching to
choral is the demonstration: every error collapses to zero and the waveform
settles.

**It does not scroll.** Each chord replaces the last. A pane with its own
scrollbar would swallow the wheel and strand you at the bottom of the rail.

**Chords are voiced around middle C.** The root takes whichever instance of
itself is nearest middle C — C through F♯ above it, G through B below — so
every chord lands within a sixth of it. A fixed octave would put B a seventh
higher than C and send the top of a thirteenth into the sixth octave, which
as a bare sine is a whistle. A slash bass goes in the octave immediately
below the root rather than at a fixed pitch. The keyboard gives the chord a
full octave of air below it so it sits in the middle of the keys, and grows
to four octaves where a chord needs the room.

**`lib/chords.ts` tracks scale degrees, not semitones.** Three semitones above
C is E♭ when it is the third of C minor and D♯ when it is the ♯9 of a dominant,
and spelling from pitch class alone gets that wrong every time — a musician
notices immediately. `Cdim7` therefore prints `C E♭ G♭ B𝄫`, double flat and
all, which is the correct notation. It also means the parser has to read `maj`
by hand rather than by lookahead: a regex alternation backtracks into `ma` and
quietly turns `Cmaj7` into a dominant seventh, which is a different chord.

**`ratioTo` reduces into one octave and multiplies back out.** An octave and a
fifth is 3/1; two octaves and a major second is 9/2. Searching a flat list of
"simple" ratios instead — which this used to do — ran out of table above two
octaves and reported the ninth of a `Bb13` as 12/5.

**`periodicity` is the answer to the question.** Write every frequency as a
whole number over a common denominator; the sum repeats at the greatest common
divisor of those numbers. Small ratios mean the shape comes back round in two
or three periods and the ear hears one thing with a pitch; stretch them and the
repeat period runs away and the same notes turn into roughness. The thresholds
are set against chords whose character is not in dispute:

| Chord | Repeats after | Reads as |
|---|---|---|
| C major triad | 4 periods | locked |
| C minor, Cmaj7, Dsus4 | 8–10 | settled |
| C augmented, G7, CmMaj7 | 20–40 | restless |
| Bb13, Cdim7, F♯m7♭5 | 180–1440 | rough |

**The dictionary question.** The Python line prints `QUALITY = {…, "maj7": (0,
4, 7, 11)}` — a dict keyed by symbol suffix, holding semitones above the root.
That is the right shape for the *lookup*: a chord quality is a name you ask
for by key, and the values are fixed. The chord *instance* under it is a
second dict, note name to frequency, looped over to build the sound. That one
is a dict for display rather than by necessity — the real constraint is
ordering and the possibility of a doubled note, which a dict loses, so the
code holds the live chord as an ordered list of pitches and only prints it as
a dict because `notes.values()` is the clearest way to show the loop.

**Where an AI would plug in.** The original ask was to send what you type
through a model. This site is static files on GitHub Pages: there is no server
to hold a key, and a key in the browser is a key anyone can read out of the
bundle. So the default path is the parser, which is deterministic, offline and
right. `resolveChord` in `Terminal.tsx` tries `VITE_CHORD_API` first when it is
set — a URL that takes `{ text }` and answers `{ midi: number[], name?: string }`
— and falls back to the parser. Point that at a small serverless function and
freeform input ("something like the end of Mahler 9") starts working. The
function is the only part that has to live somewhere with a secret.

### The rest of the room

**The lighting board** is `src/lib/palette.ts`. Three keyframes, and every lit
value is interpolated between them and written onto `<html>` as a custom
property as the rail moves — so the lights come up continuously instead of
snapping at the stops. `src/styles/tokens.css` holds only what is allowed to
snap: type, motion, spacing, and the four Mandarin tone families.

**The instrument** is projected, not sketched. A grand's plan is a long
straight spine, a straight keyboard end, and one bent rim tapering to the tail;
round all of that off and you get an oval table. `StageScene.tsx` projects
those plan coordinates through one transform and builds every other part on the
result. The baritone is drawn in a 200×420 box so the classical proportions —
head a seventh and a half of the height, shoulders a quarter, legs just under
half — are numbers rather than guesses.

**On a phone** the room would crop to the middle of the piano, so the stage
becomes a band at the foot of the screen framed on the performers, and the
system sits above it. The room is a definite `100dvh`, not a minimum, because
the terminal would otherwise push it taller than the screen — and while the
room has the wheel, a page taller than the screen is a page you cannot reach
the bottom of. At the language and engineer stops the stage band gives back
some of its height so the translations, and the ratio table, still fit.

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
