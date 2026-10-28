import { PHRASE, PIECE } from '../data/phrase'
import { SYLLABLES } from '../data/mandarin'
import { MANDARIN } from '../data/tones'
import { diatonic } from './notation'

/**
 * Does the Mandarin fit the tune?
 *
 * Two questions, asked of the same seven syllables.
 *
 * PITCH. Mandarin carries part of a word in the contour of the syllable, so
 * a melody that falls where the tone rises can make a sung line ambiguous.
 * Composers setting Mandarin and Cantonese work around it; Schubert, writing
 * in German in 1816, obviously did not.
 *
 * METRE. Mandarin has no English-style lexical stress, but it does have
 * prosodic heads — the syllable of a word that carries its weight — and
 * function words that want to stay out of the way. A setting that puts the
 * downbeat on the wrong syllable of a compound sounds subtly wrong even
 * when every pitch is right.
 *
 * Both are measurements of a coincidence: the Mandarin line is an overlay we
 * chose, not something Schubert set. Which is exactly why they are measured
 * rather than asserted — the interesting number is how often it works by
 * accident, and where it doesn't.
 */

export type Dir = 'up' | 'down' | 'level'
export type Metre = 'downbeat' | 'strong' | 'weak' | 'pickup'

export type Fit = {
  /** Index into PHRASE of the note the syllable starts on. */
  i: number
  /** Index into SYLLABLES. */
  s: number
  at: number

  tone: Dir
  melody: Dir
  /** agree: both move the same way. clash: opposite ways. flat: one of them
   *  does not move, so there is nothing to agree about. */
  pitch: 'agree' | 'clash' | 'flat'

  metre: Metre
  /** match: it got the weight it wanted. carried: it wanted weight and is
   *  held across a strong beat rather than struck on one. mismatch: not. */
  stress: 'match' | 'carried' | 'mismatch'
}

const dirOf = (a: number, b: number): Dir => (b > a ? 'up' : b < a ? 'down' : 'level')

/** Net direction of a Chao contour: where it ends against where it starts. */
function toneDir(tone: number): Dir {
  const c = MANDARIN[tone as 0 | 1 | 2 | 3 | 4].contour
  return dirOf(c[0], c[c.length - 1])
}

/**
 * Cut time: two half-note beats to the bar, written here in quarter-note
 * units, so the strong positions are 0 and 2 and the downbeat is 0.
 */
export function metreAt(beat: number): Metre {
  if (beat < PIECE.pickupBeats - 1e-9) return 'pickup'
  const inBar = (beat - PIECE.pickupBeats) % PIECE.beatsPerBar
  if (Math.abs(inBar) < 1e-9) return 'downbeat'
  if (Math.abs(inBar - PIECE.beatsPerBar / 2) < 1e-9) return 'strong'
  return 'weak'
}

/** Beat of every note, and of the syllable onsets. */
const ONSET: number[] = []
{
  let at = 0
  for (const n of PHRASE) { ONSET.push(at); at += n.beats }
}
export const NOTE_ONSET = ONSET
export const SYLLABLE_AT = PHRASE.map((n, i) => (n.han ? i : -1)).filter((i) => i >= 0)

export const FITS: Fit[] = SYLLABLE_AT.map((i, k) => {
  const syl = SYLLABLES[k]

  /* Pitch: from this syllable's first note to the next syllable's first
     note; the last one has no next, so it moves within itself. */
  const here = diatonic(PHRASE[i].step, PHRASE[i].octave)
  const next = k + 1 < SYLLABLE_AT.length
    ? diatonic(PHRASE[SYLLABLE_AT[k + 1]].step, PHRASE[SYLLABLE_AT[k + 1]].octave)
    : diatonic(PHRASE[PHRASE.length - 1].step, PHRASE[PHRASE.length - 1].octave)
  const melody = dirOf(here, next)
  const tone = toneDir(PHRASE[i].tone!)
  const pitch = tone === 'level' || melody === 'level' ? 'flat'
    : tone === melody ? 'agree' : 'clash'

  /* Metre: where the syllable is struck, and whether it is still sounding
     over the next strong beat. A held note takes some of that beat's weight
     even though nothing is articulated on it. */
  const at = ONSET[i]
  const until = k + 1 < SYLLABLE_AT.length ? ONSET[SYLLABLE_AT[k + 1]] : ONSET[PHRASE.length - 1] + PHRASE[PHRASE.length - 1].beats
  const metre = metreAt(at)
  const strongHere = metre === 'downbeat' || metre === 'strong'
  let carriesStrong = false
  for (let b = at + 0.5; b < until - 1e-9; b += 0.5) {
    const m = metreAt(b)
    if (m === 'downbeat' || m === 'strong') carriesStrong = true
  }

  const stress = syl.wants === 'strong'
    ? (strongHere ? 'match' : carriesStrong ? 'carried' : 'mismatch')
    : (strongHere ? 'mismatch' : 'match')

  return { i, s: k, at, tone, melody, pitch, metre, stress }
})

export const MARK: Record<Fit['pitch'], string> = { agree: '=', clash: '≠', flat: '·' }
/** Which way the melody goes from here, as one character. */
export const ARROW: Record<Dir, string> = { up: '↗', down: '↘', level: '→' }

export const TALLY = {
  agree: FITS.filter((f) => f.pitch === 'agree').length,
  clash: FITS.filter((f) => f.pitch === 'clash').length,
  flat: FITS.filter((f) => f.pitch === 'flat').length,
  match: FITS.filter((f) => f.stress === 'match').length,
  carried: FITS.filter((f) => f.stress === 'carried').length,
  mismatch: FITS.filter((f) => f.stress === 'mismatch').length,
  total: FITS.length,
}

/** The strong positions, for drawing the metre under the syllables. */
export const STRONG_BEATS: { beat: number; downbeat: boolean }[] = (() => {
  const out: { beat: number; downbeat: boolean }[] = []
  for (let b = PIECE.pickupBeats; b <= PIECE.pickupBeats + 2 * PIECE.beatsPerBar; b += PIECE.beatsPerBar / 2) {
    const m = metreAt(b)
    if (m === 'downbeat' || m === 'strong') out.push({ beat: b, downbeat: m === 'downbeat' })
  }
  return out
})()
