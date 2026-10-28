import { BBOX, PATH, UPM, type GlyphName } from './bravura'

/**
 * Engraving, by the book.
 *
 * The clefs, accidentals, rests, flags, brace and time signature are
 * Bravura's own outlines — the reference SMuFL font, the one Dorico sets
 * with — rather than shapes drawn by hand. A hand-drawn approximation of a
 * bass clef reads as a sketch of a bass clef, which is the opposite of what
 * a score is for.
 *
 * Noteheads stay geometry rather than outlines, because on the stage they
 * have to morph into tone-contour onsets and data points. Their proportions
 * come from the font instead: 1.18 staff spaces wide by one tall.
 */

export type { GlyphName }

/**
 * SMuFL fonts are drawn on an em of exactly four staff spaces, so a glyph
 * scaled by 4·gap/1000 is the right size and its origin lands on the staff
 * line it belongs to. That one rule is most of what makes this look engraved
 * rather than assembled. Font coordinates point up; SVG's point down.
 */
export const scaleFor = (gap: number) => (4 * gap) / UPM

/** Ink width of a glyph at staff size `gap`, for centring it on a beat. */
export const inkWidth = (name: GlyphName, gap: number) =>
  (BBOX[name][2] - BBOX[name][0]) * scaleFor(gap)

/**
 * One engraved symbol. `x`/`y` is the glyph's own anchor — the F line for a
 * bass clef, the altered pitch for an accidental, the stem tip for a flag.
 * `centre` puts its ink over x instead, which is what a rest sitting on a
 * beat wants.
 */
export function Glyph({
  name, x, y, gap, fill = 'var(--ink)', opacity, centre = false, stretchY,
}: {
  name: GlyphName; x: number; y: number; gap: number
  fill?: string; opacity?: number; centre?: boolean
  /** Height in user units, for the one glyph (the brace) that is stretched. */
  stretchY?: number
}) {
  const s = scaleFor(gap)
  const sy = stretchY === undefined ? s : stretchY / (BBOX[name][3] - BBOX[name][1])
  const sx = stretchY === undefined ? s : s * 1.9
  const dx = centre ? -inkWidth(name, gap) / 2 - BBOX[name][0] * s : 0
  return (
    <path d={PATH[name]} fill={fill} opacity={opacity}
      transform={`translate(${x + dx} ${y}) scale(${sx} ${-sy})`} />
  )
}

/**
 * Engraving thicknesses, in staff spaces, as Bravura's own metadata gives
 * them. These are small numbers that make a large difference: a staff ruled
 * at one device pixel next to a half-space beam is why amateur notation looks
 * amateur.
 */
export const ENG = {
  staffLine: 0.13,
  stem: 0.12,
  beam: 0.5,
  barlineThin: 0.16,
  barlineThick: 0.5,
  /** Gap between the two lines of a final barline. */
  barlineSep: 0.4,
  ledger: 0.16,
  /** How far a ledger line sticks out past the notehead, each side. */
  ledgerExtension: 0.4,
  /** Notehead, as half-axes: 1.18 spaces across, one space tall. */
  headRx: 0.59,
  headRy: 0.5,
  /** Noteheads are ellipses tilted off the horizontal. */
  headTilt: -20,
  /** Augmentation dot. */
  dotR: 0.1,
  dotGap: 0.5,
  /** Stems run three and a half spaces from the notehead they start on. */
  stemLength: 3.5,
} as const
