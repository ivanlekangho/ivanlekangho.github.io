import { KEY_NAME } from '../../lib/chords'
import { midi, type Pitch } from '../../lib/tuning'

/**
 * A keyboard you can play.
 *
 * Ratios and a waveform say why a chord is what it is; a keyboard says what
 * it is, in the one picture every musician already reads — and once it is
 * on screen the obvious thing to do with it is press a key, so pressing a
 * key builds the chord.
 *
 * Drawn to the real proportions rather than stretched to the available
 * width: a black key is about three-fifths the length of a white one and
 * a little over half its width, and a keyboard with those numbers wrong
 * looks wrong to anyone who has sat at one. So the SVG keeps its aspect
 * ratio and is centred in whatever space it gets.
 */

const WHITE_PC = [0, 2, 4, 5, 7, 9, 11]
const BLACK_AFTER = [0, 2, 5, 7, 9]   /* white-key indices with a black key to their right */

/** Geometry in SVG units; one white key is KW wide. */
const KW = 26
const KH = 118
const BW = 15
const BH = 74
const FELT = 5               /* the strip of cloth at the back of the keybed */

type Props = {
  /** Keys held down. */
  pitches: Pitch[]
  /** Inclusive MIDI range to draw. Fixed by the caller so the keyboard does
   *  not shift under your finger while you are building a chord. */
  from: number
  to: number
  onToggle?: (midi: number) => void
}

export default function Keyboard({ pitches, from, to, onToggle }: Props) {
  const on = new Set(pitches.map(midi))

  const whites: number[] = []
  for (let m = from; m <= to; m++) if (WHITE_PC.includes(((m % 12) + 12) % 12)) whites.push(m)
  if (!whites.length) return null

  const W = whites.length * KW
  const H = KH + FELT
  const live = !!onToggle

  const key = (m: number, black: boolean, x: number) => {
    const held = on.has(m)
    const cls = `${black ? 'key-black' : 'key'}${held ? ' is-on' : ''}`
    return (
      <rect
        key={(black ? 'b' : 'w') + m}
        x={x} y={FELT} width={black ? BW : KW} height={black ? BH : KH}
        rx="2" className={cls} vectorEffect="non-scaling-stroke"
        tabIndex={live ? 0 : undefined}
        role={live ? 'button' : undefined}
        aria-pressed={live ? held : undefined}
        aria-label={live ? `${KEY_NAME[((m % 12) + 12) % 12]}${Math.floor(m / 12) - 1}` : undefined}
        onClick={live ? () => onToggle(m) : undefined}
        onKeyDown={live ? (e) => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onToggle(m) }
        } : undefined}
      />
    )
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={live ? 'keys is-live' : 'keys'}
      preserveAspectRatio="xMidYMid meet" role="group"
      aria-label={live ? 'Keyboard — press keys to build a chord' : 'Keyboard'}>
      <rect x="0" y="0" width={W} height={FELT} className="key-felt" />
      {whites.map((m, i) => key(m, false, i * KW))}
      {whites.map((m, i) => {
        const pc = ((m % 12) + 12) % 12
        if (!BLACK_AFTER.includes(pc) || i === whites.length - 1) return null
        return key(m + 1, true, (i + 1) * KW - BW / 2)
      })}
    </svg>
  )
}

/**
 * Three octaves around a chord, aligned to C.
 *
 * A full octave of air below the lowest note rather than a couple of
 * semitones, so the chord sits in the middle of the keyboard instead of
 * hard against its left edge — and extended upward where it has to be,
 * because a thirteenth chord spans more than the three octaves a default
 * keyboard gives it.
 */
export function keyboardRange(lowest: number, highest = lowest) {
  const from = Math.floor((lowest - 12) / 12) * 12
  let to = from + 36
  while (to < highest + 2) to += 12
  return { from, to }
}
