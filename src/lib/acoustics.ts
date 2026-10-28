import { hz, midi, ratioTo, type Pitch } from './tuning'

/**
 * The arithmetic behind "why does that chord sound good".
 *
 * Everything here is computed from the same pitches the score is engraved
 * from, so the terminal in the hall is not reciting numbers someone typed
 * in — change a note in piano.ts and the answers change with it.
 */

/** Samples of a single sine, normalised to ±1, over `seconds`. */
export function sine(freq: number, seconds: number, n: number) {
  const out = new Float64Array(n)
  for (let i = 0; i < n; i++) out[i] = Math.sin(2 * Math.PI * freq * (i / (n - 1)) * seconds)
  return out
}

/**
 * The sum of several sines — which is literally what arrives at an ear when
 * a chord is played, and the thing a frequency-domain picture of a chord
 * never shows you.
 */
export function mix(freqs: number[], seconds: number, n: number) {
  const out = new Float64Array(n)
  for (const f of freqs) {
    for (let i = 0; i < n; i++) out[i] += Math.sin(2 * Math.PI * f * (i / (n - 1)) * seconds)
  }
  let peak = 0
  for (let i = 0; i < n; i++) peak = Math.max(peak, Math.abs(out[i]))
  if (peak > 0) for (let i = 0; i < n; i++) out[i] /= peak
  return out
}

/** An SVG polyline for a sample buffer, drawn into a w × h box. */
export function plot(samples: Float64Array, w: number, h: number) {
  const mid = h / 2
  const pts: string[] = []
  const step = Math.max(1, Math.floor(samples.length / w))
  for (let i = 0; i < samples.length; i += step) {
    pts.push(`${((i / (samples.length - 1)) * w).toFixed(1)},${(mid - samples[i] * (mid - 1)).toFixed(1)}`)
  }
  return pts.join(' ')
}

/** Greatest common divisor, for reducing a set of ratios to one period. */
const gcd = (a: number, b: number): number => (b ? gcd(b, Math.round(a % b)) : a)
const lcm = (a: number, b: number) => (a * b) / gcd(a, b)

/**
 * How long the whole chord takes to repeat itself, in periods of its lowest
 * note.
 *
 * This is the real answer to why a chord sounds settled rather than rough.
 * Write every frequency as a whole number over a common denominator; the sum
 * of those sines repeats at the greatest common divisor of those numbers. If
 * the ratios are small the repeat comes round in two or three periods and the
 * ear hears one thing with a pitch. Stretch them and the repeat period runs
 * away, and the same notes turn into roughness.
 *
 * The caveat the terminal says out loud: `ratioTo` snaps to the NEAREST
 * simple ratio, so this measures the interval the ear is listening for, not
 * the tempered one the piano actually plays. `temperamentError` is the gap.
 */
export function periodicity(pitches: Pitch[]) {
  if (!pitches.length) return { ratios: [] as string[], period: 1, verdict: '' }
  const seen = new Set<number>()
  const sorted = [...pitches]
    .sort((a, b) => midi(a) - midi(b))
    .filter((p) => (seen.has(midi(p)) ? false : (seen.add(midi(p)), true)))
  const nums: number[] = []
  const dens: number[] = []
  const ratios = sorted.map((p) => {
    const r = ratioTo(sorted[0], p)
    nums.push(r.num)
    dens.push(r.den)
    return `${r.num}/${r.den}`
  })
  const D = dens.reduce(lcm, 1)
  const N = nums.map((n, i) => (n * D) / dens[i])
  const period = D / N.reduce(gcd)
  /* Thresholds set against chords whose character is not in dispute: a
     major triad comes back round in 4 and a minor in 10, so both are at
     home; an augmented triad takes 20 and a dominant seventh 36, which is
     exactly the restlessness that makes them want to move; a half-
     diminished seventh takes 1440. */
  const verdict =
    period <= 4 ? 'locked' : period <= 12 ? 'settled' : period <= 48 ? 'restless' : 'rough'
  return { ratios, period, verdict }
}

/**
 * Beat frequency: two close tones go in and out of phase at the difference
 * of their frequencies, which is heard as wobble below about 20 Hz and as
 * roughness above it.
 */
export function beats(a: Pitch, b: Pitch) {
  const f = Math.abs(hz(a) - hz(b))
  return {
    hz: f,
    heard: f < 0.5 ? 'almost in tune' : f < 20 ? `${f.toFixed(1)} wobbles a second` : 'roughness, not beating',
  }
}

/** Cents away from the nearest simple ratio — how far equal temperament sits
 *  from the interval the ear is actually listening for. */
export function temperamentError(root: Pitch, p: Pitch) {
  const r = ratioTo(root, p)
  const just = 1200 * Math.log2(r.num / r.den)
  return Math.round(r.cents - just)
}

export { hz, midi, ratioTo }
