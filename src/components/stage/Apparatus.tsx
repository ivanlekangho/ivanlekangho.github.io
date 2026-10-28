import { PHRASE, PIECE } from '../../data/phrase'
import { HARMONY } from '../../data/piano'
import { MANDARIN } from '../../data/tones'
import { TALLY } from '../../lib/prosody'

/**
 * The language stop, as four rows.
 *
 * The claim the room is making is that music and language are the same kind
 * of object, and the cheapest way to make that claim is to stop arguing it
 * and lay the notations out in parallel: the line in Mandarin with its tone
 * contours, in German with its IPA, in English, and in the notation
 * musicians use for harmony. Four rows of the same shape. The last one is
 * the argument — it has a lexicon (Bm, C♯°7), an inflection (⁶₄, ⁷) and a
 * syntax (where a dominant may go), and it is sitting in the same table as
 * the three everybody already agrees are languages.
 *
 * Nothing here is prose. Prose would be me asserting the thing; the table
 * shows it.
 */

/**
 * One Mandarin tone, drawn the way the IPA draws one: the contour to the
 * left of a vertical reference bar, top of the bar being the top of the
 * speaker's range. A tone box with a line across the top instead would
 * hide the level tone, which runs along exactly that line.
 */
function Contour({ tone }: { tone: number }) {
  const t = MANDARIN[tone as 1 | 2 | 3 | 4]
  if (!t) return null
  const w = 13
  const h = 17
  const pts = t.contour
    .map((v, i) => `${(i / (t.contour.length - 1)) * w},${h - v * h}`)
    .join(' ')
  return (
    <svg className="tone-glyph" viewBox={`-1 -1 ${w + 4} ${h + 2}`} width={w + 4} height={h + 2}
      aria-hidden="true">
      <line x1={w + 2} y1="0" x2={w + 2} y2={h} stroke="var(--ink-3)" strokeWidth="0.9" />
      <polyline points={pts} fill="none" stroke={`var(--${t.family}-mid)`}
        strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

const HAN = PHRASE.filter((n) => n.han)
const GERMAN = PHRASE.filter((n) => n.german)

export default function Apparatus() {
  return (
    <div className="score-apparatus">
      <p className="apparatus-thesis">One line, four notations.</p>

      <dl className="apparatus-rows">
        <div className="arow">
          <dt>Mandarin</dt>
          <dd className="arow-syl">
            {HAN.map((n, i) => (
              <span key={n.id + i} className="syl">
                <Contour tone={n.tone!} />
                <b className="han">{n.han}</b>
                <i>{n.pinyin}</i>
              </span>
            ))}
          </dd>
        </div>

        <div className="arow">
          <dt>German</dt>
          <dd className="arow-syl">
            {GERMAN.map((n, i) => (
              <span key={n.id + i} className="syl">
                <b>{n.german}{n.hyphenAfter && <span className="tie">-</span>}</b>
                <i className="ipa">{n.ipa}</i>
              </span>
            ))}
          </dd>
        </div>

        <div className="arow">
          <dt>English</dt>
          <dd className="arow-plain">{PIECE.englishGloss}</dd>
        </div>

        <div className="arow">
          <dt>Music</dt>
          <dd className="arow-syl">
            {HARMONY.map((h) => (
              <span key={h.atBeat} className="syl">
                <b>{h.symbol}</b>
                <i>{h.numeral}</i>
              </span>
            ))}
          </dd>
        </div>
      </dl>

      <p className="apparatus-foot">
        Tone moves with the tune on <b>{TALLY.agree}</b> of {TALLY.total} syllables,
        against it on <b>{TALLY.clash}</b>. Word stress lands on the beat it wants
        on <b>{TALLY.match}</b> of {TALLY.total}.
      </p>
    </div>
  )
}
