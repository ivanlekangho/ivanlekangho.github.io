import { PIECE } from '../../data/phrase'
import { PIANO_PIECE, PIANO_UNVERIFIED } from '../../data/piano'
import { useScrollProgress } from '../../lib/useScrollProgress'
import Todo from '../Todo'
import PianoRibbon from './PianoRibbon'
import StageScene from './StageScene'
import VoiceRibbon from './VoiceRibbon'
import { STATE_LABELS, staging } from './staging'

/**
 * The recital room: the whole front page.
 *
 * A pinned stage with two performers. One scroll value moves both their scores
 * through three readings at once — the singer's from notation to Mandarin tone
 * to code, the pianist's from notation to harmony to physics. They change
 * together because it's one performance, not two widgets.
 */

const CAPTIONS = [
  'One phrase of Schubert, as written.',
  'The same phrase, read twice over: as tone, and as harmony.',
  'And underneath both — a data structure, and moving air.',
]

export default function RecitalRoom() {
  const { ref, progress } = useScrollProgress<HTMLDivElement>()
  const s = staging(progress)
  const labels = STATE_LABELS[s.index]

  return (
    <section id="room" aria-label="Recital room">
      <div ref={ref} className="room-track">
        <div className="room-sticky">
          <div className="room-head shell">
            <p className="eyebrow" style={{ marginBottom: 0 }}>
              Schubert · <em>{PIECE.title}</em> {PIECE.catalogue} · “{PIECE.german}”
            </p>
            <p className="room-caption">{CAPTIONS[s.index]}</p>
          </div>

          <div className="room-ribbons">
            <figure className="room-ribbon">
              <figcaption className="room-ribbon-tag">
                Piano — <span>{labels.piano}</span>
              </figcaption>
              <PianoRibbon p={progress} />
            </figure>
            <figure className="room-ribbon">
              <figcaption className="room-ribbon-tag">
                Voice — <span>{labels.voice}</span>
              </figcaption>
              <VoiceRibbon p={progress} />
            </figure>
          </div>

          <div className="room-stage">
            <StageScene />
          </div>

          <div className="room-progress" aria-hidden="true">
            <span style={{ width: `${Math.round(progress * 100)}%` }} />
          </div>
        </div>
      </div>

      <div className="shell" style={{ paddingBottom: 'var(--space-7)' }}>
        <p className="muted" style={{ fontSize: 'var(--step--1)', maxWidth: '58ch' }}>
          <span className="han">{PIECE.mandarin}</span> — {PIECE.mandarinPinyin} — “{PIECE.mandarinGloss}”.
          {' '}{PIECE.mandarinNote}
          <br />
          {PIANO_PIECE.summary}
        </p>
        {PIANO_UNVERIFIED && (
          <Todo>
            The piano part was measured off your screenshot, not transcribed by
            ear — staff lines detected, rules and beams stripped, noteheads found
            by template. The same pipeline reproduced your vocal corrections
            exactly, so I trust the pitches, but chord voicings are where one
            pixel becomes a wrong chord. Export MusicXML or MIDI from your
            notation software and this becomes exact. Check src/data/piano.ts.
          </Todo>
        )}
      </div>
    </section>
  )
}
