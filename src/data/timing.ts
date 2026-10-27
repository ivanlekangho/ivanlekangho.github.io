import { VOICE_ONSET } from '../lib/beatmap'
import { END_BEAT } from '../lib/beatmap'

/**
 * WHERE THE RECORDING LINES UP WITH THE SCORE
 * ===========================================
 *
 * Two numbers turn a sound file into an animated score: when each note is
 * attacked, and nothing else. Everything the room does while the audio
 * plays — which notehead lights, where the playhead sits, which chord the
 * pianist is on — comes out of the map below.
 *
 * HOW TO FILL IT IN. Drop the recording at public/audio/der-wanderer.m4a
 * (m4a or mp3, not WAV — see the README on repo size). It will play
 * straight away, timed by TEMPO, which assumes a metronome. Schubert sung
 * to a metronome is not Schubert, so the lights will drift away from the
 * voice within a bar or two. To fix that properly, open the site with
 * ?tap on the end of the URL, press play, and tap the SPACE bar on each of
 * the nine syllables as you hear them. The console prints an array. Paste
 * it in as ONSET_SECONDS and the drift is gone — the map becomes piecewise
 * linear through your own taps, so it follows the rubato instead of
 * fighting it.
 */

/** Vite rewrites BASE_URL for you, so this survives a move to a subpath. */
export const AUDIO_SRC = `${import.meta.env.BASE_URL}audio/der-wanderer.m4a`

/**
 * `onsets`: one number per note of PHRASE — seconds into the file at which
 * that syllable is attacked. Nine of them, strictly increasing. Null until
 * you have tapped them.
 */
export const RECORDING: { onsets: number[] | null } = { onsets: null }

/** Used until the onsets exist. bpm counts quarter-note beats. */
export const TEMPO = { bpm: 66, leadIn: 0.0 }

const strict = (beat: number) => TEMPO.leadIn + (beat * 60) / TEMPO.bpm

/** Piecewise-linear through the taps, extended at the ends by the slope of
 *  the nearest segment so the pickup and the final rest still have a time. */
function through(xs: number[], ys: number[], x: number) {
  const n = xs.length
  if (x <= xs[0]) {
    const k = (ys[1] - ys[0]) / (xs[1] - xs[0])
    return ys[0] + (x - xs[0]) * k
  }
  if (x >= xs[n - 1]) {
    const k = (ys[n - 1] - ys[n - 2]) / (xs[n - 1] - xs[n - 2])
    return ys[n - 1] + (x - xs[n - 1]) * k
  }
  let i = 0
  while (i < n - 2 && xs[i + 1] <= x) i++
  return ys[i] + ((ys[i + 1] - ys[i]) * (x - xs[i])) / (xs[i + 1] - xs[i])
}

const usable = (o: number[] | null): o is number[] =>
  !!o && o.length === VOICE_ONSET.length && o.every((v, i) => i === 0 || v > o[i - 1])

const taps = () => (usable(RECORDING.onsets) ? RECORDING.onsets : null)

export const CALIBRATED = taps() !== null

/** Seconds at which a given beat of the phrase sounds. */
export function timeAt(beat: number): number {
  const t = taps()
  return t ? through(VOICE_ONSET, t, beat) : strict(beat)
}

/** The inverse: which beat the recording has reached. */
export function beatAt(seconds: number): number {
  const t = taps()
  return t
    ? through(t, VOICE_ONSET, seconds)
    : ((seconds - TEMPO.leadIn) * TEMPO.bpm) / 60
}

/** When the phrase is over, so the room can stop following the audio. */
export const END_SECONDS = timeAt(END_BEAT)
