import { PHRASE, PIECE, type Note } from '../data/phrase'
import {
  barlineXs, bassClef, bassKeySharps, beatXs, cutTime, flagPath, hasFlag,
  isDotted, ledgerLines, melismaGroups, needsAccidental, noteheadPath, noteY,
  penLine, quarterRestPath, slurPath, staffLineYs, stemDirections, wobble,
  type StaffGeom,
} from '../lib/notation'

/**
 * A readable bass-clef engraving of the phrase — the recurring visual motif,
 * and state 0 of the centerpiece.
 *
 * Draws what's on Ivan's score: cut time, a pickup eighth, two bars,
 * augmentation dots, flags, barlines, syllable hyphens, and the ONE slur the
 * score contains (across "Fremd"). The Mandarin overlay's 客 span is not a
 * slur and is not drawn — see the two separate fields in phrase.ts.
 *
 * The staff is ruled; everything written on it is hand-drawn. Variation is
 * seeded per note so it's stable across renders.
 */
export default function StaffNotation({
  notes = PHRASE,
  width = 640,
  gap = 12,
  showSyllables = true,
  ariaLabel,
}: {
  notes?: Note[]
  width?: number
  gap?: number
  showSyllables?: boolean
  ariaLabel?: string
}) {
  const g: StaffGeom = { gap, bottomY: gap * 6 }
  const height = gap * 11
  const fLineY = g.bottomY - 3 * gap
  // the closing rest takes part in the spacing, so it sits where it belongs
  const layout = beatXs([...notes, { beats: PIECE.trailingRest }], gap * 11.5, width - gap * 3)
  const xs = layout.slice(0, notes.length)
  const restX = layout[notes.length]
  const bars = barlineXs(notes, xs, PIECE.pickupBeats, PIECE.beatsPerBar)
  const clef = bassClef(gap * 0.6, fLineY, g)
  const time = cutTime(gap * 8.2, g)
  const dirs = stemDirections(notes, g)
  const lyricY = g.bottomY + gap * 2.8
  const sungIdx = notes.map((n, i) => (n.german ? i : -1)).filter((i) => i >= 0)

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      role="img"
      aria-label={
        ariaLabel ??
        `${PIECE.composer}, ${PIECE.title} ${PIECE.catalogue} — "${PIECE.german}" in ${PIECE.key}, bass clef, cut time.`
      }
      style={{ display: 'block', overflow: 'visible' }}
    >
      {/* ruled manuscript paper */}
      <g stroke="var(--staff)" strokeWidth="1">
        {staffLineYs(g).map((y) => (
          <line key={y} x1="0" y1={y} x2={width} y2={y} />
        ))}
      </g>

      {/* clef */}
      <g opacity="0.88" stroke="var(--ink)" strokeLinecap="round" fill="none">
        <path d={clef.curl} strokeWidth={gap * 0.23} />
        <circle {...clef.head} fill="var(--ink)" stroke="none" />
        {clef.dots.map((d, i) => <circle key={i} {...d} fill="var(--ink)" stroke="none" />)}
      </g>

      {/* key signature — B minor, two sharps */}
      <g stroke="var(--ink-2)" strokeWidth="1.1" fill="none" strokeLinecap="round">
        {bassKeySharps(g).map((s, i) => {
          const x = gap * 5.3 + s.x
          const w = (n: number) => wobble(`ks${i}`, n) * 0.6
          return (
            <g key={i}>
              <path d={penLine(x, s.y - gap * 0.85, x + w(1), s.y + gap * 0.62, 0.4)} />
              <path d={penLine(x + gap * 0.3, s.y - gap * 0.98, x + gap * 0.3 + w(2), s.y + gap * 0.5, 0.4)} />
              <path d={penLine(x - gap * 0.2, s.y - gap * 0.16, x + gap * 0.5, s.y - gap * 0.32, 0.3)} />
              <path d={penLine(x - gap * 0.2, s.y + gap * 0.26, x + gap * 0.5, s.y + gap * 0.1, 0.3)} />
            </g>
          )
        })}
      </g>

      {/* cut time */}
      <g stroke="var(--ink)" strokeWidth={gap * 0.2} fill="none" strokeLinecap="round" opacity="0.88">
        <path d={time.c} />
        <path d={penLine(time.stem.x1, time.stem.y1, time.stem.x2, time.stem.y2, 0.5)} />
      </g>

      {/* barlines — hand-ruled, so very slightly off true */}
      <g stroke="var(--staff)" strokeWidth="1.4" fill="none" strokeLinecap="round">
        {bars.map((x, i) => (
          <path key={x} d={penLine(x, g.bottomY - 4 * gap, x + wobble(`bar${i}`, 1) * 1.2, g.bottomY, 0.7)} />
        ))}
      </g>

      {/* closing quarter rest, then the final double bar */}
      <path d={quarterRestPath(restX, g)} fill="none" stroke="var(--ink)"
        strokeWidth={gap * 0.17} strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
      <g stroke="var(--staff)" fill="none" strokeLinecap="round">
        <path strokeWidth="1.2"
          d={penLine(width - gap * 0.9, g.bottomY - 4 * gap, width - gap * 0.9, g.bottomY, 0.5)} />
        <path strokeWidth="3"
          d={penLine(width - gap * 0.3, g.bottomY - 4 * gap, width - gap * 0.3, g.bottomY, 0.4)} />
      </g>

      {/* the score's one slur */}
      <g fill="none" stroke="var(--ink-2)" strokeWidth="1.3" strokeLinecap="round" opacity="0.72">
        {melismaGroups(notes).map(([a, b]) => (
          <path key={`${a}-${b}`}
            d={slurPath(xs[a], noteY(notes[a], g), xs[b], noteY(notes[b], g), g)} />
        ))}
      </g>

      {/* notes */}
      {notes.map((n, i) => {
        const y = noteY(n, g)
        const dir = dirs[i]
        const stemX = xs[i] + (dir === 'up' ? gap * 0.5 : -gap * 0.5)
        const stemLen = gap * (2.8 + wobble(n.id, 7) * 0.22)
        const stemY = dir === 'up' ? y - stemLen : y + stemLen
        const fill = n.tone !== undefined ? `var(--t${n.tone}-mid)` : 'var(--t0-mid)'
        const tilt = -16 + wobble(n.id, 5) * 7
        const onLine = Math.round((g.bottomY - y) / (gap / 2)) % 2 === 0
        return (
          <g key={n.id}>
            {ledgerLines(n, g).map((ly) => (
              <path key={ly} fill="none" stroke="var(--staff)" strokeWidth="1"
                d={penLine(xs[i] - gap * 0.85, ly, xs[i] + gap * 0.85, ly, 0.5)} />
            ))}
            <path d={noteheadPath(gap * 0.58, gap * 0.42, n.id)} fill={fill}
              transform={`translate(${xs[i]} ${y}) rotate(${tilt})`} />
            <path fill="none" stroke="var(--ink)" strokeWidth="1.2" strokeLinecap="round" opacity="0.62"
              d={penLine(stemX, y, stemX + wobble(n.id, 8) * 1.1, stemY, 0.8)} />
            {hasFlag(n.beats) && (
              <path d={flagPath(stemX, stemY, dir, g)} fill="none" stroke="var(--ink)"
                strokeWidth="1.2" strokeLinecap="round" opacity="0.62" />
            )}
            {isDotted(n.beats) && (
              <circle cx={xs[i] + gap * 1.05} cy={onLine ? y - gap * 0.5 : y}
                r={gap * 0.15} fill="var(--ink)" opacity="0.72" />
            )}
            {needsAccidental(n, PIECE.keySignatureSharps) && (
              <g stroke="var(--ink-2)" strokeWidth="1" fill="none" strokeLinecap="round">
                <path d={penLine(xs[i] - gap * 1.5, y - gap * 0.75, xs[i] - gap * 1.5, y + gap * 0.6, 0.3)} />
                <path d={penLine(xs[i] - gap * 1.1, y - gap * 0.85, xs[i] - gap * 1.1, y + gap * 0.5, 0.3)} />
                <path d={penLine(xs[i] - gap * 1.8, y - gap * 0.18, xs[i] - gap * 0.8, y - gap * 0.34, 0.25)} />
                <path d={penLine(xs[i] - gap * 1.8, y + gap * 0.24, xs[i] - gap * 0.8, y + gap * 0.08, 0.25)} />
              </g>
            )}
          </g>
        )
      })}

      {/* lyrics, with hyphens joining the syllables of one word */}
      {showSyllables && (
        <g fontFamily="var(--font-body)" fontSize={gap * 0.85} fill="var(--ink-2)">
          {notes.map((n, i) => {
            if (!n.german) return null
            const next = sungIdx.find((j) => j > i)
            return (
              <g key={n.id}>
                <text x={xs[i]} y={lyricY} textAnchor="middle">{n.german}</text>
                {n.hyphenAfter && next !== undefined && (
                  <text x={(xs[i] + xs[next]) / 2} y={lyricY} textAnchor="middle" opacity="0.8">-</text>
                )}
              </g>
            )
          })}
        </g>
      )}
    </svg>
  )
}
