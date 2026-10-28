import { ease, range } from '../../lib/easing'

/**
 * One rail position drives both performers, so the singer's score and the
 * pianist's score change together. Shared here rather than duplicated in
 * each ribbon, because the moment they drift apart the room stops reading
 * as one performance.
 *
 * The stops sit at 0, 0.5 and 1, and each one is pure: at a stop you see
 * exactly one reading, not a blend. The fades overlap in between so that
 * no mid-drag position shows two blank staves.
 */
export function staging(p: number) {
  return {
    /** notation */
    oA: 1 - ease(range(p, 0.06, 0.44)),
    /** middle stop: tones for the voice, harmony for the piano */
    oB: ease(range(p, 0.06, 0.44)) * (1 - ease(range(p, 0.56, 0.94))),
    /** final stop: code for the voice, waves for the piano */
    oC: ease(range(p, 0.56, 0.94)),
    /** morph weights — the same noteheads moving, not a crossfade */
    tAB: ease(range(p, 0.04, 0.5)),
    tBC: ease(range(p, 0.5, 0.96)),
    index: p < 0.25 ? 0 : p < 0.75 ? 1 : 2,
  }
}

/**
 * The three screens of the room, and when each one is up.
 *
 * Separate from `staging` above, which drives the morph *inside* a screen.
 * These three share one cell, so a plain crossfade stacked the staves on
 * top of the language table halfway through every scroll. They hand over
 * in sequence instead, with only a sliver of overlap — the way a board
 * operator takes one state out before bringing the next one up.
 */
export function screens(p: number) {
  const f = (a: number, b: number) => ease(range(p, a, b))
  return {
    /* The staves and the language table overlap on purpose, and only
       they do: the words arrive from their own noteheads, so both have to
       be on screen while that happens. The terminal has no such handoff
       and takes over cleanly. */
    score: 1 - f(0.16, 0.34),
    /* Up early and quickly, while the staves are still lit: the words
       arrive on their own noteheads and have to be legible there, or the
       travel starts from nothing and the morph is lost. */
    language: f(0.12, 0.24) * (1 - f(0.58, 0.74)),
    terminal: f(0.68, 0.88),
  }
}
