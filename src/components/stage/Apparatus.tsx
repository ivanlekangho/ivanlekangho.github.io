import { Fragment, useLayoutEffect, useRef, useState } from 'react'
import { PHRASE, type Note } from '../../data/phrase'
import { HARMONY } from '../../data/piano'
import { MANDARIN, type ToneId } from '../../data/tones'
import { SYS, barX, xAt } from '../../lib/beatmap'
import { ease, range } from '../../lib/easing'
import { noteY } from '../../lib/notation'
import { ENG } from '../../lib/smufl'
import { NoteMarks, VoiceLyrics, VoiceStaffFurniture, voiceLayout } from '../score/VoiceStaff'
import { GEO } from './VoiceRibbon'

/**
 * The language stop: the sung line, and the same line written out four ways.
 *
 * The baritone's own staff stays at the top of the screen. It is the thing
 * being read, and every row underneath is a reading of it — take it away and
 * the table is four lists that happen to be the same length. Keeping it also
 * makes the arrival honest: THE WORDS COME OFF THE NOTES THEY ARE SUNG ON.
 * Each syllable starts on its own notehead, at the x that note occupies in
 * musical time and the y of its pitch, and travels out to its slot in the
 * row, where every word gets equal room because a table is not a bar of
 * music. The German and the English both leave the lyric line, because
 * that is where the German is printed and the English is what it means.
 *
 * Four rows, in the order a reader meets them: the language Ivan speaks,
 * the language he sings, what it means, and the one that is the argument.
 * That last row has a lexicon (Bm, C♯°7), an inflection (⁶₄, ⁷) and a
 * syntax — where a dominant is allowed to go — and it is sitting in the
 * same table as three things nobody disputes are languages. Nothing here
 * asserts that. The table shows it.
 */

const REDUCED = () =>
  typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches

/* ---------------------------------------------------------------- staff */

/** The crop on the voice staff: slur and high B at the top, lyrics at the
 *  foot. Narrower than the full system's frame, because the pianist's two
 *  staves are not on this screen. */
const STAFF = { y: 68, h: 132 }
const HEAD = { clef: SYS.clef, keySig: SYS.keySig, time: SYS.time }
const LAYOUT = voiceLayout(GEO, PHRASE, { xAt, barX })

/**
 * Where a word's note is, in the staff's own coordinates — read off the
 * same geometry the engraver uses, so a character starts ON its notehead
 * rather than near it. `lyricY` is a baseline, not a middle.
 */
const SOURCE = PHRASE.map((n, i) => ({
  x: LAYOUT.xs[i],
  note: noteY(n, GEO),
  lyric: LAYOUT.lyricY,
}))

/** The chord symbols have no sign of their own on a singer's page — the
 *  harmony is under the staff, in the pianist's hands — so they rise from
 *  just below it, at the x of the beat they fall on. */
const HARMONY_Y = GEO.bottomY + GEO.gap * 3.6

/** The staff mapped onto the screen, exactly as the browser maps a viewBox:
 *  preserveAspectRatio is the default xMidYMid meet — one scale, centred. */
type Axis = { x0: number; y0: number; k: number }
function staffAxis(root: HTMLElement): Axis | null {
  const el = root.querySelector('.apparatus-staff')
  if (!el) return null
  const r = el.getBoundingClientRect()
  if (!r.width || !r.height) return null
  const k = Math.min(r.width / SYS.w, r.height / STAFF.h)
  return {
    x0: r.left + (r.width - SYS.w * k) / 2,
    y0: r.top + (r.height - STAFF.h * k) / 2 - STAFF.y * k,
    k,
  }
}

/* ------------------------------------------------------------ tone chart */

/**
 * The Mandarin row is plotted on Chao's 1-5 scale: five reference lines
 * ruled across the row, each tone drawn as the line it actually traces
 * between them. A box with a rule along the top would bury the level tone,
 * which runs along exactly that rule — so the scale is five hairlines and
 * the contour is the only heavy ink on it.
 */
const TONE_H = 48
const TONE_TOP = 5
const TONE_BOT = 43
const toneY = (v: number) => TONE_BOT - v * (TONE_BOT - TONE_TOP)
/** Levels 1-5 as the 0-1 values the contours are stored in. */
const LEVELS = [0, 0.25, 0.5, 0.75, 1]

/**
 * Heights are written as fractions of --tone-h rather than in pixels, and
 * the contours are drawn with preserveAspectRatio="none", so the ruled
 * scale and the lines plotted on it squash together. A phone gets a
 * shorter chart by changing one custom property; two independent sets of
 * pixel values would have drifted apart the first time one of them moved.
 */
const bandY = (v: number, dy = 0) => `calc(var(--tone-h) * ${(toneY(v) / TONE_H).toFixed(4)}${dy ? ` + ${dy}px` : ''})`

function ToneScale() {
  return (
    <div className="tone-scale" aria-hidden="true">
      {LEVELS.map((v, i) => (
        <i key={v} className={i === 0 || i === LEVELS.length - 1 ? 'is-edge' : ''}
          style={{ top: bandY(v) }} />
      ))}
      <span style={{ top: bandY(1, -5) }}>5</span>
      <span style={{ top: bandY(0, -5) }}>1</span>
    </div>
  )
}

function Contour({ tone }: { tone: ToneId }) {
  const t = MANDARIN[tone]
  const w = 28
  const pts = t.contour
    .map((v, i) => `${2 + (i / (t.contour.length - 1)) * (w - 4)},${toneY(v)}`)
    .join(' ')
  return (
    <svg className="tone-line" viewBox={`0 0 ${w} ${TONE_H}`} preserveAspectRatio="none"
      aria-hidden="true">
      <polyline points={pts} fill="none" stroke={`var(--${t.family}-mid)`}
        strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"
        vectorEffect="non-scaling-stroke" />
    </svg>
  )
}

/* ----------------------------------------------------------------- words */

type Item = { n: Note; i: number }
const HAN: Item[] = PHRASE.map((n, i) => ({ n, i })).filter(({ n }) => n.han)
const GERMAN: Item[] = PHRASE.map((n, i) => ({ n, i })).filter(({ n }) => n.german)

/**
 * Syllables that belong to one word, gathered so the hyphen can sit inside
 * the word rather than trail off the end of a syllable. Fremd-ling is one
 * word sung across two notes, and a reader should be able to see that from
 * across the room; spread along the row with everything else, the two
 * halves read as two words. The same grouping is right for the English,
 * because it is split on the same syllables.
 */
function wordsOf(items: Item[]): Item[][] {
  const out: Item[][] = []
  for (const it of items) {
    const prev = out[out.length - 1]
    if (prev && prev[prev.length - 1].n.hyphenAfter) prev.push(it)
    else out.push([it])
  }
  return out
}
const WORDS = wordsOf(GERMAN)

/**
 * Ink sits differently in an HTML line box than in an SVG text or an
 * ellipse: a CJK glyph rides low in its box, a Latin word rides above its
 * baseline. Measured against the rendered page, in screen pixels, because
 * the correction is a property of the font at its rendered size rather
 * than of the staff's coordinate space.
 */
const INK_Y: Record<string, number> = { han: 0, de: -4, en: -4, ch: 0 }

/* ----------------------------------------------------------- measurement */

/**
 * Where every item in every row comes to rest.
 *
 * Measured rather than derived: the rows are laid out with space-between,
 * so where a word settles depends on how wide all the others are, and
 * guessing produces a slide that ends a few pixels off its target — which
 * is exactly the part the eye notices. Transforms do not affect layout, so
 * a slot still reports correctly while its word is mid-flight, and the
 * observer cannot loop.
 */
type Row = { left: number; top: number; at: { x: number; y: number }[] }

/**
 * Offset of an element within an ancestor, walking the offsetParent chain.
 *
 * Not a single offsetLeft: a word sits inside its word-group inside the
 * row, and applying a transform to any of them makes THAT one the next
 * one's offsetParent — so the number of hops changes while the animation
 * runs. Walking the chain is the only measurement that does not depend on
 * which elements happen to be moving at the time.
 */
function offsetIn(el: HTMLElement, root: HTMLElement) {
  let x = 0
  let y = 0
  let node: HTMLElement | null = el
  while (node && node !== root) {
    x += node.offsetLeft
    y += node.offsetTop
    node = node.offsetParent as HTMLElement | null
  }
  return { x, y }
}

function useSlots() {
  const ref = useRef<HTMLDivElement>(null)
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
             holds a contour above and its pinyin below, so aiming the box
             centre at a notehead lands the character somewhere else. */
          at: [...row.querySelectorAll<HTMLElement>('.syl')].map((cell) => {
            const g = (cell.querySelector('b') ?? cell) as HTMLElement
            const o = offsetIn(g, row)
            return { x: o.x + g.offsetWidth / 2, y: o.y + g.offsetHeight / 2 }
          }),
        }
      }
      const next = { rows, axis: staffAxis(root) }
      setGeo((prev) => (JSON.stringify(prev) === JSON.stringify(next) ? prev : next))
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(root)
    /* The display face arrives over the network, and a word is a different
       width in it than in the fallback — so the slots measured on mount
       are not where anything ends up. */
    let live = true
    void document.fonts?.ready.then(() => { if (live) measure() })
    return () => { live = false; ro.disconnect() }
  }, [])

  return [ref, geo] as const
}

/* ------------------------------------------------------------------ view */

export default function Apparatus({ p }: { p: number }) {
  const [root, geo] = useSlots()
  const settled = REDUCED()

  /**
   * How far through the arrival each item is. Staggered left to right, so
   * a row assembles in the order the phrase is sung rather than all at
   * once; everything is home before the rail reaches the stop.
   */
  const arrive = (i: number) =>
    settled ? 1 : ease(range(p, 0.20 + i * 0.006, 0.42 + i * 0.006))

  /**
   * Travel for one item: from its notehead out to its slot in the row.
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

  /** A hyphen belongs to the word, so it only appears once the word has. */
  const joinOpacity = (k: number) => (settled ? 1 : Math.min(arrive(k), arrive(k + 1)))

  /** One row of syllables grouped into words, hyphens in the joins. */
  const sung = (
    row: string,
    text: (n: Note) => string,
    under: (n: Note) => string | undefined,
    y: (s: (typeof SOURCE)[number]) => number,
    fallbackDy: number,
  ) => WORDS.map((word, w) => (
    <span className="wgroup" key={w}>
      {word.map((it, j) => {
        const k = GERMAN.indexOf(it)
        return (
          <Fragment key={it.n.id}>
            <span className="syl"
              style={move(row, k, { x: SOURCE[it.i].x, y: y(SOURCE[it.i]) }, fallbackDy)}>
              <b>{text(it.n)}</b>
              {under(it.n) && <i className="ipa">{under(it.n)}</i>}
            </span>
            {j < word.length - 1 && (
              <span className="hyph" style={{ opacity: joinOpacity(k) }}>-</span>
            )}
          </Fragment>
        )
      })}
    </span>
  ))

  return (
    <div className="apparatus" ref={root}>
      {/* The piece itself, still being read. Everything below is a reading
          of these nine notes, and the words come off them. */}
      <svg className="apparatus-staff" viewBox={`0 ${STAFF.y} ${SYS.w} ${STAFF.h}`} width="100%"
        role="img" aria-label="The baritone line: Ich bin ein Fremdling überall, in B minor.">
        <VoiceStaffFurniture g={GEO} width={SYS.w - 14} layout={LAYOUT} lineX0={SYS.staffLeft}
          head={HEAD} />
        {PHRASE.map((n, i) => (
          <g key={n.id}>
            <NoteMarks n={n} x={LAYOUT.xs[i]} y={noteY(n, GEO)} dir={LAYOUT.dirs[i]} g={GEO} />
            <ellipse cx={0} cy={0} rx={ENG.headRx * GEO.gap} ry={ENG.headRy * GEO.gap}
              fill={`var(--t${n.tone ?? 0}-mid)`}
              transform={`translate(${LAYOUT.xs[i]} ${noteY(n, GEO)}) rotate(${ENG.headTilt})`} />
          </g>
        ))}
        {/* The printed German goes with the words that leave it: the row
            below is the same eight syllables, and a score that still shows
            them while they are also set out underneath is saying the line
            twice. The noteheads stay — they are what the table is reading. */}
        <VoiceLyrics g={GEO} layout={LAYOUT} fontSize={12} opacity={1 - arrive(0)} />
      </svg>

      <h2 className="apparatus-thesis">Language and music intertwined</h2>

      <dl className="apparatus-rows">
        <div className="arow">
          <dt>Mandarin</dt>
          <dd className="arow-syl arow-han" data-row="han">
            <ToneScale />
            {HAN.map(({ n, i }, k) => (
              <span key={n.id} className="syl"
                style={move('han', k, { x: SOURCE[i].x, y: SOURCE[i].note }, -46)}>
                <Contour tone={n.tone!} />
                <b className="han">{n.han}</b>
                <i>{n.pinyin}</i>
                <i className="chao">{MANDARIN[n.tone!].chao}</i>
              </span>
            ))}
          </dd>
        </div>

        <div className="arow">
          <dt>German</dt>
          <dd className="arow-syl" data-row="de">
            {sung('de', (n) => n.german!, (n) => n.ipa, (s) => s.lyric, -36)}
          </dd>
        </div>

        <div className="arow">
          <dt>English</dt>
          <dd className="arow-syl arow-en" data-row="en">
            {sung('en', (n) => n.english!, () => undefined, (s) => s.lyric, -24)}
          </dd>
        </div>

        <div className="arow">
          <dt>Harmony</dt>
          <dd className="arow-syl arow-chords" data-row="ch">
            {HARMONY.map((h, k) => (
              <span key={h.atBeat} className="syl"
                style={move('ch', k, { x: xAt(h.atBeat), y: HARMONY_Y }, 44)}>
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
