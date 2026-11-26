import { glideTo, halt } from './sectionSnap'

/**
 * Go somewhere — the bar, the dots down the left, the cue under a hero.
 *
 * This file used to be a workaround. `scroll-snap-type: y mandatory` and a
 * programmatic scroll do not get on: the browser re-resolved the snap after
 * the scroll and refused the jump, and measured on Creative,
 * `window.scrollTo(0, 0)` from 4220px landed back at 4220 every time. So
 * every journey switched the snapping off, travelled, and switched it back
 * on at `scrollend` — with a timeout behind it for Safari, which has no such
 * event.
 *
 * None of that is needed now. The page has no CSS snap to fight: sections
 * are moved between by lib/sectionSnap, which animates the scroll itself.
 * So these simply hand the same animation the same kind of destination, and
 * the bar, the dots and the cue travel exactly as a wheel gesture does
 * rather than arriving by a different mechanism that looks slightly
 * different.
 */

/** Move to an absolute y. */
export const scrollToY = (y: number) => glideTo(Math.max(0, y))

/**
 * The top of the page, which is the top of its title screen.
 *
 * `animate` is false on a route change: a new page should already be at its
 * title when it appears, and animating there would show the reader the
 * middle of a page they never asked for on the way.
 */
export const scrollToTop = (animate = true) => {
  if (animate) { glideTo(0); return }
  halt()
  window.scrollTo(0, 0)
}

/** The top of a section, allowing for the bar over it. */
export function scrollToSection(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  const bar = parseFloat(
    getComputedStyle(document.documentElement).getPropertyValue('--bar-h'),
  ) || 0
  glideTo(Math.max(0, el.getBoundingClientRect().top + window.scrollY - bar))
}
