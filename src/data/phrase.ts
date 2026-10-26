import type { ToneId } from './tones'

/**
 * THE CENTERPIECE SOURCE OF TRUTH
 * ================================
 * Schubert, "Der Wanderer" D.489 — "Ich bin ein Fremdling überall"
 * Transposed to B minor for baritone; notated in bass clef.
 *
 * Everything the centerpiece draws — the staff, the tone contour, the code
 * view — is a projection of this one array. Nothing else is a source of truth.
 *
 * Mapping, per Ivan: eight notes carry eight German syllables; the seven
 * Mandarin syllables of 我处处皆为异客 fit by giving 我 (wǒ) the melisma
 * across the opening notes.
 *
 * ⚠️  PITCHES BELOW ARE PLACEHOLDER — a plausible descending B-minor line, NOT
 *     Schubert's actual notes. Replace `step`/`octave`/`beats` from the score.
 *     The syllable/tone mapping is real; the melody is not yet.
 */

export type Step = 'C' | 'D' | 'E' | 'F' | 'G' | 'A' | 'B'
export type Accidental = 'sharp' | 'flat' | 'natural'

export type Note = {
  id: string
  step: Step
  octave: number
  accidental?: Accidental
  /** Duration in beats. */
  beats: number
  /** German syllable this note carries, or null if it continues a melisma. */
  german: string | null
  /** Mandarin character, only on the note where the syllable begins. */
  han?: string
  pinyin?: string
  tone?: ToneId
  /** Notes sharing a melisma id are sung on one syllable. */
  melisma?: string
}

export const PHRASE_PLACEHOLDER = true

export const PHRASE: Note[] = [
  { id: 'n1', step: 'B', octave: 3, beats: 1,   german: 'Ich',  han: '我', pinyin: 'wǒ', tone: 3, melisma: 'wo' },
  { id: 'n2', step: 'A', octave: 3, beats: 0.5, german: 'bin',  melisma: 'wo' },
  { id: 'n3', step: 'G', octave: 3, beats: 0.5, german: 'ein',  han: '处', pinyin: 'chù', tone: 4 },
  { id: 'n4', step: 'F', octave: 3, accidental: 'sharp', beats: 1, german: 'Frem', han: '处', pinyin: 'chù', tone: 4 },
  { id: 'n5', step: 'E', octave: 3, beats: 1,   german: 'dling', han: '皆', pinyin: 'jiē', tone: 1 },
  { id: 'n6', step: 'F', octave: 3, accidental: 'sharp', beats: 0.5, german: 'ü', han: '为', pinyin: 'wéi', tone: 2 },
  { id: 'n7', step: 'D', octave: 3, beats: 0.5, german: 'ber',  han: '异', pinyin: 'yì', tone: 4 },
  { id: 'n8', step: 'B', octave: 2, beats: 2,   german: 'all',  han: '客', pinyin: 'kè', tone: 4 },
]

export const PIECE = {
  composer: 'Franz Schubert',
  title: 'Der Wanderer',
  // TODO(ivan): some catalogues list this as D.493. Confirm which number to print.
  catalogue: 'D.489',
  poet: 'Georg Philipp Schmidt von Lübeck',
  year: 1816,
  key: 'B minor',
  keySignature: ['F#', 'C#'] as const,
  clef: 'bass' as const,
  voice: 'baritone',
  german: 'Ich bin ein Fremdling überall',
  englishGloss: 'I am a stranger everywhere',
  mandarin: '我处处皆为异客',
  mandarinPinyin: 'wǒ chù chù jiē wéi yì kè',
  mandarinGloss: 'everywhere, I am a stranger-guest',
  mandarinNote:
    'Echoes Wang Wei’s 獨在異鄉為異客 — a Tang poem about being a stranger far from home.',
}
