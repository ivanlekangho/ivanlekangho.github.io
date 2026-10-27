import { PHRASE, PIECE, type Note } from '../../data/phrase'
import {
  accidentalPaths, barlineXs, bassClef, bassKeySharps, beatXs, cutTime, dotY,
  flagPath, hasFlag, HEAD_X, isDotted, ledgerLines, melismaGroups,
  needsAccidental, noteY, quarterRestPath, slurPath, staffLineYs,
  stemDirections, type StaffGeom,
} from '../../lib/notation'

/**
 * ONE engraving of the vocal line, used by both places it appears.
 *
 * The recital sheet and the staff hanging over the stage are the same two
 * bars of Schubert, so they are engraved by the same code: same cut time,
 * same barlines, same augmentation dots, same flags, same slur across
 * "Fremd", same closing rest. They used to be two renderers and they
 * drifted — the stage score lost every rhythm mark and showed nine
 * undifferentiated noteheads, which is a different piece of music.
 *
 * What differs between the two is only the horizontal axis. On its own the
 * sheet spaces itself; over the stage it borrows the system's axis, so the
 * singer's notes sit directly above the pianist's.
 *
 * The noteheads themselves are NOT drawn here. On the stage they morph into
 * tone contours and data points, so each caller owns them; this file owns
 * everything that is true only while the staff is being read as notation.
 */

/** Hand the layout a shared axis and it will use it instead of its own. */
export type Axis = { xAt: (beat: number) => number; barX: (beat: number, gap: number) => number }

export type Head = { clef: number; keySig: number; time: number }

export function headFor(g: StaffGeom): Head {
  return { clef: HEAD_X.clef(g), keySig: HEAD_X.keySig(g), time: HEAD_X.time(g) }
}

export function voiceLayout(
  g: StaffGeom, width: number, notes: Note[] = PHRASE, axis?: Axis,
) {
  if (axis) {
    const onsets: number[] = []
    let at = 0
    for (const n of notes) { onsets.push(at); at += n.beats }
    return {
      xs: onsets.map(axis.xAt),
      restX: axis.xAt(at),
      bars: [PIECE.pickupBeats, PIECE.pickupBeats + PIECE.beatsPerBar]
        .map((b) => axis.barX(b, g.gap)),
      dirs: stemDirections(notes, g),
      lyricY: g.bottomY + g.gap * 2.8,
    }
  }
  /* Standalone: the closing rest takes part in the spacing, so the last
     note is not flung at the final barline. */
  const all = beatXs([...notes, { beats: PIECE.trailingRest }], HEAD_X.firstNote(g), width - g.gap * 3)
  const xs = all.slice(0, notes.length)
  return {
    xs,
    restX: all[notes.length],
    bars: barlineXs(notes, xs, PIECE.pickupBeats, PIECE.beatsPerBar),
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
  const clef = bassClef(h.clef, g.bottomY - 3 * u, g)
  const time = cutTime(h.time, g)

  return (
    <>
      <g stroke="var(--staff)" strokeWidth="1">
        {staffLineYs(g).map((y) => <line key={y} x1={lineX0} y1={y} x2={width} y2={y} />)}
      </g>

      <g opacity="0.9" stroke="var(--ink)" strokeLinecap="round" fill="none">
        <path d={clef.curl} strokeWidth={u * 0.22} />
        <circle {...clef.head} fill="var(--ink)" stroke="none" />
        {clef.dots.map((d, i) => <circle key={i} {...d} fill="var(--ink)" stroke="none" />)}
      </g>

      {/* B minor: two sharps */}
      <g stroke="var(--ink-2)" strokeWidth={u * 0.095} fill="none" strokeLinecap="round">
        {bassKeySharps(g).map((k, i) => (
          <g key={i}>
            {accidentalPaths('sharp', h.keySig + k.x, k.y, g).map((d) => (
              <path key={d} d={d} />
            ))}
          </g>
        ))}
      </g>

      <g stroke="var(--ink)" strokeWidth={u * 0.17} fill="none" strokeLinecap="round" opacity="0.9">
        <path d={time.c} />
        <line x1={time.stem.x1} y1={time.stem.y1} x2={time.stem.x2} y2={time.stem.y2} />
      </g>

      <g stroke="var(--staff)" strokeWidth="1.2">
        {layout.bars.map((x) => (
          <line key={x} x1={x} y1={g.bottomY - 4 * u} x2={x} y2={g.bottomY} />
        ))}
      </g>

      <path d={quarterRestPath(layout.restX, g)} fill="none" stroke="var(--ink)"
        strokeWidth={u * 0.16} strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />

      <g stroke="var(--staff)">
        <line x1={width - u * 0.9} y1={g.bottomY - 4 * u} x2={width - u * 0.9} y2={g.bottomY} strokeWidth="1.1" />
        <line x1={width - u * 0.25} y1={g.bottomY - 4 * u} x2={width - u * 0.25} y2={g.bottomY} strokeWidth="3" />
      </g>

      {/* the one slur the score actually contains, across "Fremd" */}
      <g fill="none" stroke="var(--ink-2)" strokeWidth={u * 0.11} strokeLinecap="round" opacity="0.8">
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
  const stemX = x + (dir === 'up' ? u * 0.5 : -u * 0.5)
  const tip = dir === 'up' ? y - u * 2.9 : y + u * 2.9

  return (
    <g opacity={opacity}>
      <g stroke="var(--staff)" strokeWidth="1">
        {ledgerLines(n, g).map((ly) => (
          <line key={ly} x1={x - u * 0.95} y1={ly + (y - noteY(n, g))} x2={x + u * 0.95} y2={ly + (y - noteY(n, g))} />
        ))}
      </g>
      <g stroke={stroke} strokeWidth={u * 0.1} fill="none" strokeLinecap="round">
        <line x1={stemX} y1={y} x2={stemX} y2={tip} />
        {hasFlag(n.beats) && <path d={flagPath(stemX, tip, dir, g)} />}
      </g>
      {isDotted(n.beats) && (
        /* The on-line test has to use the note's STAFF position, not its
           current one — on the stage y is mid-morph. */
        <circle cx={x + u * 1.0} cy={y + dotY(noteY(n, g), g) - noteY(n, g)} r={u * 0.14}
          fill={stroke} />
      )}
      {needsAccidental(n, PIECE.keySignatureSharps) && (
        <g stroke="var(--ink-2)" strokeWidth={u * 0.09} fill="none" strokeLinecap="round">
          {accidentalPaths(n.accidental!, x - u * 1.5, y, g).map((d) => <path key={d} d={d} />)}
        </g>
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
