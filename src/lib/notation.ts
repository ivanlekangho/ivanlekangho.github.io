import type { Note, Step } from '../data/phrase'

/* ============================================================
   Staff geometry.

   We engrave the notation ourselves rather than pulling in VexFlow or a
   SMuFL font. For a single phrase that is less code, not more, and it
   means every notehead is a DOM node we can morph — which is the entire
   premise of the centerpiece. It also sidesteps edition copyright: the
   music is public domain and we are setting it, not scanning it.

   Vertical positions come from DIATONIC index, not MIDI, so F♯ and F sit
   on the same line (as they must) and the key signature does the work.
   ============================================================ */

const STEP_INDEX: Record<Step, number> = { C: 0, D: 1, E: 2, F: 3, G: 4, A: 5, B: 6 }

export const diatonic = (step: Step, octave: number) => octave * 7 + STEP_INDEX[step]

/** Bass clef: the bottom staff line is G2. */
export const BASS_BOTTOM = diatonic('G', 2)

export type StaffGeom = {
  /** Distance between adjacent staff lines. */
  gap: number
  /** y of the bottom (first) staff line. */
  bottomY: number
}

/** y for a diatonic index. One staff step = half a line gap. */
export const stepY = (idx: number, g: StaffGeom) => g.bottomY - (idx - BASS_BOTTOM) * (g.gap / 2)

export const noteY = (n: Note, g: StaffGeom) => stepY(diatonic(n.step, n.octave), g)

/** y for a diatonic index on a staff whose bottom line is `refIdx`.
 *  Lets the same geometry serve the treble staff as well as the bass. */
export const stepYFrom = (idx: number, refIdx: number, g: StaffGeom) =>
  g.bottomY - (idx - refIdx) * (g.gap / 2)

export const TREBLE_BOTTOM = diatonic('E', 4)

/** The five line y values, bottom to top. */
export const staffLineYs = (g: StaffGeom) => [0, 1, 2, 3, 4].map((i) => g.bottomY - i * g.gap)

/** Stems go up below the middle line, down above it — standard practice. */
export const stemDirection = (n: Note, g: StaffGeom) =>
  noteY(n, g) > g.bottomY - 2 * g.gap ? 'up' : 'down'

/**
 * Stem directions for a whole phrase. A note sitting exactly ON the middle
 * line can go either way, so it follows its neighbour rather than flipping —
 * otherwise "ber" and "all" point opposite ways for no reason a reader can see.
 */
export function stemDirections(notes: Note[], g: StaffGeom): ('up' | 'down')[] {
  const mid = g.bottomY - 2 * g.gap
  const out: ('up' | 'down')[] = []
  for (const n of notes) {
    const y = noteY(n, g)
    out.push(y === mid && out.length ? out[out.length - 1] : y > mid ? 'up' : 'down')
  }
  return out
}

/** Ledger lines for anything outside the staff. Empty for this phrase. */
export function ledgerLines(n: Note, g: StaffGeom): number[] {
  const idx = diatonic(n.step, n.octave)
  const out: number[] = []
  for (let i = BASS_BOTTOM - 2; i >= idx; i -= 2) out.push(stepY(i, g))
  for (let i = BASS_BOTTOM + 10; i <= idx; i += 2) out.push(stepY(i, g))
  return out
}

/** Where the two sharps of a B-minor key signature sit in bass clef. */
export const bassKeySharps = (g: StaffGeom) => [
  { x: 0, y: stepY(diatonic('F', 3), g) },
  { x: g.gap * 0.62, y: stepY(diatonic('C', 3), g) },
]

/**
 * A line-drawn F clef: head dot on the F line, a curl that closes just above
 * the bottom staff line, and the two dots that straddle the F line.
 *
 * Deliberately stroked rather than a filled engraved glyph — the whole site is
 * thin-line pastel, and a Bravura clef would sit on the page like a stamp.
 * Returns the parts rather than one path so the caller can't put the dots in
 * the wrong place relative to the curl, which is exactly what happened when
 * their x was hardcoded separately.
 */
export function bassClef(x: number, fLineY: number, g: StaffGeom) {
  const u = g.gap
  return {
    curl:
      `M ${x + 0.5 * u},${fLineY} ` +
      `C ${x + 0.5 * u},${fLineY - 1.05 * u} ${x + 2.7 * u},${fLineY - 0.95 * u} ${x + 2.7 * u},${fLineY + 0.35 * u} ` +
      `C ${x + 2.7 * u},${fLineY + 1.85 * u} ${x + 1.5 * u},${fLineY + 2.6 * u} ${x + 0.25 * u},${fLineY + 3.0 * u}`,
    head: { cx: x + 0.5 * u, cy: fLineY, r: 0.3 * u },
    dots: [
      { cx: x + 3.4 * u, cy: fLineY - 0.5 * u, r: 0.15 * u },
      { cx: x + 3.4 * u, cy: fLineY + 0.5 * u, r: 0.15 * u },
    ],
    width: 3.8 * u,
  }
}

/** An eighth flag: a comma bulging away from the notehead. */
export function flagPath(stemX: number, stemTipY: number, dir: 'up' | 'down', g: StaffGeom) {
  const u = g.gap
  const s = dir === 'up' ? 1 : -1
  return `M ${stemX},${stemTipY} q ${0.95 * u},${0.25 * u * s} ${0.6 * u},${1.35 * u * s}`
}

/* ------------------------------------------------------------------
   Engraving details: dots, flags, barlines, slurs.
   ------------------------------------------------------------------ */

/** Durations that need an augmentation dot. */
export const isDotted = (beats: number) => [0.75, 1.5, 3, 6].includes(beats)

/** Anything shorter than a quarter gets a flag. This phrase only has eighths. */
export const hasFlag = (beats: number) => beats < 1

export const totalBeats = (notes: Note[]) => notes.reduce((s, n) => s + n.beats, 0)

/**
 * x positions for noteheads.
 *
 * Space is allocated per note as `beats ** 0.6`, not linearly. Strict
 * proportional spacing is what engravers call "mathematically correct and
 * visually wrong": an eighth next to a dotted quarter gets a third of the
 * room and the pair reads as cramped. The sub-linear curve is roughly what
 * hand engravers used, and it's why "ein Fremd" stops colliding.
 */
export function beatXs(notes: { beats: number }[], x0: number, x1: number, exponent = 0.6) {
  const w = notes.map((n) => Math.pow(n.beats, exponent))
  const total = w.reduce((a, b) => a + b, 0)
  let acc = 0
  return notes.map((_, i) => {
    const x = x0 + ((x1 - x0) * acc) / total
    acc += w[i]
    return x
  })
}

export function barlineXs(
  notes: Note[],
  xs: number[],
  pickup: number,
  perBar: number,
): number[] {
  const out: number[] = []
  let acc = 0
  let nextBar = pickup > 0 ? pickup : perBar
  for (let i = 0; i < notes.length; i++) {
    acc += notes[i].beats
    if (acc >= nextBar - 1e-9 && i < notes.length - 1) {
      out.push((xs[i] + xs[i + 1]) / 2)
      nextBar += perBar
    }
  }
  return out
}

/** Contiguous index runs that share a melisma id. */
export function melismaGroups(notes: Note[]): [number, number][] {
  const out: [number, number][] = []
  let i = 0
  while (i < notes.length) {
    const m = notes[i].melisma
    if (!m) { i++; continue }
    let j = i
    while (j + 1 < notes.length && notes[j + 1].melisma === m) j++
    if (j > i) out.push([i, j])
    i = j + 1
  }
  return out
}

/** A slur arcing above two noteheads. */
export function slurPath(x1: number, y1: number, x2: number, y2: number, g: StaffGeom) {
  const lift = g.gap * 1.5
  const cx = (x1 + x2) / 2
  const cy = Math.min(y1, y2) - lift
  return `M ${x1},${y1 - g.gap * 0.6} Q ${cx},${cy} ${x2},${y2 - g.gap * 0.6}`
}

/* ------------------------------------------------------------------
   Accidentals
   ------------------------------------------------------------------ */

/**
 * Whether a written accidental is needed. A note's `accidental` records its
 * SOUNDING pitch, so in B minor the F♯s and C♯ carry `sharp` in the data but
 * must not be marked on the staff — the key signature already says so.
 */
export function needsAccidental(n: Note, keySharps: readonly string[]) {
  if (!n.accidental) return false
  if (n.accidental === 'sharp') return !keySharps.includes(n.step)
  return true // naturals and flats always contradict something
}

/**
 * Cut time (alla breve): a C open to the right, spanning the middle two staff
 * spaces, with a vertical stroke through it. Built from two explicit beziers
 * rather than an SVG arc so the shape can't flip on an arc-flag.
 */
export function cutTime(cx: number, g: StaffGeom) {
  const cy = g.bottomY - 2 * g.gap
  const r = g.gap
  const k = 0.5523 * r
  const sx = cx + r * 0.78
  const sy = cy - r * 0.62
  const ex = cx + r * 0.78
  const ey = cy + r * 0.62
  return {
    // start upper-right → over the top → round the left → down to lower-right
    c:
      `M ${sx},${sy} C ${cx + r * 0.42},${cy - r} ${cx - k},${cy - r} ${cx - r},${cy - k * 0.35} ` +
      `C ${cx - r * 1.08},${cy + k * 0.7} ${cx - r * 0.5},${cy + r} ${ex},${ey}`,
    stem: { x1: cx, y1: cy - r * 1.75, x2: cx, y2: cy + r * 1.75 },
  }
}

/**
 * A quarter rest, drawn as a hand-written zigzag rather than the engraved
 * glyph. Without it the closing bar looks truncated instead of complete.
 */
export function quarterRestPath(x: number, g: StaffGeom) {
  const u = g.gap
  const y = g.bottomY - 2 * u // centred on the middle line
  return (
    `M ${x + u * 0.22},${y - u * 1.15} ` +
    `L ${x - u * 0.3},${y - u * 0.3} ` +
    `L ${x + u * 0.3},${y + u * 0.15} ` +
    `L ${x - u * 0.28},${y + u * 0.95} ` +
    `C ${x + u * 0.05},${y + u * 0.62} ${x + u * 0.42},${y + u * 0.72} ${x + u * 0.38},${y + u * 1.2}`
  )
}

/**
 * A line-drawn treble clef, in the same stroked idiom as the bass clef.
 * `yG` is the G4 line — the second line up — which is the line the spiral
 * wraps, and the only thing a treble clef actually asserts.
 */
export function trebleClef(x: number, yG: number, g: StaffGeom) {
  const u = g.gap
  return {
    /** The body: down the left, round the right, into the spiral at the G line. */
    body:
      `M ${x + 0.05 * u},${yG - 3.40 * u} ` +
      `C ${x - 0.95 * u},${yG - 2.40 * u} ${x - 1.10 * u},${yG - 1.05 * u} ${x - 0.10 * u},${yG - 0.25 * u} ` +
      `C ${x + 0.90 * u},${yG + 0.55 * u} ${x + 1.12 * u},${yG + 1.55 * u} ${x + 0.30 * u},${yG + 1.98 * u} ` +
      `C ${x - 0.42 * u},${yG + 2.34 * u} ${x - 1.00 * u},${yG + 1.70 * u} ${x - 0.82 * u},${yG + 0.95 * u} ` +
      `C ${x - 0.68 * u},${yG + 0.32 * u} ${x + 0.08 * u},${yG + 0.06 * u} ${x + 0.42 * u},${yG + 0.62 * u}`,
    /** The stem, straight down from the top tip past the staff. */
    stem: `M ${x + 0.05 * u},${yG - 3.40 * u} C ${x + 0.38 * u},${yG - 1.6 * u} ${x + 0.38 * u},${yG + 0.9 * u} ${x + 0.30 * u},${yG + 2.75 * u}`,
    /** The tail hook below the staff. */
    tail: `M ${x + 0.30 * u},${yG + 2.75 * u} C ${x + 0.26 * u},${yG + 3.45 * u} ${x - 0.45 * u},${yG + 3.55 * u} ${x - 0.62 * u},${yG + 2.95 * u}`,
  }
}

/**
 * Ledger lines for a staff whose bottom line is `bottomIdx`. Generic, because
 * the piano's right hand spends the whole phrase below the treble staff and
 * its left hand below the bass staff — without these, almost every chord's
 * pitch is unreadable.
 */
export function ledgersFor(idx: number, bottomIdx: number, g: StaffGeom): number[] {
  const topIdx = bottomIdx + 8
  const out: number[] = []
  for (let i = bottomIdx - 2; i >= idx; i -= 2) out.push(stepYFrom(i, bottomIdx, g))
  for (let i = topIdx + 2; i <= idx; i += 2) out.push(stepYFrom(i, bottomIdx, g))
  return out
}

/* ------------------------------------------------------------------
   Engraved marks.

   Nothing here wobbles. An earlier version jittered every line with a
   hash so the score looked hand-copied; at the sizes this page uses it
   just read as imprecision, which is the opposite of what a score is
   for. These are ruled.
   ------------------------------------------------------------------ */

/** True when a staff y sits ON a line rather than in a space. */
export const onLine = (y: number, g: StaffGeom) =>
  Math.round((g.bottomY - y) / (g.gap / 2)) % 2 === 0

/** An augmentation dot never sits on a line, so a notehead on a line
 *  pushes its dot up into the space above. */
export const dotY = (y: number, g: StaffGeom) => (onLine(y, g) ? y - g.gap / 2 : y)

/**
 * Which noteheads of a chord have to leave the column.
 *
 * Two notes a second apart cannot share a column — they would overlap. One
 * of the pair moves to the far side of the stem: with an up stem the UPPER
 * note goes right, with a down stem the LOWER note goes left. `idxs` must be
 * sorted low to high; the result is a displacement in notehead widths.
 */
export function clusterShifts(idxs: number[], dir: 'up' | 'down'): number[] {
  const out = idxs.map(() => 0)
  if (dir === 'up') {
    for (let i = 1; i < idxs.length; i++) {
      if (idxs[i] - idxs[i - 1] === 1 && out[i - 1] === 0) out[i] = 1
    }
  } else {
    for (let i = idxs.length - 2; i >= 0; i--) {
      if (idxs[i + 1] - idxs[i] === 1 && out[i + 1] === 0) out[i] = -1
    }
  }
  return out
}

/** An eighth rest: the hook and the slanted stroke falling away from it. */
export function eighthRestPath(x: number, g: StaffGeom) {
  const u = g.gap
  const y = g.bottomY - 2 * u
  return (
    `M ${x + 0.42 * u},${y - 0.85 * u} L ${x - 0.1 * u},${y + 0.95 * u} ` +
    `M ${x + 0.42 * u},${y - 0.85 * u} C ${x + 0.1 * u},${y - 0.5 * u} ` +
    `${x - 0.3 * u},${y - 0.42 * u} ${x - 0.46 * u},${y - 0.66 * u}`
  )
}

export type AccidentalKind = 'sharp' | 'flat' | 'natural'

/**
 * Accidentals as stroked line-art, in the same idiom as the clefs. Returned
 * as a list of subpaths so a caller can set one stroke width for the lot.
 */
export function accidentalPaths(kind: AccidentalKind, x: number, y: number, g: StaffGeom): string[] {
  const u = g.gap
  if (kind === 'flat') {
    return [
      `M ${x - 0.2 * u},${y - 1.3 * u} L ${x - 0.2 * u},${y + 0.45 * u}`,
      `M ${x - 0.2 * u},${y + 0.45 * u} C ${x + 0.5 * u},${y + 0.02 * u} ` +
        `${x + 0.46 * u},${y - 0.45 * u} ${x - 0.2 * u},${y - 0.08 * u}`,
    ]
  }
  if (kind === 'natural') {
    return [
      `M ${x - 0.22 * u},${y - 0.58 * u} L ${x - 0.22 * u},${y + 0.98 * u}`,
      `M ${x + 0.22 * u},${y - 0.98 * u} L ${x + 0.22 * u},${y + 0.58 * u}`,
      `M ${x - 0.22 * u},${y - 0.26 * u} L ${x + 0.22 * u},${y - 0.42 * u}`,
      `M ${x - 0.22 * u},${y + 0.3 * u} L ${x + 0.22 * u},${y + 0.14 * u}`,
    ]
  }
  return [
    `M ${x - 0.18 * u},${y - 0.78 * u} L ${x - 0.18 * u},${y + 0.92 * u}`,
    `M ${x + 0.18 * u},${y - 0.92 * u} L ${x + 0.18 * u},${y + 0.78 * u}`,
    `M ${x - 0.44 * u},${y - 0.2 * u} L ${x + 0.44 * u},${y - 0.38 * u}`,
    `M ${x - 0.44 * u},${y + 0.36 * u} L ${x + 0.44 * u},${y + 0.18 * u}`,
  ]
}

/** How far the clef, key signature and time signature reach before the
 *  first notehead. Shared so every staff on the site starts in the same
 *  place and the two voice scores stay in step. */
export const HEAD_X = {
  clef: (g: StaffGeom) => g.gap * 0.6,
  keySig: (g: StaffGeom) => g.gap * 5.3,
  time: (g: StaffGeom) => g.gap * 8.2,
  firstNote: (g: StaffGeom) => g.gap * 11.5,
}
