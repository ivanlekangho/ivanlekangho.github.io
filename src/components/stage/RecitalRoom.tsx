import { PIECE } from '../../data/phrase'
import { useMode } from '../../lib/mode'
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
 * Nothing scrolls. Sections arrive as lit sheets over the top (Panel).
 */
export default function RecitalRoom() {
  const { pos } = useMode()
  const s = staging(pos)
  const labels = STATE_LABELS[s.index]

  return (
    <section className="room" aria-label="Recital room">
      <StageScene p={pos} />

      <div className="room-head">
        <p className="room-piece">
          Schubert · <em>{PIECE.title}</em>, {PIECE.catalogue}
          <span>“{PIECE.german}”</span>
        </p>
      </div>

      <div className="room-ribbons">
        <figure className="room-ribbon">
          <figcaption className="room-ribbon-tag">Piano — <span>{labels.piano}</span></figcaption>
          <PianoRibbon p={pos} />
        </figure>
        <figure className="room-ribbon">
          <figcaption className="room-ribbon-tag">Voice — <span>{labels.voice}</span></figcaption>
          <VoiceRibbon p={pos} />
        </figure>
      </div>

      <div className="room-foot">
        <ModeRail />
      </div>
    </section>
  )
}
