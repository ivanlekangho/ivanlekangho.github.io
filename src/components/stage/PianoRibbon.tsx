import { HARMONY, LH, RH, SLURS, type PianoEvent } from '../../data/piano'
import { hz, label, midi, ratioTo, type Pitch } from '../../lib/tuning'
import {
  accidentalPaths, bassClef, bassKeySharps, clusterShifts, cutTime, diatonic,
  dotY, eighthRestPath, flagPath, hasFlag, isDotted, ledgersFor,
  quarterRestPath, stepYFrom, staffLineYs, TREBLE_BOTTOM, trebleClef,
  type AccidentalKind, type StaffGeom,
} from '../../lib/notation'
import { lerp } from '../../lib/easing'
import { staging } from './staging'

/**
 * The pianist's score: notation → harmony → physics.
 *
 *   A  grand staff, as written
 *   B  functional harmony: chord blocks, roman numerals, and the common
 *      tones held between chords drawn as the horizontal lines they are
 *   C  physics: every note at its true log frequency, each carrying a sine
 *      whose wavelength is its own, plus the ratios that make the final
 *      chord lock
 *
 * State A is engraved, not sketched: cut time, augmentation dots, flags on
 * the unbeamed eighths, a beam over the pair that shares one, rests, and
 * seconds displaced across the stem so a cluster reads as a cluster rather
 * than as one smudged notehead.
 */

const VB = { w: 760, h: 345 }
const TREBLE: StaffGeom = { gap: 11, bottomY: 86 }
const BASS: StaffGeom = { gap: 11, bottomY: 196 }
const BASS_BOTTOM_IDX = diatonic('G', 2)
const HEAD_W = 12.6          /* one notehead across — the displacement unit */
const STEM = 3.5             /* stem length in staff spaces, standard */

/** Every onset in the phrase, both hands, plus the final barline. */
const ONSETS = [0, 0.5, 1.5, 2.0, 2.5, 4.0, 4.5, 5.5, 6.5, 7.5, 8.5]
const X0 = 126
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

const geoFor = (hand: 'rh' | 'lh') => (hand === 'rh' ? TREBLE : BASS)
const bottomFor = (hand: 'rh' | 'lh') => (hand === 'rh' ? TREBLE_BOTTOM : BASS_BOTTOM_IDX)

/* ------------------------------------------------------------------
   One pass over both hands, producing everything state A needs to draw.
   ------------------------------------------------------------------ */

type Flat = {
  key: string
  pitch: Pitch
  hand: 'rh' | 'lh'
  atBeat: number
  event: PianoEvent
  /** Displacement across the stem, in notehead widths: 0, +1 or −1. */
  shift: number
}

type Ev = {
  id: string
  hand: 'rh' | 'lh'
  atBeat: number
  beats: number
  rest: boolean
  beam?: string
  up: boolean
  stemX: number
  /** Staff y of every notehead, low index first. */
  ys: number[]
  notes: Flat[]
}

const EVENTS: Ev[] = []
const NOTES: Flat[] = []

for (const [events, hand] of [[RH, 'rh'], [LH, 'lh']] as const) {
  let at = 0
  for (const e of events) {
    const g = geoFor(hand)
    const sorted = [...e.pitches].sort((a, b) => midi(a) - midi(b))
    const idxs = sorted.map((pt) => diatonic(pt.step, pt.octave))
    const ys = idxs.map((i) => stepYFrom(i, bottomFor(hand), g))
    /* A stem points away from the staff's centre of gravity. The right
       hand sits below the treble staff all phrase and the left hand low in
       the bass, so in practice everything here stems up — but the octave
       opening bar 2 is a half note, and hard-coding "halves stem down"
       sent it diving through four ledger lines. */
    const mid = g.bottomY - 2 * g.gap
    const up = ys.length === 0 || ys.reduce((a, b) => a + b, 0) / ys.length > mid
    const shifts = clusterShifts(idxs, up ? 'up' : 'down')
    const notes = sorted.map((pitch, j) => ({
      key: `${e.id}-${j}`, pitch, hand, atBeat: at, event: e, shift: shifts[j],
    }))
    NOTES.push(...notes)
    EVENTS.push({
      id: e.id, hand, atBeat: at, beats: e.beats, rest: !!e.rest, beam: e.beam,
      up, stemX: xAt(at) + (up ? HEAD_W / 2 : -HEAD_W / 2), ys, notes,
    })
    at += e.beats
  }
}

/** Stem tip for an event, or for a whole beamed group. */
function tipOf(evs: Ev[]) {
  const up = evs[0].up
  const g = geoFor(evs[0].hand)
  const all = evs.flatMap((e) => e.ys)
  return up ? Math.min(...all) - STEM * g.gap : Math.max(...all) + STEM * g.gap
}

const staffY = (f: Flat) => stepYFrom(diatonic(f.pitch.step, f.pitch.octave), bottomFor(f.hand), geoFor(f.hand))
const headX = (f: Flat) => xAt(f.atBeat) + f.shift * HEAD_W

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
 * Which notes carry a written accidental.
 *
 * Three rules, each of which a reader notices immediately if you break it.
 * The key signature already sharpens F and C. An accidental holds for the
 * rest of its bar at that exact staff position, so the D♯ on the first of
 * the two beamed chords is written and the identical D♯ on the second is
 * not. And a pitch that was altered in the previous bar gets a cautionary
 * sign when it reverts — which is the natural visible on the first chord of
 * bar 2 in Ivan's score, undoing that D♯.
 */
const BARLINES = [0.5, 4.5]
const WRITTEN = new Map<string, AccidentalKind>()
;(() => {
  const inForce = new Map<string, string>()
  let lastBarAltered = new Map<string, string>()
  let bar = -1
  for (const n of [...NOTES].sort((a, b) => a.atBeat - b.atBeat)) {
    const b = BARLINES.filter((x) => x <= n.atBeat).length
    if (b !== bar) {
      lastBarAltered = new Map(inForce)
      inForce.clear()
      bar = b
    }
    const slot = `${n.pitch.step}${n.pitch.octave}`
    const fromKey = n.pitch.step === 'F' || n.pitch.step === 'C' ? 'sharp' : 'natural'
    const sounding = n.pitch.accidental ?? fromKey
    const held = inForce.get(slot) ?? fromKey
    const cautionary = !inForce.has(slot) && (lastBarAltered.get(slot) ?? fromKey) !== sounding
    if (held !== sounding || cautionary) WRITTEN.set(n.key, sounding as AccidentalKind)
    inForce.set(slot, sounding)
  }
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
  const sounding = EVENTS.filter((e) => !e.rest)
  const beamed = new Set(sounding.filter((e) => e.beam).map((e) => e.beam))

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

        {/* key signatures — two sharps on each staff */}
        <g stroke="var(--ink-2)" strokeWidth="1" fill="none" strokeLinecap="round">
          {[
            { y: stepYFrom(diatonic('F', 5), TREBLE_BOTTOM, TREBLE), g: TREBLE, x: 80 },
            { y: stepYFrom(diatonic('C', 5), TREBLE_BOTTOM, TREBLE), g: TREBLE, x: 87 },
            { y: bassKeySharps(BASS)[0].y, g: BASS, x: 80 },
            { y: bassKeySharps(BASS)[1].y, g: BASS, x: 87 },
          ].map((k, i) =>
            accidentalPaths('sharp', k.x, k.y, k.g).map((d) => <path key={`${i}${d}`} d={d} />),
          )}
        </g>

        {/* cut time, on both staves */}
        <g stroke="var(--ink)" strokeWidth="1.8" fill="none" strokeLinecap="round" opacity="0.85">
          {[TREBLE, BASS].map((g, i) => {
            const t = cutTime(104, g)
            return (
              <g key={i}>
                <path d={t.c} />
                <line x1={t.stem.x1} y1={t.stem.y1} x2={t.stem.x2} y2={t.stem.y2} />
              </g>
            )
          })}
        </g>

        {/* barlines: after the pickup and after bar 1, then the final double */}
        <g stroke="var(--staff)" strokeWidth="1.2">
          {BARLINES.map((b) => (
            <line key={b} x1={xAt(b) - 13} y1={TREBLE.bottomY - 4 * TREBLE.gap} x2={xAt(b) - 13} y2={BASS.bottomY} />
          ))}
          <line x1={VB.w - 21} y1={TREBLE.bottomY - 4 * TREBLE.gap} x2={VB.w - 21} y2={BASS.bottomY} strokeWidth="1.1" />
          <line x1={VB.w - 16} y1={TREBLE.bottomY - 4 * TREBLE.gap} x2={VB.w - 16} y2={BASS.bottomY} strokeWidth="3" />
        </g>

        {/* stems and flags, then the one beam */}
        <g stroke="var(--ink)" fill="none" strokeWidth="1.2" opacity="0.75" strokeLinecap="round">
          {sounding.filter((e) => !e.beam).map((e) => {
            const tip = tipOf([e])
            const foot = e.up ? Math.max(...e.ys) : Math.min(...e.ys)
            return (
              <g key={e.id}>
                <line x1={e.stemX} y1={foot} x2={e.stemX} y2={tip} />
                {hasFlag(e.beats) && (
                  <path d={flagPath(e.stemX, tip, e.up ? 'up' : 'down', geoFor(e.hand))} />
                )}
              </g>
            )
          })}
          {[...beamed].map((b) => {
            const grp = sounding.filter((e) => e.beam === b)
            const tip = tipOf(grp)
            return (
              <g key={b}>
                {grp.map((e) => (
                  <line key={e.id} x1={e.stemX} y1={e.up ? Math.max(...e.ys) : Math.min(...e.ys)}
                    x2={e.stemX} y2={tip} />
                ))}
                <line x1={grp[0].stemX} y1={tip} x2={grp[grp.length - 1].stemX} y2={tip} strokeWidth="3.5" />
              </g>
            )
          })}
        </g>

        {/* augmentation dots — one per notehead, clear of any displaced one */}
        <g fill="var(--ink)" opacity="0.8">
          {EVENTS.filter((e) => isDotted(e.beats) && !e.rest).map((e) => {
            const g = geoFor(e.hand)
            const right = Math.max(...e.notes.map(headX))
            return e.notes.map((n) => (
              <circle key={n.key} cx={right + HEAD_W * 0.85} cy={dotY(staffY(n), g)} r="1.7" />
            ))
          })}
        </g>

        {/* rests */}
        <g fill="none" stroke="var(--ink)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.6">
          {EVENTS.filter((e) => e.rest).map((e) => {
            const g = geoFor(e.hand)
            const d = e.beats < 1 ? eighthRestPath(xAt(e.atBeat), g) : quarterRestPath(xAt(e.atBeat), g)
            return <path key={e.id} d={d} />
          })}
        </g>

        {/* the phrasing slur in bar 2 */}
        <g fill="none" stroke="var(--ink-2)" strokeWidth="1.2" strokeLinecap="round" opacity="0.75">
          {SLURS.map((sl) => {
            const g = geoFor(sl.hand)
            const low = (b: number) =>
              Math.max(...NOTES.filter((n) => n.hand === sl.hand && n.atBeat === b).map(staffY))
            const y1 = low(sl.from) + g.gap * 0.9
            const y2 = low(sl.to) + g.gap * 0.9
            const sag = Math.max(y1, y2) + g.gap * 1.4
            return (
              <path key={`${sl.from}-${sl.to}`}
                d={`M ${xAt(sl.from)},${y1} Q ${(xAt(sl.from) + xAt(sl.to)) / 2},${sag} ${xAt(sl.to)},${y2}`} />
            )
          })}
        </g>
      </g>

      {/* ---------- B: harmony ---------- */}
      <g opacity={s.oB}>
        {HARMONY.map((h) => {
          const x = xAt(h.atBeat)
          const next = xAt(h.atBeat + h.beats)
          const fam = h.key === 'b' ? 't3' : 't1'
          const w = Math.max(30, next - x - 4)
          return (
            <g key={h.atBeat}>
              <rect x={x - 16} y={B_TOP - 12} width={w} height={B_BOT - B_TOP + 24}
                fill={`var(--${fam}-wash)`} opacity="0.5" />
              <text x={x - 16 + w / 2} y={B_BOT + 36} textAnchor="middle"
                fontFamily="var(--font-mono)" fontSize="13" fill={`var(--${fam}-deep)`}>{h.numeral}</text>
              <text x={x - 16 + w / 2} y={B_BOT + 50} textAnchor="middle"
                fontFamily="var(--font-body)" fontSize="9" fill="var(--ink-3)">{h.name}</text>
            </g>
          )
        })}
        <g stroke="var(--ink-3)" strokeWidth="1" strokeDasharray="3 3" opacity="0.8">
          {COMMON.map((c, i) => <line key={i} x1={c.x1} y1={c.y} x2={c.x2} y2={c.y} />)}
        </g>
        <text x={X0 - 16} y={B_TOP - 20} fontFamily="var(--font-mono)" fontSize="9" fill="var(--t3-deep)">B minor</text>
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
        <text x={X0 - 16} y={C_BOT + 54} fontFamily="var(--font-body)" fontSize="11" fill="var(--ink-2)">
          Every note at its own wavelength. The closing D major locks because its
          frequencies sit at small whole-number ratios.
        </text>
      </g>

      {/* ---------- the notes themselves ---------- */}
      {NOTES.map((n) => {
        const yA = staffY(n)
        const xA = headX(n)
        const x = lerp(xA, xAt(n.atBeat), Math.max(s.tAB, s.tBC))
        const y = lerp(lerp(yA, harmonyY(n), s.tAB), physicsY(n), s.tBC)
        const fam = n.hand === 'rh' ? 't1' : 't3'
        const scale = lerp(1, 0.72, s.tBC)
        const idx = diatonic(n.pitch.step, n.pitch.octave)
        const g = geoFor(n.hand)
        /* a half note or longer is hollow — the octave opening bar 2 is one */
        const hollow = n.event.beats >= 2
        const acc = WRITTEN.get(n.key)
        return (
          <g key={n.key}>
            <g opacity={s.oA} stroke="var(--staff)" strokeWidth="1">
              {ledgersFor(idx, bottomFor(n.hand), g).map((ly) => (
                <line key={ly} x1={xA - 9} y1={ly} x2={xA + 9} y2={ly} />
              ))}
            </g>
            <ellipse cx={0} cy={0} rx={6.3} ry={4.5}
              fill={hollow ? 'var(--hall)' : `var(--${fam}-${s.tBC > 0.5 ? 'deep' : 'mid'})`}
              stroke={hollow ? `var(--${fam}-mid)` : 'none'} strokeWidth={hollow ? 1.8 : 0}
              transform={`translate(${x} ${y}) rotate(${lerp(-20, 0, s.tAB)}) scale(${scale})`} />
            {acc && (
              <g opacity={s.oA} stroke="var(--ink-2)" strokeWidth="1" fill="none" strokeLinecap="round">
                {accidentalPaths(acc, xA - g.gap * 1.45, yA, g).map((d) => <path key={d} d={d} />)}
              </g>
            )}
          </g>
        )
      })}
    </svg>
  )
}
