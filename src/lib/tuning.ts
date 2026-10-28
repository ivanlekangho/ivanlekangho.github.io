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
 * The five-limit just ratio for each interval inside an octave.
 *
 * This is the "pure" an ear is listening for, and it is also what the choral
 * tuning in lib/temperament.ts actually builds a chord out of, so the two
 * cannot disagree: switch the terminal to choral and every error reads zero,
 * because zero is the definition of the thing it is being measured against.
 *
 * The minor seventh is 16/9, two pure fourths stacked, rather than the 9/5
 * that some tables give — it is four cents from equal temperament where 9/5
 * is eighteen, and a dominant seventh is where this interval mostly turns up.
 */
export const JUST: [number, number][] = [
  [1, 1], [16, 15], [9, 8], [6, 5], [5, 4], [4, 3],
  [45, 32], [3, 2], [8, 5], [5, 3], [16, 9], [15, 8],
]

const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a)

/**
 * The interval between two pitches as a whole-number ratio.
 *
 * Reduced into one octave first and then multiplied back out, because that
 * is how these ratios are built: an octave and a fifth is 3/1, two octaves
 * and a major second is 9/2. Searching a flat list of "simple" ratios
 * instead — which this used to do — ran out of table above two octaves and
 * started reporting a ninth as 12/5.
 */
export function ratioTo(root: Pitch, p: Pitch) {
  const semis = midi(p) - midi(root)
  const oct = Math.floor(semis / 12)
  const [a, b] = JUST[((semis % 12) + 12) % 12]
  let num = a
  let den = b
  if (oct >= 0) num *= 2 ** oct
  else den *= 2 ** -oct
  const g = gcd(num, den)
  return {
    num: num / g,
    den: den / g,
    /* Equal-tempered cents, which is what the piano actually plays. */
    cents: Math.round(100 * semis),
  }
}
