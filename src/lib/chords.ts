import type { Accidental, Step } from '../data/phrase'
import { label, type Pitch } from './tuning'

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
  /** The chord's shape, independent of which note it is built on: the
   *  symbol's suffix and the semitones it stands for. This is the entry a
   *  lookup table holds, and the terminal prints it as one. */
  quality: { suffix: string; semis: number[] }
}

/**
 * Where a chord is voiced when nobody says.
 *
 * Around middle C, which is where a pianist's right hand sits and where a
 * sine tone is pleasant rather than a rumble or a whistle. The root takes
 * whichever instance of itself is nearest middle C, so every chord lands
 * inside a sixth of it — C through F♯ above, G through B below — instead
 * of a fixed octave, which would put B a seventh higher than C and send
 * the top of a thirteenth chord into the sixth octave.
 */
const MIDDLE_C = 60
const rootNear = (pc: number) => MIDDLE_C + pc - (pc >= 7 ? 12 : 0)

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
 * maj, ma, M, Δ. Read by hand rather than by lookahead: an alternation
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

  const rootMidi = rootNear(rootPc)
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
    const bassPc = (LETTER_PC[bl] + bAcc + 12) % 12
    /* Inside the octave below the root, not pinned to a fixed octave: a
       slash bass is the note under the chord, and three octaves under it
       is a different sound. */
    const bassMidi = rootMidi - 12 + ((bassPc - rootPc + 12) % 12)
    pitches.unshift({
      step: bl,
      octave: Math.floor((bassMidi - bAcc) / 12) - 1,
      accidental: bAcc > 0 ? 'sharp' : bAcc < 0 ? 'flat' : undefined,
    })
    names.unshift(`${bl}${SIGN[bAcc + 2]}${Math.floor((bassMidi - bAcc) / 12) - 1}`)
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
    quality: { suffix: main.slice(m[1].length + m[2].length), semis: chordTones.map((t) => t.semis) },
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

/** Shown in the prompt, so the examples cost no screen furniture. */
export const SUGGESTIONS = ['B+', 'C#dim7', 'Bb13', 'Dsus4/A']

/**
 * The other direction: a handful of keys, back to a name.
 *
 * Going symbol → pitches is a parse. Going pitches → symbol is a guess, and
 * it is a guess with real ambiguity in it: C E♭ G♭ A is a diminished
 * seventh four different ways depending on which note you call the root.
 * So the rule here is the one a musician uses by default — the lowest note
 * sounding is the root unless nothing fits that way — and anything with no
 * name in the table is reported as having no name rather than being forced
 * into the nearest one.
 *
 * Keyed by interval set rather than by symbol, which is the lookup this
 * direction actually needs; `TRIADS` above is the same knowledge indexed
 * the other way round for the parser.
 */
const SHAPES: [number[], string, string][] = [
  [[0, 4, 7], '', 'major'],
  [[0, 3, 7], 'm', 'minor'],
  [[0, 3, 6], 'dim', 'diminished'],
  [[0, 4, 8], '+', 'augmented'],
  [[0, 5, 7], 'sus4', 'suspended fourth'],
  [[0, 2, 7], 'sus2', 'suspended second'],
  [[0, 4, 7, 11], 'maj7', 'major seventh'],
  [[0, 4, 7, 10], '7', 'dominant seventh'],
  [[0, 3, 7, 10], 'm7', 'minor seventh'],
  [[0, 3, 6, 10], 'm7b5', 'half-diminished seventh'],
  [[0, 3, 6, 9], 'dim7', 'diminished seventh'],
  [[0, 3, 7, 11], 'mMaj7', 'minor-major seventh'],
  [[0, 4, 8, 10], '7#5', 'dominant seventh, sharp fifth'],
  [[0, 4, 6, 10], '7b5', 'dominant seventh, flat fifth'],
  [[0, 4, 7, 9], '6', 'major sixth'],
  [[0, 3, 7, 9], 'm6', 'minor sixth'],
  [[0, 5, 7, 10], '7sus4', 'dominant seventh, suspended fourth'],
  [[0, 2, 4, 7], 'add9', 'major, added ninth'],
  [[0, 2, 4, 7, 10], '9', 'dominant ninth'],
  [[0, 2, 4, 7, 11], 'maj9', 'major ninth'],
  [[0, 2, 3, 7, 10], 'm9', 'minor ninth'],
  [[0, 2, 4, 5, 7, 10], '11', 'dominant eleventh'],
  [[0, 2, 4, 7, 9, 10], '13', 'dominant thirteenth'],
  /* partial voicings, which is most of what two hands actually play */
  [[0, 4, 10], '7', 'dominant seventh, no fifth'],
  [[0, 7, 10], '7(no3)', 'dominant seventh, no third'],
  [[0, 2, 7, 10], '9(no3)', 'dominant ninth, no third'],
  [[0, 5, 10], '7sus4(no5)', 'dominant seventh, suspended, no fifth'],
  [[0, 4, 11], 'maj7', 'major seventh, no fifth'],
  [[0, 3, 10], 'm7', 'minor seventh, no fifth'],
  [[0, 7], '5', 'open fifth'],
  [[0, 4], '', 'major third, bare'],
  [[0, 3], 'm', 'minor third, bare'],
]
const SHAPE_KEY = new Map(SHAPES.map(([iv, suffix, name]) => [iv.join(','), { suffix, name }]))

/**
 * What a key is called when nothing else decides it: the names a musician
 * reaches for without being asked which key they are in. Shared with the
 * keyboard so a key you press is written the same way in both places.
 */
export const KEY_NAME = ['C', 'C♯', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'A♭', 'A', 'B♭', 'B']
const ROOT_NAME = KEY_NAME
const PREFER_FLATS = new Set([3, 8, 10, 1, 6])

/** Pitches held down, as a chord — or null if the set has no name. */
export function identify(midis: number[]): Chord | null {
  const notes = [...new Set(midis)].sort((a, b) => a - b)
  if (!notes.length) return null
  const classes = [...new Set(notes.map((m) => ((m % 12) + 12) % 12))]

  if (notes.length === 1 || classes.length === 1) {
    const pc = classes[0]
    const pitches = notes.map((m) => spell(m, PREFER_FLATS.has(pc)))
    return {
      symbol: ROOT_NAME[pc],
      name: notes.length === 1 ? 'one note' : 'one note, doubled',
      pitches, names: pitches.map(label), intervals: notes.map((m) => m - notes[0]),
      quality: { suffix: '', semis: [0] },
    }
  }

  /* Candidate roots, bass first: an inversion is still named after its root,
     but when two readings both work the bass wins, because that is the one
     the ear takes. */
  const bassPc = ((notes[0] % 12) + 12) % 12
  const candidates = [bassPc, ...classes.filter((c) => c !== bassPc)]
  for (const root of candidates) {
    const iv = classes.map((c) => (c - root + 12) % 12).sort((a, b) => a - b)
    const hit = SHAPE_KEY.get(iv.join(','))
    if (!hit) continue
    const flats = PREFER_FLATS.has(root)
    const pitches = notes.map((m) => spell(m, flats))
    const slash = root === bassPc ? '' : `/${ROOT_NAME[bassPc]}`
    const symbol = `${ROOT_NAME[root]}${hit.suffix}${slash}`
    return {
      symbol,
      name: `${ROOT_NAME[root]} ${hit.name}${slash ? `, over its ${ROOT_NAME[bassPc]}` : ''}`,
      pitches,
      /* Spelling comes back through the parser, so a chord you click is
         written the same way as the chord you type: C minor is C E♭ G, and
         an augmented triad keeps its double sharp. */
      names: spellAs(notes, symbol, flats),
      intervals: notes.map((m) => m - notes[0]),
      quality: { suffix: hit.suffix, semis: iv },
    }
  }

  /* No name is a real answer. The arithmetic still works on it. */
  const pitches = notes.map((m) => spell(m, PREFER_FLATS.has(bassPc)))
  const plain = notes.map((m) => `${KEY_NAME[((m % 12) + 12) % 12]}${Math.floor(m / 12) - 1}`)
  return {
    symbol: plain.join(' '),
    name: `${notes.length} notes, no name in the table`,
    pitches, names: plain, intervals: notes.map((m) => m - notes[0]),
    quality: { suffix: '?', semis: classes.map((c) => (c - bassPc + 12) % 12).sort((a, b) => a - b) },
  }
}

const WRITTEN = /^([A-G])(𝄫|♭|♯|𝄪)?/u
const WRITTEN_SHIFT: Record<string, number> = { '𝄫': -2, '♭': -1, '♯': 1, '𝄪': 2 }

/**
 * Name each played note the way the parser spells that chord.
 *
 * The octave belongs to the LETTER, not to the sound: B𝄫 above middle C
 * sounds A4 but is written in the fifth octave, because it is a kind of B.
 */
function spellAs(midis: number[], symbol: string, flats: boolean): string[] {
  const parsed = parseChord(symbol)
  const byPc = new Map<number, string>()
  for (const n of parsed?.names ?? []) {
    const m = WRITTEN.exec(n)
    if (!m) continue
    const shift = m[2] ? WRITTEN_SHIFT[m[2]] : 0
    byPc.set((LETTER_PC[m[1] as Step] + shift + 24) % 12, m[1] + (m[2] ?? ''))
  }
  return midis.map((midi) => {
    const written = byPc.get(((midi % 12) + 12) % 12)
    if (!written) return label(spell(midi, flats))
    const m = WRITTEN.exec(written)!
    const shift = m[2] ? WRITTEN_SHIFT[m[2]] : 0
    return `${written}${Math.floor((midi - shift) / 12) - 1}`
  })
}
