import { PHRASE } from '../data/phrase'
import { MANDARIN } from '../data/tones'
import { diatonic } from './notation'

/**
 * Does Schubert's melody move the way the Mandarin tone does?
 *
 * Setting a tone language to music is a real problem: in Mandarin the pitch
 * contour of a syllable is part of the word, so a melody that falls where the
 * tone rises can make a sung line ambiguous. Composers writing in Cantonese
 * and Mandarin work around it; Schubert, writing in German in 1816, obviously
 * did not, and our Mandarin overlay of his line is a mapping we chose. So this
 * is a measurement of a coincidence — which is exactly why it is worth
 * measuring rather than asserting.
 *
 * A syllable's melodic direction is from its first note to the first note of
 * the next syllable. The last one has no next, so it uses its own two notes.
 */

export type Dir = 'up' | 'down' | 'level'

export type Fit = {
  /** Index into PHRASE of the note the syllable starts on. */
  i: number
  tone: Dir
  melody: Dir
  /** agree: both move the same way. clash: they move opposite ways.
   *  flat: one of them doesn't move, so there is nothing to agree about. */
  verdict: 'agree' | 'clash' | 'flat'
}

const dirOf = (a: number, b: number): Dir => (b > a ? 'up' : b < a ? 'down' : 'level')

/** Net direction of a Chao contour: where it ends against where it starts. */
function toneDir(tone: number): Dir {
  const c = MANDARIN[tone as 0 | 1 | 2 | 3 | 4].contour
  return dirOf(c[0], c[c.length - 1])
}

export const FITS: Fit[] = (() => {
  const starts = PHRASE.map((n, i) => (n.han ? i : -1)).filter((i) => i >= 0)
  return starts.map((i, k) => {
    const here = diatonic(PHRASE[i].step, PHRASE[i].octave)
    const next = k + 1 < starts.length
      ? diatonic(PHRASE[starts[k + 1]].step, PHRASE[starts[k + 1]].octave)
      /* no next syllable: the final one moves within itself */
      : diatonic(PHRASE[PHRASE.length - 1].step, PHRASE[PHRASE.length - 1].octave)
    const melody = dirOf(here, next)
    const tone = toneDir(PHRASE[i].tone!)
    const verdict =
      tone === 'level' || melody === 'level' ? 'flat'
        : tone === melody ? 'agree'
        : 'clash'
    return { i, tone, melody, verdict }
  })
})()

export const MARK: Record<Fit['verdict'], string> = { agree: '=', clash: '≠', flat: '·' }

export const TALLY = {
  agree: FITS.filter((f) => f.verdict === 'agree').length,
  clash: FITS.filter((f) => f.verdict === 'clash').length,
  flat: FITS.filter((f) => f.verdict === 'flat').length,
  total: FITS.length,
}
