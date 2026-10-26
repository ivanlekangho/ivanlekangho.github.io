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

/** The five line y values, bottom to top. */
export const staffLineYs = (g: StaffGeom) => [0, 1, 2, 3, 4].map((i) => g.bottomY - i * g.gap)

/** Stems go up below the middle line, down above it — standard practice. */
export const stemDirection = (n: Note, g: StaffGeom) =>
  noteY(n, g) > g.bottomY - 2 * g.gap ? 'up' : 'down'

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
  { x: 9, y: stepY(diatonic('C', 3), g) },
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

export const totalBeats = (notes: Note[]) => notes.reduce((s, n) => s + n.beats, 0)

/**
 * x positions proportional to elapsed beats, so the spacing reads rhythmically
 * instead of as evenly spaced dots. The same x is reused by all three
 * projections, which is what keeps the morph legible as one object moving.
 */
export function beatXs(notes: Note[], x0: number, x1: number) {
  const total = totalBeats(notes)
  let acc = 0
  return notes.map((n) => {
    const x = x0 + ((x1 - x0) * acc) / total
    acc += n.beats
    return x
  })
}

/* ------------------------------------------------------------------
   Engraving details: dots, flags, barlines, slurs.
   ------------------------------------------------------------------ */

/** Durations that need an augmentation dot. */
export const isDotted = (beats: number) => [0.75, 1.5, 3, 6].includes(beats)

/** Anything shorter than a quarter gets a flag. This phrase only has eighths. */
export const hasFlag = (beats: number) => beats < 1

/**
 * x positions for barlines, placed midway between the note that ends a bar and
 * the note that starts the next so they never collide with a notehead.
 * `pickup` is the length of the anacrusis in the same units as `beats`.
 */
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
