import Todo from '../components/Todo'
import { PIECE } from '../data/phrase'
import { PIANO_PIECE } from '../data/piano'

/**
 * What you just looked at.
 *
 * This used to be a panel called "Recital" that you had to go and find. It
 * belongs directly under the hall: a reader who has just dragged the rail
 * and watched the noteheads move has exactly one question, and the answer
 * should be the next thing on the page rather than a destination.
 */

const READINGS = [
  {
    stop: 'Musician',
    voice: 'Bass-clef notation',
    piano: 'Grand staff',
    text: 'What is actually on the page. Two bars of Schubert, engraved from note names rather than MIDI numbers, so the key signature does its job and F♯ and F sit on the same line.',
  },
  {
    stop: 'Linguist',
    voice: 'Mandarin tone contours',
    piano: 'Functional harmony',
    text: 'The same noteheads become the onsets of the four Mandarin tones, and the chords become roman numerals. A Mandarin syllable carries part of its meaning in pitch; get the tone wrong and the word changes, not just the sound.',
  },
  {
    stop: 'Engineer',
    voice: 'The data behind it',
    piano: 'Frequency and ratio',
    text: 'Every note at its true log frequency, carrying a sine wave of its own wavelength. The closing D major locks because its frequencies sit at small whole-number ratios.',
  },
]

export default function Room() {
  return (
    <section id="room" className="band">
      <div className="shell">
        <p className="eyebrow">The room</p>
        <h2 className="h-hero">One phrase,<br />read three ways</h2>

        <p className="lede">
          The same nine noteheads are the notation, the tone contours and the data
          points. Nothing crossfades between three pictures — the objects
          themselves move. The claim is that music, language and code are three
          views of one thing, so it had better be literally true on the page.
        </p>

        <ul className="index">
          {READINGS.map((r) => (
            <li key={r.stop} className="index-row index-row-wide">
              <span className="index-main">{r.stop}</span>
              <span className="index-sub">{r.text}</span>
              <span className="index-meta">{r.voice}<br />{r.piano}</span>
            </li>
          ))}
        </ul>

        <h3 className="h-rule">The piece</h3>
        <p className="pull">{PIECE.german}</p>
        <p className="pull-gloss">
          {PIECE.englishGloss} · {PIECE.composer}, {PIECE.title} {PIECE.catalogue} ·
          text by {PIECE.poet}, {PIECE.year} · {PIECE.key}, baritone
        </p>

        <dl className="field">
          <dt>Mandarin</dt>
          <dd>
            <span className="han">{PIECE.mandarin}</span> — {PIECE.mandarinPinyin} —
            “{PIECE.mandarinGloss}”. {PIECE.mandarinNote}
          </dd>
          <dt>Harmony</dt>
          <dd>{PIANO_PIECE.summary}</dd>
          <dt>Why this one</dt>
          <dd>
            <Todo>
              Why you chose it, and what was technically hard — the range, the shift
              out of the minor opening, breath control, whatever it actually was.
              Then: pieces two and three, with the same for each.
            </Todo>
          </dd>
        </dl>

        <Todo>
          A recording. Drop it at public/audio/der-wanderer.m4a (m4a or mp3, not
          WAV — see the README) and a play button appears over the score: the
          playhead sweeps the system and the notes light up as they sound, on both
          staves at once. Nine space-bar taps with ?tap on the URL and it follows
          your rubato instead of a metronome.
        </Todo>

        <Todo>
          The piano chord voicings are still measured off a screenshot rather than
          transcribed. A MusicXML or MIDI export from your notation software is one
          click and makes them exact.
        </Todo>
      </div>
    </section>
  )
}
