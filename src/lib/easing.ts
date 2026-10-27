/* ============================================================
   The three functions the whole morph is built out of.

   Notation, tone contour and code are three projections of the same
   note array, all indexed by one number — the rail position. These
   turn that number into the staging weights each projection uses.
   ============================================================ */

/** Linear interpolate. */
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t

/** Map t from [inMin,inMax] to [0,1], clamped. The workhorse for staging. */
export const range = (t: number, inMin: number, inMax: number) =>
  Math.min(1, Math.max(0, (t - inMin) / (inMax - inMin)))

/** Smooth the ends of a 0→1 ramp so nothing starts or stops abruptly. */
export const ease = (t: number) => t * t * (3 - 2 * t)
