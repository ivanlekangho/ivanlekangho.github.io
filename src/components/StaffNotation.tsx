import { PHRASE, PIECE, type Note } from '../data/phrase'
import { noteY, type StaffGeom } from '../lib/notation'
import { NoteMarks, VoiceLyrics, VoiceStaffFurniture, voiceLayout } from './score/VoiceStaff'

/**
 * The vocal line as a readable sheet: cut time, a pickup eighth, two bars,
 * augmentation dots, flags, barlines, hyphenated syllables, and the one
 * slur the score contains (across "Fremd"). The Mandarin overlay's 客 span
 * is a mapping choice, not a slur, and is deliberately not drawn — see the
 * two separate fields in phrase.ts.
 *
 * Every mark except the noteheads comes from score/VoiceStaff, which the
 * stage score uses too, so the two can't drift apart.
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
  const L = voiceLayout(g, width, notes)

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
      <VoiceStaffFurniture g={g} width={width} layout={L} />

      {notes.map((n, i) => {
        const y = noteY(n, g)
        return (
          <g key={n.id}>
            <NoteMarks n={n} x={L.xs[i]} y={y} dir={L.dirs[i]} g={g} />
            <ellipse cx={L.xs[i]} cy={y} rx={gap * 0.6} ry={gap * 0.43}
              transform={`rotate(-20 ${L.xs[i]} ${y})`}
              fill={`var(--t${n.tone ?? 0}-mid)`} />
          </g>
        )
      })}

      {showSyllables && <VoiceLyrics g={g} layout={L} notes={notes} />}
    </svg>
  )
}
