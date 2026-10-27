import { useEffect, useState } from 'react'
import { ease, range } from '../../lib/easing'

/**
 * The hall.
 *
 * One Steinway in three-quarter view with the lid on the full stick, one
 * baritone standing in the curve of it, and a stage floor that reflects
 * both. Every colour comes from the lighting board (src/lib/palette.ts) as
 * a custom property, so the rail brings the lights up on this scene rather
 * than swapping it for another drawing.
 *
 * The piano is not drawn freehand. A grand's plan is three things — a long
 * straight spine, a straight keyboard end, and one bent rim that tapers
 * from the full width at the keyboard to a narrow tail — and if you round
 * all of that off you get an oval table. So the case is projected from
 * plan coordinates through PROJ below, and every other part of the
 * instrument is built on those same points.
 *
 * The room itself changes with the rail: tone marks hang in the air at the
 * linguist stop, and the boards take a measured grid at the engineer stop.
 * Nothing else leaves the performers — two drawn lines used to run from the
 * lid and the singer up off the top of the frame, and with the score now
 * bracketed as one system directly above them they read as stray marks.
 */

const W = 1200
const H = 660
const FLOOR = 330   /* where the back wall meets the boards */

/* Plan → screen. x runs the length of the instrument from keyboard to
   tail, y across its width from spine to bent side. */
const OX = 230
const OY = 300
const px = (x: number, y: number) => OX + x + y * 0.55
const py = (x: number, y: number) => OY - x * 0.18 + y * 0.42
const P = (x: number, y: number) => `${px(x, y).toFixed(0)} ${py(x, y).toFixed(0)}`

/* The four corners everything else hangs off.
   A spine-at-keyboard · B bent-rim-at-keyboard · C spine-at-tail · T tail */

/** Case seen from above: keyboard edge, bent rim tapering to the tail,
 *  then the spine straight back to where it started. */
const CASE_TOP =
  'M230 300 L340 384 C400 374 500 338 564 310 C620 286 668 262 685 242 \
C694 230 680 220 660 223 Z'

/** The same outline extruded down by the depth of the rim. */
const CASE_RIM =
  'M230 300 L230 326 L340 410 C400 400 500 364 564 336 C620 312 668 288 685 268 \
C694 256 680 246 660 249 L660 223 C680 220 694 230 685 242 C668 262 620 286 564 310 \
C500 338 400 374 340 384 Z'

/** The lid is the same plan shape hinged on the spine and swung up, so its
 *  free edge is the bent rim reflected across the spine and lifted. */
const LID =
  'M230 300 L307 172 C360 165 470 160 542 167 C590 172 645 184 677 193 \
C686 196 668 212 660 223 Z'

/** The lid has a thickness, and you see it from underneath. Without this
 *  strip the lid reads as a sheet of paper standing on edge. */
const LID_EDGE =
  'M307 172 C360 165 470 160 542 167 C590 172 645 184 677 193 L677 200 \
C645 191 590 179 542 174 C470 167 360 172 307 179 Z'

/** Long in the bass along the spine, short in the treble, fanning off the
 *  pin block at the keyboard end. */
const STRINGS = Array.from({ length: 16 }, (_, i) => {
  const y = 12 + i * 11
  const xEnd = 420 - i * 14
  return `M${P(40, y)} L${P(xEnd, y)}`
})

/** A tapered grand leg: wider at the knee than at the foot. */
function leg(xTop: number, yTop: number, xFoot: number, yFoot: number, wTop: number, wFoot: number) {
  return `M${xTop - wTop} ${yTop} L${xTop + wTop} ${yTop} L${xFoot + wFoot} ${yFoot} \
L${xFoot - wFoot} ${yFoot} Z`
}

/* The whole stage is drawn at a comfortable working size and then placed
   with one transform, so the camera can be pulled back without touching a
   single coordinate. SCENE is that placement; STAGE_* are the numbers it
   was drawn against. */
const SCENE = { x: 241.2, y: 191.2, k: 0.70 }

/** A phone viewport is far taller than the stage, and covering it with the
 *  full drawing crops away everything but the middle of the instrument. So
 *  on a phone the stage becomes a band at the foot of the room, framed on
 *  the performers rather than on the whole hall. .room carries the hall
 *  colour up the rest of the page, so there is no seam. */
const CLOSE_UP = '265 248 622 372'   /* piano and singer, nothing else */

function useNarrow() {
  const q = '(max-width: 62rem)'
  const [narrow, setNarrow] = useState(
    () => typeof matchMedia === 'function' && matchMedia(q).matches,
  )
  useEffect(() => {
    const m = matchMedia(q)
    const on = () => setNarrow(m.matches)
    m.addEventListener('change', on)
    return () => m.removeEventListener('change', on)
  }, [])
  return narrow
}

export default function StageScene({ p = 0 }: { p?: number }) {
  const narrow = useNarrow()
  /* Peaks at the language stop and is gone at both ends. */
  const tone = Math.max(0, 1 - Math.abs(p - 0.5) / 0.38)
  const eng = ease(range(p, 0.52, 1))
  const dark = 1 - ease(range(p, 0, 0.55))

  return (
    <svg
      viewBox={narrow ? CLOSE_UP : `0 0 ${W} ${H}`}
      className="stage-svg"
      aria-hidden="true"
      preserveAspectRatio="xMidYMax slice"
    >
      <defs>
        <radialGradient id="pool" cx="46%" cy="76%" r="42%">
          <stop offset="0%" stopColor="var(--pool)" stopOpacity="var(--pool-alpha)" />
          <stop offset="46%" stopColor="var(--pool)" stopOpacity="calc(var(--pool-alpha) * 0.42)" />
          <stop offset="100%" stopColor="var(--pool)" stopOpacity="0" />
        </radialGradient>
        {/* a polished lid is bright where it catches the rig, near black
            where it doesn't — the gloss is most of what says "Steinway" */}
        <linearGradient id="gloss" x1="0.1" y1="0" x2="0.45" y2="1">
          <stop offset="0%" stopColor="var(--piano-edge)" stopOpacity="0.30" />
          <stop offset="38%" stopColor="var(--piano-lid)" stopOpacity="1" />
          <stop offset="100%" stopColor="var(--piano-body)" stopOpacity="1" />
        </linearGradient>
        <linearGradient id="caseGloss" x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0%" stopColor="var(--piano-body)" stopOpacity="1" />
          <stop offset="70%" stopColor="var(--piano-lid)" stopOpacity="1" />
        </linearGradient>
        <linearGradient id="refl" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--piano-edge)" stopOpacity="0.22" />
          <stop offset="100%" stopColor="var(--piano-edge)" stopOpacity="0" />
        </linearGradient>
        {/* the back wall is not evenly black: the rig spills onto it behind
            the performers, which is what gives the hall any depth at all */}
        <radialGradient id="spill" cx="48%" cy="100%" r="62%">
          <stop offset="0%" stopColor="var(--pool)" stopOpacity="0.16" />
          <stop offset="100%" stopColor="var(--pool)" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="shadow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#000" stopOpacity="0.62" />
          <stop offset="62%" stopColor="#000" stopOpacity="0.30" />
          <stop offset="100%" stopColor="#000" stopOpacity="0" />
        </radialGradient>
        {/* Depth of field. The performers are the thing the score is ABOUT,
            not the thing you read, so they sit behind it: softened, dimmed
            and a little desaturated. The room's light itself is untouched —
            blurring the pool as well would just look like a smeared page. */}
        <filter id="depth" x="-15%" y="-15%" width="130%" height="130%"
          colorInterpolationFilters="sRGB">
          <feGaussianBlur stdDeviation="1.7" result="soft" />
          <feColorMatrix in="soft" type="saturate" values="0.76" />
        </filter>

        <radialGradient id="vignette" cx="50%" cy="56%" r="74%">
          <stop offset="52%" stopColor="#000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.70" />
        </radialGradient>
        <clipPath id="caseClip"><path d={CASE_TOP} /></clipPath>
      </defs>

      {/* ---------------- the room ---------------- */}
      <rect x="0" y="0" width={W} height={H} fill="var(--bg)" />
      <rect x="0" y="0" width={W} height={FLOOR} fill="var(--hall)" />
      <g stroke="var(--hall-line)" strokeWidth="1.2">
        {[90, 290, 490, 700, 900, 1100].map((x) => (
          <path key={x} d={`M${x} 0 L${x} ${FLOOR}`} />
        ))}
      </g>
      <g stroke="var(--piano-edge)" strokeWidth="0.5" opacity={eng * 0.18}>
        {Array.from({ length: 12 }, (_, i) => (
          <path key={`gh${i}`} d={`M0 ${i * 32} L${W} ${i * 32}`} />
        ))}
        {Array.from({ length: 38 }, (_, i) => (
          <path key={`gv${i}`} d={`M${i * 32} 0 L${i * 32} ${FLOOR}`} />
        ))}
      </g>

      <rect x="0" y="0" width={W} height={FLOOR} fill="url(#spill)" />

      <rect x="0" y={FLOOR - 2} width={W} height={H - FLOOR + 2} fill="var(--boards)" />
      <g stroke="var(--floor-edge)" strokeWidth="0.8" opacity="0.45">
        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <path key={`b${i}`} d={`M${60 + i * 140} ${FLOOR} L${-260 + i * 210} ${H}`} />
        ))}
      </g>
      <g stroke="var(--piano-edge)" strokeWidth="0.6" opacity={eng * 0.24} fill="none">
        {[412, 452, 500, 558, 626, 704].map((y) => (
          <path key={`fg${y}`} d={`M0 ${y} L${W} ${y}`} />
        ))}
      </g>
      <path d={`M0 ${FLOOR} L${W} ${FLOOR}`} stroke="var(--floor-edge)" strokeWidth="1.2" />

      <rect x="0" y="0" width={W} height={H} fill="url(#pool)" />

      {/* Tone marks hanging in the air at the language stop. Faint, and only
          three of them: the score itself now draws the tone contours, so
          these are an echo of it rather than a second legend. They keep to
          the left of the instrument, because `slice` crops this drawing
          differently at every window size and anything further right ends up
          under the score. */}
      <g opacity={tone * 0.42} fill="none" strokeWidth="3" strokeLinecap="round">
        <path d="M118 306 L174 306" stroke="var(--t1-mid)" />
        <path d="M212 326 L260 288" stroke="var(--t2-mid)" />
        <path d="M296 292 C308 322 334 322 346 292" stroke="var(--t3-mid)" />
      </g>

      {/* ---------------- everything standing on the boards ---------------- */}
      <g transform={`translate(${SCENE.x},${SCENE.y}) scale(${SCENE.k})`}
        filter="url(#depth)" opacity="0.8">

      {/* ---------------- bench ---------------- */}
      <g>
        <ellipse cx="136" cy="476" rx="104" ry="20" fill="url(#shadow)"
          opacity={0.7 + dark * 0.3} />
        <path d={leg(64, 378, 60, 470, 3.5, 2.6)} fill="var(--piano-body)" />
        <path d={leg(148, 354, 146, 448, 3.5, 2.6)} fill="var(--piano-body)" />
        <path d={leg(210, 372, 214, 464, 3.5, 2.6)} fill="var(--piano-body)" />
        <path d={leg(126, 398, 124, 492, 3.5, 2.6)} fill="var(--piano-body)" />
        <path d="M60 372 L60 382 L124 402 L124 392 Z" fill="var(--piano-body)" />
        <path d="M124 392 L124 402 L214 376 L214 366 Z" fill="var(--piano-body)" />
        <path d="M60 372 L150 348 L214 366 L124 392 Z" fill="var(--piano-lid)" />
        <path d="M60 372 L150 348 L214 366 L124 392 Z" fill="none"
          stroke="var(--piano-edge)" strokeWidth="0.8" opacity="0.55" />
      </g>

      {/* ---------------- the Steinway ---------------- */}
      <g>
        {/* cast shadow first, so the legs stand in it */}
        <ellipse cx="460" cy="544" rx="300" ry="44" fill="url(#shadow)"
          opacity={0.75 + dark * 0.25} />

        <path d={leg(238, 328, 232, 498, 13, 10)} fill="var(--piano-body)" />
        <path d={leg(332, 410, 328, 560, 15, 11)} fill="var(--piano-body)" />
        <path d={leg(674, 268, 682, 418, 13, 10)} fill="var(--piano-body)" />
        <g stroke="var(--piano-edge)" strokeWidth="0.8" opacity="0.45" fill="none">
          <path d="M231 332 L226 496" /><path d="M324 414 L321 558" /><path d="M667 272 L674 416" />
        </g>

        {/* pedal lyre */}
        <path d="M370 352 L376 404 M398 356 L394 404" stroke="var(--piano-body)"
          strokeWidth="6" fill="none" strokeLinecap="round" />
        <path d="M362 404 L410 404 L404 416 L368 416 Z" fill="var(--piano-body)" />
        <g stroke="var(--piano-edge)" strokeWidth="2" strokeLinecap="round" opacity="0.9">
          <path d="M374 420 L374 429" /><path d="M386 421 L386 430" /><path d="M398 420 L398 429" />
        </g>

        {/* rim, then the top, then what lives inside it */}
        <path d={CASE_RIM} fill="url(#caseGloss)" />
        <path d={CASE_TOP} fill="var(--piano-body)" />
        <g clipPath="url(#caseClip)">
          <path d={CASE_TOP} fill="var(--piano-edge)" opacity="0.20" />
          <g stroke="var(--string)" strokeWidth="0.8" opacity="0.62">
            {STRINGS.map((d, i) => <path key={i} d={d} />)}
          </g>
          {/* pin block at the keyboard end, dampers across the middle */}
          <path d={`M${P(24, 6)} L${P(24, 190)}`} stroke="var(--piano-body)" strokeWidth="18" />
          <path d={`M${P(150, 6)} L${P(150, 150)}`} stroke="var(--piano-body)"
            strokeWidth="7" opacity="0.8" />
        </g>
        <path d={CASE_TOP} fill="none" stroke="var(--piano-edge)" strokeWidth="1" opacity="0.7" />
        <path d="M230 300 L340 384 C400 374 500 338 564 310 C620 286 668 262 685 242"
          fill="none" stroke="var(--piano-edge)" strokeWidth="1.3" opacity="0.9" />
        <path d="M230 326 L340 410 C400 400 500 364 564 336 C620 312 668 288 685 268"
          fill="none" stroke="var(--piano-edge)" strokeWidth="0.6" opacity="0.38" />

        {/* lid on the full stick */}
        <path d={LID} fill="url(#gloss)" />
        <path d={LID_EDGE} fill="var(--piano-body)" />
        <path d={LID} fill="none" stroke="var(--piano-edge)" strokeWidth="1.1" opacity="0.75" />
        <path d="M307 172 C360 165 470 160 542 167 C590 172 645 184 677 193"
          fill="none" stroke="var(--piano-edge)" strokeWidth="1.6" opacity="0.95" />
        <path d="M316 190 C376 183 474 179 540 186 C592 191 640 201 666 209"
          fill="none" stroke="var(--piano-edge)" strokeWidth="0.7" opacity="0.28" />
        <path d="M564 310 L544 172" stroke="var(--piano-edge)" strokeWidth="2.6"
          strokeLinecap="round" opacity="0.8" />

        {/* keyboard: naturals, sharps, keyslip, cheek blocks */}
        <path d="M230 300 L340 384 L280 395 L170 311 Z" fill="var(--keys)" />
        <g stroke="var(--piano-body)" strokeWidth="0.6" opacity="0.4">
          {Array.from({ length: 19 }, (_, i) => {
            const f = (i + 1) / 20
            return <path key={i} d={`M${230 + f * 110} ${300 + f * 84} L${170 + f * 110} ${311 + f * 84}`} />
          })}
        </g>
        <g fill="var(--piano-body)" opacity="0.92">
          {[0.06, 0.16, 0.26, 0.36, 0.46, 0.56, 0.66, 0.76, 0.86, 0.96].map((f, i) => {
            const x = 230 + f * 110, y = 300 + f * 84
            return <path key={i} d={`M${x} ${y} l-34 -6.2 l-5 0.9 l34 6.2 Z`} />
          })}
        </g>
        <path d="M170 311 L280 395 L280 402 L170 318 Z" fill="var(--piano-body)" />
        <path d="M222 294 L240 299 L180 309 L164 305 Z" fill="var(--piano-body)" />
        <path d="M332 378 L350 383 L290 393 L274 389 Z" fill="var(--piano-body)" />
        {/* the decal line on the fallboard — a Steinway's one piece of gold */}
        <path d="M252 306 L318 356" stroke="var(--piano-edge)" strokeWidth="1.3"
          opacity="0.85" strokeLinecap="round" />

        {/* reflected in the boards */}
        <path d="M234 506 C340 548 560 560 686 530 L686 562 C560 592 340 580 234 540 Z"
          fill="url(#refl)" opacity="0.7" />
      </g>

      {/* ---------------- the baritone ----------------
          Drawn in a 200 x 420 box — head at the top, feet on 420 — so the
          classical proportions are readable as numbers rather than guessed:
          head one seventh and a half of the height, shoulders a quarter of
          it, legs just under half. Getting those wrong is what makes a
          drawn figure look like a doll. */}
      <g transform="translate(751.9,213) scale(0.881)">
        <ellipse cx="100" cy="418" rx="86" ry="22" fill="url(#shadow)"
          opacity={0.8 + dark * 0.2} />

        {/* tails, hanging behind the legs */}
        <path d="M66 200 C61 248 63 284 68 302 L87 302 C80 266 78 234 80 200 Z" fill="var(--coat)" />
        <path d="M134 200 C139 248 137 284 132 302 L113 302 C120 266 122 234 120 200 Z" fill="var(--coat)" />

        {/* trousers and shoes */}
        <path d="M80 203 L99 203 L97 405 L82 405 Z" fill="var(--coat)" />
        <path d="M101 203 L120 203 L118 405 L103 405 Z" fill="var(--coat)" />
        <path d="M74 405 L99 405 L101 418 L70 418 Z" fill="var(--coat)" />
        <path d="M101 405 L126 405 L130 418 L99 418 Z" fill="var(--coat)" />

        {/* shirt front and the white waistcoat below it */}
        <path d="M88 76 L112 76 L115 150 L85 150 Z" fill="var(--shirt)" />
        <path d="M86 148 L114 148 L113 180 L87 180 Z" fill="var(--shirt)" opacity="0.9" />

        {/* the tailcoat, cut away over the waistcoat */}
        <path d="M91 74 C71 83 61 108 59 140 C57 176 61 196 65 208 L87 208
                 C85 160 84 110 93 78 Z" fill="var(--coat)" />
        <path d="M109 74 C129 83 139 108 141 140 C143 176 139 196 135 208 L113 208
                 C115 160 116 110 107 78 Z" fill="var(--coat)" />
        <path d="M93 78 L99 118 L90 150" fill="none" stroke="var(--coat)" strokeWidth="1.1" opacity="0.7" />
        <path d="M107 78 L101 118 L110 150" fill="none" stroke="var(--coat)" strokeWidth="1.1" opacity="0.7" />

        {/* arms, with a little life left in them */}
        <path d="M90 84 C72 112 66 150 70 184" fill="none" stroke="var(--coat)"
          strokeWidth="15" strokeLinecap="round" />
        <path d="M110 84 C128 112 134 150 130 184" fill="none" stroke="var(--coat)"
          strokeWidth="15" strokeLinecap="round" />
        <ellipse cx="70" cy="193" rx="7" ry="10" fill="var(--skin)" transform="rotate(-8 70 193)" />
        <ellipse cx="130" cy="193" rx="7" ry="10" fill="var(--skin)" transform="rotate(8 130 193)" />

        {/* wing collar, white tie, neck, head */}
        <path d="M88 66 L112 66 L115 80 L85 80 Z" fill="var(--shirt)" />
        <path d="M92 50 L108 50 L109 68 L91 68 Z" fill="var(--skin)" />
        <path d="M89 70 L100 76 L111 70 L111 84 L100 78 L89 84 Z" fill="var(--shirt)" />
        <path d="M81 30 C81 12 87 3 100 3 C113 3 119 12 119 30
                 C119 46 111 56 100 56 C89 56 81 46 81 30 Z" fill="var(--skin)" />
        <path d="M80 28 C79 8 88 1 100 1 C112 1 121 8 120 28
                 C116 16 110 13 100 14 C90 15 84 18 80 28 Z" fill="var(--coat)" />

        {/* rim light down the lit side — the rig is stage left */}
        <g stroke="var(--piano-edge)" strokeWidth="1.1" fill="none" opacity="0.85">
          <path d="M82 22 C79 32 81 46 88 53" />
          <path d="M91 76 C72 85 62 110 60 140 C58 176 62 196 66 208" />
          <path d="M81 203 L83 403" />
        </g>
      </g>

      </g>

      {/* the house, holding its darkness at the first stop */}
      <rect x="0" y="0" width={W} height={H} fill="url(#vignette)" opacity={0.40 + dark * 0.55} />
    </svg>
  )
}
