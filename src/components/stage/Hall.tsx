import { PIECE } from '../../data/phrase'
import { useMode } from '../../lib/mode'
import { usePlayback } from '../../lib/playback'
import ModeRail from '../ModeRail'
import Score from './Score'
import StageScene from './StageScene'
import Transport from './Transport'
import { STATE_LABELS, staging } from './staging'

/**
 * The hall: the first screen, and nothing below it until you have been
 * through it.
 *
 * A drawn stage with two performers and, hanging over them, the one system
 * they are both reading — voice above piano, bracketed, on a shared axis.
 * The rail at the foot moves that system through three readings at once,
 * the singer's from notation to Mandarin tone to code and the pianist's
 * from notation to harmony to physics, and brings the house lights up as
 * it goes. They change together because it is one performance, not two
 * widgets.
 *
 * Scrolling walks the rail rather than the page (see lib/hallScroll.ts);
 * once the lights are full up, the next scroll leaves the room and the
 * site behaves like any other page.
 */
export default function Hall() {
  const { pos } = useMode()
  const pb = usePlayback()
  const s = staging(pos)
  const labels = STATE_LABELS[s.index]

  return (
    <section className="hall" aria-label="Recital hall">
      <StageScene p={pos} />

      <header className="hall-head">
        <p className="brand-name">Ivan Ho</p>
        <p className="brand-sub">Stanford CS / Math / Linguistics / Music</p>
      </header>

      <figure className="score-system">
        <figcaption className="score-head">
          <p className="score-title">
            {PIECE.composer} · <span>{PIECE.title}</span>, {PIECE.catalogue}
          </p>
          <div className="score-tag">
            <span>Voice <b>{labels.voice}</b></span>
            <Transport pb={pb} />
            <span>Piano <b>{labels.piano}</b></span>
          </div>
        </figcaption>
        <Score p={pos} beat={pb.beat} />
      </figure>

      <div className="hall-foot">
        <ModeRail />
      </div>
    </section>
  )
}
