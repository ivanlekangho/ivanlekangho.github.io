import { PHRASE, PIECE, PHRASE_PLACEHOLDER } from '../data/phrase'
import { MANDARIN } from '../data/tones'
import { beatXs, bassClefPath, bassKeySharps, diatonic, noteY, staffLineYs, type StaffGeom } from '../lib/notation'
import { ease, lerp, range, useScrollProgress } from '../lib/useScrollProgress'
import Todo from './Todo'

/* ============================================================
   THE CENTERPIECE

   One note array, three projections, one scroll value.

   The same <ellipse> elements are the noteheads in state 0, the tone-contour
   onsets in state 1, and the data points in state 2. Nothing crossfades
   between three separate graphics — the objects themselves move. That is the
   claim the section is making, so it had better be literally true in the DOM.

   Staging (all off `progress`, 0 → 1). The fades OVERLAP deliberately — if the
   outgoing layer finishes before the incoming one starts, the section goes blank
   mid-scroll, which is exactly the bug this comment exists to prevent:
     0.10–0.30  staff, clef and key signature fade out
     0.18–0.38  tone box and contours fade in, overlapping the staff's exit
     0.38–0.58  plateau: the tone state sits still long enough to be read
     0.58–0.74  contours fade out
     0.62–0.86  data axis and the code panel fade in
   ============================================================ */

const VB = { w: 720, h: 300 }
const GEO: StaffGeom = { gap: 14, bottomY: 182 }

// tone box: normalised pitch 0 (bottom) → 1 (top)
const TONE_TOP = 78
const TONE_BOT = 186
const TONE_H = TONE_BOT - TONE_TOP
const SLOT_W = 26

// data view
const DATA_BASE = 232
const DATA_H = 120

/**
 * The data projection plots MELODIC PITCH, coloured by tone — so the final
 * state carries information from both earlier ones rather than replacing them.
 *
 * The first version keyed bar height off the tone contour's end value, which
 * looked fine in the abstract and was flat in practice: four of the seven
 * syllables are falling tones, all ending at 0, so half the series sat on the
 * baseline. Pitch gives the actual descending shape of the phrase, which is
 * the thing worth showing.
 */
const PITCH_IDX = PHRASE.map((n) => diatonic(n.step, n.octave))
const P_MIN = Math.min(...PITCH_IDX)
const P_MAX = Math.max(...PITCH_IDX)
const dataY = (i: number) => DATA_BASE - ((PITCH_IDX[i] - P_MIN) / (P_MAX - P_MIN)) * DATA_H

export default function Centerpiece() {
  const { ref, progress: p } = useScrollProgress<HTMLDivElement>()
  const xs = beatXs(PHRASE, 128, VB.w - 56)

  // --- layer opacities -------------------------------------------------
  const oStaff = 1 - ease(range(p, 0.10, 0.30))
  const oTone = ease(range(p, 0.18, 0.38)) * (1 - ease(range(p, 0.58, 0.74)))
  const oData = ease(range(p, 0.62, 0.86))
  const oGerman = 1 - ease(range(p, 0.06, 0.22))
  const oHan = ease(range(p, 0.22, 0.38)) * (1 - ease(range(p, 0.62, 0.76)))
  const oCode = ease(range(p, 0.66, 0.86))

  // --- morph weights ---------------------------------------------------
  const tAB = ease(range(p, 0.12, 0.36))  // notation → tone
  const tBC = ease(range(p, 0.58, 0.82))  // tone → data

  const fLineY = GEO.bottomY - 3 * GEO.gap

  const stateLabel =
    p < 0.30 ? 'Notation' : p < 0.62 ? 'Tone' : 'Data'

  return (
    <section id="centerpiece" className="section" style={{ borderTop: '1px solid var(--rule)' }}>
      {/* Tall scroll track. The sticky child is what the reader actually sees. */}
      <div ref={ref} style={{ height: '340vh', position: 'relative' }}>
        <div
          style={{
            position: 'sticky',
            top: 0,
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: 'var(--space-5)',
          }}
        >
          <div className="shell" style={{ width: '100%' }}>
            <p className="eyebrow">
              One phrase, three notations — {stateLabel}
            </p>
            <h2 style={{ fontSize: 'var(--step-2)', maxWidth: '24ch' }}>
              {PIECE.german}
            </h2>
            <p className="muted" style={{ fontSize: 'var(--step--1)', maxWidth: '46ch' }}>
              {PIECE.composer}, <em>{PIECE.title}</em> {PIECE.catalogue} · {PIECE.key},
              baritone · “{PIECE.englishGloss}”
            </p>

            <svg
              viewBox={`0 0 ${VB.w} ${VB.h}`}
              width="100%"
              role="img"
              aria-label={`A single phrase of Schubert's Der Wanderer shown three ways: as bass-clef notation, as the Mandarin tone contours of ${PIECE.mandarin}, and as a data series of pitch coloured by tone. Currently showing: ${stateLabel}.`}
              style={{ display: 'block', overflow: 'visible', marginTop: 'var(--space-4)' }}
            >
              {/* ---------- state 0: staff, clef, key signature ---------- */}
              <g opacity={oStaff}>
                <g stroke="var(--rule)" strokeWidth="1">
                  {staffLineYs(GEO).map((y) => (
                    <line key={y} x1="40" y1={y} x2={VB.w - 20} y2={y} />
                  ))}
                </g>
                <path d={bassClefPath(48, fLineY, GEO)} fill="none" stroke="var(--ink)"
                  strokeWidth={GEO.gap * 0.26} strokeLinecap="round" opacity="0.8" />
                <circle cx={53} cy={fLineY} r={GEO.gap * 0.3} fill="var(--ink)" opacity="0.8" />
                <circle cx={94} cy={fLineY - GEO.gap * 0.5} r={GEO.gap * 0.15} fill="var(--ink)" opacity="0.8" />
                <circle cx={94} cy={fLineY + GEO.gap * 0.5} r={GEO.gap * 0.15} fill="var(--ink)" opacity="0.8" />
                <g stroke="var(--ink-2)" strokeWidth="1.1" fill="none">
                  {bassKeySharps(GEO).map((s, i) => {
                    const x = 104 + s.x
                    return (
                      <g key={i}>
                        <line x1={x} y1={s.y - 12} x2={x} y2={s.y + 9} />
                        <line x1={x + 3.4} y1={s.y - 14} x2={x + 3.4} y2={s.y + 7} />
                        <line x1={x - 2.4} y1={s.y - 3} x2={x + 5.6} y2={s.y - 6} />
                        <line x1={x - 2.4} y1={s.y + 4} x2={x + 5.6} y2={s.y + 1} />
                      </g>
                    )
                  })}
                </g>
              </g>

              {/* ---------- state 1: tone box + contours ---------- */}
              <g opacity={oTone}>
                <g stroke="var(--rule)" strokeWidth="1" strokeDasharray="2 4">
                  <line x1="60" y1={TONE_TOP} x2={VB.w - 20} y2={TONE_TOP} />
                  <line x1="60" y1={(TONE_TOP + TONE_BOT) / 2} x2={VB.w - 20} y2={(TONE_TOP + TONE_BOT) / 2} />
                  <line x1="60" y1={TONE_BOT} x2={VB.w - 20} y2={TONE_BOT} />
                </g>
                <text x="52" y={TONE_TOP + 4} textAnchor="end" fontFamily="var(--font-mono)"
                  fontSize="10" fill="var(--ink-3)">5</text>
                <text x="52" y={TONE_BOT + 4} textAnchor="end" fontFamily="var(--font-mono)"
                  fontSize="10" fill="var(--ink-3)">1</text>
                {PHRASE.map((n, i) => {
                  if (n.tone === undefined) return null
                  const t = MANDARIN[n.tone]
                  const pts = t.contour
                    .map((v, j) => `${xs[i] - SLOT_W / 2 + (SLOT_W * j) / (t.contour.length - 1)},${TONE_BOT - v * TONE_H}`)
                    .join(' ')
                  return (
                    <polyline key={n.id} points={pts} fill="none"
                      stroke={`var(--${t.family}-mid)`} strokeWidth="3"
                      strokeLinecap="round" strokeLinejoin="round" />
                  )
                })}
              </g>

              {/* ---------- state 2: data axis ---------- */}
              <g opacity={oData}>
                <line x1="60" y1={DATA_BASE} x2={VB.w - 20} y2={DATA_BASE}
                  stroke="var(--ink-3)" strokeWidth="1" />
                {PHRASE.map((n, i) => (
                  <line key={n.id} x1={xs[i]} y1={DATA_BASE} x2={xs[i]} y2={dataY(i)}
                    stroke={`var(--t${n.tone ?? 0}-wash)`} strokeWidth="10" strokeLinecap="round" />
                ))}
              </g>

              {/* ---------- the notes themselves: one set, three positions ---------- */}
              {PHRASE.map((n, i) => {
                const yA = noteY(n, GEO)
                const isSyllable = n.tone !== undefined
                const tone = isSyllable ? MANDARIN[n.tone!] : null

                // melisma continuations are not separate syllables: they collapse
                // toward the syllable they belong to and dim, which is exactly
                // what a melisma is.
                const parentIdx = isSyllable
                  ? i
                  : PHRASE.findIndex((m) => m.melisma === n.melisma && m.tone !== undefined)
                const yB = tone
                  ? TONE_BOT - tone.contour[0] * TONE_H
                  : TONE_BOT - MANDARIN[PHRASE[parentIdx]?.tone ?? 0].contour[0] * TONE_H
                const xB = tone ? xs[i] - SLOT_W / 2 : xs[parentIdx] ?? xs[i]

                const yC = dataY(i)
                const xC = xs[i]

                const x = lerp(lerp(xs[i], xB, tAB), xC, tBC)
                const y = lerp(lerp(yA, yB, tAB), yC, tBC)
                const r = lerp(lerp(1, 1, tAB), 0.62, tBC)
                const dim = isSyllable ? 1 : lerp(1, 0.22, tAB)
                const fill = `var(--t${n.tone ?? 0}-${tBC > 0.5 ? 'deep' : 'mid'})`

                return (
                  <g key={n.id} opacity={dim}>
                    {/* stem only exists while we are reading notation */}
                    <line x1={x + 7} y1={y} x2={x + 7} y2={y - 36}
                      stroke="var(--ink)" strokeWidth="1.1" opacity={oStaff * 0.5} />
                    <ellipse cx={x} cy={y} rx={7.3 * r} ry={5.3 * r} fill={fill}
                      transform={`rotate(${lerp(-16, 0, tAB)} ${x} ${y})`} />
                    {n.german && (
                      <text x={xs[i]} y={GEO.bottomY + 36} textAnchor="middle" opacity={oGerman}
                        fontFamily="var(--font-body)" fontSize="12" fill="var(--ink-2)">
                        {n.german}
                      </text>
                    )}
                    {n.han && (
                      <g opacity={oHan}>
                        <text x={xs[i]} y={TONE_BOT + 26} textAnchor="middle"
                          fontFamily="var(--font-han)" fontSize="17" fill="var(--ink)">
                          {n.han}
                        </text>
                        <text x={xs[i]} y={TONE_BOT + 42} textAnchor="middle"
                          fontFamily="var(--font-body)" fontSize="11"
                          fill={`var(--t${n.tone}-deep)`}>
                          {n.pinyin}
                        </text>
                      </g>
                    )}
                  </g>
                )
              })}
            </svg>

            {/* ---------- the code third ---------- */}
            <pre
              aria-hidden={oCode < 0.5}
              style={{
                opacity: oCode,
                marginTop: 'var(--space-4)',
                fontSize: 'var(--step--1)',
                maxWidth: '46rem',
                transition: 'opacity 80ms linear',
              }}
            >{`phrase
  .filter(n => n.han)                     // 7 syllables, 8 notes
  .map(n => [n.han, n.tone, pitch(n)])
// [['我',3,'B3'], ['处',4,'G3'],  ['处',4,'F♯3'], ['皆',1,'E3'],
//  ['为',2,'F♯3'], ['异',4,'D3'], ['客',4,'B2']]`}</pre>

            <p className="muted" style={{ fontSize: 'var(--step--1)', marginTop: 'var(--space-4)', maxWidth: '52ch' }}>
              <span className="han">{PIECE.mandarin}</span> — {PIECE.mandarinPinyin} — “{PIECE.mandarinGloss}”.
              <br />
              {PIECE.mandarinNote}
            </p>
          </div>
        </div>
      </div>

      <div className="shell">
        {PHRASE_PLACEHOLDER && (
          <Todo>
            The melody above is a plausible descending B-minor line, NOT Schubert's
            actual notes — only the syllable and tone mapping is real. Send the score
            page (or just the pitches and rhythms for these eight notes) and this
            becomes the real phrase. Edit src/data/phrase.ts.
          </Todo>
        )}
      </div>
    </section>
  )
}
