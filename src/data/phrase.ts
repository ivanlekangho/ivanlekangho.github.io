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
 * Pitches confirmed by Ivan, and independently re-measured off the score image
 * by detecting staff lines and correlating a notehead template (the scan
 * reproduced his corrections exactly, and settled the "ü" he hadn't listed).
 * Accidentals: F♯ is in the key signature, so the three opening F♯s and the
 * C♯ on "ber" need no written accidental; `accidental` here records the
 * sounding pitch, and the engraver only draws a sign where the key signature
 * doesn't already supply it.
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
  /** IPA for that syllable, in standard (Bühnendeutsch-ish) German.
   *  Whole line: [ɪç bɪn aɪ̯n ˈfʁɛmtlɪŋ ˌyːbɐˈʔal]. The glottal stop belongs
   *  to "all", not to "ü" — überall is not a compound of über + all in the
   *  way the spelling suggests, but the onset of the stressed syllable gets
   *  the stop all the same. */
  ipa?: string
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
  /** Draw a hyphen to the next syllable — i.e. both belong to one word. */
  hyphenAfter?: boolean
}

/** All nine pitches confirmed. */
export const UE_PITCH_UNVERIFIED = false

export const PHRASE: Note[] = [
  // pickup
  { id: 'n1', step: 'F', octave: 3, accidental: 'sharp', beats: 0.5, german: 'ich',  ipa: 'ɪç',  han: '我', pinyin: 'wǒ',  tone: 3 },
  // bar 1
  { id: 'n2', step: 'F', octave: 3, accidental: 'sharp', beats: 1.5, german: 'bin',  ipa: 'bɪn', han: '处', pinyin: 'chù', tone: 4 },
  { id: 'n3', step: 'F', octave: 3, accidental: 'sharp', beats: 0.5, german: 'ein',  ipa: 'aɪ̯n', han: '处', pinyin: 'chù', tone: 4 },
  { id: 'n4', step: 'B', octave: 3, beats: 1.0, german: 'Fremd', ipa: 'fʁɛmt', hyphenAfter: true,
    han: '皆', pinyin: 'jiē', tone: 1, melisma: 'm1', hanGroup: 'h4' },
  { id: 'n5', step: 'G', octave: 3, beats: 0.5, german: null, melisma: 'm1', hanGroup: 'h4' },
  { id: 'n6', step: 'E', octave: 3, beats: 0.5, german: 'ling', ipa: 'lɪŋ', han: '为', pinyin: 'wéi', tone: 2 },
  // bar 2
  { id: 'n7', step: 'A', octave: 3, beats: 1.5, german: 'ü',   ipa: 'yː', hyphenAfter: true, han: '异', pinyin: 'yì', tone: 4 },
  { id: 'n8', step: 'C', octave: 3, accidental: 'sharp', beats: 0.5, german: 'ber', ipa: 'bɐ', hyphenAfter: true,
    han: '客', pinyin: 'kè', tone: 4, hanGroup: 'h7' },
  { id: 'n9', step: 'D', octave: 3, beats: 1.0, german: 'all', ipa: 'ʔal', hanGroup: 'h7' },
]

export const PIECE = {
  composer: 'Franz Schubert',
  title: 'Der Wanderer',
  // TODO(ivan): some catalogues list this as D.493. Confirm which to print.
  catalogue: 'D.489',
  poet: 'Georg Philipp Schmidt von Lübeck',
  year: 1816,
  key: 'B minor',
  /** Steps the key signature already sharpens; the engraver suppresses a
   *  written accidental for these so F♯ and C♯ aren't marked twice. */
  keySignatureSharps: ['F', 'C'] as const,
  clef: 'bass' as const,
  voice: 'baritone',
  /** Cut time. A bar is four quarter-note units; the phrase opens on a pickup. */
  beatsPerBar: 4,
  pickupBeats: 0.5,
  /** The closing bar finishes with a quarter rest. */
  trailingRest: 1,
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
