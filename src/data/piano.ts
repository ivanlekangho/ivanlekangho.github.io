import type { Pitch } from '../lib/tuning'

/**
 * THE PIANO PART — Schubert, "Der Wanderer" D.489, the "Ich bin ein Fremdling
 * überall" bar and a half, in B minor.
 *
 * WHERE THIS CAME FROM. Ivan's own MuseScore file, which settles it. Every
 * pitch, duration, beam and tie below was read out of the score's XML and
 * transposed down a perfect fourth — his file is in E minor and the room is
 * in B minor (see the note on key in PIECE).
 *
 * It replaces an image-processing read of a score photograph, which got the
 * voice exactly right, got the whole left hand exactly right including the
 * A octave minim that opens bar 2, and got two right-hand chords wrong:
 * an A read as a G in the beamed quavers of bar 1, and an A missing
 * altogether from the dominant seventh in bar 2. Both were a notehead
 * landing a step off, which is what a pixel of error looks like once it is
 * a chord. The first of them also mis-named the harmony — B7 was being
 * called B augmented, because the note that makes it a seventh was the one
 * that went missing.
 */

export const PIANO_UNVERIFIED = false

export type PianoEvent = {
  id: string
  /** Duration in quarter-note units. */
  beats: number
  pitches: Pitch[]
  rest?: boolean
  /** Eighths sharing an id are beamed together rather than flagged. */
  beam?: string
}

const p = (step: Pitch['step'], octave: number, accidental?: Pitch['accidental']): Pitch =>
  ({ step, octave, accidental })

/* Right hand. Pickup eighth rest, then two bars.
   Beat map: | 0 (q) 1 (e) 1.5 (e) 2 (q.) 3.5 (e) | 0 (q) 1 (q) 2 (q) 3 (rest) | */
export const RH: PianoEvent[] = [
  { id: 'r0', beats: 0.5, pitches: [], rest: true },
  { id: 'r1', beats: 1.0, pitches: [p('F', 3, 'sharp'), p('B', 3), p('D', 4)] },
  { id: 'r2', beats: 0.5, beam: 'rb', pitches: [p('F', 3, 'sharp'), p('A', 3), p('B', 3), p('D', 4, 'sharp')] },
  { id: 'r3', beats: 0.5, beam: 'rb', pitches: [p('F', 3, 'sharp'), p('A', 3), p('B', 3), p('D', 4, 'sharp')] },
  { id: 'r4', beats: 1.5, pitches: [p('G', 3), p('B', 3), p('E', 4)] },
  { id: 'r5', beats: 0.5, pitches: [p('G', 3), p('B', 3, 'flat'), p('E', 4)] },
  { id: 'r6', beats: 1.0, pitches: [p('F', 3, 'sharp'), p('A', 3), p('D', 4)] },
  { id: 'r7', beats: 1.0, pitches: [p('G', 3), p('A', 3), p('C', 4, 'sharp')] },
  { id: 'r8', beats: 1.0, pitches: [p('F', 3, 'sharp'), p('A', 3), p('D', 4)] },
  { id: 'r9', beats: 1.0, pitches: [], rest: true },
]

/* Left hand. Note bar 2 opens with an octave HALF note, so the hands do not
   share a rhythm — hence two independent event lists rather than one. */
export const LH: PianoEvent[] = [
  { id: 'l0', beats: 0.5, pitches: [], rest: true },
  { id: 'l1', beats: 1.0, pitches: [p('B', 2)] },
  { id: 'l2', beats: 0.5, beam: 'lb', pitches: [p('B', 2)] },
  { id: 'l3', beats: 0.5, beam: 'lb', pitches: [p('B', 2)] },
  { id: 'l4', beats: 1.5, pitches: [p('E', 2)] },
  { id: 'l5', beats: 0.5, pitches: [p('G', 2)] },
  { id: 'l6', beats: 2.0, pitches: [p('A', 1), p('A', 2)] },
  { id: 'l7', beats: 1.0, pitches: [p('D', 2)] },
  { id: 'l8', beats: 1.0, pitches: [], rest: true },
]

/**
 * The harmonic reading — state 2 of the piano's morph.
 *
 * The phrase leaves B minor and lands in D major, its relative major, which is
 * why the voice ends on D rather than resolving to B. The last three chords are
 * a plain cadential six-four in D: the tonic over its own fifth, the dominant
 * seventh, then the tonic. Schubert makes "I am a stranger everywhere" resolve
 * somewhere other than home.
 */
export type HarmonyStep = {
  atBeat: number
  beats: number
  /** Lead-sheet symbol: what a pianist would read off a chart. */
  symbol: string
  /** Roman numeral: what the chord is DOING in the key. */
  numeral: string
  name: string
  /** The word for the move, which is the part worth learning. */
  move: string
  key: 'b' | 'D'
  note?: string
}

export const HARMONY: HarmonyStep[] = [
  { atBeat: 0.5, beats: 1.0, symbol: 'Bm',    numeral: 'i',      name: 'B minor',
    move: 'tonic', key: 'b' },
  { atBeat: 1.5, beats: 1.0, symbol: 'B7',    numeral: 'V⁷/iv',  name: 'B dominant seventh',
    move: 'secondary dominant', key: 'b',
    note: 'The D♯ pulls upward to E: a dominant pointing at the subdominant.' },
  { atBeat: 2.5, beats: 1.5, symbol: 'Em',    numeral: 'iv',     name: 'E minor',
    move: 'subdominant', key: 'b' },
  { atBeat: 4.0, beats: 0.5, symbol: 'C♯°7',  numeral: 'vii°⁷/III', name: 'C♯ diminished seventh',
    move: 'pivot', key: 'b',
    note: 'The B♭ is the pivot — a diminished seventh that turns the phrase toward D.' },
  { atBeat: 4.5, beats: 1.0, symbol: 'D/A',   numeral: 'I⁶₄',    name: 'D major over its fifth',
    move: 'cadential six-four', key: 'D' },
  { atBeat: 5.5, beats: 1.0, symbol: 'A7',    numeral: 'V⁷',     name: 'A dominant seventh',
    move: 'dominant', key: 'D' },
  { atBeat: 6.5, beats: 1.0, symbol: 'D',     numeral: 'I',      name: 'D major',
    move: 'resolution', key: 'D' },
]

/**
 * The progression in the words a musician would actually use. Kept as data
 * so the page can say it once rather than three times in three registers.
 */
export const PROGRESSION = {
  short: 'i – V/iv – iv – vii°⁷ – I⁶₄ – V⁷ – I',
  sentence:
    'B minor borrows its own dominant to lean on the subdominant, pivots on a diminished seventh, and cadences in D major — the relative major, not the key it started in.',
}

/**
 * Phrasing slurs in the accompaniment, by onset beat. Only one is visible in
 * the score image Ivan sent: it opens on the first chord of bar 2 and carries
 * across the rest of the bar. Where it ends is the one part of this that is
 * read rather than measured.
 */
export const SLURS: { hand: 'rh' | 'lh'; from: number; to: number }[] = [
  { hand: 'rh', from: 4.5, to: 6.5 },
]

export const PIANO_PIECE = {
  startKey: 'B minor',
  endKey: 'D major',
  summary:
    'Eight chords that begin in B minor and end in D major — the phrase resolves, just not home.',
}

/**
 * Every pitch sounding at a given beat, both hands — sustained notes
 * included, which is the difference between "what was struck" and "what you
 * can hear". The A octave that opens bar 2 is held under the next chord, and
 * without it the V⁷ there reads as a bare tritone.
 */
export function soundingAt(beat: number): Pitch[] {
  const out: Pitch[] = []
  for (const hand of [RH, LH]) {
    let at = 0
    for (const e of hand) {
      if (!e.rest && at <= beat + 1e-9 && beat < at + e.beats - 1e-9) out.push(...e.pitches)
      at += e.beats
    }
  }
  return out
}
