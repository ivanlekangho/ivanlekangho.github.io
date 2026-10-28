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
