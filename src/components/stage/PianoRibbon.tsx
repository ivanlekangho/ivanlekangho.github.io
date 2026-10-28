import { HARMONY, LH, RH, SLURS, type PianoEvent } from '../../data/piano'
import { hz, label, midi, ratioTo, type Pitch } from '../../lib/tuning'
import {
  bassKeySharps, clusterShifts, diatonic, dotY, hasFlag, isDotted, ledgersFor,
  stepYFrom, staffLineYs, TREBLE_BOTTOM, type AccidentalKind, type StaffGeom,
} from '../../lib/notation'
import { ENG, Glyph } from '../../lib/smufl'
import { lerp } from '../../lib/easing'
import { BAR_BEATS, SYS, barX, xAt } from '../../lib/beatmap'
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
 *
 * It draws into the system's coordinates, under the voice staff, on the
 * axis they share — see lib/beatmap.ts.
 */

const RIGHT = SYS.w - 14
const TREBLE: StaffGeom = { gap: 11, bottomY: 86 }
const BASS: StaffGeom = { gap: 11, bottomY: 196 }
export const PIANO_H = 300

/**
 * Where the piano's own coordinate space begins inside the system. It
 * deliberately overlaps the empty top of this block so the two staves sit a
 * staff-and-a-half apart, which is the distance a vocal score uses.
 *
 * It lives here rather than in Score.tsx because the language stop needs it
 * too: the chord symbols there start life on the pianist's staff, and they
 * can only do that if they know where it is.
 */
export const PIANO_DY = 200

/** Middle of the pianist's right hand, in the SYSTEM's coordinates — where
 *  the chords the harmony row names are actually played. */
export const RH_MID = PIANO_DY + TREBLE.bottomY - 2 * TREBLE.gap
const BASS_BOTTOM_IDX = diatonic('G', 2)
const U = TREBLE.gap                      /* both piano staves share a size */
const HEAD_W = ENG.headRx * 2 * U         /* one notehead across — the displacement unit */
const STEM = ENG.stemLength               /* in staff spaces, as Bravura has it */

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
const BARLINES = BAR_BEATS
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
  const room = xAt(atBeat + 0.5) - xAt(atBeat) - 10
  return Math.max(16, Math.min(54, room))
}

/** The closing D major chord, used for the ratio annotation. */
const FINAL = NOTES.filter((n) => n.atBeat === 6.5).sort((a, b) => midi(a.pitch) - midi(b.pitch))

export default function PianoStaves({ p, beat }: { p: number; beat: number | null }) {
  const s = staging(p)
  const voiced = EVENTS.filter((e) => !e.rest)
  const beamed = new Set(voiced.filter((e) => e.beam).map((e) => e.beam))
  const live = (e: { atBeat: number; event: PianoEvent }) =>
    beat !== null && beat >= e.atBeat - 0.02 && beat < e.atBeat + e.event.beats

  return (
    <g>

      {/* ---------- A: grand staff ---------- */}
      <g opacity={s.oA}>
        <g stroke="var(--staff)" strokeWidth={ENG.staffLine * U}>
          {staffLineYs(TREBLE).map((y) => <line key={`t${y}`} x1={SYS.staffLeft} y1={y} x2={RIGHT} y2={y} />)}
          {staffLineYs(BASS).map((y) => <line key={`b${y}`} x1={SYS.staffLeft} y1={y} x2={RIGHT} y2={y} />)}
        </g>
        {/* the brace that marks these two staves as one instrument */}
        <Glyph name="brace" gap={U} x={SYS.staffLeft - 16} y={BASS.bottomY}
          stretchY={BASS.bottomY - (TREBLE.bottomY - 4 * TREBLE.gap)} opacity={0.85} />
        <line x1={SYS.staffLeft} y1={TREBLE.bottomY - 4 * TREBLE.gap} x2={SYS.staffLeft} y2={BASS.bottomY}
          stroke="var(--staff)" strokeWidth={ENG.barlineThin * U} />

        {/* clefs, key signatures and the time signature, all Bravura */}
        <g>
          <Glyph name="gClef" gap={U} x={SYS.clef + 4} y={TREBLE.bottomY - TREBLE.gap} />
          <Glyph name="fClef" gap={U} x={SYS.clef} y={BASS.bottomY - 3 * BASS.gap} />
          {[
            { x: SYS.keySig, y: stepYFrom(diatonic('F', 5), TREBLE_BOTTOM, TREBLE) },
            { x: SYS.keySig + U, y: stepYFrom(diatonic('C', 5), TREBLE_BOTTOM, TREBLE) },
            { x: SYS.keySig, y: bassKeySharps(BASS)[0].y },
            { x: SYS.keySig + U, y: bassKeySharps(BASS)[1].y },
          ].map((k, i) => <Glyph key={i} name="sharp" gap={U} x={k.x} y={k.y} fill="var(--ink-2)" />)}
          <Glyph name="cutCommon" gap={U} x={SYS.time} y={TREBLE.bottomY - 2 * TREBLE.gap} />
          <Glyph name="cutCommon" gap={U} x={SYS.time} y={BASS.bottomY - 2 * BASS.gap} />
        </g>

        {/* barlines: after the pickup and after bar 1, then the final double */}
        <g stroke="var(--staff)">
          {BARLINES.map((b) => (
            <line key={b} x1={barX(b, TREBLE.gap)} y1={TREBLE.bottomY - 4 * TREBLE.gap}
              x2={barX(b, TREBLE.gap)} y2={BASS.bottomY} strokeWidth={ENG.barlineThin * U} />
          ))}
          <line x1={RIGHT - (ENG.barlineSep + ENG.barlineThick) * U} y1={TREBLE.bottomY - 4 * TREBLE.gap}
            x2={RIGHT - (ENG.barlineSep + ENG.barlineThick) * U} y2={BASS.bottomY}
            strokeWidth={ENG.barlineThin * U} />
          <line x1={RIGHT - (ENG.barlineThick / 2) * U} y1={TREBLE.bottomY - 4 * TREBLE.gap}
            x2={RIGHT - (ENG.barlineThick / 2) * U} y2={BASS.bottomY}
            strokeWidth={ENG.barlineThick * U} />
        </g>

        {/* stems and flags, then the one beam */}
        <g stroke="var(--ink)" fill="none" strokeWidth={ENG.stem * U} strokeLinecap="butt">
          {voiced.filter((e) => !e.beam).map((e) => {
            const tip = tipOf([e])
            const foot = e.up ? Math.max(...e.ys) : Math.min(...e.ys)
            return (
              <g key={e.id}>
                <line x1={e.stemX} y1={foot} x2={e.stemX} y2={tip} />
                {hasFlag(e.beats) && (
                  <g stroke="none">
                    <Glyph name={e.up ? 'flagUp' : 'flagDown'} gap={U} x={e.stemX} y={tip} />
                  </g>
                )}
              </g>
            )
          })}
          {[...beamed].map((b) => {
            const grp = voiced.filter((e) => e.beam === b)
            const tip = tipOf(grp)
            const half = (ENG.beam * U) / 2
            return (
              <g key={b}>
                {grp.map((e) => (
                  <line key={e.id} x1={e.stemX} y1={e.up ? Math.max(...e.ys) : Math.min(...e.ys)}
                    x2={e.stemX} y2={tip} />
                ))}
                <line x1={grp[0].stemX - ENG.stem * U / 2} y1={tip + (grp[0].up ? half : -half)}
                  x2={grp[grp.length - 1].stemX + ENG.stem * U / 2} y2={tip + (grp[0].up ? half : -half)}
                  strokeWidth={ENG.beam * U} />
              </g>
            )
          })}
        </g>

        {/* augmentation dots — one per notehead, clear of any displaced one */}
        <g fill="var(--ink)">
          {EVENTS.filter((e) => isDotted(e.beats) && !e.rest).map((e) => {
            const g = geoFor(e.hand)
            const right = Math.max(...e.notes.map(headX))
            return e.notes.map((n) => (
              <circle key={n.key} cx={right + (ENG.headRx + ENG.dotGap) * U} cy={dotY(staffY(n), g)}
                r={ENG.dotR * U} />
            ))
          })}
        </g>

        {/* rests */}
        <g>
          {EVENTS.filter((e) => e.rest).map((e) => {
            const g = geoFor(e.hand)
            return (
              <Glyph key={e.id} gap={U} centre fill="var(--ink-2)"
                name={e.beats < 1 ? 'restEighth' : 'restQuarter'}
                x={xAt(e.atBeat)} y={g.bottomY - 2 * g.gap} />
            )
          })}
        </g>

        {/* the phrasing slur in bar 2 */}
        <g fill="none" stroke="var(--ink-2)" strokeWidth="1.2" strokeLinecap="round" opacity="0.8">
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
        {/* What a pianist reads off a chart goes above the band; what the
            chord is DOING in the key goes below it. Two registers of the same
            sentence — the chord symbol names the object, the roman numeral
            names its function. */}
        {HARMONY.map((h) => {
          const x = xAt(h.atBeat)
          const next = xAt(h.atBeat + h.beats)
          const fam = h.key === 'b' ? 't3' : 't1'
          const w = Math.max(30, next - x - 4)
          const mid = x - 16 + w / 2
          return (
            <g key={h.atBeat}>
              <rect x={x - 16} y={B_TOP - 12} width={w} height={B_BOT - B_TOP + 24}
                fill={`var(--${fam}-wash)`} opacity="0.17" />
              <line x1={x - 16} y1={B_TOP - 12} x2={x - 16} y2={B_BOT + 12}
                stroke="var(--rule)" strokeWidth="1" />
              <text x={mid} y={B_TOP - 22} textAnchor="middle"
                fontFamily="var(--font-display)" fontWeight="500" fontSize="20"
                fill="var(--ink)">{h.symbol}</text>
              <text x={mid} y={B_BOT + 34} textAnchor="middle"
                fontFamily="var(--font-label)" fontSize="14" letterSpacing="0.04em"
                fill={`var(--${fam}-mid)`}>{h.numeral}</text>
              {/* and the word for the move, which is the part worth learning */}
              {h.move.split(' ').map((word, j) => (
                <text key={word} x={mid} y={B_BOT + 50 + j * 11} textAnchor="middle"
                  fontFamily="var(--font-body)" fontSize="9.5" fill="var(--ink-3)">{word}</text>
              ))}
            </g>
          )
        })}
        <g stroke="var(--ink-3)" strokeWidth="1" strokeDasharray="3 3" opacity="0.8">
          {COMMON.map((c, i) => <line key={i} x1={c.x1} y1={c.y} x2={c.x2} y2={c.y} />)}
        </g>
        {/* Where the key changes hands, drawn once rather than said twice. */}
        <g fontFamily="var(--font-label)" fontSize="11" letterSpacing="0.14em">
          <text x={SYS.staffLeft} y={B_TOP - 44} fill="var(--t3-mid)">IN B MINOR</text>
          <text x={xAt(4.5) - 16} y={B_TOP - 44} fill="var(--t1-mid)">IN D MAJOR</text>
        </g>
        <line x1={xAt(4.5) - 24} y1={B_TOP - 40} x2={xAt(4.5) - 24} y2={B_BOT + 14}
          stroke="var(--rule)" strokeWidth="1" strokeDasharray="2 4" />
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
              <text key={n.key} x={RIGHT - 14} y={physicsY(n) + 3} textAnchor="end" fill="var(--ink-2)">
                {label(n.pitch)}, {Math.round(hz(n.pitch))} Hz{i ? `, ${r.num}:${r.den}` : ''}
              </text>
            )
          })}
        </g>
        <text x={SYS.staffLeft} y={C_BOT + 54} fontFamily="var(--font-body)" fontSize="11" fill="var(--ink-2)">
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
        const on = live(n)
        return (
          <g key={n.key}>
            <g opacity={s.oA} stroke="var(--staff)" strokeWidth={ENG.ledger * U}>
              {ledgersFor(idx, bottomFor(n.hand), g).map((ly) => (
                <line key={ly} x1={xA - (ENG.headRx + ENG.ledgerExtension) * U} y1={ly}
                  x2={xA + (ENG.headRx + ENG.ledgerExtension) * U} y2={ly} />
              ))}
            </g>
            {on && <circle cx={x} cy={y} r={13} fill={`var(--${fam}-mid)`} opacity="0.18" />}
            <ellipse cx={0} cy={0} rx={ENG.headRx * U} ry={ENG.headRy * U}
              fill={hollow ? 'var(--hall)' : `var(--${fam}-${on || s.tBC > 0.5 ? 'deep' : 'mid'})`}
              stroke={hollow ? `var(--${fam}-${on ? 'deep' : 'mid'})` : 'none'} strokeWidth={hollow ? 1.8 : 0}
              transform={`translate(${x} ${y}) rotate(${lerp(ENG.headTilt, 0, s.tAB)}) scale(${scale * (on ? 1.4 : 1)})`} />
            {acc && (
              <Glyph gap={U} x={xA - g.gap * 1.95} y={yA} opacity={s.oA} fill="var(--ink-2)"
                name={acc === 'flat' ? 'flat' : acc === 'natural' ? 'natural' : 'sharp'} />
            )}
          </g>
        )
      })}
    </g>
  )
}
