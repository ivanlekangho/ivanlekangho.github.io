import { useLayoutEffect, useRef, useState } from 'react'
import { PHRASE, PIECE } from '../../data/phrase'
import { HARMONY } from '../../data/piano'
import { MANDARIN } from '../../data/tones'
import { SYS, VOICE_ONSET, xAt } from '../../lib/beatmap'
import { ease, range } from '../../lib/easing'
import { noteY } from '../../lib/notation'
import { FRAME } from './Score'
import { GEO } from './VoiceRibbon'

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
 *
 * THE WORDS ARRIVE FROM THEIR NOTES. Each syllable starts at the x its
 * note occupies in musical time — the spacing of the score, where a dotted
 * quarter takes more room than an eighth — and travels out to its slot in
 * the row, where every word gets equal room because a table is not a bar
 * of music. Mandarin falls from the height of its own pitch; the German
 * comes down off the lyric line; the chords rise from the piano's staves.
 * The staff is fading out underneath while they move, so what you watch is
 * the notes turning into the words, which is the claim the room is making.
 */

const REDUCED = () =>
  typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Where a word's note is, in the score's own coordinates.
 *
 * Both of these are read off the same geometry the engraver uses, so a
 * character starts on its notehead rather than near it. `lyricY` is where
 * VoiceStaff sets the German, and the staff is pinned to the notation
 * frame while it dissolves, so the frame is a constant here.
 */
const SOURCE = PHRASE.map((n, i) => ({
  x: xAt(VOICE_ONSET[i]),
  note: noteY(n, GEO),
  /* lyricY is a baseline, not a middle. */
  lyric: GEO.bottomY + GEO.gap * 2.8,
}))
const NOTATION = FRAME[0]

/** The score's viewBox mapped onto the screen, as the browser maps it. */
type Axis = { x0: number; y0: number; k: number }
function scoreAxis(): Axis | null {
  const el = document.querySelector('.score-svg')
  if (!el) return null
  const r = el.getBoundingClientRect()
  if (!r.width || !r.height) return null
  /* preserveAspectRatio is the default xMidYMid meet: one scale, centred. */
  const k = Math.min(r.width / SYS.w, r.height / NOTATION.h)
  return {
    x0: r.left + (r.width - SYS.w * k) / 2,
    y0: r.top + (r.height - NOTATION.h * k) / 2 - NOTATION.y * k,
    k,
  }
}

const HAN = PHRASE.map((n, i) => ({ n, i })).filter(({ n }) => n.han)
const GERMAN = PHRASE.map((n, i) => ({ n, i })).filter(({ n }) => n.german)

/**
 * Ink sits differently in an HTML line box than in an SVG text or an
 * ellipse: a CJK glyph rides low in its box, a Latin word rides above its
 * baseline. Measured once against the rendered page, in screen pixels,
 * because the correction is a property of the font at its rendered size
 * rather than of the score's coordinate space.
 */
const INK_Y: Record<string, number> = { han: 0, de: -4, ch: 0 }

/**
 * The chords come up out of the piano's staves. There is no symbol on the
 * page at the musician stop for them to leave from — a pianist reads the
 * notes, not a chart — so they take the x of the beat they fall on and a y
 * in the middle of the grand staff, which is where that harmony was being
 * played.
 */
const PIANO_Y = 300

/**
 * Where every item in every row comes to rest, and where the staff is.
 *
 * Measured rather than derived: the rows are laid out with space-between,
 * so where an item settles depends on how wide all the others are, and
 * guessing produces a slide that ends a few pixels off its target — which
 * is exactly the part the eye notices. Transforms do not affect layout, so
 * `offsetLeft` still reports the slot while the item is mid-flight, and the
 * observer cannot loop.
 */
type Row = { left: number; top: number; at: { x: number; y: number }[] }

function useSlots() {
  const ref = useRef<HTMLDListElement>(null)
  const [geo, setGeo] = useState<{ rows: Record<string, Row>; axis: Axis | null }>({
    rows: {}, axis: null,
  })

  useLayoutEffect(() => {
    const root = ref.current
    if (!root) return
    const measure = () => {
      const rows: Record<string, Row> = {}
      for (const row of root.querySelectorAll<HTMLElement>('[data-row]')) {
        const r = row.getBoundingClientRect()
        rows[row.dataset.row!] = {
          left: r.left,
          top: r.top,
          /* The word inside the cell, not the cell: a Mandarin cell also
             holds a tone letter above and pinyin below, so aiming its box
             centre at a notehead lands the character somewhere else.
             Two hops, because applying a transform to a cell makes that
             cell the glyph's offsetParent — so the glyph's own offset is
             always within its cell, and the cell's is within the row.
             Both are positioned in CSS so neither hop can be skipped. */
          at: ([...row.children] as HTMLElement[]).map((k) => {
            const g = (k.querySelector('b') ?? k) as HTMLElement
            return {
              x: k.offsetLeft + g.offsetLeft + g.offsetWidth / 2,
              y: k.offsetTop + g.offsetTop + g.offsetHeight / 2,
            }
          }),
        }
      }
      const next = { rows, axis: scoreAxis() }
      setGeo((prev) => (JSON.stringify(prev) === JSON.stringify(next) ? prev : next))
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(root)
    const score = document.querySelector('.score-svg')
    if (score) ro.observe(score)
    /* The display face arrives over the network, and a word is a different
       width in it than in the fallback — so the slots measured on mount
       are not where anything ends up. */
    let live = true
    void document.fonts?.ready.then(() => { if (live) measure() })
    return () => { live = false; ro.disconnect() }
  }, [])

  return [ref, geo] as const
}

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

export default function Apparatus({ p }: { p: number }) {
  const [rows, geo] = useSlots()
  const settled = REDUCED()

  /**
   * How far through the arrival each item is. Staggered left to right, so
   * the row assembles in the order the phrase is sung rather than all at
   * once; everything is home before the rail reaches the stop.
   */
  const arrive = (i: number) =>
    settled ? 1 : ease(range(p, 0.14 + i * 0.007, 0.36 + i * 0.007))

  /**
   * Travel for an item: from its notehead out to its slot in the row.
   *
   * With the staff's axis in hand the start is the note itself; without it
   * — before the first measurement, or if the frame is degenerate — the
   * item simply rises into place, which is a worse animation rather than a
   * broken one.
   */
  const move = (row: string, i: number, src: { x: number; y: number } | null, fallbackDy: number) => {
    const t = arrive(i)
    if (t >= 1) return undefined
    const r = geo.rows[row]
    let dx = 0
    let dy = fallbackDy
    const slot = r?.at[i]
    if (r && slot && src && geo.axis) {
      dx = geo.axis.x0 + src.x * geo.axis.k - (r.left + slot.x)
      dy = geo.axis.y0 + src.y * geo.axis.k - (r.top + slot.y) + (INK_Y[row] ?? 0)
    }
    const u = 1 - t
    return { transform: `translate(${(dx * u).toFixed(1)}px, ${(dy * u).toFixed(1)}px)` }
  }

  return (
    <div className="apparatus">
      <p className="apparatus-thesis">One line, four notations.</p>

      <dl className="apparatus-rows" ref={rows}>
        <div className="arow">
          <dt>Mandarin</dt>
          <dd className="arow-syl arow-han" data-row="han">
            {HAN.map(({ n, i }, k) => (
              <span key={n.id} className="syl"
                style={move('han', k, { x: SOURCE[i].x, y: SOURCE[i].note }, -46)}>
                <Contour tone={n.tone!} />
                <b className="han">{n.han}</b>
                <i>{n.pinyin}</i>
              </span>
            ))}
          </dd>
        </div>

        <div className="arow">
          <dt>German</dt>
          <dd className="arow-syl" data-row="de">
            {GERMAN.map(({ n, i }, k) => (
              <span key={n.id} className="syl"
                style={move('de', k, { x: SOURCE[i].x, y: SOURCE[i].lyric }, -36)}>
                <b>{n.german}{n.hyphenAfter && <span className="tie">-</span>}</b>
                <i className="ipa">{n.ipa}</i>
              </span>
            ))}
          </dd>
        </div>

        <div className="arow">
          <dt>English</dt>
          <dd className="arow-plain" style={move('en', 0, null, 16)}>
            {PIECE.englishGloss}
          </dd>
        </div>

        <div className="arow">
          <dt>Harmony</dt>
          <dd className="arow-syl arow-chords" data-row="ch">
            {HARMONY.map((h, k) => (
              <span key={h.atBeat} className="syl"
                style={move('ch', k, { x: xAt(h.atBeat), y: PIANO_Y }, 44)}>
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
