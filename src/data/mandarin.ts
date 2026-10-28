/**
 * THE MANDARIN LINE, WORD BY WORD
 * ===============================
 * 我处处皆为异客 — wǒ chù chù jiē wéi yì kè
 *
 * The seven syllables are five words, and the words are what the metrical
 * question needs: a syllable does not want a strong beat, a word's
 * prosodic head does.
 *
 * ⚠️  A CAVEAT WORTH READING. Mandarin does not have English-style lexical
 *     stress — it has tone, and prominence that lives at the word and
 *     phrase level rather than in the syllable. The `head` flags below say
 *     which syllable of each word carries that prominence, and for the two
 *     disyllables they are the standard reading: a reduplicated adverb
 *     (处处) is heavier on the first, a noun compound (异客) on the second,
 *     which is its head noun. Ivan speaks Mandarin and I do not; this is
 *     the part of the analysis he should check.
 */

export type Syllable = {
  han: string
  pinyin: string
  gloss: string
  /** The word this syllable belongs to. */
  word: string
  wordGloss: string
  pos: string
  /** True when this is the syllable the word's prominence falls on. */
  head: boolean
  /** Where prosody would put it: heads and content words want weight,
   *  pronouns and the copula do not. */
  wants: 'strong' | 'weak'
}

export const SYLLABLES: Syllable[] = [
  { han: '我', pinyin: 'wǒ', gloss: 'I',
    word: '我', wordGloss: 'I', pos: 'pronoun', head: true, wants: 'weak' },
  { han: '处', pinyin: 'chù', gloss: 'place',
    word: '处处', wordGloss: 'everywhere', pos: 'reduplicated adverb', head: true, wants: 'strong' },
  { han: '处', pinyin: 'chù', gloss: 'place',
    word: '处处', wordGloss: 'everywhere', pos: 'reduplicated adverb', head: false, wants: 'weak' },
  { han: '皆', pinyin: 'jiē', gloss: 'in every case',
    word: '皆', wordGloss: 'in every case', pos: 'adverb', head: true, wants: 'strong' },
  { han: '为', pinyin: 'wéi', gloss: 'to be',
    word: '为', wordGloss: 'to be', pos: 'copula', head: true, wants: 'weak' },
  { han: '异', pinyin: 'yì', gloss: 'strange',
    word: '异客', wordGloss: 'stranger-guest', pos: 'noun compound', head: false, wants: 'weak' },
  { han: '客', pinyin: 'kè', gloss: 'guest',
    word: '异客', wordGloss: 'stranger-guest', pos: 'noun compound', head: true, wants: 'strong' },
]
