import { PHRASE, PIECE, type Note } from '../data/phrase'
import {
  bassClefPath, bassKeySharps, beatXs, diatonic, ledgerLines,
  noteY, staffLineYs, stemDirection, type StaffGeom,
} from '../lib/notation'

/**
 * A real, readable bass-clef staff for the phrase — used as the recurring
 * visual motif (section dividers, the recital room) and as state 0 of the
 * centerpiece.
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
  const xs = beatXs(notes, gap * 9, width - gap * 4)

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      role="img"
      aria-label={
        ariaLabel ??
        `${PIECE.composer}, ${PIECE.title} ${PIECE.catalogue} — "${PIECE.german}" in ${PIECE.key}, bass clef.`
      }
      style={{ display: 'block', overflow: 'visible' }}
    >
      {/* staff */}
      <g stroke="var(--rule)" strokeWidth="1">
        {staffLineYs(g).map((y) => (
          <line key={y} x1="0" y1={y} x2={width} y2={y} />
        ))}
      </g>

      {/* clef */}
      <path
        d={bassClefPath(gap * 0.8, fLineY, g)}
        fill="none"
        stroke="var(--ink)"
        strokeWidth={gap * 0.26}
        strokeLinecap="round"
        opacity="0.85"
      />
      <circle cx={gap * 1.15} cy={fLineY} r={gap * 0.3} fill="var(--ink)" opacity="0.85" />
      <circle cx={gap * 4.0} cy={fLineY - gap * 0.5} r={gap * 0.15} fill="var(--ink)" opacity="0.85" />
      <circle cx={gap * 4.0} cy={fLineY + gap * 0.5} r={gap * 0.15} fill="var(--ink)" opacity="0.85" />

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

      {/* notes */}
      {notes.map((n, i) => {
        const y = noteY(n, g)
        const dir = stemDirection(n, g)
        const stemY = dir === 'up' ? y - gap * 2.6 : y + gap * 2.6
        const tone = n.tone
        const fill = tone !== undefined ? `var(--t${tone}-mid)` : 'var(--t0-mid)'
        return (
          <g key={n.id}>
            {ledgerLines(n, g).map((ly) => (
              <line key={ly} x1={xs[i] - gap * 0.75} y1={ly} x2={xs[i] + gap * 0.75} y2={ly}
                stroke="var(--rule)" strokeWidth="1" />
            ))}
            <ellipse cx={xs[i]} cy={y} rx={gap * 0.52} ry={gap * 0.38} fill={fill}
              transform={`rotate(-16 ${xs[i]} ${y})`} />
            <line x1={xs[i] + (dir === 'up' ? gap * 0.5 : -gap * 0.5)} y1={y}
              x2={xs[i] + (dir === 'up' ? gap * 0.5 : -gap * 0.5)} y2={stemY}
              stroke="var(--ink)" strokeWidth="1.1" opacity="0.55" />
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
      <desc>
        Diatonic positions derived from note names, so enharmonics land on the
        correct line. Bottom line is G2 (diatonic index {diatonic('G', 2)}).
      </desc>
    </svg>
  )
}
