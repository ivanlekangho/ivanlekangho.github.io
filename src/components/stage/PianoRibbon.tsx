import { HARMONY, LH, RH, type PianoEvent } from '../../data/piano'
import { hz, label, midi, ratioTo, type Pitch } from '../../lib/tuning'
import {
  bassClef, bassKeySharps, diatonic, ledgersFor, noteheadPath, quarterRestPath,
  stepYFrom, staffLineYs, TREBLE_BOTTOM, trebleClef, wobble, type StaffGeom,
} from '../../lib/notation'
import { lerp } from '../../lib/easing'
import { staging } from './staging'

/**
 * The pianist's score: notation → harmony → physics.
 *
 * Same contract as the singer's ribbon — one set of noteheads, three
 * projections — but the three readings are the ones a pianist would give:
 * what's on the page, what the chords are doing, and what the air is doing.
 *
 *   A  grand staff, as written
 *   B  functional harmony: chord blocks, roman numerals, common tones held
 *      between chords drawn as the horizontal lines they actually are
 *   C  physics: every note at its true log frequency, each carrying a sine
 *      whose wavelength is its own, plus the whole-number ratios that make
 *      the final chord lock
 */

const VB = { w: 760, h: 340 }
const TREBLE: StaffGeom = { gap: 11, bottomY: 86 }
const BASS: StaffGeom = { gap: 11, bottomY: 196 }
const BASS_BOTTOM_IDX = diatonic('G', 2)

/** Every onset in the phrase, both hands, plus the final barline. */
const ONSETS = [0, 0.5, 1.5, 2.0, 2.5, 4.0, 4.5, 5.5, 6.5, 7.5, 8.5]
const X0 = 108
const X1 = VB.w - 34

const xMap = (() => {
  const w = ONSETS.slice(1).map((b, i) => Math.pow(b - ONSETS[i], 0.6))
  const total = w.reduce((a, b) => a + b, 0)
  const out = new Map<number, number>()
  let acc = 0
  ONSETS.forEach((b, i) => {
    out.set(b, X0 + ((X1 - X0) * acc) / total)
    if (i < w.length) acc += w[i]
  })
  return out
})()
const xAt = (beat: number) => xMap.get(beat) ?? X0

/** Flatten both hands into one list of sounding notes with absolute onsets. */
type Flat = {
  key: string
  pitch: Pitch
  hand: 'rh' | 'lh'
  atBeat: number
  event: PianoEvent
  /** right-displaced because a neighbour sits a second away */
  shift: boolean
}

function flatten(events: PianoEvent[], hand: 'rh' | 'lh'): Flat[] {
  const out: Flat[] = []
  let at = 0
  for (const e of events) {
    const sorted = [...e.pitches].sort((a, b) => midi(a) - midi(b))
    let prevIdx = -99
    let prevShift = false
    sorted.forEach((pitch, j) => {
      const idx = diatonic(pitch.step, pitch.octave)
      // seconds can't share a column, so the upper note of the pair moves right
      const shift = idx - prevIdx === 1 && !prevShift
      out.push({ key: `${e.id}-${j}`, pitch, hand, atBeat: at, event: e, shift })
      prevIdx = idx
      prevShift = shift
    })
    at += e.beats
  }
  return out
}

const NOTES: Flat[] = [...flatten(RH, 'rh'), ...flatten(LH, 'lh')]
const RESTS = [
  ...RH.map((e, i) => ({ e, at: RH.slice(0, i).reduce((s, x) => s + x.beats, 0), g: TREBLE })),
  ...LH.map((e, i) => ({ e, at: LH.slice(0, i).reduce((s, x) => s + x.beats, 0), g: BASS })),
].filter((r) => r.e.rest && r.e.beats >= 1)

const staffY = (f: Flat) =>
  f.hand === 'rh'
    ? stepYFrom(diatonic(f.pitch.step, f.pitch.octave), TREBLE_BOTTOM, TREBLE)
    : stepYFrom(diatonic(f.pitch.step, f.pitch.octave), BASS_BOTTOM_IDX, BASS)

/* ---- B: compact pitch band, so common tones line up horizontally ---- */
const B_TOP = 74
const B_BOT = 178
const MIDI_LO = Math.min(...NOTES.map((n) => midi(n.pitch)))
const MIDI_HI = Math.max(...NOTES.map((n) => midi(n.pitch)))
const harmonyY = (f: Flat) =>
  B_BOT - ((midi(f.pitch) - MIDI_LO) / (MIDI_HI - MIDI_LO)) * (B_BOT - B_TOP)

/* ---- C: true log frequency, spread wider ---- */
const C_TOP = 44
const C_BOT = 228
const F_LO = Math.log2(Math.min(...NOTES.map((n) => hz(n.pitch))))
const F_HI = Math.log2(Math.max(...NOTES.map((n) => hz(n.pitch))))
const physicsY = (f: Flat) =>
  C_BOT - ((Math.log2(hz(f.pitch)) - F_LO) / (F_HI - F_LO)) * (C_BOT - C_TOP)

/**
 * Which notes actually get a written accidental.
 *
 * Two rules, both of which a musician notices immediately if you break them:
 * the key signature already sharpens F and C, and an accidental holds for the
 * rest of its bar at that exact staff position. So the D♯ on the first of the
 * two beamed chords is written and the identical D♯ on the second is not.
 */
const BARLINES = [0.5, 4.5]
const WRITTEN: Set<string> = (() => {
  const out = new Set<string>()
  const inForce = new Map<string, string>()   // "D4" -> "sharp"
  let bar = -1
  for (const n of [...NOTES].sort((a, b) => a.atBeat - b.atBeat)) {
    const b = BARLINES.filter((x) => x <= n.atBeat).length
    if (b !== bar) { inForce.clear(); bar = b }
    const slot = `${n.pitch.step}${n.pitch.octave}`
    const fromKey = n.pitch.step === 'F' || n.pitch.step === 'C' ? 'sharp' : 'natural'
    const sounding = n.pitch.accidental ?? fromKey
    if ((inForce.get(slot) ?? fromKey) !== sounding) out.add(n.key)
    inForce.set(slot, sounding)
  }
  return out
})()

/** Notes held between consecutive chords — the lines a listener actually hears. */
const COMMON: { x1: number; x2: number; y: number }[] = []
for (let i = 0; i < HARMONY.length - 1; i++) {
  const a = NOTES.filter((n) => n.atBeat === HARMONY[i].atBeat)
  const b = NOTES.filter((n) => n.atBeat === HARMONY[i + 1].atBeat)
  for (const n of a) {
    const m = b.find((o) => midi(o.pitch) === midi(n.pitch))
    if (m) COMMON.push({ x1: xAt(n.atBeat), x2: xAt(m.atBeat), y: harmonyY(n) })
  }
}

/**
 * Sine for the physics view: each note drawn at its own wavelength, so a note
 * an octave up visibly oscillates twice as fast. Length is capped at the gap
 * to the next chord — letting every wave run a fixed 52px made neighbouring
 * chords overlap into scribble, which read as noise rather than as physics.
 */
function sine(x: number, y: number, f: number, fRef: number, len: number, amp = 4) {
  const wl = Math.max(4.5, 30 * (fRef / f))
  const pts: string[] = []
  for (let t = 0; t <= len; t += 1.5) {
    pts.push(`${(x + t).toFixed(1)},${(y - amp * Math.sin((2 * Math.PI * t) / wl)).toFixed(1)}`)
  }
  return pts.join(' ')
}
const F_REF = Math.min(...NOTES.map((n) => hz(n.pitch)))

/** How far a note's wave may run before the next chord needs the space. */
function waveLen(atBeat: number) {
  const next = ONSETS.find((b) => b > atBeat)
  const room = next === undefined ? 56 : xAt(next) - xAt(atBeat) - 10
  return Math.max(16, Math.min(54, room))
}

/** The closing D major chord, used for the ratio annotation. */
const FINAL = NOTES.filter((n) => n.atBeat === 6.5).sort((a, b) => midi(a.pitch) - midi(b.pitch))

export default function PianoRibbon({ p }: { p: number }) {
  const s = staging(p)

  return (
    <svg viewBox={`0 0 ${VB.w} ${VB.h}`} width="100%" role="img"
      aria-label="The piano accompaniment shown three ways: as a grand staff, as a harmonic analysis moving from B minor to D major, and as the frequencies and whole-number ratios the chords are built from."
      style={{ display: 'block', overflow: 'visible' }}>

      {/* ---------- A: grand staff ---------- */}
      <g opacity={s.oA}>
        <g stroke="var(--staff)" strokeWidth="1">
          {staffLineYs(TREBLE).map((y) => <line key={`t${y}`} x1="30" y1={y} x2={VB.w - 16} y2={y} />)}
          {staffLineYs(BASS).map((y) => <line key={`b${y}`} x1="30" y1={y} x2={VB.w - 16} y2={y} />)}
        </g>
        {/* brace and the line joining the staves */}
        <path d={`M 22,${TREBLE.bottomY - 4 * TREBLE.gap} C 6,${TREBLE.bottomY - 2 * TREBLE.gap} 6,${BASS.bottomY - 2 * BASS.gap} 22,${BASS.bottomY}`}
          fill="none" stroke="var(--ink)" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
        <line x1="30" y1={TREBLE.bottomY - 4 * TREBLE.gap} x2="30" y2={BASS.bottomY} stroke="var(--staff)" strokeWidth="1.2" />

        {(() => {
          const t = trebleClef(48, TREBLE.bottomY - TREBLE.gap, TREBLE)
          return (
            <g fill="none" stroke="var(--ink)" strokeWidth={TREBLE.gap * 0.19}
              strokeLinecap="round" opacity="0.85">
              <path d={t.stem} /><path d={t.body} /><path d={t.tail} />
            </g>
          )
        })()}
        {(() => {
          const c = bassClef(40, BASS.bottomY - 3 * BASS.gap, BASS)
          return (
            <g opacity="0.85">
              <path d={c.curl} fill="none" stroke="var(--ink)" strokeWidth={BASS.gap * 0.22} strokeLinecap="round" />
              <circle {...c.head} fill="var(--ink)" />
              {c.dots.map((d, i) => <circle key={i} {...d} fill="var(--ink)" />)}
            </g>
          )
        })()}

        {/* key signatures */}
        <g stroke="var(--ink-2)" strokeWidth="0.9" fill="none" strokeLinecap="round">
          {[
            ...[diatonic('F', 5), diatonic('C', 5)].map((i) => ({ y: stepYFrom(i, TREBLE_BOTTOM, TREBLE), o: 0 })),
            ...bassKeySharps(BASS).map((k) => ({ y: k.y, o: 1 })),
          ].map((k, i) => {
            const x = 78 + (i % 2) * 7
            return (
              <g key={i}>
                <line x1={x} y1={k.y - 9} x2={x} y2={k.y + 7} />
                <line x1={x + 3.4} y1={k.y - 10.5} x2={x + 3.4} y2={k.y + 5.5} />
                <line x1={x - 2.4} y1={k.y - 1.8} x2={x + 5.8} y2={k.y - 3.4} />
                <line x1={x - 2.4} y1={k.y + 3} x2={x + 5.8} y2={k.y + 1.4} />
              </g>
            )
          })}
        </g>

        {/* barlines: after the pickup and after bar 1 */}
        <g stroke="var(--staff)" strokeWidth="1.3">
          {[0.5, 4.5].map((b) => (
            <line key={b} x1={xAt(b) - 11} y1={TREBLE.bottomY - 4 * TREBLE.gap} x2={xAt(b) - 11} y2={BASS.bottomY} />
          ))}
          <line x1={VB.w - 20} y1={TREBLE.bottomY - 4 * TREBLE.gap} x2={VB.w - 20} y2={BASS.bottomY} />
          <line x1={VB.w - 16} y1={TREBLE.bottomY - 4 * TREBLE.gap} x2={VB.w - 16} y2={BASS.bottomY} strokeWidth="3" />
        </g>

        {/* stems, beams and rests */}
        <g stroke="var(--ink)" fill="none" strokeWidth="1.1" opacity="0.6" strokeLinecap="round">
          {[...RH, ...LH].filter((e) => !e.rest).map((e) => {
            const notes = NOTES.filter((n) => n.event === e)
            if (!notes.length) return null
            const ys = notes.map(staffY)
            const up = e.beats < 2
            const x = xAt(notes[0].atBeat) + (up ? 6 : -6)
            const tip = up ? Math.min(...ys) - 26 : Math.max(...ys) + 26
            return <line key={e.id} x1={x} y1={up ? Math.max(...ys) : Math.min(...ys)} x2={x} y2={tip} />
          })}
          {['rb', 'lb'].map((b) => {
            const g = NOTES.filter((n) => n.event.beam === b)
            if (!g.length) return null
            const xsB = [...new Set(g.map((n) => xAt(n.atBeat)))].sort((a, c) => a - c)
            const tip = Math.min(...g.map(staffY)) - 26
            return <line key={b} x1={xsB[0] + 6} y1={tip} x2={xsB[xsB.length - 1] + 6} y2={tip} strokeWidth="3" />
          })}
        </g>
        <g fill="none" stroke="var(--ink)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" opacity="0.55">
          {RESTS.map((r, i) => (
            <path key={i} d={quarterRestPath(xAt(r.at), r.g)} />
          ))}
        </g>
      </g>

      {/* ---------- B: harmony ---------- */}
      <g opacity={s.oB}>
        {HARMONY.map((h) => {
          const x = xAt(h.atBeat)
          const next = xAt(h.atBeat + h.beats)
          const fam = h.key === 'b' ? 't3' : 't1'
          return (
            <g key={h.atBeat}>
              <rect x={x - 16} y={B_TOP - 12} width={Math.max(30, next - x - 4)} height={B_BOT - B_TOP + 24}
                rx="7" fill={`var(--${fam}-wash)`} opacity="0.55" />
              <text x={x - 16 + Math.max(30, next - x - 4) / 2} y={B_BOT + 36} textAnchor="middle"
                fontFamily="var(--font-display)" fontSize="15" fill={`var(--${fam}-deep)`}>{h.numeral}</text>
              <text x={x - 16 + Math.max(30, next - x - 4) / 2} y={B_BOT + 50} textAnchor="middle"
                fontFamily="var(--font-body)" fontSize="9" fill="var(--ink-3)">{h.name}</text>
            </g>
          )
        })}
        <g stroke="var(--ink-3)" strokeWidth="1" strokeDasharray="3 3" opacity="0.8">
          {COMMON.map((c, i) => <line key={i} x1={c.x1} y1={c.y} x2={c.x2} y2={c.y} />)}
        </g>
        <text x={X0 - 14} y={B_TOP - 20} fontFamily="var(--font-mono)" fontSize="9" fill="var(--t3-deep)">B minor</text>
        <text x={xAt(4.5) - 16} y={B_TOP - 20} fontFamily="var(--font-mono)" fontSize="9" fill="var(--t1-deep)">D major</text>
      </g>

      {/* ---------- C: physics ---------- */}
      <g opacity={s.oC}>
        {NOTES.map((n) => (
          <polyline key={`w${n.key}`}
            points={sine(xAt(n.atBeat) + 7, physicsY(n), hz(n.pitch), F_REF, waveLen(n.atBeat))}
            fill="none" stroke={n.hand === 'rh' ? 'var(--t1-mid)' : 'var(--t3-mid)'}
            strokeWidth="1.1" opacity="0.9" />
        ))}
        {/* ratios for the closing chord, set clear to the right of it */}
        <g fontFamily="var(--font-mono)" fontSize="9">
          {FINAL.map((n, i) => {
            const r = ratioTo(FINAL[0].pitch, n.pitch)
            return (
              <text key={n.key} x={VB.w - 30} y={physicsY(n) + 3} textAnchor="end" fill="var(--ink-2)">
                {label(n.pitch)} · {Math.round(hz(n.pitch))} Hz{i ? ` · ${r.num}:${r.den}` : ''}
              </text>
            )
          })}
        </g>
        <text x={X0 - 14} y={C_BOT + 54} fontFamily="var(--font-body)" fontSize="11" fill="var(--ink-2)">
          Every note at its own wavelength. The closing D major locks because its
          frequencies sit at small whole-number ratios.
        </text>
      </g>

      {/* ---------- the notes themselves ---------- */}
      {NOTES.map((n) => {
        const yA = staffY(n)
        const xA = xAt(n.atBeat) + (n.shift ? 11 : 0)
        const x = lerp(xA, xAt(n.atBeat), Math.max(s.tAB, s.tBC))
        const y = lerp(lerp(yA, harmonyY(n), s.tAB), physicsY(n), s.tBC)
        const fam = n.hand === 'rh' ? 't1' : 't3'
        const scale = lerp(1, 0.72, s.tBC)
        const idx = diatonic(n.pitch.step, n.pitch.octave)
        const geo = n.hand === 'rh' ? TREBLE : BASS
        const bottomIdx = n.hand === 'rh' ? TREBLE_BOTTOM : BASS_BOTTOM_IDX
        // a half note or longer is hollow — the octave opening bar 2 is one
        const hollow = n.event.beats >= 2
        return (
          <g key={n.key}>
            <g opacity={s.oA} stroke="var(--staff)" strokeWidth="1">
              {ledgersFor(idx, bottomIdx, geo).map((ly) => (
                <line key={ly} x1={xA - 10} y1={ly} x2={xA + 10} y2={ly} />
              ))}
            </g>
            <path d={noteheadPath(6.4, 4.6, n.key)}
              fill={hollow ? 'var(--paper)' : `var(--${fam}-${s.tBC > 0.5 ? 'deep' : 'mid'})`}
              stroke={hollow ? `var(--${fam}-deep)` : 'none'} strokeWidth={hollow ? 1.6 : 0}
              transform={`translate(${x} ${y}) rotate(${lerp(-16 + wobble(n.key, 3) * 7, 0, s.tAB)}) scale(${scale})`} />
            {WRITTEN.has(n.key) && (
              <text x={xA - 15} y={yA + 4} opacity={s.oA} textAnchor="middle"
                fontFamily="var(--font-body)" fontSize="13" fill="var(--ink-2)">
                {n.pitch.accidental === 'sharp' ? '♯' : n.pitch.accidental === 'flat' ? '♭' : '♮'}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}
