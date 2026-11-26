import { useState } from 'react'
import { PHRASE } from '../../data/phrase'
import { SYS, barX, xAt } from '../../lib/beatmap'
import { noteY, type StaffGeom } from '../../lib/notation'
import { Glyph } from '../../lib/smufl'
import { NoteMarks, VoiceLyrics, VoiceStaffFurniture, voiceLayout } from './VoiceStaff'
import { PianoSystem } from './Piano'

/**
 * The bar the line comes from, engraved — voice over piano.
 *
 * Nine notes for eight German syllables, in B minor for baritone, with the
 * one slur the score actually contains across "Fremd". It is the phrase
 * About is named after, so About is where it belongs: a reader who has just
 * read "I am a stranger everywhere" can see what Schubert did with it
 * without being asked to go anywhere.
 *
 * The accompaniment is here now too. It was always in the data — read out
 * of Ivan's MuseScore file and transposed into B minor — and drawing only
 * the vocal line made the one claim the engraving should not make, that the
 * song is unaccompanied. The piano is the half that modulates: the phrase
 * begins in B minor and lands in D major, and the voice alone cannot show
 * that.
 *
 * Both staves read their x positions from one shared axis (lib/beatmap), so
 * a chord struck on beat 3 sits directly under the syllable sung on beat 3.
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
 * engraving lives in score/VoiceStaff and score/Piano.
 */

/* The three staves of the system, top to bottom: the singer, then the
   pianist's two hands. One gap throughout — a system whose staves are ruled
   at different sizes reads as two scores photographed together. */
const GAP = 14
const VOICE: StaffGeom = { gap: GAP, bottomY: 108 }
const RH_BOTTOM = 258
const LH_BOTTOM = 366
const H = 418

/**
 * The recording, when there is one.
 *
 * Ivan is going to sing this phrase and the file is not here yet, so the
 * button says so rather than pretending. It is a real button that gives a
 * real answer, because the alternative — a disabled control, or no control
 * until the file lands — tells a reader nothing about whether a recording
 * is coming. `aria-live` so the answer is announced and not only drawn.
 */
function Recording() {
  const [asked, setAsked] = useState(false)

  return (
    <div className="phrase-play">
      <button type="button" className="player-go" onClick={() => setAsked(true)}
        aria-label="Play Ivan singing this phrase">
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M8 5.2 19 12 8 18.8Z" fill="currentColor" />
        </svg>
      </button>
      <p className="phrase-play-say" aria-live="polite">
        {asked
          ? <><b>Coming soon.</b> Ivan singing the phrase.</>
          : 'Hear it sung'}
      </p>
    </div>
  )
}

export default function Wanderer() {
  const layout = voiceLayout(VOICE, PHRASE, { xAt, barX })

  return (
    <figure className="wanderer">
      <svg
        className="wanderer-svg"
        viewBox={`0 0 ${SYS.w} ${H}`}
        role="img"
        aria-label="Schubert, Der Wanderer, D.489 — the bar setting “Ich bin ein Fremdling überall”, in B minor for baritone, with the piano accompaniment"
      >
        {/* The singer. `head` is passed explicitly so the clef, key
            signature and time signature land on the system's own axis: the
            defaults in notation.HEAD_X are measured in staff spaces from
            zero, which put the bass clef at x≈8 while the staff lines began
            at 52 — the clef was floating 44px off the left end of its own
            stave, and the key signature and cut time with it. */}
        <VoiceStaffFurniture g={VOICE} width={SYS.w} layout={layout} lineX0={SYS.staffLeft}
          head={{ clef: SYS.clef, keySig: SYS.keySig, time: SYS.time }} />
        {PHRASE.map((n, i) => (
          <g key={n.id}>
            <NoteMarks n={n} x={layout.xs[i]} y={noteY(n, VOICE)} dir={layout.dirs[i]} g={VOICE} />
            <Glyph
              name={n.beats >= 2 ? 'noteheadHalf' : 'noteheadBlack'}
              x={layout.xs[i]} y={noteY(n, VOICE)} gap={VOICE.gap} centre
            />
          </g>
        ))}
        <VoiceLyrics g={VOICE} layout={layout} />

        {/* The pianist. */}
        <PianoSystem gap={GAP} rhBottom={RH_BOTTOM} lhBottom={LH_BOTTOM} />
      </svg>

      <Recording />
</figure>
  )
}
