import type { Accidental, Step } from '../data/phrase'
import type { Pitch } from './tuning'

/**
 * Reading a chord symbol.
 *
 * The terminal takes whatever a musician would write on a chart — Cmaj7,
 * F♯m7♭5, Bb13, Dsus4/A, Eb7#9 — and turns it into pitches, which is all the
 * acoustics needs. Deterministic rather than inferred: a chord symbol is a
 * notation with rules, and a parser that gets Bb13 wrong is worse than no
 * parser at all.
 *
 * Every tone carries the SCALE DEGREE it is, not just its distance in
 * semitones, because that is what decides its name. Three semitones above C
 * is E♭ when it is the third of C minor and D♯ when it is the ♯9 of a
 * dominant. Spelling from pitch class alone gets that wrong every time, and
 * a musician notices it immediately.
 */

export type Chord = {
  /** Tidied version of what was typed. */
  symbol: string
  /** Plain English, for the line under the symbol. */
  name: string
  pitches: Pitch[]
  /** Spelled names, which may need a double flat — B𝄫 in a diminished
   *  seventh is correct and B♭ is not. Parallel to `pitches`. */
  names: string[]
  /** Semitones above the root, root first. */
  intervals: number[]
}

const LETTERS: Step[] = ['C', 'D', 'E', 'F', 'G', 'A', 'B']
const LETTER_PC: Record<Step, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }
const SIGN = ['𝄫', '♭', '', '♯', '𝄪']

/** A tone of the chord: how far above the root, and which degree it is. */
type Tone = { semis: number; degree: number }

/* Degrees are the scale numbers a musician says out loud: 3 for the third,
   ♭7 for the seventh of a dominant, 9 for the ninth even though it is the
   same letter as the second. */
const T = (semis: number, degree: number): Tone => ({ semis, degree })

const TRIADS: [RegExp, Tone[], string][] = [
  [/^(m7b5|m7♭5|ø7?|min7b5|-7b5)/i, [T(0, 1), T(3, 3), T(6, 5), T(10, 7)], 'half-diminished seventh'],
  [/^(dim7|o7|°7)/i, [T(0, 1), T(3, 3), T(6, 5), T(9, 7)], 'diminished seventh'],
  [/^(dim|°|o(?![a-z]))/i, [T(0, 1), T(3, 3), T(6, 5)], 'diminished'],
  [/^(aug|\+)/i, [T(0, 1), T(4, 3), T(8, 5)], 'augmented'],
  [/^(sus2)/i, [T(0, 1), T(2, 2), T(7, 5)], 'suspended second'],
  [/^(sus4|sus)/i, [T(0, 1), T(5, 4), T(7, 5)], 'suspended fourth'],
  [/^(min|m(?!a))/i, [T(0, 1), T(3, 3), T(7, 5)], 'minor'],
  [/^-/, [T(0, 1), T(3, 3), T(7, 5)], 'minor'],
]
const MAJOR: Tone[] = [T(0, 1), T(4, 3), T(7, 5)]

/**
 * maj · ma · M · Δ. Read by hand rather than by lookahead: an alternation
 * with a lookahead backtracks into `ma` and quietly turns Cmaj7 into a
 * dominant seventh, which is a different chord.
 */
const MAJ_MARK = /^(maj|ma|M|Δ)/i

/** Alterations, pulled out first so the 9 in `7#9` is not read as a plain
 *  ninth and the `#` left stranded. Each names the degree it alters. */
const ALTERATIONS: [RegExp, number, number][] = [
  [/[#♯]11/, 11, 18], [/b11|♭11/, 11, 16],
  [/b13|♭13/, 13, 20], [/[#♯]13/, 13, 22],
  [/[#♯]9/, 9, 15], [/b9|♭9/, 9, 13],
  [/[#♯]5/, 5, 8], [/b5|♭5/, 5, 6],
]
/** The plain (unaltered) version of a degree, for when `7#9` has to imply a 9. */
const PLAIN: Record<number, number> = { 5: 7, 9: 14, 11: 17, 13: 21 }

export function parseChord(input: string): Chord | null {
  const raw = input.trim().replace(/\s+/g, '')
  if (!raw) return null
  const [main, bassTxt] = raw.split('/')

  const m = /^([A-Ga-g])([#b♯♭]?)(.*)$/.exec(main)
  if (!m) return null
  const rootLetter = m[1].toUpperCase() as Step
  const rootAcc = m[2] === '#' || m[2] === '♯' ? 1 : m[2] === 'b' || m[2] === '♭' ? -1 : 0
  const rootPc = (LETTER_PC[rootLetter] + rootAcc + 12) % 12

  let rest = m[3]
  let tones: Tone[] = MAJOR
  let quality = 'major'
  for (const [re, t, labelled] of TRIADS) {
    const hit = re.exec(rest)
    if (hit) { tones = t; quality = labelled; rest = rest.slice(hit[0].length); break }
  }
  const byDegree = new Map(tones.map((t) => [t.degree, t.semis]))

  /* A major marker is either the triad (Cmaj) or the seventh family (Cmaj7,
     Cmaj9, CmMaj7), and which one depends entirely on what follows it. */
  let majSeventh = false
  const mark = MAJ_MARK.exec(rest)
  if (mark) {
    const after = rest.slice(mark[0].length)
    if (/^(7|9|11|13)/.test(after)) { majSeventh = true; rest = after }
    else if (!after || /^[^a-z0-9]/i.test(after)) { rest = after }
  }

  /* Alterations first: they own their digits. */
  const altered: [number, number][] = []
  for (const [re, degree, semis] of ALTERATIONS) {
    if (re.test(rest)) { rest = rest.replace(re, ''); altered.push([degree, semis]) }
  }

  const take = (re: RegExp) => { const hit = re.exec(rest); if (hit) rest = rest.replace(re, ''); return !!hit }
  const addNine = take(/add9/i)
  const thirteen = take(/13/)
  const eleven = take(/11/)
  const nine = take(/9/)
  const six = take(/6/)
  const seven = take(/7/)

  /* Anything left over was not understood, and silently ignoring it would be
     answering a question nobody asked. */
  if (rest.replace(/[()\s]/g, '')) return null

  const alreadySeventh = byDegree.has(7)
  if (majSeventh) byDegree.set(7, 11)
  else if ((seven || nine || eleven || thirteen) && !alreadySeventh) byDegree.set(7, 10)
  if (six) byDegree.set(6, 9)
  if (nine || eleven || thirteen || addNine) byDegree.set(9, 14)
  if (eleven || thirteen) byDegree.set(11, 17)
  if (thirteen) byDegree.set(13, 21)

  for (const [degree, semis] of altered) {
    /* C7#9 has a ninth because the alteration says so, even though nobody
       wrote a plain 9. */
    if (!byDegree.has(degree) && PLAIN[degree] === undefined) return null
    byDegree.set(degree, semis)
  }

  const chordTones = [...byDegree.entries()]
    .map(([degree, semis]) => ({ degree, semis }))
    .sort((a, b) => a.semis - b.semis)

  /** Letter name for a degree, with whatever accidental makes the interval
   *  come out right. */
  const nameOf = (t: Tone) => {
    const letterIdx = (LETTERS.indexOf(rootLetter) + (t.degree - 1)) % 7
    const letter = LETTERS[letterIdx]
    const natural = (LETTER_PC[letter] - LETTER_PC[rootLetter] + 12) % 12
    let shift = ((rootAcc + t.semis - natural + 18) % 12) - 6
    if (shift < -2 || shift > 2) shift = Math.sign(shift) * 2
    return { letter, shift }
  }

  const rootMidi = 48 + rootPc
  const pitches: Pitch[] = []
  const names: string[] = []
  for (const t of chordTones) {
    const { letter, shift } = nameOf(t)
    const midi = rootMidi + t.semis
    names.push(`${letter}${SIGN[shift + 2]}${Math.floor(midi / 12) - 1}`)
    /* The Pitch feeds the arithmetic, so it has to be representable: a
       double accidental is spelled in `names` and voiced enharmonically. */
    pitches.push(asPitch(midi, letter, shift))
  }

  if (bassTxt) {
    const b = /^([A-Ga-g])([#b♯♭]?)$/.exec(bassTxt)
    if (!b) return null
    const bl = b[1].toUpperCase() as Step
    const bAcc = b[2] === '#' || b[2] === '♯' ? 1 : b[2] === 'b' || b[2] === '♭' ? -1 : 0
    pitches.unshift({ step: bl, octave: 2, accidental: bAcc > 0 ? 'sharp' : bAcc < 0 ? 'flat' : undefined })
    names.unshift(`${bl}${SIGN[bAcc + 2]}2`)
  }

  /* Naming it the way a musician would say it out loud. "C major seventh"
     and "C dominant seventh" are different chords, and a name assembled from
     the triad plus the word "seventh" cannot tell them apart. */
  const ORD: Record<number, string> = { 5: 'fifth', 9: 'ninth', 11: 'eleventh', 13: 'thirteenth' }
  const hasDominantSeventh = byDegree.get(7) === 10 && !alreadySeventh
  let head = quality
  if (majSeventh) head = quality === 'major' ? 'major seventh' : `${quality}-major seventh`
  else if (hasDominantSeventh) head = quality === 'major' ? 'dominant seventh' : `${quality} seventh`
  const top = thirteen ? 'thirteenth' : eleven ? 'eleventh' : nine ? 'ninth' : ''
  if (top && /seventh$/.test(head)) head = head.replace(/seventh$/, top)

  const extras = [
    six ? 'sixth' : '',
    addNine && !nine ? 'added ninth' : '',
    top && !/thirteenth|eleventh|ninth/.test(head) ? top : '',
    ...altered.map(([d, semis]) => `${semis > (PLAIN[d] ?? semis) ? 'sharp' : 'flat'} ${ORD[d] ?? d}`),
  ].filter(Boolean)

  return {
    symbol: raw,
    name: `${rootLetter}${SIGN[rootAcc + 2]} ${[head, ...extras].join(', ')}`,
    pitches,
    names,
    intervals: chordTones.map((t) => t.semis),
  }
}

/** A spelled note as a Pitch, falling back to an enharmonic where the real
 *  spelling needs a double accidental the type cannot carry. */
function asPitch(midi: number, letter: Step, shift: number): Pitch {
  const octave = Math.floor(midi / 12) - 1
  if (shift >= -1 && shift <= 1) {
    return { step: letter, octave, accidental: shift > 0 ? 'sharp' : shift < 0 ? 'flat' : undefined }
  }
  return spell(midi, shift < 0)
}

const SHARP_NAMES: [Step, Accidental?][] = [
  ['C'], ['C', 'sharp'], ['D'], ['D', 'sharp'], ['E'], ['F'],
  ['F', 'sharp'], ['G'], ['G', 'sharp'], ['A'], ['A', 'sharp'], ['B'],
]
const FLAT_NAMES: [Step, Accidental?][] = [
  ['C'], ['D', 'flat'], ['D'], ['E', 'flat'], ['E'], ['F'],
  ['G', 'flat'], ['G'], ['A', 'flat'], ['A'], ['B', 'flat'], ['B'],
]

/** A MIDI number as a spelled pitch, in sharps or in flats. */
export function spell(midi: number, flats: boolean): Pitch {
  const [step, accidental] = (flats ? FLAT_NAMES : SHARP_NAMES)[((midi % 12) + 12) % 12]
  return { step, accidental, octave: Math.floor(midi / 12) - 1 }
}

/** The chords worth offering before anyone has typed anything. */
export const SUGGESTIONS = ['Cmaj7', 'F#m7b5', 'Bb13', 'Dsus4/A', 'Caug', 'Eb7#9']
