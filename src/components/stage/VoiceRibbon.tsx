import { PHRASE } from '../../data/phrase'
import { MANDARIN } from '../../data/tones'
import { SYS, VOICE_ONSET, barX, xAt } from '../../lib/beatmap'
import { diatonic, noteY, type StaffGeom } from '../../lib/notation'
import { NoteMarks, VoiceLyrics, VoiceStaffFurniture, voiceLayout } from '../score/VoiceStaff'
import { FITS, MARK } from '../../lib/toneMelody'
import { lerp } from '../../lib/easing'
import { staging } from './staging'

/**
 * The singer's staff: notation → Mandarin tone contour → code.
 *
 * The same ellipses are the noteheads, the tone onsets and the data
 * points. They move; nothing crossfades between three separate pictures.
 *
 * It draws into the system's own coordinates rather than its own viewBox,
 * because it is the top staff of a vocal score now and has to line up
 * vertically with the piano underneath it.
 */

export const VOICE_H = 224
const GEO: StaffGeom = { gap: 13, bottomY: 150 }
const HEAD = { clef: SYS.clef, keySig: SYS.keySig, time: SYS.time }
const TONE_TOP = 40
const TONE_BOT = 126
const TONE_H = TONE_BOT - TONE_TOP
const SLOT = 26
const DATA_BASE = 176
const DATA_H = 104

const PITCH_IDX = PHRASE.map((n) => diatonic(n.step, n.octave))
const P_MIN = Math.min(...PITCH_IDX)
const P_MAX = Math.max(...PITCH_IDX)

export default function VoiceStaves({ p, beat }: { p: number; beat: number | null }) {
  const s = staging(p)
  const L = voiceLayout(GEO, PHRASE, { xAt, barX })
  const xs = L.xs
  const dataY = (i: number) =>
    DATA_BASE - ((PITCH_IDX[i] - P_MIN) / (P_MAX - P_MIN)) * DATA_H
  const sounding = (i: number) =>
    beat !== null && beat >= VOICE_ONSET[i] - 0.02 && beat < VOICE_ONSET[i] + PHRASE[i].beats

  return (
    <g>
      {/* ---- state A: the engraved staff ---- */}
      <g opacity={s.oA}>
        <VoiceStaffFurniture g={GEO} width={SYS.w - 14} layout={L} lineX0={SYS.staffLeft} head={HEAD} />
      </g>

      {/* ---- state B: tone box ---- */}
      <g opacity={s.oB}>
        <g stroke="var(--rule)" strokeWidth="1" strokeDasharray="2 4">
          {[TONE_TOP, (TONE_TOP + TONE_BOT) / 2, TONE_BOT].map((y) => (
            <line key={y} x1={SYS.staffLeft + 30} y1={y} x2={SYS.x1 + 20} y2={y} />
          ))}
        </g>
        <text x={SYS.staffLeft + 22} y={TONE_TOP + 4} textAnchor="end" fontFamily="var(--font-label)" fontSize="10" fill="var(--ink-3)">5</text>
        <text x={SYS.staffLeft + 22} y={TONE_BOT + 4} textAnchor="end" fontFamily="var(--font-label)" fontSize="10" fill="var(--ink-3)">1</text>
        {/* The tone contour in colour, and over it, from the same starting
            point, the direction Schubert's melody actually takes from this
            syllable to the next. Where the two lines diverge, a sung Mandarin
            word is fighting the tune it is set to. */}
        {PHRASE.map((n, i) => {
          if (n.tone === undefined) return null
          const t = MANDARIN[n.tone]
          const x0 = xs[i] - SLOT / 2
          const y0 = TONE_BOT - t.contour[0] * TONE_H
          const pts = t.contour
            .map((v, j) => `${x0 + (SLOT * j) / (t.contour.length - 1)},${TONE_BOT - v * TONE_H}`)
            .join(' ')
          const fit = FITS.find((f) => f.i === i)
          const rise = fit?.melody === 'up' ? -1 : fit?.melody === 'down' ? 1 : 0
          const y1 = Math.min(TONE_BOT, Math.max(TONE_TOP, y0 + rise * TONE_H * 0.34))
          const mood = fit?.verdict === 'agree' ? 'var(--t1-mid)'
            : fit?.verdict === 'clash' ? 'var(--t4-mid)' : 'var(--ink-3)'
          return (
            <g key={n.id}>
              <line x1={x0} y1={y0} x2={x0 + SLOT} y2={y1}
                stroke="var(--ink-2)" strokeWidth="1.2" strokeDasharray="3 3" opacity="0.8" />
              <polyline points={pts} fill="none" stroke={`var(--${t.family}-mid)`}
                strokeWidth={sounding(i) ? 4.5 : 3} strokeLinecap="round" strokeLinejoin="round" />
              {fit && (
                <text x={xs[i]} y={TONE_TOP - 13} textAnchor="middle" fontFamily="var(--font-label)"
                  fontSize="14" fill={mood}>{MARK[fit.verdict]}</text>
              )}
            </g>
          )
        })}
      </g>

      {/* ---- state C: data axis ---- */}
      <g opacity={s.oC}>
        <line x1={SYS.staffLeft + 30} y1={DATA_BASE} x2={SYS.x1 + 20} y2={DATA_BASE} stroke="var(--ink-3)" strokeWidth="1" />
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
        const on = sounding(i)
        const scale = lerp(1, 0.68, s.tBC) * (on ? 1.5 : 1)
        const dim = sung ? 1 : lerp(1, 0.22, s.tAB)
        const fam = `t${n.tone ?? 0}`
        return (
          <g key={n.id} opacity={dim}>
            <NoteMarks n={n} x={x} y={y} dir={L.dirs[i]} g={GEO} opacity={s.oA} />
            {on && (
              <circle cx={x} cy={y} r={15} fill={`var(--${fam}-mid)`} opacity="0.2" />
            )}
            <ellipse cx={0} cy={0} rx={7.4} ry={5.3}
              fill={`var(--${fam}-${on || s.tBC > 0.5 ? 'deep' : 'mid'})`}
              style={{ transition: 'none' }}
              transform={`translate(${x} ${y}) rotate(${lerp(-20, 0, s.tAB)}) scale(${scale})`} />
            {n.han && (
              <g opacity={s.oB}>
                <text x={xs[i]} y={TONE_BOT + 25} textAnchor="middle" fontFamily="var(--font-han)"
                  fontSize="20" fill={on ? `var(--${fam}-mid)` : 'var(--ink)'}>{n.han}</text>
                <text x={xs[i]} y={TONE_BOT + 40} textAnchor="middle" fontFamily="var(--font-body)"
                  fontSize="12" fill={`var(--${fam}-mid)`}>{n.pinyin}</text>
              </g>
            )}
          </g>
        )
      })}

      <VoiceLyrics g={GEO} layout={L} fontSize={12} opacity={s.oA} />

      {/* ---- state C annotation ---- */}
      <g opacity={s.oC} fontFamily="var(--font-mono)" fontSize="10" fill="var(--ink-3)">
        <text x={SYS.staffLeft + 30} y={DATA_BASE + 22}>phrase.map(n =&gt; [n.han, n.tone, pitch(n)])</text>
        <text x={SYS.staffLeft + 30} y={DATA_BASE + 36} fill="var(--ink-2)">
          [['我',3,'F♯3'], ['处',4,'F♯3'], ['处',4,'F♯3'], ['皆',1,'B3'],
        </text>
        <text x={SYS.staffLeft + 30} y={DATA_BASE + 48} fill="var(--ink-2)">
          &nbsp;['为',2,'E3'], ['异',4,'A3'], ['客',4,'C♯3']]
        </text>
      </g>
    </g>
  )
}
