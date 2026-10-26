import { penLine, wobble } from '../../lib/notation'

/**
 * The recital room itself: boards, a pool of light, a grand piano with the lid
 * up, and a singer standing in the curve of it.
 *
 * Drawn with the same pen helpers as the notation, so the stage and the score
 * coming off it look like one hand rather than two assets. Nothing here is
 * interactive — it's the room the scroll happens in.
 */

const W = 1200
const H = 620
const FLOOR = 520

/** Where the ribbons attach, in viewBox units, so callers can anchor to them. */
export const ANCHORS = {
  pianoLid: { x: 612, y: 262 },
  singer: { x: 836, y: 300 },
  viewBox: { w: W, h: H },
}

const hand = (x1: number, y1: number, x2: number, y2: number, seed: string) =>
  penLine(x1, y1, x2, y2, wobble(seed, 1) * 1.6)

export default function StageScene() {
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      aria-hidden="true"
      style={{ display: 'block', overflow: 'visible' }}
      preserveAspectRatio="xMidYMax meet"
    >
      <defs>
        <radialGradient id="pool" cx="50%" cy="48%" r="52%">
          <stop offset="0%" stopColor="var(--t2-wash)" stopOpacity="0.95" />
          <stop offset="70%" stopColor="var(--t2-wash)" stopOpacity="0.30" />
          <stop offset="100%" stopColor="var(--t2-wash)" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* the scores trailing up out of the piano's open lid and off the
          singer — drawn here so they anchor to the performers exactly, rather
          than to guessed percentages of the viewport */}
      <g fill="none" stroke="var(--rule)" strokeWidth="1.4" strokeLinecap="round" opacity="0.75">
        <path d="M 612,262 C 588,170 566,80 548,-40" />
        <path d="M 836,296 C 846,200 852,110 858,-40" />
      </g>

      {/* pool of light */}
      <ellipse cx="640" cy={FLOOR - 20} rx="470" ry="150" fill="url(#pool)" />

      {/* floorboards, converging slightly */}
      <g stroke="var(--rule)" fill="none" strokeWidth="1" strokeLinecap="round">
        {[0, 1, 2, 3, 4].map((i) => {
          const y = FLOOR + i * 22
          const inset = 90 - i * 22
          return <path key={i} d={hand(inset, y, W - inset, y, `fl${i}`)} />
        })}
        {[0, 1, 2, 3, 4, 5, 6].map((i) => {
          const xTop = 170 + i * 145
          const xBot = 60 + i * 180
          return <path key={`v${i}`} d={hand(xTop, FLOOR, xBot, H, `fv${i}`)} opacity="0.55" />
        })}
      </g>
      <path d={hand(60, FLOOR, W - 60, FLOOR, 'edge')} stroke="var(--ink-3)"
        fill="none" strokeWidth="1.4" strokeLinecap="round" opacity="0.5" />

      {/* ---------------- grand piano ---------------- */}
      <g stroke="var(--ink)" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {/* lid, hinged at the back and propped open */}
        <path
          d={`M 196,396 C 300,352 470,300 616,258 L 640,276 C 500,320 330,372 214,412 Z`}
          fill="var(--t2-wash)" opacity="0.92"
        />
        <path d={hand(452, 372, 520, 300, 'prop')} strokeWidth="1.6" />

        {/* case: straight side, curved tail */}
        <path
          d={`M 180,400 L 520,400 C 596,400 628,420 622,444
              C 616,468 560,476 486,476 L 180,476 Z`}
          fill="var(--paper-2)"
        />
        <path d={hand(180, 418, 612, 418, 'case')} strokeWidth="1.1" opacity="0.5" />

        {/* keyboard */}
        <path d="M 176,398 L 300,398 L 300,420 L 176,420 Z" fill="var(--paper)" />
        <g strokeWidth="1.4" opacity="0.75">
          {Array.from({ length: 11 }, (_, i) => 186 + i * 10.5).map((x, i) => (
            <path key={x} d={hand(x, 400, x - 1, 414, `k${i}`)} />
          ))}
        </g>

        {/* legs and pedal lyre */}
        <path d={hand(206, 476, 200, FLOOR, 'lg1')} strokeWidth="3" />
        <path d={hand(452, 476, 458, FLOOR, 'lg2')} strokeWidth="3" />
        <path d={hand(598, 462, 606, FLOOR, 'lg3')} strokeWidth="3" />
        <path d={hand(330, 476, 332, 506, 'lyre')} strokeWidth="1.6" />
        <path d={hand(318, 506, 346, 506, 'ped')} strokeWidth="2.4" />

        {/* bench */}
        <path d="M 96,462 L 186,462 L 186,472 L 96,472 Z" fill="var(--paper-2)" strokeWidth="1.6" />
        <path d={hand(106, 472, 102, FLOOR - 4, 'bl1')} strokeWidth="2" />
        <path d={hand(176, 472, 180, FLOOR - 4, 'bl2')} strokeWidth="2" />
      </g>

      {/* ---------------- singer ---------------- */}
      <g stroke="var(--ink)" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {/* head, tilted very slightly up — they're singing, not reading */}
        <ellipse cx="838" cy="312" rx="20" ry="23" fill="var(--paper)" />
        <path d={hand(828, 336, 848, 336, 'neck')} strokeWidth="1.4" opacity="0.6" />
        {/* gown: one long tapering line each side, hem on the floor */}
        <path
          d={`M 826,338 C 800,386 782,452 772,${FLOOR}
              L 906,${FLOOR} C 896,452 876,386 850,338 Z`}
          fill="var(--t4-wash)" opacity="0.9"
        />
        {/* arms, hands loosely joined at the waist */}
        <path d={`M 824,352 C 800,384 798,410 820,420`} strokeWidth="1.8" />
        <path d={`M 852,352 C 876,384 878,410 856,420`} strokeWidth="1.8" />
        <ellipse cx="838" cy="424" rx="12" ry="8" fill="var(--paper)" strokeWidth="1.6" />
        {/* hem */}
        <path d={hand(772, FLOOR, 906, FLOOR, 'hem')} strokeWidth="2" />
      </g>
    </svg>
  )
}
