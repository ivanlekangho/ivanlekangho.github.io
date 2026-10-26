import { ease, range } from '../../lib/useScrollProgress'

/**
 * One scroll value drives both performers, so the singer's score and the
 * pianist's score change state together. Shared here rather than duplicated in
 * each ribbon, because the moment they drift apart the room stops reading as
 * one performance.
 *
 * The fades overlap on purpose: if an outgoing layer finished before the
 * incoming one started, both staves would blank mid-scroll.
 */
export function staging(p: number) {
  return {
    /** notation */
    oA: 1 - ease(range(p, 0.10, 0.30)),
    /** middle state: tones for the voice, harmony for the piano */
    oB: ease(range(p, 0.18, 0.38)) * (1 - ease(range(p, 0.58, 0.74))),
    /** final state: code for the voice, waves for the piano */
    oC: ease(range(p, 0.62, 0.86)),
    /** morph weights */
    tAB: ease(range(p, 0.12, 0.36)),
    tBC: ease(range(p, 0.58, 0.82)),
    index: p < 0.30 ? 0 : p < 0.62 ? 1 : 2,
  }
}

export const STATE_LABELS = [
  { voice: 'Notation', piano: 'Notation' },
  { voice: 'Mandarin tone', piano: 'Harmony' },
  { voice: 'Code', piano: 'Physics' },
]
