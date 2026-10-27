/* ============================================================
   The lighting board.

   Three keyframes — musician, linguist, engineer — and a continuous
   position between them. Everything the eye reads as "light" is
   interpolated here and written onto the document as custom properties,
   so dragging the rail brings the lights up smoothly instead of snapping
   at the stops. Type and motion tokens stay in CSS, where snapping is
   fine; only colour has to be continuous.
   ============================================================ */

export type Stop = {
  /* the hall */
  bg: string; hall: string; boards: string; hallLine: string; floorEdge: string
  /* light */
  pool: string; poolAlpha: number
  /* chrome on the dark */
  accent: string; accentSoft: string
  ink: string; ink2: string; ink3: string; rule: string; staff: string
  /* the lit sheet a panel is printed on */
  panel: string; panelInk: string; panelInk2: string; panelRule: string; panelAccent: string
  /* the instrument and the person */
  body: string; lid: string; edge: string; keys: string; string_: string
  shirt: string; skin: string; coat: string
}

/** House lights down. One warm pool, everything else silhouette. */
const MUSICIAN: Stop = {
  bg: '#120F0D', hall: '#1A1512', boards: '#231A12', hallLine: '#241C16', floorEdge: '#3A2E1E',
  pool: '#C9A961', poolAlpha: 0.34,
  accent: '#C9A961', accentSoft: '#8A6F3F',
  ink: '#F2EBDD', ink2: '#C3B6A2', ink3: '#8E8273', rule: '#2E2419', staff: '#6B5B3E',
  panel: '#F7F2E8', panelInk: '#1A1512', panelInk2: '#5E5345', panelRule: '#DFD4C2', panelAccent: '#8A6A20',
  body: '#0B0908', lid: '#271E15', edge: '#8A6F3F', keys: '#E8DFD0', string_: '#C9A961',
  shirt: '#F2EBDD', skin: '#C6A383', coat: '#090807',
}

/** Half light. The hall warms into view and cools at once — ink wash at dusk. */
const LINGUIST: Stop = {
  bg: '#2A2630', hall: '#332E3B', boards: '#3A3238', hallLine: '#3E3848', floorEdge: '#4E4557',
  pool: '#CDBEDC', poolAlpha: 0.30,
  accent: '#BCB0D6', accentSoft: '#7A6E92',
  ink: '#F7F3EC', ink2: '#CFC7D8', ink3: '#9A92A8', rule: '#413A4D', staff: '#8A7FA6',
  panel: '#F4F1F7', panelInk: '#231F2B', panelInk2: '#5C5468', panelRule: '#DAD3E2', panelAccent: '#5F4E8C',
  body: '#17131C', lid: '#3A3140', edge: '#A79BC4', keys: '#F2EDE4', string_: '#D8C6A8',
  shirt: '#F7F3EC', skin: '#CFAC8C', coat: '#121018',
}

/** Full state, cold. You can see every corner of the room. */
const ENGINEER: Stop = {
  bg: '#3C444E', hall: '#47505B', boards: '#4E5862', hallLine: '#515B67', floorEdge: '#6B7684',
  pool: '#EAF3FA', poolAlpha: 0.34,
  accent: '#CFE4F2', accentSoft: '#8FA8BC',
  ink: '#EAF3FA', ink2: '#C3D2DE', ink3: '#94A3B1', rule: '#5B6672', staff: '#A9C2DC',
  panel: '#F4F7FA', panelInk: '#1A1F26', panelInk2: '#4E5862', panelRule: '#D3DDE5', panelAccent: '#2F5E80',
  body: '#1C2128', lid: '#49535E', edge: '#A9C2DC', keys: '#FAFCFD', string_: '#C7D6E2',
  shirt: '#FFFFFF', skin: '#D9B795', coat: '#161A20',
}

export const STOPS = [MUSICIAN, LINGUIST, ENGINEER]
export const MODES = ['musician', 'linguist', 'engineer'] as const
export type Mode = (typeof MODES)[number]

/** Position of each stop on the rail. Evenly spaced — the rail is a dimmer. */
export const STOP_AT = [0, 0.5, 1]

const hex = (c: string) => [
  parseInt(c.slice(1, 3), 16),
  parseInt(c.slice(3, 5), 16),
  parseInt(c.slice(5, 7), 16),
]

/** sRGB is not perceptually even, but mixing in linear light turns these
 *  warm darks muddy. Plain channel blending keeps the hues where they belong. */
function mix(a: string, b: string, t: number) {
  const [r1, g1, b1] = hex(a)
  const [r2, g2, b2] = hex(b)
  const ch = (x: number, y: number) => Math.round(x + (y - x) * t)
  return `rgb(${ch(r1, r2)} ${ch(g1, g2)} ${ch(b1, b2)})`
}

/** Which keyframe pair a position sits between, and how far along. */
function segment(p: number) {
  const q = Math.min(1, Math.max(0, p))
  if (q <= 0.5) return { a: STOPS[0], b: STOPS[1], t: q / 0.5 }
  return { a: STOPS[1], b: STOPS[2], t: (q - 0.5) / 0.5 }
}

export function modeAt(p: number): Mode {
  return p < 0.25 ? 'musician' : p < 0.75 ? 'linguist' : 'engineer'
}

/** The custom properties the whole site is painted with, at this position. */
export function paletteAt(p: number): Record<string, string> {
  const { a, b, t } = segment(p)
  const c = (k: keyof Stop) => mix(a[k] as string, b[k] as string, t)
  return {
    '--bg': c('bg'),
    '--hall': c('hall'),
    '--boards': c('boards'),
    '--hall-line': c('hallLine'),
    '--floor-edge': c('floorEdge'),
    '--pool': c('pool'),
    '--pool-alpha': String(a.poolAlpha + (b.poolAlpha - a.poolAlpha) * t),
    '--accent': c('accent'),
    '--accent-soft': c('accentSoft'),
    '--ink': c('ink'),
    '--ink-2': c('ink2'),
    '--ink-3': c('ink3'),
    '--rule': c('rule'),
    '--staff': c('staff'),
    '--panel': c('panel'),
    '--panel-ink': c('panelInk'),
    '--panel-ink-2': c('panelInk2'),
    '--panel-rule': c('panelRule'),
    '--panel-accent': c('panelAccent'),
    '--piano-body': c('body'),
    '--piano-lid': c('lid'),
    '--piano-edge': c('edge'),
    '--keys': c('keys'),
    '--string': c('string_'),
    '--shirt': c('shirt'),
    '--skin': c('skin'),
    '--coat': c('coat'),
  }
}
