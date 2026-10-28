import { PHRASE } from '../../data/phrase'
import { SYLLABLES } from '../../data/mandarin'
import { MANDARIN } from '../../data/tones'
import { SYS, barX, xAt } from '../../lib/beatmap'
import { diatonic, noteY, type StaffGeom } from '../../lib/notation'
import { ARROW, FITS, STRONG_BEATS } from '../../lib/prosody'
import { ENG } from '../../lib/smufl'
import { NoteMarks, VoiceLyrics, VoiceStaffFurniture, voiceLayout } from '../score/VoiceStaff'
import { lerp } from '../../lib/easing'
import { staging } from './staging'

/**
 * The singer's staff: notation → Mandarin → code.
 *
 * At the language stop the noteheads do not just move, they become the
 * words: each one travels to the start of its syllable's tone contour and
 * turns into the Han character there, with the tone drawn out of it and the
 * German still sitting underneath. One object, two languages, one pitch —
 * which is the whole argument the room is making, stated in the smallest
 * possible way.
 *
 * Below the syllables runs the metre: a tick at every strong beat of the
 * bar, and under each word a mark saying whether it got the weight its own
 * prosody wanted. See lib/prosody.ts.
 */

export const VOICE_H = 224
const GEO: StaffGeom = { gap: 13, bottomY: 150 }
const HEAD = { clef: SYS.clef, keySig: SYS.keySig, time: SYS.time }

const TONE_TOP = 38
const TONE_BOT = 116
const TONE_H = TONE_BOT - TONE_TOP
/** Where a syllable sits, and where its contour runs, relative to its beat. */
const HAN_DX = -11
const CONTOUR_DX = 3
const SLOT = 21
const PINYIN_Y = TONE_BOT + 20
const METRE_Y = 157

const DATA_BASE = 176
const DATA_H = 104

const PITCH_IDX = PHRASE.map((n) => diatonic(n.step, n.octave))
const P_MIN = Math.min(...PITCH_IDX)
const P_MAX = Math.max(...PITCH_IDX)

const STRESS_COLOUR = {
  match: 'var(--t1-mid)',
  carried: 'var(--t2-mid)',
  mismatch: 'var(--t4-mid)',
} as const
const PITCH_COLOUR = {
  agree: 'var(--t1-mid)',
  clash: 'var(--t4-mid)',
  flat: 'var(--ink-3)',
} as const

export default function VoiceStaves({ p, beat }: { p: number; beat: number | null }) {
  const s = staging(p)
  const L = voiceLayout(GEO, PHRASE, { xAt, barX })
  const xs = L.xs
  const dataY = (i: number) =>
    DATA_BASE - ((PITCH_IDX[i] - P_MIN) / (P_MAX - P_MIN)) * DATA_H
  const sounding = (i: number) =>
    beat !== null && beat >= NOTE_AT(i) - 0.02 && beat < NOTE_AT(i) + PHRASE[i].beats

  return (
    <g>
      {/* ---- state A: the engraved staff ---- */}
      <g opacity={s.oA}>
        <VoiceStaffFurniture g={GEO} width={SYS.w - 14} layout={L} lineX0={SYS.staffLeft} head={HEAD} />
      </g>

      {/* ---- state B: Mandarin ---- */}
      <g opacity={s.oB}>
        <g stroke="var(--rule)" strokeWidth="1" strokeDasharray="2 4">
          {[TONE_TOP, (TONE_TOP + TONE_BOT) / 2, TONE_BOT].map((y) => (
            <line key={y} x1={SYS.staffLeft + 30} y1={y} x2={SYS.x1 + 24} y2={y} />
          ))}
        </g>
        <g fontFamily="var(--font-label)" fontSize="10" fill="var(--ink-3)" textAnchor="end">
          <text x={SYS.staffLeft + 22} y={TONE_TOP + 4}>5</text>
          <text x={SYS.staffLeft + 22} y={TONE_BOT + 4}>1</text>
          <text x={SYS.staffLeft + 22} y={METRE_Y + 4}>BEAT</text>
        </g>

        {/* The bar, as a reader of the score would feel it: a long tick on
            each downbeat, a short one on the second half-note beat. */}
        <g>
          <line x1={SYS.staffLeft + 30} y1={METRE_Y} x2={SYS.x1 + 24} y2={METRE_Y}
            stroke="var(--rule)" strokeWidth="1" />
          {STRONG_BEATS.map(({ beat: b, downbeat }) => (
            <line key={b} x1={xAt(b)} y1={METRE_Y} x2={xAt(b)} y2={METRE_Y - (downbeat ? 11 : 6)}
              stroke={downbeat ? 'var(--accent)' : 'var(--accent-soft)'} strokeWidth={downbeat ? 1.6 : 1.2} />
          ))}
        </g>

        {/* The tone of each syllable, drawn out of the character itself. */}
        {FITS.map((f) => {
          const t = MANDARIN[PHRASE[f.i].tone!]
          const x0 = xs[f.i] + CONTOUR_DX
          const pts = t.contour
            .map((v, j) => `${x0 + (SLOT * j) / (t.contour.length - 1)},${TONE_BOT - v * TONE_H}`)
            .join(' ')
          return (
            <g key={`tone${f.i}`}>
              <polyline points={pts} fill="none" stroke={`var(--${t.family}-mid)`}
                strokeWidth={sounding(f.i) ? 4.5 : 3} strokeLinecap="round" strokeLinejoin="round" />
              {/* where the tune goes next, and whether the tone agrees */}
              <text x={x0 + SLOT / 2} y={TONE_TOP - 11} textAnchor="middle"
                fontFamily="var(--font-label)" fontSize="13" fill={PITCH_COLOUR[f.pitch]}>
                {ARROW[f.melody]}
              </text>
              <text x={xs[f.i]} y={PINYIN_Y} textAnchor="middle" fontFamily="var(--font-body)"
                fontSize="12" fill={`var(--${t.family}-mid)`}>{SYLLABLES[f.s].pinyin}</text>
              <rect x={xs[f.i] - 3} y={METRE_Y + 5} width="6" height="6"
                fill={STRESS_COLOUR[f.stress]} />
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
        const xB = (tone ? xs[i] : xs[parent] ?? xs[i]) + HAN_DX
        const x = lerp(lerp(xs[i], xB, s.tAB), xs[i], s.tBC)
        const y = lerp(lerp(yA, yB, s.tAB), dataY(i), s.tBC)
        const scale = lerp(1, 0.68, s.tBC)
        const dim = sung ? 1 : lerp(1, 0.22, s.tAB)
        const on = sounding(i)
        const fam = `t${n.tone ?? 0}`
        return (
          <g key={n.id} opacity={dim}>
            <NoteMarks n={n} x={x} y={y} dir={L.dirs[i]} g={GEO} opacity={s.oA} />
            {on && <circle cx={x} cy={y} r={15} fill={`var(--${fam}-mid)`} opacity="0.2" />}
            {/* the notehead, and the word it turns into — same place, one
                fading as the other arrives */}
            <ellipse cx={0} cy={0} rx={ENG.headRx * GEO.gap} ry={ENG.headRy * GEO.gap}
              opacity={1 - s.oB}
              fill={`var(--${fam}-${on || s.tBC > 0.5 ? 'deep' : 'mid'})`}
              transform={`translate(${x} ${y}) rotate(${lerp(ENG.headTilt, 0, s.tAB)}) scale(${scale})`} />
            {n.han && (
              <text x={x} y={y + 6} textAnchor="middle" opacity={s.oB}
                fontFamily="var(--font-han)" fontSize="18"
                fill={on ? `var(--${fam}-mid)` : 'var(--ink)'}>{n.han}</text>
            )}
          </g>
        )
      })}

      {/* The German stays at the language stop: the same notes carry both,
          and seeing them stacked is the point. */}
      <VoiceLyrics g={GEO} layout={L} fontSize={12} opacity={1 - s.oC} />

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

/** Beat each note of the phrase begins on. */
const ONSETS = (() => {
  const out: number[] = []
  let at = 0
  for (const n of PHRASE) { out.push(at); at += n.beats }
  return out
})()
const NOTE_AT = (i: number) => ONSETS[i]
