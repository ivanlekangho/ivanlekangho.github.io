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

    /**
     * Anything already overhead is simply here.
     *
     * This is a sweep and not a branch inside the observer, because the
     * observer cannot see this case at all: an IntersectionObserver
     * notifies on threshold crossings, and an element that goes from below
     * the window to above it inside one frame reads as ratio 0 both times.
     * No crossing, no callback, and the element sits at opacity 0 above the
     * reader for as long as the page is open. One hard flick down this page
     * left Impact's heading and lede permanently invisible that way.
     *
     * So: on every scroll, and on mount, anything whose bottom edge is past
     * the top of the window gets marked arrived. It covers the fast flick,
     * a deep link into the middle of the page, and a reload that restored
     * the scroll position — all three are the same thing, an element with
     * no arrival left to make.
     */
    let queued = false
    const sweep = () => {
      queued = false
      for (const el of document.querySelectorAll('[data-reveal]:not(.is-in)')) {
        if (el.getBoundingClientRect().bottom >= 0) continue
        el.classList.add('is-in')
        io.unobserve(el)
      }
    }
    const onScroll = () => {
      if (queued) return
      queued = true
      requestAnimationFrame(sweep)
    }

    for (const el of document.querySelectorAll('[data-reveal]:not(.is-in)')) io.observe(el)
    sweep()
    window.addEventListener('scroll', onScroll, { passive: true })

    return () => { io.disconnect(); window.removeEventListener('scroll', onScroll) }
    /* Keyed on the route: without a dependency array this rebuilt the
       observer after every single render of the app. */
  }, [key])
}
