import { PHRASE, PIECE } from '../data/phrase'
import { LH, RH } from '../data/piano'

/**
 * ONE horizontal axis for the whole system.
 *
 * The singer's staff hangs directly above the pianist's, and they are only
 * honest about playing together if a note sounded on beat 3 sits at the
 * same x on both. So neither score lays itself out any more: both read
 * their positions out of this file.
 *
 * Space between onsets goes as (beats ** 0.6), not linearly. Strictly
 * proportional spacing is what engravers call mathematically correct and
 * visually wrong — an eighth beside a dotted quarter gets a third of the
 * room and the pair reads as cramped.
 */

/** Width of the system's drawing surface, shared by both staves. */
export const SYS = {
  w: 880,
  /** Left of the staff lines. The space to its left holds the system
   *  bracket and the piano's brace. */
  staffLeft: 52,
  clef: 60,
  keySig: 118,
  time: 156,
  /** First notehead, and the right edge of the last one. */
  x0: 192,
  x1: 846,
}

/** Beats at which the bar changes. The phrase opens on a pickup eighth. */
export const BAR_BEATS = [PIECE.pickupBeats, PIECE.pickupBeats + PIECE.beatsPerBar]
/** One beat past the last sounding note: the final barline. */
export const END_BEAT = PIECE.pickupBeats + 2 * PIECE.beatsPerBar

/** Onsets of every note either performer attacks, in beats from the pickup. */
function onsetsOf(durations: number[]) {
  const out: number[] = []
  let at = 0
  for (const d of durations) { out.push(at); at += d }
  return out
}

export const VOICE_ONSET = onsetsOf(PHRASE.map((n) => n.beats))
export const RH_ONSET = onsetsOf(RH.map((e) => e.beats))
export const LH_ONSET = onsetsOf(LH.map((e) => e.beats))

const GRID = [...new Set([...VOICE_ONSET, ...RH_ONSET, ...LH_ONSET, END_BEAT])]
  .sort((a, b) => a - b)

const X: number[] = (() => {
  const w = GRID.slice(1).map((b, i) => Math.pow(b - GRID[i], 0.6))
  const total = w.reduce((a, b) => a + b, 0)
  const out: number[] = []
  let acc = 0
  GRID.forEach((_, i) => {
    out.push(SYS.x0 + ((SYS.x1 - SYS.x0) * acc) / total)
    if (i < w.length) acc += w[i]
  })
  return out
})()

/** x for any beat, interpolated inside the segment it falls in. Beats off
 *  the ends clamp, so a playhead can sit before the first note. */
export function xAt(beat: number): number {
  if (beat <= GRID[0]) return X[0]
  if (beat >= GRID[GRID.length - 1]) return X[X.length - 1]
  let i = 0
  while (i < GRID.length - 1 && GRID[i + 1] <= beat) i++
  const span = GRID[i + 1] - GRID[i]
  return X[i] + ((X[i + 1] - X[i]) * (beat - GRID[i])) / span
}

/** The inverse, for turning a pointer position back into a beat. */
export function beatAtX(x: number): number {
  if (x <= X[0]) return GRID[0]
  if (x >= X[X.length - 1]) return GRID[GRID.length - 1]
  let i = 0
  while (i < X.length - 1 && X[i + 1] <= x) i++
  return GRID[i] + ((GRID[i + 1] - GRID[i]) * (x - X[i])) / (X[i + 1] - X[i])
}

/** Barlines sit a little left of the note they precede, never on top of it. */
export const barX = (beat: number, gap: number) => xAt(beat) - gap * 1.25
