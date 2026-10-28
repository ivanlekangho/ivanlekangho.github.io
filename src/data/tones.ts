/**
 * Tone systems, kept as data rather than hardcoded, because Hakka is part of
 * the story and Hakka does not have four tones. Mandarin gets the four palette
 * hues plus neutral; any additional system renders its contours on the neutral
 * warm-grey family so a six- or seven-tone inventory never forces new hues
 * into the palette or breaks the legend.
 */

export type ToneId = 0 | 1 | 2 | 3 | 4

export type Tone = {
  id: ToneId
  name: string
  mark: string
  /** Pitch contour as normalised points, 0 = bottom of the tone box, 1 = top.
   *  Chao tone letters: Mandarin 1=55, 2=35, 3=214, 4=51. */
  contour: number[]
  /** CSS custom property stem, e.g. 't4' → var(--t4-mid) */
  family: string
}

export const MANDARIN: Record<ToneId, Tone> = {
  1: { id: 1, name: 'level',   mark: 'ˉ', contour: [1.0, 1.0],            family: 't1' },
  2: { id: 2, name: 'rising',  mark: 'ˊ', contour: [0.5, 1.0],            family: 't2' },
  3: { id: 3, name: 'dipping', mark: 'ˇ', contour: [0.35, 0.0, 0.75],     family: 't3' },
  4: { id: 4, name: 'falling', mark: 'ˋ', contour: [1.0, 0.0],            family: 't4' },
  0: { id: 0, name: 'neutral', mark: '˙', contour: [0.45, 0.35],          family: 't0' },
}

/**
 * TODO(ivan): Hakka. Tone inventories vary by variety (Sixian, Hailu, …) and
 * the counts differ, so I am not guessing. Tell me which variety you speak and
 * its Chao tone values and this fills in; until then nothing on the site claims
 * to show Hakka tones.
 */
export const HAKKA: Record<string, Tone> | null = null

/**
 * Tone sandhi matters for honesty: a diagram should show what a mouth actually
 * does, not the citation form. Mandarin's main rule is 3+3 → 2+3.
 * 我处处皆为异客 (3-4-4-1-2-4-4) never puts two third tones together, so this
 * is currently a no-op — but it is here so it stays true if the line changes.
 */
export function applySandhi(tones: ToneId[]): ToneId[] {
  const out = [...tones]
  for (let i = 0; i < out.length - 1; i++) {
    if (out[i] === 3 && out[i + 1] === 3) out[i] = 2
  }
  return out
}
