import { Fragment, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { PHRASE, type Note } from '../../data/phrase'
import { HARMONY } from '../../data/piano'
import { MANDARIN, type ToneId } from '../../data/tones'
import { SYS, barX, xAt } from '../../lib/beatmap'
import { ease, range } from '../../lib/easing'
import { noteY } from '../../lib/notation'
import { ENG } from '../../lib/smufl'
import { NoteMarks, VoiceLyrics, VoiceStaffFurniture, voiceLayout } from '../score/VoiceStaff'
import { RH_MID } from './PianoRibbon'
import { FRAME } from './Score'
import { GEO } from './VoiceRibbon'

/**
 * The language stop: the sung line, and the same line written out four ways.
 *
 * The baritone's own staff stays at the top of the screen, and every row
 * underneath sits on the staff's own axis — each syllable, each chord symbol,
 * directly under the note or the beat it belongs to. That is the whole
 * claim. Spread evenly across the row instead, which is what this was, the
 * four rows are four lists of the same length and a reader has to take it on
 * trust that the fourth syllable goes with the fourth note.
 *
 * The arrival says the same thing in motion: the German leaves the printed
 * lyrics, the Mandarin leaves the noteheads, and the chord symbols leave the
 * pianist's own staff, which is on the screen before this one. Nothing
 * crosses the room to get where it is going — with the rows on the staff's
 * axis, every one of them travels straight down (or, for the chords,
 * straight up) out of the thing it is a reading of.
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

/**
 * The crop on the voice staff.
 *
 * It opens at exactly the top of the full system's own frame, and it is
 * drawn in the same box, at the same width, with no vertical letterboxing —
 * so the singer's staff lands on the same pixels in both screens. Crossing
 * from the music stop to this one the staff does not move at all: the
 * pianist's two staves simply leave from under it.
 */
const STAFF = { y: FRAME[0].y, h: 200 - FRAME[0].y }
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

/** The chords have no sign of their own on a singer's page: they are in the
 *  pianist's hands, a staff and a half further down. That is where the
 *  symbols start from, at the x of the beat they fall on — the same pixels
 *  the chord itself occupied a moment earlier. */
const HARMONY_Y = RH_MID

/**
 * x as a share of the drawing's width.
 *
 * The staff is drawn with no letterboxing in either direction (see
 * .apparatus-staff), so a note at x in the system's coordinates is at
 * exactly this share of the row's width. That is what lets every row sit on
 * the staff's axis without measuring anything: one number per item, and the
 * browser does the rest at every width.
 */
const pct = (x: number) => `${((x / SYS.w) * 100).toFixed(3)}%`

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
/** One contour's width on screen. The rules stop half a contour past the
 *  outermost one, the way a staff stops at its barline. */
const TONE_W = 28

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
  const pts = t.contour
    .map((v, i) => `${2 + (i / (t.contour.length - 1)) * (TONE_W - 4)},${toneY(v)}`)
    .join(' ')
  return (
    <svg className="tone-line" viewBox={`0 0 ${TONE_W} ${TONE_H}`} preserveAspectRatio="none"
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

/** The tone scale's own extent: it is the scale for these contours, so it
 *  runs from the first of them to the last and stops there. */
const HAN_BAND = {
  '--band-l': pct(SOURCE[HAN[0].i].x),
  '--band-r': pct(SYS.w - SOURCE[HAN[HAN.length - 1].i].x),
} as CSSProperties

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
 * Measured rather than derived: a row's items are placed by percentage, but
 * what a syllable's ink does inside that placement depends on its own width
 * and on the font that arrived. Transforms do not affect layout, so a slot
 * still reports correctly while its word is mid-flight, and the observer
 * cannot loop.
 */
type Row = { left: number; top: number; w: number; at: Slot[] }
/** A word's centre in the row, and the edges of its ink: a hyphen goes in
 *  the gap between two words, which is not the midpoint of their notes
 *  unless they happen to be the same width. */
type Slot = { x: number; y: number; l: number; r: number }

/**
 * Offset of an element within an ancestor, walking the offsetParent chain.
 *
 * Not a single offsetLeft: applying a transform to an element makes THAT
 * one the next one's offsetParent, so the number of hops changes while the
 * animation runs. Walking the chain is the only measurement that does not
 * depend on which elements happen to be moving at the time.
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
          w: r.width,
          /* The word inside the cell, not the cell: a Mandarin cell also
             holds a contour above and its pinyin below, so aiming the box
             centre at a notehead lands the character somewhere else. */
          at: [...row.querySelectorAll<HTMLElement>('.syl')].map((cell) => {
            const g = (cell.querySelector('b') ?? cell) as HTMLElement
            const o = offsetIn(g, row)
            return {
              x: o.x + g.offsetWidth / 2, y: o.y + g.offsetHeight / 2,
              l: o.x, r: o.x + g.offsetWidth,
            }
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

  /** One staggered 0→1 ramp, so a row acts in the order the phrase is sung. */
  const span = (i: number, a: number, b: number) =>
    settled ? 1 : ease(range(p, a + i * 0.004, b + i * 0.004))

  /**
   * Two clocks, because the rows do not all come off the same thing.
   *
   * The German, the English and the Mandarin leave the voice staff, which
   * THIS screen also carries — so they wait until the crossfade is over and
   * the staff they are leaving is the one you are looking at. The chords
   * leave the pianist, who is only on the screen before this one, so they
   * go while it is still there: the symbol lifts off the chord as the staff
   * that printed it dissolves.
   */
  const arrive = (i: number) => span(i, 0.30, 0.465)
  const arriveChord = (i: number) => span(i, 0.15, 0.36)

  /**
   * And one more, just before each item moves: it is the SAME WORD in two
   * typefaces at the same spot — 12px engraved under the staff, table type
   * in the row — and both at once reads as a bad shadow rather than as one
   * thing becoming another. So the printed lyric hands over in place (see
   * VoiceLyrics below), and a character grows out of its notehead instead
   * of being stamped on top of it.
   */
  const emerge = (i: number) => span(i, 0.25, 0.32)
  const emergeChord = (i: number) => span(i, 0.11, 0.18)

  /**
   * Travel for one item: from the music out to its slot in the row.
   *
   * dx comes out near zero now and that is the point — the rows are on the
   * staff's axis, so a syllable's slot IS its note's x and the only journey
   * left is straight down. It is still measured rather than assumed, because
   * what the ink does inside the slot depends on the word's own width.
   *
   * With the staff's axis in hand the start is the note (or the chord)
   * itself; without it — before the first measurement, or if the frame is
   * degenerate — the item simply rises into place, which is a worse
   * animation rather than a broken one.
   */
  const travel = (
    row: string, i: number,
    src: { x: number; y: number }, fallbackDy: number,
  ) => {
    const r = geo.rows[row]
    const slot = r?.at[i]
    if (!r || !slot || !geo.axis) return { dx: 0, dy: fallbackDy }
    return {
      dx: geo.axis.x0 + src.x * geo.axis.k - (r.left + slot.x),
      dy: geo.axis.y0 + src.y * geo.axis.k - (r.top + slot.y) + (INK_Y[row] ?? 0),
    }
  }

  /** An item's place on the staff's axis, what is left of its travel, and
   *  how much of it has arrived. Layout, transform and opacity compose. */
  const place = (
    x: number, t: number, o: number, d?: { dx: number; dy: number },
  ) => {
    const u = 1 - t
    return {
      '--x': pct(x),
      opacity: o < 1 ? o : undefined,
      transform: d && t < 1
        ? `translate(${(d.dx * u).toFixed(1)}px, ${(d.dy * u).toFixed(1)}px)`
        : undefined,
    } as CSSProperties
  }

  /**
   * A hyphen between syllables k and k+1 of a row: placed in the middle of
   * the gap their ink leaves, as a share of the row's width, and fading in
   * with whichever of its two halves is later.
   */
  const join = (row: string, k: number, dy: number, srcX: number): CSSProperties => {
    const r = geo.rows[row]
    const a = r?.at[k]
    const b = r?.at[k + 1]
    const o = Math.min(emerge(k), emerge(k + 1))
    const t = arrive(k)
    /* Before the first measurement there is nothing to split, so it sits at
       the midpoint of the two notes — right for every pair but the tightest. */
    if (!r || !a || !b || !geo.axis) {
      return place(srcX, t, o, { dx: 0, dy })
    }
    const x = (a.r + b.l) / 2
    const u = 1 - t
    return {
      '--x': `${((x / r.w) * 100).toFixed(3)}%`,
      opacity: o < 1 ? o : undefined,
      transform: t < 1
        ? `translate(${((geo.axis.x0 + srcX * geo.axis.k - (r.left + x)) * u).toFixed(1)}px, ${(dy * u).toFixed(1)}px)`
        : undefined,
    } as CSSProperties
  }

  /**
   * One row of sung syllables, each under its own note, with a hyphen
   * inside every word that is sung across more than one of them — which is
   * where a vocal score prints it, and only possible at all now that the
   * syllables are where the notes are.
   */
  const sung = (
    row: string,
    text: (n: Note) => string,
    under: (n: Note) => string | undefined,
    y: (s: (typeof SOURCE)[number]) => number,
    fallbackDy: number,
  ) => GERMAN.map((it, k) => {
    const next = GERMAN[k + 1]
    const d = travel(row, k, { x: SOURCE[it.i].x, y: y(SOURCE[it.i]) }, fallbackDy)
    return (
      <Fragment key={it.n.id}>
        <span className="syl" style={place(SOURCE[it.i].x, arrive(k), emerge(k), d)}>
          <b>{text(it.n)}</b>
          {under(it.n) && <i className="ipa">{under(it.n)}</i>}
        </span>
        {/* The hyphen is printed under the staff too, so it comes down with
            the word rather than appearing once the word has landed — from
            the engraved one's place, which is the midpoint of the two notes,
            to the middle of the gap the two words actually leave. Those are
            not the same point: "v'ry" and "where" are a beat apart and very
            different widths, and a dash put at the midpoint of their notes
            lands on the W. */}
        {it.n.hyphenAfter && next && (
          <span className="hyph" style={join(row, k, d.dy,
            (SOURCE[it.i].x + SOURCE[next.i].x) / 2)}>-</span>
        )}
      </Fragment>
    )
  })

  return (
    <div className="apparatus" ref={root}>
      {/* The piece itself, still being read. Everything below is a reading
          of these nine notes, on their axis, and the words come off them. */}
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
        <VoiceLyrics g={GEO} layout={LAYOUT} fontSize={12} opacity={1 - emerge(0)} />
      </svg>

      <h2 className="apparatus-thesis">Language and music intertwined</h2>

      <dl className="apparatus-rows">
        <div className="arow">
          <dt>Mandarin</dt>
          <dd className="arow-syl arow-han" data-row="han" style={HAN_BAND}>
            <ToneScale />
            {HAN.map(({ n, i }, k) => (
              <span key={n.id} className="syl"
                style={place(SOURCE[i].x, arrive(k), emerge(k),
                  travel('han', k, { x: SOURCE[i].x, y: SOURCE[i].note }, -46))}>
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
          <dd className="arow-syl arow-sung" data-row="de">
            {sung('de', (n) => n.german!, (n) => n.ipa, (s) => s.lyric, -36)}
          </dd>
        </div>

        <div className="arow">
          <dt>English</dt>
          <dd className="arow-syl arow-sung arow-en" data-row="en">
            {sung('en', (n) => n.english!, () => undefined, (s) => s.lyric, -24)}
          </dd>
        </div>

        <div className="arow">
          <dt>Harmony</dt>
          <dd className="arow-syl arow-chords" data-row="ch">
            {HARMONY.map((h, k) => (
              <span key={h.atBeat} className="syl"
                style={place(xAt(h.atBeat), arriveChord(k), emergeChord(k),
                  travel('ch', k, { x: xAt(h.atBeat), y: HARMONY_Y }, 44))}>
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
