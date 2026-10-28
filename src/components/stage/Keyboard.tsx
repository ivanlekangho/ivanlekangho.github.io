import { midi, type Pitch } from '../../lib/tuning'

/**
 * A keyboard with the chord pressed.
 *
 * Ratios and a waveform say why a chord is what it is; a keyboard says what
 * it is, in the one picture every musician already reads. The range follows
 * the chord rather than being fixed, so a thirteenth doesn't shrink the
 * keys to nothing.
 */

const WHITE_PC = [0, 2, 4, 5, 7, 9, 11]
const BLACK_AFTER = [0, 2, 5, 7, 9]   /* white-key indices with a black key to their right */

export default function Keyboard({ pitches, h = 64 }: { pitches: Pitch[]; h?: number }) {
  if (!pitches.length) return null
  const notes = new Set(pitches.map(midi))
  const lo = Math.min(...notes)
  const hi = Math.max(...notes)
  /* Whole octaves, a little air each side, never less than two octaves. */
  let from = Math.floor((lo - 2) / 12) * 12
  let to = Math.ceil((hi + 3) / 12) * 12 - 1
  while (to - from < 24) { to += 12 }

  const whites: number[] = []
  for (let m = from; m <= to; m++) if (WHITE_PC.includes(((m % 12) + 12) % 12)) whites.push(m)

  const w = 100 / whites.length
  const bw = w * 0.62
  const bh = h * 0.62

  return (
    <svg viewBox={`0 0 100 ${h}`} width="100%" height={h} className="keys"
      preserveAspectRatio="none" role="img"
      aria-label={`Keyboard with ${pitches.length} keys held down`}>
      {whites.map((m, i) => (
        <rect key={`w${m}`} x={i * w} y={0} width={w} height={h}
          className={notes.has(m) ? 'key is-on' : 'key'} vectorEffect="non-scaling-stroke" />
      ))}
      {whites.map((m, i) => {
        const pc = ((m % 12) + 12) % 12
        if (!BLACK_AFTER.includes(pc) || i === whites.length - 1) return null
        const b = m + 1
        return (
          <rect key={`b${b}`} x={(i + 1) * w - bw / 2} y={0} width={bw} height={bh}
            className={notes.has(b) ? 'key-black is-on' : 'key-black'} vectorEffect="non-scaling-stroke" />
        )
      })}
    </svg>
  )
}
