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
 * A line-drawn F clef. Deliberately stroked rather than a filled engraved
 * glyph: the whole site is thin-line pastel, and a heavy Bravura clef would
 * sit on the page like a stamp. Swap in a subsetted SMuFL font here if we
 * ever want strict engraving accuracy.
 */
export function bassClefPath(x: number, fLineY: number, g: StaffGeom) {
  const u = g.gap
  return `M ${x + 0.35 * u},${fLineY}
          C ${x + 0.35 * u},${fLineY - 1.15 * u} ${x + 2.7 * u},${fLineY - 1.25 * u} ${x + 2.7 * u},${fLineY + 0.3 * u}
          C ${x + 2.7 * u},${fLineY + 2.25 * u} ${x + 0.95 * u},${fLineY + 3.4 * u} ${x - 0.2 * u},${fLineY + 4.0 * u}`
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
