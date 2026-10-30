import { memo } from 'react'
import { SYS, xAt } from '../../lib/beatmap'
import { lerp } from '../../lib/easing'
import { useNarrow } from '../../lib/useNarrow'
import { staging } from './staging'
import PianoStaves, { PIANO_DY } from './PianoRibbon'
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

/**
 * The camera. Each reading needs a different amount of vertical room —
 * notation is two compact staves, acoustics is nearly twice that — and a
 * viewBox big enough for the tallest one leaves the staves shrunk and
 * letterboxed at the stop most people land on. So the frame closes in on
 * the notation and opens out as the rail moves.
 */
export const FRAME = [
  { y: 78, h: 342 },   // musician: top line of the voice staff to the bass staff
  { y: 14, h: 450 },   // linguist: the tone arrows down to the progression
  { y: 52, h: 446 },   // engineer: data series down to the ratios
]

/**
 * A phone cannot hold the language stop at a readable size and still show
 * the harmony under it, so it shows the singer's half — tone, characters,
 * metre, German — and the chord chart is a tap away in the piece sheet.
 * Shrinking it to fit would be a diagram nobody can read.
 */
const FRAME_NARROW = [FRAME[0], { y: 12, h: 206 }, FRAME[2]]

/* The bracket spans from the top line of the voice staff to the bottom
   line of the piano's bass staff. Both numbers come from the staves. */
const TOP = 150 - 4 * 13
const BOT = PIANO_DY + 196
const BX = 16

/**
 * Also memoised. Hall.tsx clamps `p` below the first morph so the staff is
 * held at notation while it dissolves — which means that past the clamp the
 * props stop changing, and a component whose props stop changing should stop
 * re-rendering. Four hundred and eighty nodes of engraving, once.
 */
function Score({ p, beat }: { p: number; beat: number | null }) {
  const s = staging(p)
  const head = beat === null ? null : xAt(beat)
  const F = useNarrow() ? FRAME_NARROW : FRAME
  const vy = lerp(lerp(F[0].y, F[1].y, s.tAB), F[2].y, s.tBC)
  const vh = lerp(lerp(F[0].h, F[1].h, s.tAB), F[2].h, s.tBC)

  return (
    <svg viewBox={`0 ${vy.toFixed(1)} ${SYS.w} ${vh.toFixed(1)}`} width="100%" className="score-svg" role="img"
      aria-label="Schubert, Der Wanderer: the vocal line over the piano accompaniment, shown as notation, then as Mandarin tone and harmony, then as data and acoustics."
      /* hidden, not visible: the frame is the crop, and on a phone the
         language stop deliberately leaves the harmony outside it */
      style={{ display: 'block', overflow: 'hidden' }}>

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

/* VOICE_H is the voice block's own height. PIANO_DY — how far below it the
   pianist's space begins — belongs to the piano now, because the language
   stop reads it too: see PianoRibbon.tsx. */
void VOICE_H

export default memo(Score)
