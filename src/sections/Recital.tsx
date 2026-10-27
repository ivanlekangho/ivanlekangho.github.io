import StaffNotation from '../components/StaffNotation'
import Todo from '../components/Todo'
import { PIECE } from '../data/phrase'
import { PIANO_PIECE } from '../data/piano'

export default function Recital() {
  return (
    <section id="recital" className="section">
      <h1 className="h-hero">Three pieces,<br />and why</h1>

      <article className="entry">
        <div className="entry-head">
          <h3>{PIECE.title} {PIECE.catalogue}</h3>
          <p className="entry-meta">
            {PIECE.composer} · {PIECE.poet}, {PIECE.year} · German · {PIECE.key}, baritone
          </p>
        </div>

        <div className="entry-body">
          <div className="score-sheet">
            <StaffNotation width={620} gap={11} />
          </div>

          <p className="pull">{PIECE.german}</p>
          <p className="pull-gloss">{PIECE.englishGloss}</p>

          <dl className="field">
            <dt>Mandarin</dt>
            <dd>
              <span className="han">{PIECE.mandarin}</span> — {PIECE.mandarinPinyin} —
              “{PIECE.mandarinGloss}”. {PIECE.mandarinNote}
            </dd>
            <dt>Harmony</dt>
            <dd>{PIANO_PIECE.summary}</dd>
          </dl>

          <Todo>
            Audio for this piece (m4a or mp3, please not WAV — see the README on
            repo size). Drop it at public/audio/der-wanderer.m4a and it plays.
            Also: why you chose it, and what was technically hard — the range, the
            shift out of the minor opening, breath control, whatever it was.
          </Todo>
        </div>
      </article>

      <Todo>
        Pieces two and three. Any other Schubert or Mendelssohn you sing, plus the
        same for each: language, why you chose it, what was hard, a lyric excerpt
        with translation, and a score page so the notation snippet is real.
      </Todo>

      <Todo>
        Friedrich’s Wanderer above the Sea of Fog — duotone treatment, as agreed.
        Drop the image at public/img/friedrich.jpg and I’ll tint it into the
        paper-and-wisteria range. It’s public domain (1818), so there’s no rights
        question, and the caption will say plainly that the painting and the song
        aren’t historically connected.
      </Todo>

      <Todo>
        The piano chord voicings are still measured off a screenshot rather than
        transcribed. A MusicXML or MIDI export from your notation software is one
        click and makes them exact.
      </Todo>
    </section>
  )
}
