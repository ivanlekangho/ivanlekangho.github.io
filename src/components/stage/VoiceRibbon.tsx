import { PHRASE, PIECE } from '../../data/phrase'
import { MANDARIN } from '../../data/tones'
import { diatonic, noteY, type StaffGeom } from '../../lib/notation'
import { NoteMarks, VoiceLyrics, VoiceStaffFurniture, voiceLayout } from '../score/VoiceStaff'
import { lerp } from '../../lib/easing'
import { staging } from './staging'

/**
 * The singer's score: notation → Mandarin tone contour → code.
 *
 * The same ellipses are the noteheads, the tone onsets and the data
 * points. They move; nothing crossfades between three separate pictures.
 *
 * State A is engraved by score/VoiceStaff — the same code that sets the
 * sheet in the recital panel — so this is literally the same two bars of
 * music, dots, flags, barlines and all, and not a simplified sketch of it.
 */

const VB = { w: 700, h: 300 }
const GEO: StaffGeom = { gap: 13, bottomY: 150 }
const TONE_TOP = 56
const TONE_BOT = 156
const TONE_H = TONE_BOT - TONE_TOP
const SLOT = 24
const DATA_BASE = 222
const DATA_H = 112

const PITCH_IDX = PHRASE.map((n) => diatonic(n.step, n.octave))
const P_MIN = Math.min(...PITCH_IDX)
const P_MAX = Math.max(...PITCH_IDX)

export default function VoiceRibbon({ p }: { p: number }) {
  const s = staging(p)
  const L = voiceLayout(GEO, VB.w - 14)
  const xs = L.xs
  const dataY = (i: number) =>
    DATA_BASE - ((PITCH_IDX[i] - P_MIN) / (P_MAX - P_MIN)) * DATA_H

  return (
    <svg viewBox={`0 0 ${VB.w} ${VB.h}`} width="100%" role="img"
      aria-label={`The sung phrase "${PIECE.german}" shown as bass-clef notation, as the Mandarin tone contours of ${PIECE.mandarin}, and as a data series.`}
      style={{ display: 'block', overflow: 'visible' }}>

      {/* ---- state A: the engraved staff ---- */}
      <g opacity={s.oA}>
        <VoiceStaffFurniture g={GEO} width={VB.w - 14} layout={L} />
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
            stroke={`var(--t${n.tone ?? 0}-wash)`} strokeWidth="9" />
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
            <NoteMarks n={n} x={x} y={y} dir={L.dirs[i]} g={GEO} opacity={s.oA} />
            <ellipse cx={0} cy={0} rx={7.4} ry={5.3}
              fill={`var(--t${n.tone ?? 0}-${s.tBC > 0.5 ? 'deep' : 'mid'})`}
              transform={`translate(${x} ${y}) rotate(${lerp(-20, 0, s.tAB)}) scale(${scale})`} />
            {n.han && (
              <g opacity={s.oB}>
                <text x={xs[i]} y={TONE_BOT + 24} textAnchor="middle" fontFamily="var(--font-han)"
                  fontSize="16" fill="var(--ink)">{n.han}</text>
                <text x={xs[i]} y={TONE_BOT + 39} textAnchor="middle" fontFamily="var(--font-mono)"
                  fontSize="10" fill={`var(--t${n.tone}-deep)`}>{n.pinyin}</text>
              </g>
            )}
          </g>
        )
      })}

      <VoiceLyrics g={GEO} layout={L} fontSize={11} opacity={s.oA} />

      {/* ---- state C annotation ---- */}
      <g opacity={s.oC} fontFamily="var(--font-mono)" fontSize="10" fill="var(--ink-3)">
        <text x="40" y={DATA_BASE + 24}>phrase.map(n =&gt; [n.han, n.tone, pitch(n)])</text>
        <text x="40" y={DATA_BASE + 40} fill="var(--ink-2)">
          [['我',3,'F♯3'], ['处',4,'F♯3'], ['处',4,'F♯3'], ['皆',1,'B3'],
        </text>
        <text x="40" y={DATA_BASE + 54} fill="var(--ink-2)">
          &nbsp;['为',2,'E3'], ['异',4,'A3'], ['客',4,'C♯3']]
        </text>
      </g>
    </svg>
  )
}
