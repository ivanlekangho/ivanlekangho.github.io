import { PHRASE, PIECE } from '../../data/phrase'
import { HARMONY } from '../../data/piano'
import { MANDARIN } from '../../data/tones'

/**
 * The language stop: one line, written out four ways.
 *
 * This is the whole screen at this stop, not a caption under a diagram.
 * Earlier it was both — the staff above drew the tone contours and the
 * chord chart, and these rows repeated them underneath, so the Mandarin,
 * the German and the harmony were each on screen twice and neither copy
 * had room to be read. One copy of each, large enough to read, is worth
 * more than two of everything.
 *
 * Four rows of the same shape, in the order a reader meets them: the
 * language Ivan speaks, the language he sings, what it means, and the one
 * that is the argument. The last row has a lexicon (Bm, C♯°7), an
 * inflection (⁶₄, ⁷) and a syntax — where a dominant is allowed to go —
 * and it is sitting in the same table as three things nobody disputes are
 * languages. Nothing here asserts that. The table shows it.
 */

/**
 * One Mandarin tone, drawn the way the IPA draws one: the contour to the
 * left of a vertical reference bar, the top of the bar being the top of the
 * speaker's range. A tone box with a line across the top would hide the
 * level tone, which runs along exactly that line.
 */
function Contour({ tone }: { tone: number }) {
  const t = MANDARIN[tone as 1 | 2 | 3 | 4]
  if (!t) return null
  const w = 15
  const h = 20
  const pts = t.contour
    .map((v, i) => `${(i / (t.contour.length - 1)) * w},${h - v * h}`)
    .join(' ')
  return (
    <svg className="tone-glyph" viewBox={`-1.5 -1.5 ${w + 6} ${h + 3}`} width={w + 6} height={h + 3}
      aria-hidden="true">
      <line x1={w + 3} y1="0" x2={w + 3} y2={h} stroke="var(--ink-3)" strokeWidth="1" />
      <polyline points={pts} fill="none" stroke={`var(--${t.family}-mid)`}
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

const HAN = PHRASE.filter((n) => n.han)
const GERMAN = PHRASE.filter((n) => n.german)

export default function Apparatus() {
  return (
    <div className="apparatus">
      <p className="apparatus-thesis">One line, four notations.</p>

      <dl className="apparatus-rows">
        <div className="arow">
          <dt>Mandarin</dt>
          <dd className="arow-syl arow-han">
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
          <dt>Harmony</dt>
          <dd className="arow-syl arow-chords">
            {HARMONY.map((h) => (
              <span key={h.atBeat} className="syl">
                <b>{h.symbol}</b>
                <i>{h.numeral}</i>
                <i className="move">{h.move}</i>
              </span>
            ))}
          </dd>
        </div>
      </dl>
    </div>
  )
}
