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
  /* One staff space apart: a Bravura sharp is 0.98 spaces wide, so anything
     tighter sets the two of them overlapping. */
  { x: g.gap, y: stepY(diatonic('C', 3), g) },
]

/* ------------------------------------------------------------------
   Engraving details: dots, flags, barlines, slurs.
   ------------------------------------------------------------------ */

/** Durations that need an augmentation dot. */
export const isDotted = (beats: number) => [0.75, 1.5, 3, 6].includes(beats)

/** Anything shorter than a quarter gets a flag. This phrase only has eighths. */
export const hasFlag = (beats: number) => beats < 1

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

export type AccidentalKind = 'sharp' | 'flat' | 'natural'

/** How far the clef, key signature and time signature reach before the
 *  first notehead. Shared so every staff on the site starts in the same
 *  place and the two voice scores stay in step. */
export const HEAD_X = {
  clef: (g: StaffGeom) => g.gap * 0.6,
  keySig: (g: StaffGeom) => g.gap * 5.3,
  time: (g: StaffGeom) => g.gap * 8.2,
  firstNote: (g: StaffGeom) => g.gap * 11.5,
}
