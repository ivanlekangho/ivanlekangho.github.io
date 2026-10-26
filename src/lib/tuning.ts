import type { Accidental, Step } from '../data/phrase'

/** A pitch with an explicit octave — the common currency of both staves. */
export type Pitch = { step: Step; octave: number; accidental?: Accidental }

const SEMI: Record<Step, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }
const SHIFT = { sharp: 1, flat: -1, natural: 0 } as const

/** MIDI note number. C4 (middle C) is 60. */
export const midi = (p: Pitch) =>
  (p.octave + 1) * 12 + SEMI[p.step] + (p.accidental ? SHIFT[p.accidental] : 0)

/** Equal-tempered frequency, A4 = 440 Hz. */
export const hz = (p: Pitch) => 440 * Math.pow(2, (midi(p) - 69) / 12)

/** Pitch class 0–11, for naming chords. */
export const pc = (p: Pitch) => ((midi(p) % 12) + 12) % 12

export const label = (p: Pitch) =>
  p.step + (p.accidental === 'sharp' ? '♯' : p.accidental === 'flat' ? '♭' : '') + p.octave

/**
 * Just-intonation ratios against the lowest note of a chord, to the nearest
 * simple ratio. The physics view uses these to show WHY a chord locks: the
 * partials line up at small whole-number ratios.
 */
const SIMPLE: [number, number][] = [
  [1, 1], [16, 15], [9, 8], [6, 5], [5, 4], [4, 3], [45, 32],
  [3, 2], [8, 5], [5, 3], [16, 9], [15, 8], [2, 1], [12, 5], [5, 2], [3, 1], [4, 1],
]

export function ratioTo(root: Pitch, p: Pitch) {
  const r = hz(p) / hz(root)
  let best = SIMPLE[0]
  let err = Infinity
  for (const [a, b] of SIMPLE) {
    const e = Math.abs(a / b - r)
    if (e < err) { err = e; best = [a, b] }
  }
  return { num: best[0], den: best[1], cents: Math.round(1200 * Math.log2(r)) }
}
