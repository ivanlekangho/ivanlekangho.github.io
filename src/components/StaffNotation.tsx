import { PHRASE, PIECE, type Note } from '../data/phrase'
import {
  barlineXs, bassClef, bassKeySharps, beatXs, flagPath, hasFlag, isDotted,
  ledgerLines, melismaGroups, noteY, slurPath, staffLineYs, stemDirection,
  type StaffGeom,
} from '../lib/notation'

/**
 * A readable bass-clef engraving of the phrase — the recurring visual motif,
 * and state 0 of the centerpiece.
 *
 * Draws what's actually on Ivan's score: cut time, a pickup eighth, two bars,
 * augmentation dots, flags, barlines, and the ONE slur the score contains
 * (across "Fremd"). The Mandarin overlay's 客 span is not a slur and is not
 * drawn here — see the two separate fields in phrase.ts.
 * The closing quarter rest is omitted; the phrase display stops on "all".
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
  const left = gap * 11
  const xs = beatXs(notes, left, width - gap * 3)
  const bars = barlineXs(notes, xs, PIECE.pickupBeats, PIECE.beatsPerBar)
  const clef = bassClef(gap * 0.6, fLineY, g)

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
      <g stroke="var(--staff)" strokeWidth="1">
        {staffLineYs(g).map((y) => (
          <line key={y} x1="0" y1={y} x2={width} y2={y} />
        ))}
      </g>

      {/* bass clef, drawn as a line rather than an engraved glyph so it sits
          with the rest of the site's thin-line vocabulary */}
      <g opacity="0.85">
        <path d={clef.curl} fill="none" stroke="var(--ink)" strokeWidth={gap * 0.22} strokeLinecap="round" />
        <circle {...clef.head} fill="var(--ink)" />
        {clef.dots.map((d, i) => <circle key={i} {...d} fill="var(--ink)" />)}
      </g>

      {/* key signature — B minor, two sharps */}
      <g stroke="var(--ink-2)" strokeWidth="1.1" fill="none">
        {bassKeySharps(g).map((s, i) => {
          const x = gap * 5.4 + s.x
          return (
            <g key={i}>
              <line x1={x} y1={s.y - gap * 0.9} x2={x} y2={s.y + gap * 0.7} />
              <line x1={x + 3.2} y1={s.y - gap * 1.05} x2={x + 3.2} y2={s.y + gap * 0.55} />
              <line x1={x - 2} y1={s.y - gap * 0.22} x2={x + 5.2} y2={s.y - gap * 0.42} />
              <line x1={x - 2} y1={s.y + gap * 0.28} x2={x + 5.2} y2={s.y + gap * 0.08} />
            </g>
          )
        })}
      </g>

      {/* cut time */}
      <g fill="none" stroke="var(--ink)" strokeWidth={gap * 0.22} opacity="0.85">
        <path d={`M ${gap * 9.3},${g.bottomY - gap * 2.6}
                  a ${gap * 1.1},${gap * 1.4} 0 1 0 0,${gap * 2.8}`} />
        <line x1={gap * 8.8} y1={g.bottomY - gap * 3.4} x2={gap * 8.8} y2={g.bottomY - gap * 0.6} />
      </g>

      {/* barlines */}
      <g stroke="var(--staff)" strokeWidth="1.4">
        {bars.map((x) => (
          <line key={x} x1={x} y1={g.bottomY - 4 * gap} x2={x} y2={g.bottomY} />
        ))}
      </g>

      {/* slurs marking the melismas */}
      <g fill="none" stroke="var(--ink-2)" strokeWidth="1.2" opacity="0.7">
        {melismaGroups(notes).map(([a, b]) => (
          <path key={`${a}-${b}`}
            d={slurPath(xs[a], noteY(notes[a], g), xs[b], noteY(notes[b], g), g)} />
        ))}
      </g>

      {/* notes */}
      {notes.map((n, i) => {
        const y = noteY(n, g)
        const dir = stemDirection(n, g)
        const stemX = xs[i] + (dir === 'up' ? gap * 0.5 : -gap * 0.5)
        const stemY = dir === 'up' ? y - gap * 2.8 : y + gap * 2.8
        const fill = n.tone !== undefined ? `var(--t${n.tone}-mid)` : 'var(--t0-mid)'
        // a dot sits in a space: if the note is on a line, nudge it up half a gap
        const onLine = Math.round((g.bottomY - y) / (gap / 2)) % 2 === 0
        return (
          <g key={n.id}>
            {ledgerLines(n, g).map((ly) => (
              <line key={ly} x1={xs[i] - gap * 0.85} y1={ly} x2={xs[i] + gap * 0.85} y2={ly}
                stroke="var(--staff)" strokeWidth="1" />
            ))}
            <ellipse cx={xs[i]} cy={y} rx={gap * 0.58} ry={gap * 0.42} fill={fill}
              transform={`rotate(-16 ${xs[i]} ${y})`} />
            <line x1={stemX} y1={y} x2={stemX} y2={stemY}
              stroke="var(--ink)" strokeWidth="1.1" opacity="0.6" />
            {hasFlag(n.beats) && (
              <path d={flagPath(stemX, stemY, dir, g)} fill="none" stroke="var(--ink)"
                strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
            )}
            {isDotted(n.beats) && (
              <circle cx={xs[i] + gap * 1.05} cy={onLine ? y - gap * 0.5 : y}
                r={gap * 0.15} fill="var(--ink)" opacity="0.7" />
            )}
            {n.accidental === 'sharp' && (
              <g stroke="var(--ink-2)" strokeWidth="1" fill="none">
                <line x1={xs[i] - gap * 1.5} y1={y - gap * 0.75} x2={xs[i] - gap * 1.5} y2={y + gap * 0.6} />
                <line x1={xs[i] - gap * 1.1} y1={y - gap * 0.85} x2={xs[i] - gap * 1.1} y2={y + gap * 0.5} />
                <line x1={xs[i] - gap * 1.8} y1={y - gap * 0.18} x2={xs[i] - gap * 0.8} y2={y - gap * 0.34} />
                <line x1={xs[i] - gap * 1.8} y1={y + gap * 0.24} x2={xs[i] - gap * 0.8} y2={y + gap * 0.08} />
              </g>
            )}
            {showSyllables && n.german && (
              <text x={xs[i]} y={g.bottomY + gap * 2.6} textAnchor="middle"
                fontFamily="var(--font-body)" fontSize={gap * 0.85} fill="var(--ink-2)">
                {n.german}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}
