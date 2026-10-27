import { PHRASE, PIECE } from '../../data/phrase'
import { MANDARIN } from '../../data/tones'
import {
  bassClef, bassKeySharps, beatXs, diatonic, noteheadPath, noteY,
  staffLineYs, wobble, type StaffGeom,
} from '../../lib/notation'
import { lerp } from '../../lib/easing'
import { staging } from './staging'

/**
 * The singer's score: notation → Mandarin tone contour → code.
 *
 * The same <path> noteheads are the noteheads, the tone onsets and the data
 * points. They move; nothing crossfades between three separate pictures.
 */

const VB = { w: 700, h: 290 }
const GEO: StaffGeom = { gap: 13, bottomY: 150 }
const TONE_TOP = 56
const TONE_BOT = 156
const TONE_H = TONE_BOT - TONE_TOP
const SLOT = 24
const DATA_BASE = 214
const DATA_H = 110

const PITCH_IDX = PHRASE.map((n) => diatonic(n.step, n.octave))
const P_MIN = Math.min(...PITCH_IDX)
const P_MAX = Math.max(...PITCH_IDX)

export default function VoiceRibbon({ p }: { p: number }) {
  const s = staging(p)
  const xs = beatXs(PHRASE, 104, VB.w - 40)
  const fLineY = GEO.bottomY - 3 * GEO.gap
  const clef = bassClef(10, fLineY, GEO)
  const dataY = (i: number) =>
    DATA_BASE - ((PITCH_IDX[i] - P_MIN) / (P_MAX - P_MIN)) * DATA_H

  return (
    <svg viewBox={`0 0 ${VB.w} ${VB.h}`} width="100%" role="img"
      aria-label={`The sung phrase "${PIECE.german}" shown as bass-clef notation, as the Mandarin tone contours of ${PIECE.mandarin}, and as a data series.`}
      style={{ display: 'block', overflow: 'visible' }}>

      {/* ---- state A: staff ---- */}
      <g opacity={s.oA}>
        <g stroke="var(--staff)" strokeWidth="1">
          {staffLineYs(GEO).map((y) => <line key={y} x1="4" y1={y} x2={VB.w - 20} y2={y} />)}
        </g>
        <g opacity="0.85">
          <path d={clef.curl} fill="none" stroke="var(--ink)" strokeWidth={GEO.gap * 0.22} strokeLinecap="round" />
          <circle {...clef.head} fill="var(--ink)" />
          {clef.dots.map((d, i) => <circle key={i} {...d} fill="var(--ink)" />)}
        </g>
        <g stroke="var(--ink-2)" strokeWidth="1" fill="none" strokeLinecap="round">
          {bassKeySharps(GEO).map((k, i) => {
            const x = 62 + k.x
            return (
              <g key={i}>
                <line x1={x} y1={k.y - 11} x2={x} y2={k.y + 8} />
                <line x1={x + 4} y1={k.y - 13} x2={x + 4} y2={k.y + 6} />
                <line x1={x - 3} y1={k.y - 2} x2={x + 7} y2={k.y - 4} />
                <line x1={x - 3} y1={k.y + 4} x2={x + 7} y2={k.y + 2} />
              </g>
            )
          })}
        </g>
      </g>

      {/* ---- state B: tone box ---- */}
      <g opacity={s.oB}>
        <g stroke="var(--rule)" strokeWidth="1" strokeDasharray="2 4">
          {[TONE_TOP, (TONE_TOP + TONE_BOT) / 2, TONE_BOT].map((y) => (
            <line key={y} x1="40" y1={y} x2={VB.w - 20} y2={y} />
          ))}
        </g>
        <text x="32" y={TONE_TOP + 4} textAnchor="end" fontFamily="var(--font-mono)" fontSize="9" fill="var(--ink-3)">5</text>
        <text x="32" y={TONE_BOT + 4} textAnchor="end" fontFamily="var(--font-mono)" fontSize="9" fill="var(--ink-3)">1</text>
        {PHRASE.map((n, i) => {
          if (n.tone === undefined) return null
          const t = MANDARIN[n.tone]
          const pts = t.contour
            .map((v, j) => `${xs[i] - SLOT / 2 + (SLOT * j) / (t.contour.length - 1)},${TONE_BOT - v * TONE_H}`)
            .join(' ')
          return <polyline key={n.id} points={pts} fill="none" stroke={`var(--${t.family}-mid)`}
            strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        })}
      </g>

      {/* ---- state C: data axis ---- */}
      <g opacity={s.oC}>
        <line x1="40" y1={DATA_BASE} x2={VB.w - 20} y2={DATA_BASE} stroke="var(--ink-3)" strokeWidth="1" />
        {PHRASE.map((n, i) => (
          <line key={n.id} x1={xs[i]} y1={DATA_BASE} x2={xs[i]} y2={dataY(i)}
            stroke={`var(--t${n.tone ?? 0}-wash)`} strokeWidth="9" strokeLinecap="round" />
        ))}
      </g>

      {/* ---- the notes: one set, three positions ---- */}
      {PHRASE.map((n, i) => {
        const yA = noteY(n, GEO)
        const sung = n.tone !== undefined
        const tone = sung ? MANDARIN[n.tone!] : null
        const parent = sung ? i : PHRASE.findIndex((m) => m.hanGroup === n.hanGroup && m.tone !== undefined)
        const yB = tone
          ? TONE_BOT - tone.contour[0] * TONE_H
          : TONE_BOT - MANDARIN[PHRASE[parent]?.tone ?? 0].contour[0] * TONE_H
        const xB = tone ? xs[i] - SLOT / 2 : xs[parent] ?? xs[i]
        const x = lerp(lerp(xs[i], xB, s.tAB), xs[i], s.tBC)
        const y = lerp(lerp(yA, yB, s.tAB), dataY(i), s.tBC)
        const scale = lerp(1, 0.68, s.tBC)
        const dim = sung ? 1 : lerp(1, 0.22, s.tAB)
        return (
          <g key={n.id} opacity={dim}>
            <line x1={x + 6} y1={y} x2={x + 6} y2={y - 32} stroke="var(--ink)" strokeWidth="1.1" opacity={s.oA * 0.5} />
            <path d={noteheadPath(7, 5, n.id)} fill={`var(--t${n.tone ?? 0}-${s.tBC > 0.5 ? 'deep' : 'mid'})`}
              transform={`translate(${x} ${y}) rotate(${lerp(-16 + wobble(n.id, 5) * 7, 0, s.tAB)}) scale(${scale})`} />
            {n.german && (
              <text x={xs[i]} y={GEO.bottomY + 32} textAnchor="middle" opacity={s.oA}
                fontFamily="var(--font-body)" fontSize="11" fill="var(--ink-2)">{n.german}</text>
            )}
            {n.han && (
              <g opacity={s.oB}>
                <text x={xs[i]} y={TONE_BOT + 24} textAnchor="middle" fontFamily="var(--font-han)"
                  fontSize="16" fill="var(--ink)">{n.han}</text>
                <text x={xs[i]} y={TONE_BOT + 39} textAnchor="middle" fontFamily="var(--font-body)"
                  fontSize="10" fill={`var(--t${n.tone}-deep)`}>{n.pinyin}</text>
              </g>
            )}
          </g>
        )
      })}

      {/* ---- state C annotation ---- */}
      <g opacity={s.oC} fontFamily="var(--font-mono)" fontSize="10" fill="var(--ink-3)">
        <text x="40" y={DATA_BASE + 22}>phrase.map(n =&gt; [n.han, n.tone, pitch(n)])</text>
        <text x="40" y={DATA_BASE + 38} fill="var(--ink-2)">
          [['我',3,'F♯3'], ['处',4,'F♯3'], ['处',4,'F♯3'], ['皆',1,'B3'],
        </text>
        <text x="40" y={DATA_BASE + 52} fill="var(--ink-2)">
          &nbsp;['为',2,'E3'], ['异',4,'A3'], ['客',4,'C♯3']]
        </text>
      </g>
    </svg>
  )
}
