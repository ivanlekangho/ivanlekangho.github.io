import { useState } from 'react'
import { PIECE } from '../../data/phrase'
import { useMode } from '../../lib/mode'
import { usePlayback } from '../../lib/playback'
import ModeRail from '../ModeRail'
import Apparatus from './Apparatus'
import Score from './Score'
import PieceSheet from './PieceSheet'
import StageScene from './StageScene'
import Terminal from './Terminal'
import Transport from './Transport'
import { staging } from './staging'

/**
 * The recital room: the first screen, and nothing below it until you have
 * been through it.
 *
 * A drawn stage with two performers standing behind everything, and in front
 * of them the one system they are both reading. The rail at the foot moves
 * that system through three readings at once — the singer's from notation to
 * Mandarin tone to code, the pianist's from notation to harmony to acoustics
 * — and brings the house lights up as it goes.
 *
 * The whole room is one argument: that music, language and code are three
 * descriptions of the same object. So the three readings are not three
 * subjects; they are three vocabularies pointed at the same nine notes.
 *
 * Scrolling walks the rail rather than the page (lib/hallScroll.ts); once the
 * lights are full up, the next scroll leaves the room.
 */
export default function Hall() {
  const { pos } = useMode()
  const pb = usePlayback()
  const [sheet, setSheet] = useState(false)
  const s = staging(pos)
  const engineer = s.oC > 0.5

  return (
    <section className="hall" aria-label="Recital room">
      <StageScene p={pos} />

      <header className="hall-head">
        <p className="brand-name">Ivan Ho</p>
        <p className="brand-sub">Stanford CS / Math / Linguistics / Music</p>
      </header>

      <figure className="score-system">
        <figcaption className="score-head">
          <button type="button" className="score-title" onClick={() => setSheet(true)}
            aria-haspopup="dialog" title="Open the piece">
            {PIECE.composer} — <span>{PIECE.title}</span>, {PIECE.catalogue}
          </button>
          {pb.available && <div className="score-tag"><Transport pb={pb} /></div>}
        </figcaption>

        {/* The score and the terminal occupy the same cell and cross-fade:
            at the engineer stop the staves have said what they can, and the
            arithmetic takes the space rather than crowding in beside it. */}
        <div className="score-stack">
          <div className="score-layer" aria-hidden={engineer}
            style={{ opacity: 1 - s.oC, pointerEvents: engineer ? 'none' : 'auto' }}>
            <Score p={pos} beat={pb.beat} />
          </div>
          <div className="score-layer score-layer-term" aria-hidden={!engineer}
            style={{ opacity: s.oC, pointerEvents: engineer ? 'auto' : 'none' }}>
            <Terminal live={engineer} />
          </div>
        </div>

        {s.oB > 0.02 && (
          <div className="apparatus-wrap" style={{ opacity: s.oB }} aria-hidden={s.oB < 0.5}>
            <Apparatus />
          </div>
        )}
      </figure>

      <div className="hall-foot">
        <ModeRail />
      </div>

      {sheet && <PieceSheet onClose={() => setSheet(false)} />}
    </section>
  )
}
