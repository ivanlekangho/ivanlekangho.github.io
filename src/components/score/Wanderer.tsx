import { PHRASE } from '../../data/phrase'
import { SYS, barX, xAt } from '../../lib/beatmap'
import { noteY, type StaffGeom } from '../../lib/notation'
import { Glyph } from '../../lib/smufl'
import { NoteMarks, VoiceLyrics, VoiceStaffFurniture, voiceLayout } from './VoiceStaff'

/**
 * The bar the line comes from, engraved.
 *
 * Nine notes for eight German syllables, in B minor for baritone, with the
 * one slur the score actually contains across "Fremd". It is the phrase
 * About is named after, so About is where it belongs: a reader who has just
 * read "I am a stranger everywhere" can see what Schubert did with it
 * without being asked to go anywhere.
 *
 * This is all that survives of the recital room, along with the tone
 * generator. The room walked this same phrase through three readings —
 * notation, Mandarin tone contour, acoustics — on a rail, over a drawn
 * stage, under a lighting board that interpolated twenty-six colours a
 * frame. That was a lot of machinery to make one argument, and the argument
 * reads better stated twice and quietly than performed once and loudly: the
 * score here, the physics under Creative.
 *
 * Everything that is a symbol is a Bravura glyph and everything that is a
 * rule is a line at the thickness Bravura's own metadata asks for; the
 * engraving itself lives in score/VoiceStaff, which the room used too.
 * Nothing about the notation is new — only the frame around it.
 */

/** Taller than the stage's, because nothing is stacked beneath it now. */
const GEO: StaffGeom = { gap: 14, bottomY: 108 }
const H = 170

export default function Wanderer() {
  const layout = voiceLayout(GEO, PHRASE, { xAt, barX })

  return (
    <figure className="wanderer">
      <svg
        className="wanderer-svg"
        viewBox={`0 0 ${SYS.w} ${H}`}
        role="img"
        aria-label="Schubert, Der Wanderer, D.489 — the bar setting “Ich bin ein Fremdling überall”, in B minor for baritone"
      >
        <VoiceStaffFurniture g={GEO} width={SYS.w} layout={layout} lineX0={SYS.staffLeft} />
        {PHRASE.map((n, i) => (
          <g key={n.id}>
            <NoteMarks n={n} x={layout.xs[i]} y={noteY(n, GEO)} dir={layout.dirs[i]} g={GEO} />
            <Glyph
              name={n.beats >= 2 ? 'noteheadHalf' : 'noteheadBlack'}
              x={layout.xs[i]} y={noteY(n, GEO)} gap={GEO.gap} centre
            />
          </g>
        ))}
        <VoiceLyrics g={GEO} layout={layout} />
      </svg>
      <figcaption>
        Schubert, <cite>Der Wanderer</cite>, D.489 — transposed to B minor for
        baritone. Nine notes for eight syllables: the slur falls inside
        “Fremd”, not on “ich”.
      </figcaption>
    </figure>
  )
}
