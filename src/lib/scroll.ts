/**
 * Go somewhere, past the snapping.
 *
 * `scroll-snap-type: y mandatory` and a programmatic scroll do not get on.
 * The browser re-resolves the snap after the scroll and refuses the jump:
 * measured on Creative, `window.scrollTo(0, 0)` from 4220px landed back at
 * 4220, every time. Dropping `scroll-snap-stop` changed nothing; turning
 * the snapping off landed at 0 exactly. So it is the mandatory snap, and it
 * breaks every bit of navigation that is not a human scrolling: the bar's
 * return to a title page, the dots down the left, and the cue under the
 * hero.
 *
 * So the snap is suspended for the length of the journey and restored at
 * the end of it. Suspending it is safe — nothing re-snaps while the
 * property is off, and by the time it comes back the scroll is resting
 * exactly on a snap position anyway, which is where it was being sent.
 *
 * Restoring it is the fiddly half. Too early and the snap grabs the scroll
 * mid-animation and drags it back, which looks exactly like the bug this
 * fixes. `scrollend` is the right signal and is honoured where it exists;
 * the timeout behind it is for Safari, which has none, and for the case
 * where the scroll was already at its destination and no event ever comes.
 */

/** Long enough for a smooth scroll across a long page, short enough that a
 *  reader cannot get a second gesture in before the snap is back. */
const PATIENCE = 1100

let restoring = 0

export function scrollToY(y: number, smooth = false) {
  const root = document.documentElement
  const quiet = matchMedia('(prefers-reduced-motion: reduce)').matches

  root.style.scrollSnapType = 'none'
  window.clearTimeout(restoring)

  const give = () => {
    window.clearTimeout(restoring)
    root.style.removeProperty('scroll-snap-type')
    window.removeEventListener('scrollend', give)
  }
  window.addEventListener('scrollend', give)
  restoring = window.setTimeout(give, PATIENCE)

  window.scrollTo({ top: y, behavior: smooth && !quiet ? 'smooth' : 'instant' })
}

/** The top of the page, which is the top of its title screen. */
export const scrollToTop = (smooth = false) => scrollToY(0, smooth)

/** The top of a section, allowing for the bar over it. */
export function scrollToSection(id: string, smooth = true) {
  const el = document.getElementById(id)
  if (!el) return
  const bar = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--bar-h')) || 0
  scrollToY(el.getBoundingClientRect().top + window.scrollY - bar, smooth)
}
