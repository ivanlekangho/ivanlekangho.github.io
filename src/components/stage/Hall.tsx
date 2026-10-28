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
import { screens } from './staging'

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
  const show = screens(pos)
  const notation = show.score > 0.5
  const language = show.language > 0.5
  const engineer = show.terminal > 0.5

  return (
    <section className="hall" aria-label="Recital room">
      <StageScene p={pos} />

      <header className="hall-head">
        <p className="brand-name">Ivan Ho</p>
        <p className="brand-sub">Stanford CS / Math / Linguistics / Music</p>
      </header>

      <figure className="score-system">
        <figcaption className="score-head">
          {/* A credit line that happens to be a button is a credit line to
              everyone who does not hover it, so this one is set in a pill
              and lit on the accent. */}
          <button type="button" className="score-title" onClick={() => setSheet(true)}
            aria-haspopup="dialog">
            {/* One flex item, or the three runs of the credit wrap
                independently and a phone gets "Franz / Der / , Schubert". */}
            <span className="score-title-text">
              {PIECE.composer} — <span>{PIECE.title}</span>, {PIECE.catalogue}
            </span>
          </button>
          {pb.available && <div className="score-tag"><Transport pb={pb} /></div>}
        </figcaption>

        {/* Three readings, one cell, cross-faded. Each stop gets the whole
            space rather than a share of it: the staves, then the line in
            four notations, then the arithmetic. They used to overlap —
            staff above, table below — and the Mandarin, the German and the
            harmony were each drawn twice, neither copy large enough to
            read.

            The staff is held at notation while it dissolves (`p` clamped
            below the first morph) so you do not watch it half-change into
            something the next screen is about to say properly. That does
            leave the ribbons' own language and physics states unreachable;
            they are still in VoiceRibbon.tsx and PianoRibbon.tsx. */}
        <div className="score-stack">
          <div className="score-layer" aria-hidden={!notation}
            style={{ opacity: show.score, pointerEvents: notation ? 'auto' : 'none' }}>
            <Score p={Math.min(pos, 0.04)} beat={pb.beat} />
          </div>
          <div className="score-layer score-layer-lang" aria-hidden={!language}
            style={{ opacity: show.language, pointerEvents: language ? 'auto' : 'none' }}>
            <Apparatus p={pos} />
          </div>
          <div className="score-layer score-layer-term" aria-hidden={!engineer}
            style={{ opacity: show.terminal, pointerEvents: engineer ? 'auto' : 'none' }}>
            <Terminal live={engineer} />
          </div>
        </div>
      </figure>

      <div className="hall-foot">
        <ModeRail />
      </div>

      {sheet && <PieceSheet onClose={() => setSheet(false)} />}
    </section>
  )
}
