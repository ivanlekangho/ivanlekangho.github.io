import { PHRASE, PIECE, type Note } from '../../data/phrase'
import {
  bassKeySharps, dotY, HEAD_X, hasFlag, isDotted, ledgerLines, melismaGroups,
  needsAccidental, noteY, slurPath, staffLineYs, stemDirections, type StaffGeom,
} from '../../lib/notation'
import { ENG, Glyph } from '../../lib/smufl'

/**
 * The engraving of the vocal line: cut time, barlines, augmentation dots,
 * flags, the one slur across "Fremd", the closing rest. Kept apart from the
 * component that draws it because it was once duplicated, and the copies
 * drifted — the stage score lost every rhythm mark and showed nine
 * undifferentiated noteheads, which is a different piece of music.
 *
 * Everything that is a symbol is a Bravura glyph; everything that is a rule
 * is a line at the thickness Bravura's own metadata specifies. Positions come
 * from the system's shared axis (lib/beatmap.ts), so the singer's notes sit
 * directly above the pianist's.
 *
 * The noteheads themselves are NOT drawn here. On the stage they morph into
 * tone contours and data points, so each caller owns them; this file owns
 * everything that is true only while the staff is being read as notation.
 */

export type Axis = { xAt: (beat: number) => number; barX: (beat: number, gap: number) => number }

export type Head = { clef: number; keySig: number; time: number }

export function headFor(g: StaffGeom): Head {
  return { clef: HEAD_X.clef(g), keySig: HEAD_X.keySig(g), time: HEAD_X.time(g) }
}

export function voiceLayout(g: StaffGeom, notes: Note[] = PHRASE, axis: Axis) {
  const onsets: number[] = []
  let at = 0
  for (const n of notes) { onsets.push(at); at += n.beats }
  return {
    xs: onsets.map(axis.xAt),
    /** The closing rest sits where the next note would have been. */
    restX: axis.xAt(at),
    bars: [PIECE.pickupBeats, PIECE.pickupBeats + PIECE.beatsPerBar]
      .map((b) => axis.barX(b, g.gap)),
    dirs: stemDirections(notes, g),
    lyricY: g.bottomY + g.gap * 2.8,
  }
}

type L = ReturnType<typeof voiceLayout>

/** Staff, clef, key signature, cut time, barlines, closing rest, final bar. */
export function VoiceStaffFurniture({
  g, width, layout, lineX0 = 0, head,
}: { g: StaffGeom; width: number; layout: L; lineX0?: number; head?: Head }) {
  const u = g.gap
  const h = head ?? headFor(g)
  const mid = g.bottomY - 2 * u
  const top = g.bottomY - 4 * u
  const fLine = g.bottomY - 3 * u
  const endThick = width - (ENG.barlineThick / 2) * u
  const endThin = endThick - (ENG.barlineSep + (ENG.barlineThick + ENG.barlineThin) / 2) * u

  return (
    <>
      <g stroke="var(--staff)" strokeWidth={ENG.staffLine * u}>
        {staffLineYs(g).map((y) => <line key={y} x1={lineX0} y1={y} x2={width} y2={y} />)}
      </g>

      <Glyph name="fClef" x={h.clef} y={fLine} gap={u} />
      {/* B minor: two sharps, each sitting on its own line or space */}
      {bassKeySharps(g).map((k, i) => (
        <Glyph key={i} name="sharp" x={h.keySig + k.x} y={k.y} gap={u} fill="var(--ink-2)" />
      ))}
      <Glyph name="cutCommon" x={h.time} y={mid} gap={u} />
      <Glyph name="restQuarter" x={layout.restX} y={mid} gap={u} centre fill="var(--ink-2)" />

      <g stroke="var(--staff)">
        {layout.bars.map((x) => (
          <line key={x} x1={x} y1={top} x2={x} y2={g.bottomY} strokeWidth={ENG.barlineThin * u} />
        ))}
        <line x1={endThin} y1={top} x2={endThin} y2={g.bottomY} strokeWidth={ENG.barlineThin * u} />
        <line x1={endThick} y1={top} x2={endThick} y2={g.bottomY} strokeWidth={ENG.barlineThick * u} />
      </g>

      {/* the one slur the score actually contains, across "Fremd" */}
      <g fill="none" stroke="var(--ink-2)" strokeWidth={u * 0.11} strokeLinecap="round" opacity="0.85">
        {melismaGroups(PHRASE).map(([a, b]) => (
          <path key={`${a}-${b}`}
            d={slurPath(layout.xs[a], noteY(PHRASE[a], g), layout.xs[b], noteY(PHRASE[b], g), g)} />
        ))}
      </g>
    </>
  )
}

/**
 * Stem, flag, augmentation dot, ledger lines and any written accidental for
 * one note. Positioned at (x, y) rather than at the note's staff position,
 * so on the stage these travel with the notehead as it morphs instead of
 * being left behind on an empty staff.
 */
export function NoteMarks({
  n, x, y, dir, g, stroke = 'var(--ink)', opacity = 1,
}: {
  n: Note; x: number; y: number; dir: 'up' | 'down'; g: StaffGeom
  stroke?: string; opacity?: number
}) {
  const u = g.gap
  const up = dir === 'up'
  /* The stem leaves the notehead at its side, not its centre. */
  const stemX = x + (up ? ENG.headRx : -ENG.headRx) * u
  const tip = y + (up ? -1 : 1) * ENG.stemLength * u
  const drift = y - noteY(n, g)
  const ext = (ENG.headRx + ENG.ledgerExtension) * u

  return (
    <g opacity={opacity}>
      <g stroke="var(--staff)" strokeWidth={ENG.ledger * u}>
        {ledgerLines(n, g).map((ly) => (
          <line key={ly} x1={x - ext} y1={ly + drift} x2={x + ext} y2={ly + drift} />
        ))}
      </g>
      <line x1={stemX} y1={y} x2={stemX} y2={tip} stroke={stroke} strokeWidth={ENG.stem * u} />
      {hasFlag(n.beats) && (
        <Glyph name={up ? 'flagUp' : 'flagDown'} x={stemX} y={tip} gap={u} fill={stroke} />
      )}
      {isDotted(n.beats) && (
        /* The on-line test has to use the note's STAFF position, not its
           current one — on the stage y is mid-morph. */
        <circle cx={x + (ENG.headRx + ENG.dotGap) * u} cy={y + dotY(noteY(n, g), g) - noteY(n, g)}
          r={ENG.dotR * u} fill={stroke} />
      )}
      {needsAccidental(n, PIECE.keySignatureSharps) && (
        <Glyph gap={u} x={x - u * 1.9} y={y} fill="var(--ink-2)"
          name={n.accidental === 'flat' ? 'flat' : n.accidental === 'natural' ? 'natural' : 'sharp'} />
      )}
    </g>
  )
}

/** The sung syllables, with hyphens where two of them belong to one word. */
export function VoiceLyrics({
  g, layout, fontSize, opacity = 1, notes = PHRASE,
}: { g: StaffGeom; layout: L; fontSize?: number; opacity?: number; notes?: Note[] }) {
  const sung = notes.map((n, i) => (n.german ? i : -1)).filter((i) => i >= 0)
  return (
    <g fontFamily="var(--font-body)" fontSize={fontSize ?? g.gap * 0.82} fill="var(--ink-2)"
      opacity={opacity} letterSpacing="0.02em">
      {notes.map((n, i) => {
        if (!n.german) return null
        const next = sung.find((j) => j > i)
        return (
          <g key={n.id}>
            <text x={layout.xs[i]} y={layout.lyricY} textAnchor="middle">{n.german}</text>
            {n.hyphenAfter && next !== undefined && (
              <text x={(layout.xs[i] + layout.xs[next]) / 2} y={layout.lyricY} textAnchor="middle" opacity="0.75">-</text>
            )}
          </g>
        )
      })}
    </g>
  )
}
