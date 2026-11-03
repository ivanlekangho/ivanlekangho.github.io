import { useEffect } from 'react'

/**
 * Things arrive as you reach them.
 *
 * One observer for the whole page rather than one per element, watching
 * anything marked `data-reveal`. An element gets `is-in` the first time it
 * crosses into view and is then unobserved — this is an entrance, not a
 * state, and re-animating on the way back up is the thing that makes a
 * page feel like a toy.
 *
 * The transition itself is CSS. This only decides when.
 *
 * Three cautions, all learned the hard way on this page:
 *
 * - Anything above the fold must be visible immediately, so the first
 *   callback fires synchronously on observe and the marks are set before
 *   paint (`useLayoutEffect` would be better still, but the sections mount
 *   under a route and an effect is enough).
 * - If the observer never runs — reduced motion, no IntersectionObserver,
 *   a crawler — the content must still be there. The CSS default is
 *   therefore *visible*, and the hidden state is only applied under
 *   `html.can-reveal`, a class set here. No JS, no hiding.
 * - New sections appear when the route changes, so the observer re-runs on
 *   every mount and picks up anything not already marked.
 */
const REDUCED = () =>
  typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches

export function useReveal(key?: string) {
  useEffect(() => {
    if (REDUCED() || typeof IntersectionObserver !== 'function') return
    /* Added and never removed. Taking it off during cleanup meant every
       re-render dropped the hidden state for a frame and flashed every
       unrevealed element onto the page. */
    document.documentElement.classList.add('can-reveal')

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue
          e.target.classList.add('is-in')
          io.unobserve(e.target)
        }
      },
      /* A little before the element's top edge arrives, so the motion has
         finished by the time it is properly in the reading area rather
         than animating under the reader's eye. */
      { rootMargin: '0px 0px -12% 0px', threshold: 0 },
    )

    for (const el of document.querySelectorAll('[data-reveal]:not(.is-in)')) {
      /* Already above the viewport — a deep link into the middle of the
         page, or a reload that restored the scroll position. There is no
         arrival left to make, and waiting for one would leave the whole
         page above the reader blank until they scrolled up through it. */
      if (el.getBoundingClientRect().bottom < 0) { el.classList.add('is-in'); continue }
      io.observe(el)
    }
    return () => io.disconnect()
    /* Keyed on the route: without a dependency array this rebuilt the
       observer after every single render of the app. */
  }, [key])
}
