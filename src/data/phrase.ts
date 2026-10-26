import type { ToneId } from './tones'

/**
 * THE CENTERPIECE SOURCE OF TRUTH
 * ================================
 * Schubert, "Der Wanderer" D.489 — "Ich bin ein Fremdling überall"
 * Transposed to B minor for baritone; bass clef, cut time, pickup eighth.
 *
 * Everything the centerpiece draws — staff, tone contour, data view — is a
 * projection of this one array. Nothing else is a source of truth.
 *
 * NINE notes for EIGHT German syllables. The score puts a slur across two
 * notes on "Fremd", so the melisma sits in the middle of the word, not on
 * "ich" as we first assumed.
 *
 * Mandarin mapping (我处处皆为异客, 7 syllables over 9 notes): syllables fall
 * positionally. 皆 sits on the slur the score already draws across "Fremd",
 * and 客 is stretched over the last two notes so the word "stranger" lands on
 * the cadence. Note the asymmetry: "ü-ber-all" is three separate German
 * syllables with no slur, so the notation must NOT draw one there — that span
 * exists only in the Mandarin overlay. Hence two fields, not one.
 *
 * ⚠️  PITCHES ARE MY READING OF IVAN'S SCORE PHOTO and need confirming.
 *     Rhythm and bar structure are solid. See PITCHES_UNVERIFIED below.
 */

export type Step = 'C' | 'D' | 'E' | 'F' | 'G' | 'A' | 'B'
export type Accidental = 'sharp' | 'flat' | 'natural'

export type Note = {
  id: string
  step: Step
  octave: number
  accidental?: Accidental
  /** Duration in quarter-note units. */
  beats: number
  /** German syllable, or null where a note continues a melisma. */
  german: string | null
  /** Mandarin character, only on the note where the syllable begins. */
  han?: string
  pinyin?: string
  tone?: ToneId
  /** Score melisma: notes sharing an id are slurred on ONE GERMAN syllable.
   *  This is a fact of the music — it draws a slur in the notation. */
  melisma?: string
  /** Mandarin overlay: notes sharing an id carry ONE HAN syllable. This is our
   *  mapping choice, not something in the score, so it never draws a slur. */
  hanGroup?: string
}

/** Flip to false once Ivan has checked the pitches against his score. */
export const PITCHES_UNVERIFIED = true

export const PHRASE: Note[] = [
  // pickup
  { id: 'n1', step: 'E', octave: 3, beats: 0.5, german: 'ich',  han: '我', pinyin: 'wǒ',  tone: 3 },
  // bar 1
  { id: 'n2', step: 'G', octave: 3, beats: 1.5, german: 'bin',  han: '处', pinyin: 'chù', tone: 4 },
  { id: 'n3', step: 'E', octave: 3, beats: 0.5, german: 'ein',  han: '处', pinyin: 'chù', tone: 4 },
  { id: 'n4', step: 'B', octave: 3, beats: 1.0, german: 'Fremd', han: '皆', pinyin: 'jiē', tone: 1, melisma: 'm1', hanGroup: 'h4' },
  { id: 'n5', step: 'A', octave: 3, beats: 0.5, german: null,   melisma: 'm1', hanGroup: 'h4' },
  { id: 'n6', step: 'G', octave: 3, beats: 0.5, german: 'ling', han: '为', pinyin: 'wéi', tone: 2 },
  // bar 2
  { id: 'n7', step: 'A', octave: 3, beats: 1.5, german: 'ü',    han: '异', pinyin: 'yì',  tone: 4 },
  { id: 'n8', step: 'D', octave: 3, beats: 0.5, german: 'ber',  han: '客', pinyin: 'kè',  tone: 4, hanGroup: 'h7' },
  { id: 'n9', step: 'C', octave: 3, beats: 1.0, german: 'all',  hanGroup: 'h7' },
]

export const PIECE = {
  composer: 'Franz Schubert',
  title: 'Der Wanderer',
  // TODO(ivan): some catalogues list this as D.493. Confirm which to print.
  catalogue: 'D.489',
  poet: 'Georg Philipp Schmidt von Lübeck',
  year: 1816,
  key: 'B minor',
  clef: 'bass' as const,
  voice: 'baritone',
  /** Cut time. A bar is four quarter-note units; the phrase opens on a pickup. */
  beatsPerBar: 4,
  pickupBeats: 0.5,
  german: 'Ich bin ein Fremdling überall',
  englishGloss: 'I am a stranger everywhere',
  mandarin: '我处处皆为异客',
  mandarinPinyin: 'wǒ chù chù jiē wéi yì kè',
  mandarinGloss: 'everywhere, I am a stranger-guest',
  mandarinNote:
    'Echoes Wang Wei’s 獨在異鄉為異客 — a Tang poem about being a stranger far from home.',
}

/** Sanity check: the bars must actually add up. Throws loudly in dev if not. */
if (import.meta.env.DEV) {
  const total = PHRASE.reduce((s, n) => s + n.beats, 0)
  const expected = PIECE.pickupBeats + 2 * PIECE.beatsPerBar - 1 // final bar is a beat short (rest)
  if (total !== expected) {
    console.warn(`[phrase] beats total ${total}, expected ${expected} — check durations.`)
  }
}
