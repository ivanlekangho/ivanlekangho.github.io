import Sheet from '../Sheet'
import Todo from '../Todo'
import { PHRASE, PIECE } from '../../data/phrase'
import { PIANO_PIECE, PROGRESSION } from '../../data/piano'
import { soloAxis } from '../../lib/beatmap'
import { noteY, type StaffGeom } from '../../lib/notation'
import { ENG } from '../../lib/smufl'
import { FITS, TALLY } from '../../lib/prosody'
import { SYLLABLES } from '../../data/mandarin'
import { NoteMarks, VoiceLyrics, VoiceStaffFurniture, voiceLayout } from '../score/VoiceStaff'

/**
 * The piece, on paper.
 *
 * Clicking the credit over the stage lifts this out of the room: the vocal
 * line engraved on its own, the three readings of the text, and what the
 * harmony is doing. It is an overlay rather than a section of the page
 * because it is about the thing you are already looking at — sending a
 * reader down the page to find it would be sending them away.
 */

const W = 760
const GEO: StaffGeom = { gap: 15, bottomY: 110 }

export default function PieceSheet({ onClose }: { onClose: () => void }) {
  const axis = soloAxis(170, W - 36)
  const L = voiceLayout(GEO, PHRASE, axis)

  return (
    <Sheet onClose={onClose} label={PIECE.title} tone="paper">
      <>
          <p className="sheet-eyebrow">{PIECE.composer}, {PIECE.year}</p>
          <h2 className="sheet-title">{PIECE.title}</h2>
          <p className="sheet-sub">
            {PIECE.catalogue} — text by {PIECE.poet} — {PIECE.key}, baritone, cut time
          </p>

          <svg viewBox={`0 0 ${W} 190`} width="100%" className="sheet-score" role="img"
            aria-label={`The vocal line of ${PIECE.title}, engraved in bass clef.`}>
            <VoiceStaffFurniture g={GEO} width={W - 20} layout={L} lineX0={30}
              head={{ clef: 38, keySig: 100, time: 136 }} />
            {PHRASE.map((n, i) => {
              const y = noteY(n, GEO)
              return (
                <g key={n.id}>
                  <NoteMarks n={n} x={L.xs[i]} y={y} dir={L.dirs[i]} g={GEO} />
                  <ellipse cx={L.xs[i]} cy={y} rx={ENG.headRx * GEO.gap} ry={ENG.headRy * GEO.gap}
                    transform={`rotate(${ENG.headTilt} ${L.xs[i]} ${y})`}
                    fill={`var(--t${n.tone ?? 0}-mid)`} />
                </g>
              )
            })}
            <VoiceLyrics g={GEO} layout={L} fontSize={13} />
          </svg>

          <dl className="sheet-field">
            <dt>Sung</dt>
            <dd className="sheet-line">{PIECE.german}</dd>
            <dt>Means</dt>
            <dd>{PIECE.englishGloss}</dd>
            <dt>Mandarin</dt>
            <dd>
              <span className="han">{PIECE.mandarin}</span>, {PIECE.mandarinPinyin},
              “{PIECE.mandarinGloss}”. {PIECE.mandarinNote}
            </dd>
          </dl>

          <h3 className="sheet-h">Tone against the tune</h3>
          <p>
            Mandarin carries part of a word in the pitch of the syllable: the same
            sounds on a falling contour are a different word. A melody that falls
            where the tone rises can make a sung line ambiguous, which is a real
            problem for anyone setting Mandarin or Cantonese and plainly not one
            Schubert had in 1816. The Mandarin line over his melody is a mapping I
            chose, so what the room measures is a coincidence rather than a claim:
            <em> {TALLY.agree} of the {TALLY.total} syllables</em> move the way their
            tone does, <em>{TALLY.clash}</em> move the opposite way — 处 and 客, both
            falling tones set to a rising line.
          </p>

          <h3 className="sheet-h">Stress against the bar</h3>
          <p>
            Mandarin has no English-style lexical stress, but it has prosodic heads:
            the syllable a word leans on. 异客 is a noun compound and its head is 客,
            the noun itself; 处处 is a reduplicated adverb and leans on the first;
            为 is a copula and wants to stay out of the way. Cut time puts a strong
            beat at the top of each bar and another halfway through, so the question
            is whether those weights land where the words want them.
          </p>
          <table className="sheet-table">
            <thead>
              <tr><th>Syllable</th><th>Word</th><th>Wants</th><th>Gets</th><th /></tr>
            </thead>
            <tbody>
              {FITS.map((f) => {
                const syl = SYLLABLES[f.s]
                return (
                  <tr key={f.i} className={`is-${f.stress}`}>
                    <td><span className="han">{syl.han}</span> {syl.pinyin}</td>
                    <td>{syl.word}, {syl.pos}</td>
                    <td>{syl.wants}</td>
                    <td>{f.metre}</td>
                    <td>{f.stress === 'match' ? 'yes' : f.stress === 'carried' ? 'held over one' : 'no'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          <p>
            <em>{TALLY.match} of {TALLY.total}</em> land where they want to. The
            function words behave: 我 takes the pickup and 为 sits off the beat,
            exactly where a pronoun and a copula belong. The one that does not is
            异客 — Schubert's downbeat falls on 异, <em>strange</em>, and 客,
            <em> guest</em>, arrives off the beat and only reaches the next strong
            one by being held through it.
          </p>
          <p>
            Which is wrong, and is also the better reading. The song is called
            <em> Der Wanderer</em>; leaning on <em>strange</em> rather than on
            <em> guest</em> is what the poem is about. He had no way of knowing that.
          </p>

          <h3 className="sheet-h">What the harmony is doing</h3>
          <p>
            <em>{PROGRESSION.short}</em> — the functional reading, each numeral naming
            what the chord does to the key rather than what it is. Over the staff the
            room shows the other register, the one a pianist reads off a chart: Bm,
            B+, Em, C♯°7, D/A, A7, D.
          </p>
          <p>{PROGRESSION.sentence} {PIANO_PIECE.summary}</p>

          <Todo>
            The stress reading above rests on which syllable each word leans on —
            处处 on the first, 异客 on the second. That is the standard analysis and
            I am not a Mandarin speaker; you are. If either is wrong, the table is
            wrong, and it is one line each in src/data/mandarin.ts.
          </Todo>
          <Todo>
            A recording. Drop it at public/audio/der-wanderer.m4a (m4a or mp3, not
            WAV — see the README) and a play button appears over the score: the
            playhead sweeps the system and the notes light up as they sound, on both
            staves at once. Nine space-bar taps with ?tap on the URL and it follows
            your rubato instead of a metronome. Then: why you chose this piece, and
            what was actually hard about it.
          </Todo>
          <Todo>
            The piano chord voicings are still measured off a screenshot rather than
            transcribed. A MusicXML or MIDI export from your notation software is one
            click and makes them exact.
          </Todo>
      </>
    </Sheet>
  )
}
