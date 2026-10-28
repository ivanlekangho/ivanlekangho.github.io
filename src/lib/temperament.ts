import { hz, JUST, midi, type Pitch } from './tuning'

/**
 * Tuning systems.
 *
 * A chord has no single set of frequencies — it has one per tuning, and the
 * differences are audible. A piano is in equal temperament because it has to
 * play in every key; a choir is not, because it does not, and a good one
 * leans every chord onto whole-number ratios until it stops beating. That is
 * the thing singers mean by "locking", and it is why the same chord can sound
 * sweet in a choir and slightly sour at the keyboard.
 *
 * Every system here is expressed as twelve ratios against the chord's lowest
 * note, which is also how a choir tunes: to the bass, not to A440. Octaves
 * extend by doubling. Equal temperament reproduces `hz()` exactly, so
 * switching to it changes nothing — which is the point of having it in the
 * list rather than treating it as the absence of a choice.
 */

export type TuningId = 'equal' | 'just' | 'pythagorean' | 'meantone'

export type Tuning = {
  id: TuningId
  name: string
  /** One line, for the terminal. */
  blurb: string
  /** Ratio above the root for each of the twelve semitones. */
  ratios: number[]
}

/** Quarter-comma meantone: a chain of fifths each flattened by a quarter of
 *  the syntonic comma, so four of them stack into a pure major third. */
function meantone() {
  const fifth = Math.pow(5, 0.25)           /* 696.578 cents */
  const out = new Array(12).fill(1)
  /* E♭ … G♯, the usual placement of the wolf. */
  for (let k = -3; k <= 8; k++) {
    let r = Math.pow(fifth, k)
    while (r >= 2) r /= 2
    while (r < 1) r *= 2
    out[Math.round(12 * Math.log2(r)) % 12] = r
  }
  out[0] = 1
  return out
}

/** Pythagorean: pure fifths all the way, which buys clean fourths and fifths
 *  at the price of a very wide major third. */
function pythagorean() {
  const out = new Array(12).fill(1)
  for (let k = -5; k <= 6; k++) {
    let r = Math.pow(1.5, k)
    while (r >= 2) r /= 2
    while (r < 1) r *= 2
    out[Math.round(12 * Math.log2(r)) % 12] = r
  }
  out[0] = 1
  return out
}

export const TUNINGS: Tuning[] = [
  {
    id: 'equal',
    name: 'equal',
    blurb: 'twelve identical steps — every key usable, no interval but the octave pure',
    ratios: Array.from({ length: 12 }, (_, i) => Math.pow(2, i / 12)),
  },
  {
    id: 'just',
    name: 'choral',
    blurb: 'whole-number ratios against the bass — what a choir drifts to when it locks',
    /* The same table the ratio column measures against, so this system is
       the zero the others are read from. */
    ratios: JUST.map(([a, b]) => a / b),
  },
  {
    id: 'pythagorean',
    name: 'pythagorean',
    blurb: 'a chain of pure fifths — bright fourths and fifths, a third 22¢ sharp',
    ratios: pythagorean(),
  },
  {
    id: 'meantone',
    name: 'meantone',
    blurb: 'fifths narrowed to buy pure thirds — the Renaissance keyboard, and a wolf',
    ratios: meantone(),
  },
]

export const tuningById = (id: TuningId) => TUNINGS.find((t) => t.id === id) ?? TUNINGS[0]

/**
 * The frequencies of a chord in a given tuning, the lowest note taken as
 * the 1/1. The root keeps its equal-tempered pitch so the chord does not
 * wander off when you switch systems — only its internal intervals change,
 * which is the only part anyone can hear in a single chord.
 */
export function freqsIn(pitches: Pitch[], id: TuningId): number[] {
  const t = tuningById(id)
  if (!pitches.length) return []
  const sorted = [...pitches].sort((a, b) => midi(a) - midi(b))
  const root = sorted[0]
  const f0 = hz(root)
  return pitches.map((p) => {
    const semis = midi(p) - midi(root)
    const oct = Math.floor(semis / 12)
    const within = ((semis % 12) + 12) % 12
    return f0 * t.ratios[within] * Math.pow(2, oct)
  })
}

/** Cents between two frequencies. */
export const centsBetween = (a: number, b: number) => 1200 * Math.log2(b / a)
