import { LH, RH, SLURS, type PianoEvent } from '../../data/piano'
import { BAR_BEATS, LH_ONSET, RH_ONSET, SYS, barX, xAt } from '../../lib/beatmap'
import {
  BASS_BOTTOM, TREBLE_BOTTOM, diatonic, slurPath, staffLineYs, stepYFrom,
  type StaffGeom,
} from '../../lib/notation'
import { ENG, Glyph } from '../../lib/smufl'
import type { Pitch } from '../../lib/tuning'

/**
 * The accompaniment, engraved — a grand staff under the singer's.
 *
 * The data for this has been sitting in `data/piano.ts` since the recital
 * room was built, read out of Ivan's own MuseScore XML and transposed down
 * a fourth into B minor, and nothing has drawn it since the room came
 * apart. The voice staff was left on the page alone, which makes the one
 * claim the engraving should not make: that Schubert wrote this line
 * unaccompanied. The piano is the half that does the modulating.
 *
 * Both hands read their x positions from the same shared axis the voice
 * does (lib/beatmap), so a chord struck on beat 3 sits directly under the
 * syllable sung on beat 3. That is the whole reason that axis exists, and
 * it is why this does not lay itself out.
 *
 * The two hands are separate event lists and not one rhythm, because they
 * are not one rhythm: bar 2 opens with an octave MINIM in the left hand
 * held under two crotchets in the right. A single list would have had to
 * invent a rhythm neither hand plays.
 *
 * Clefs are the conventional pair even though both hands would avoid some
 * ledger lines in the other one. The right hand runs F♯3 to E4, which
 * straddles middle C, so it needs ledgers below the treble staff or above
 * the bass one whichever way round it is set — and a pianist reads a right
 * hand in treble.
 */

/** One staff step, in y. Two steps to a line gap. */
const HALF = (g: StaffGeom) => g.gap / 2

/**
 * The ledger lines one pitch needs.
 *
 * `s` counts staff steps up from the bottom line, so the five lines are the
 * even numbers 0 to 8 and a ledger is any even number outside that. A pitch
 * in the space just past the staff (s of -1, or 9) needs none, which the
 * loop bounds give for free.
 */
function ledgersFor(idx: number, ref: number, g: StaffGeom) {
  const s = idx - ref
  const out: number[] = []
  for (let k = -2; k >= s; k -= 2) out.push(g.bottomY - k * HALF(g))
  for (let k = 10; k <= s; k += 2) out.push(g.bottomY - k * HALF(g))
  return out
}

/**
 * Which accidental, if any, has to be written.
 *
 * The key signature carries F♯ and C♯, so those two are silent wherever
 * they sound as sharps; this passage's D♯ and B♭ are not in the signature
 * and are written. A natural would be written on an F or a C that sounded
 * natural — there are none here, but leaving the branch out would be the
 * kind of omission that is correct only until the data changes.
 */
const KEY_SHARPS = new Set(['F', 'C'])
function accidentalFor(pitch: Pitch): 'sharp' | 'flat' | 'natural' | null {
  if (pitch.accidental === 'flat') return 'flat'
  if (pitch.accidental === 'sharp') return KEY_SHARPS.has(pitch.step) ? null : 'sharp'
  if (pitch.accidental === 'natural') return 'natural'
  return KEY_SHARPS.has(pitch.step) ? 'natural' : null
}

type HandGeom = { g: StaffGeom; ref: number }

const yOf = (pitch: Pitch, h: HandGeom) =>
  stepYFrom(diatonic(pitch.step, pitch.octave), h.ref, h.g)

/**
 * Noteheads a second apart, displaced across the stem.
 *
 * Two notes one staff step apart cannot both sit on the same side of the
 * stem — drawn at one x they overlap into a blob, which is what bar 1's
 * right-hand chord was: F♯3, A3, B3 and D♯4, with the A and the B on top of
 * each other. The engraver's rule is that the upper of the pair crosses to
 * the far side of the stem, reading outward from the note the stem starts
 * on, and that a displaced note does not itself displace the next one.
 */
function seconds(e: PianoEvent, up: boolean, h: HandGeom) {
  const u = h.g.gap
  const items = e.pitches
    .map((pt) => ({ pt, y: yOf(pt, h) }))
    /* Outward from the stem's own end: lowest first for an up stem. */
    .sort((a, b) => (up ? b.y - a.y : a.y - b.y))
  let displaced = false
  return items.map((it, i) => {
    const second = i > 0 && Math.abs(it.y - items[i - 1].y) < u * 0.51
    const shift = second && !displaced
    displaced = shift
    return { ...it, dx: shift ? (up ? 1 : -1) * 2 * ENG.headRx * u : 0 }
  })
}


/** Everything true of one staff before any notes are on it. */
function StaffLines({ g, x0, x1 }: { g: StaffGeom; x0: number; x1: number }) {
  return (
    <g stroke="var(--staff)" strokeWidth={ENG.staffLine * g.gap}>
      {staffLineYs(g).map((y) => <line key={y} x1={x0} y1={y} x2={x1} y2={y} />)}
    </g>
  )
}

/** The two sharps of B minor, placed for whichever clef this staff carries. */
function KeySignature({ h, x }: { h: HandGeom; x: number }) {
  const treble = h.ref === TREBLE_BOTTOM
  /* F♯ then C♯, each on its own line or space, in the octave the clef puts
     them in. A sharp is 0.98 spaces wide, so they stand one space apart. */
  const marks = treble
    ? [{ step: 'F' as const, octave: 5 }, { step: 'C' as const, octave: 5 }]
    : [{ step: 'F' as const, octave: 3 }, { step: 'C' as const, octave: 3 }]
  return (
    <>
      {marks.map((m, i) => (
        <Glyph key={m.step} name="sharp" gap={h.g.gap} fill="var(--ink-2)"
          x={x + i * h.g.gap} y={stepYFrom(diatonic(m.step, m.octave), h.ref, h.g)} />
      ))}
    </>
  )
}

/**
 * One hand's notes: chords, stems, beams, flags, rests, ledgers, accidentals.
 *
 * A chord gets ONE stem, taken from the note furthest from the middle line,
 * and its direction is decided by the chord as a whole rather than per
 * notehead — which is the difference between a chord and three notes that
 * happen to be vertically aligned.
 */
function Hand({ events, onsets, h }: { events: PianoEvent[]; onsets: number[]; h: HandGeom }) {
  const { g } = h
  const u = g.gap
  const mid = g.bottomY - 2 * u

  /* Beam groups, in the order they appear, so a beam can be drawn once
     across the group instead of once per note. */
  const beams = new Map<string, number[]>()
  events.forEach((e, i) => {
    if (!e.beam || e.rest) return
    const got = beams.get(e.beam) ?? []
    got.push(i)
    beams.set(e.beam, got)
  })
  const beamed = new Set([...beams.values()].flat())

  const stemOf = (e: PianoEvent, i: number) => {
    const ys = e.pitches.map((pt) => yOf(pt, h))
    const far = Math.max(...ys.map((y) => Math.abs(y - mid)))
    const anchor = ys.find((y) => Math.abs(y - mid) === far) ?? mid
    const up = anchor > mid
    const head = up ? Math.max(...ys) : Math.min(...ys)
    const x = xAt(onsets[i]) + (up ? ENG.headRx : -ENG.headRx) * u
    return { up, x, from: head, tip: (up ? Math.min(...ys) : Math.max(...ys)) + (up ? -1 : 1) * ENG.stemLength * u }
  }

  return (
    <>
      {events.map((e, i) => {
        const x = xAt(onsets[i])
        if (e.rest) {
          return (
            <Glyph key={e.id} name={e.beats < 1 ? 'restEighth' : 'restQuarter'}
              x={x} y={mid} gap={u} centre fill="var(--ink-2)" />
          )
        }
        const st = stemOf(e, i)
        return (
          <g key={e.id}>
            {seconds(e, st.up, h).map(({ pt, y, dx }) => {
              const acc = accidentalFor(pt)
              const ext = (ENG.headRx + ENG.ledgerExtension) * u
              return (
                <g key={`${pt.step}${pt.octave}${pt.accidental ?? ''}`}>
                  <g stroke="var(--staff)" strokeWidth={ENG.ledger * u}>
                    {ledgersFor(diatonic(pt.step, pt.octave), h.ref, g).map((ly) => (
                      <line key={ly} x1={x - ext} y1={ly} x2={x + ext} y2={ly} />
                    ))}
                  </g>
                  {/* The accidental clears the notehead's own offset, so a
                      displaced second does not have its sharp sitting on top
                      of the note below it. */}
                  {acc && (
                    <Glyph name={acc} gap={u} x={x + Math.min(0, dx) - u * 1.85} y={y}
                      fill="var(--ink-2)" />
                  )}
                  <Glyph name={e.beats >= 2 ? 'noteheadHalf' : 'noteheadBlack'}
                    x={x + dx} y={y} gap={u} centre />
                </g>
              )
            })}
            <line x1={st.x} y1={st.from} x2={st.x} y2={st.tip}
              stroke="var(--ink)" strokeWidth={ENG.stem * u} />
            {/* A flag only where there is no beam to carry the tail. */}
            {e.beats < 1 && !beamed.has(i) && (
              <Glyph name={st.up ? 'flagUp' : 'flagDown'} x={st.x} y={st.tip} gap={u} fill="var(--ink)" />
            )}
          </g>
        )
      })}

      {/* One beam per group, across the stem tips at each end. */}
      <g stroke="var(--ink)" strokeWidth={ENG.beam * u} strokeLinecap="butt">
        {[...beams.values()].filter((ix) => ix.length > 1).map((ix) => {
          const a = stemOf(events[ix[0]], ix[0])
          const b = stemOf(events[ix[ix.length - 1]], ix[ix.length - 1])
          return <line key={events[ix[0]].id} x1={a.x} y1={a.tip} x2={b.x} y2={b.tip} />
        })}
      </g>
    </>
  )
}

/**
 * The grand staff, braced, with both hands on it.
 *
 * `top` is the y of the right hand's bottom line; the left hand's staff
 * hangs a fixed distance under it, and the brace and the two barlines span
 * from the top of one to the bottom of the other — which is what makes two
 * staves read as one instrument rather than as two players.
 */
export function PianoSystem({ gap, rhBottom, lhBottom }: {
  gap: number; rhBottom: number; lhBottom: number
}) {
  const rh: HandGeom = { g: { gap, bottomY: rhBottom }, ref: TREBLE_BOTTOM }
  const lh: HandGeom = { g: { gap, bottomY: lhBottom }, ref: BASS_BOTTOM }
  const u = gap
  const top = rhBottom - 4 * u
  const bottom = lhBottom
  const endThick = SYS.w - (ENG.barlineThick / 2) * u
  const endThin = endThick - (ENG.barlineSep + (ENG.barlineThick + ENG.barlineThin) / 2) * u

  return (
    <>
      <StaffLines g={rh.g} x0={SYS.staffLeft} x1={SYS.w} />
      <StaffLines g={lh.g} x0={SYS.staffLeft} x1={SYS.w} />

      {/* The brace, stretched to span both staves rather than set at a size
          and hoped over. `Glyph` flips Y, so a stretched glyph grows UPWARD
          from its anchor — the anchor is therefore the bottom of the system
          and the stretch is the full height, in user units. */}
      <Glyph name="brace" x={SYS.staffLeft - u * 1.5} y={bottom} gap={u}
        stretchY={bottom - top} fill="var(--staff)" />
      {/* The bracket line down the left, closing the system. */}
      <line x1={SYS.staffLeft} y1={top} x2={SYS.staffLeft} y2={bottom}
        stroke="var(--staff)" strokeWidth={ENG.barlineThin * u} />

      <Glyph name="gClef" x={SYS.clef} y={rh.g.bottomY - u} gap={u} />
      <Glyph name="fClef" x={SYS.clef} y={lh.g.bottomY - 3 * u} gap={u} />
      <KeySignature h={rh} x={SYS.keySig} />
      <KeySignature h={lh} x={SYS.keySig} />
      <Glyph name="cutCommon" x={SYS.time} y={rh.g.bottomY - 2 * u} gap={u} />
      <Glyph name="cutCommon" x={SYS.time} y={lh.g.bottomY - 2 * u} gap={u} />

      <Hand events={RH} onsets={RH_ONSET} h={rh} />
      <Hand events={LH} onsets={LH_ONSET} h={lh} />

      {/* Barlines run the full height of the system, both staves at once —
          and from BAR_BEATS, the same list the voice staff reads, because a
          barline that does not line up with the one above it is the one
          error in an engraving that every reader sees at a glance. */}
      <g stroke="var(--staff)">
        {BAR_BEATS.map((b) => (
          <line key={b} x1={barX(b, u)} y1={top} x2={barX(b, u)} y2={bottom}
            strokeWidth={ENG.barlineThin * u} />
        ))}
        <line x1={endThin} y1={top} x2={endThin} y2={bottom} strokeWidth={ENG.barlineThin * u} />
        <line x1={endThick} y1={top} x2={endThick} y2={bottom} strokeWidth={ENG.barlineThick * u} />
      </g>

      {/* The one phrasing slur the score actually shows, over bar 2's right
          hand. Where it ends is read from Ivan's score rather than measured,
          which is noted in the data too. */}
      <g fill="none" stroke="var(--ink-2)" strokeWidth={u * 0.11} strokeLinecap="round" opacity="0.85">
        {SLURS.map((s) => {
          const h = s.hand === 'rh' ? rh : lh
          const ev = s.hand === 'rh' ? RH : LH
          const on = s.hand === 'rh' ? RH_ONSET : LH_ONSET
          const pick = (beat: number) => {
            const i = on.indexOf(beat)
            if (i < 0 || !ev[i].pitches.length) return null
            return { x: xAt(beat), y: Math.min(...ev[i].pitches.map((pt) => yOf(pt, h))) }
          }
          const a = pick(s.from)
          const b = pick(s.to)
          if (!a || !b) return null
          return <path key={`${s.hand}${s.from}`} d={slurPath(a.x, a.y, b.x, b.y, h.g)} />
        })}
      </g>
    </>
  )
}
