import { useLocation } from 'react-router-dom'
import { PIECE } from '../../data/phrase'
import { useMode } from '../../lib/mode'
import { usePlayback } from '../../lib/playback'
import { useRailScroll } from '../../lib/railScroll'
import ModeRail from '../ModeRail'
import Score from './Score'
import StageScene from './StageScene'
import Transport from './Transport'
import { STATE_LABELS, staging } from './staging'

/**
 * The recital room: the whole site, all the time.
 *
 * A hall with two performers and, hanging over them, the one system they
 * are both reading — voice above piano, bracketed, on a shared axis. The
 * rail at the foot of the room moves that system through three readings at
 * once, the singer's from notation to Mandarin tone to code and the
 * pianist's from notation to harmony to physics, and brings the house
 * lights up as it goes. They change together because it is one
 * performance, not two widgets.
 */
export default function RecitalRoom() {
  const { pos } = useMode()
  const atHome = useLocation().pathname === '/'
  useRailScroll(atHome)
  const pb = usePlayback()

  const s = staging(pos)
  const labels = STATE_LABELS[s.index]

  return (
    <section className="room" aria-label="Recital room">
      <StageScene p={pos} />

      <div className="room-head">
        <p className="room-piece">
          <span className="room-piece-work">{PIECE.title}</span>
          <span className="room-piece-meta">Schubert · {PIECE.catalogue} · {PIECE.key}</span>
          <span className="room-piece-line">{PIECE.german}</span>
        </p>
      </div>

      <figure className="score-system">
        <figcaption className="score-tag">
          <span>Voice <b>{labels.voice}</b></span>
          <Transport pb={pb} />
          <span>Piano <b>{labels.piano}</b></span>
        </figcaption>
        <Score p={pos} beat={pb.beat} />
      </figure>

      <div className="room-foot">
        <ModeRail />
      </div>
    </section>
  )
}
