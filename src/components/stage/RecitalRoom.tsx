import { useLocation } from 'react-router-dom'
import { PIECE } from '../../data/phrase'
import { useMode } from '../../lib/mode'
import { useRailScroll } from '../../lib/railScroll'
import ModeRail from '../ModeRail'
import PianoRibbon from './PianoRibbon'
import StageScene from './StageScene'
import VoiceRibbon from './VoiceRibbon'
import { STATE_LABELS, staging } from './staging'

/**
 * The recital room: the whole site, all the time.
 *
 * A hall with two performers, pinned to the viewport. The rail at the foot
 * of it moves both their scores through three readings at once — the
 * singer's from notation to Mandarin tone to code, the pianist's from
 * notation to harmony to physics — and brings the house lights up as it
 * goes. They change together because it's one performance, not two widgets.
 *
 * The wheel drives the same rail, so scrolling walks the room. It is
 * switched off while a sheet is open, where the wheel belongs to the sheet.
 */
export default function RecitalRoom() {
  const { pos } = useMode()
  const atHome = useLocation().pathname === '/'
  useRailScroll(atHome)

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

      <div className="room-ribbons">
        <figure className="room-ribbon">
          <figcaption className="room-ribbon-tag">Piano<span>{labels.piano}</span></figcaption>
          <PianoRibbon p={pos} />
        </figure>
        <figure className="room-ribbon">
          <figcaption className="room-ribbon-tag">Voice<span>{labels.voice}</span></figcaption>
          <VoiceRibbon p={pos} />
        </figure>
      </div>

      <div className="room-foot">
        <ModeRail />
      </div>
    </section>
  )
}
