import { SYS, xAt } from '../../lib/beatmap'
import { lerp } from '../../lib/easing'
import { staging } from './staging'
import PianoStaves from './PianoRibbon'
import VoiceStaves, { VOICE_H } from './VoiceRibbon'

/**
 * ONE SYSTEM.
 *
 * The singer's staff sits directly above the pianist's and both read their
 * horizontal positions out of lib/beatmap.ts, so a note sounded on beat
 * three is at the same x on both — which is the whole claim: they are
 * playing together, not sitting beside each other. A bracket down the left
 * says so, the way it does in any vocal score.
 *
 * When a recording is playing, `beat` is where it has got to: a playhead
 * sweeps the system and the notes sounding at that instant light up on
 * both staves at once.
 */

/** Where the piano's own coordinate space begins inside the system. */
const PIANO_DY = 200

/**
 * The camera. Each reading needs a different amount of vertical room —
 * notation is two compact staves, acoustics is nearly twice that — and a
 * viewBox big enough for the tallest one leaves the staves shrunk and
 * letterboxed at the stop most people land on. So the frame closes in on
 * the notation and opens out as the rail moves.
 */
const FRAME = [
  { y: 78, h: 342 },   // musician: top line of the voice staff to the bass staff
  { y: 20, h: 420 },   // linguist: tone box down to the roman numerals
  { y: 52, h: 446 },   // engineer: data series down to the ratios
]

/* The bracket spans from the top line of the voice staff to the bottom
   line of the piano's bass staff. Both numbers come from the staves. */
const TOP = 150 - 4 * 13
const BOT = PIANO_DY + 196
const BX = 16

export default function Score({ p, beat }: { p: number; beat: number | null }) {
  const s = staging(p)
  const head = beat === null ? null : xAt(beat)
  const vy = lerp(lerp(FRAME[0].y, FRAME[1].y, s.tAB), FRAME[2].y, s.tBC)
  const vh = lerp(lerp(FRAME[0].h, FRAME[1].h, s.tAB), FRAME[2].h, s.tBC)

  return (
    <svg viewBox={`0 ${vy.toFixed(1)} ${SYS.w} ${vh.toFixed(1)}`} width="100%" className="score-svg" role="img"
      aria-label="Schubert, Der Wanderer: the vocal line over the piano accompaniment, shown as notation, then as Mandarin tone and harmony, then as data and acoustics."
      style={{ display: 'block', overflow: 'visible' }}>

      {/* system bracket — one instrument group, two performers */}
      <g opacity={s.oA} stroke="var(--accent-soft)" strokeWidth="1.4" fill="none" strokeLinecap="round">
        <line x1={BX} y1={TOP} x2={BX} y2={BOT} />
        <line x1={BX} y1={TOP} x2={BX + 9} y2={TOP} />
        <line x1={BX} y1={BOT} x2={BX + 9} y2={BOT} />
      </g>

      {head !== null && (
        <g className="playhead">
          <line x1={head} y1={vy + 6} x2={head} y2={vy + vh - 6}
            stroke="var(--accent)" strokeWidth="1.5" opacity="0.75" />
          <circle cx={head} cy={vy + 6} r="3.5" fill="var(--accent)" />
        </g>
      )}

      <VoiceStaves p={p} beat={beat} />
      <g transform={`translate(0 ${PIANO_DY})`}>
        <PianoStaves p={p} beat={beat} />
      </g>
    </svg>
  )
}

/* VOICE_H is the voice block's own height; PIANO_DY deliberately overlaps
   the empty top of the piano block so the two staves sit a staff-and-a-half
   apart, which is the distance a vocal score uses. */
void VOICE_H
