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
      /* A little before the element's leading edge arrives, so the motion
         has finished by the time it is properly in the reading area rather
         than animating under the reader's eye. Inset on two sides now, not
         one: the page reads left to right, so things arrive from the right
         as well as from below. */
      { rootMargin: '0px -8% -12% 0px', threshold: 0 },
    )

    /**
     * Anything already behind the reader is simply here.
     *
     * This is a sweep and not a branch inside the observer, because the
     * observer cannot see this case at all: an IntersectionObserver
     * notifies on threshold crossings, and an element that goes from
     * outside the window on one side to outside it on the other inside a
     * single frame reads as ratio 0 both times. No crossing, no callback,
     * and the element sits at opacity 0 behind the reader for as long as
     * the page is open. One hard flick left Impact's heading and lede
     * permanently invisible that way.
     *
     * Both axes, because both happen. A panel that holds more than a
     * screen is still flicked down past its own content; and the deck
     * itself moves sideways, so a reader who lands on #contact and then
     * walks back leftward meets two panels whose contents were never on
     * screen to cross anything. Past the top edge OR past the left edge is
     * the same fact — an element with no arrival left to make.
     */
    let queued = false
    const sweep = () => {
      queued = false
      for (const el of document.querySelectorAll('[data-reveal]:not(.is-in)')) {
        const r = el.getBoundingClientRect()
        if (r.bottom >= 0 && r.right >= 0) continue
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
    /* Capture on the document, not a listener on the window. A scroll
       event does not bubble, so a window listener hears the document
       scrolling and nothing else — and the thing that scrolls now is the
       deck, and inside it a panel. Capture reaches the document on the way
       down to any of them. */
    document.addEventListener('scroll', onScroll, { capture: true, passive: true })

    return () => {
      io.disconnect()
      document.removeEventListener('scroll', onScroll, { capture: true })
    }
    /* Keyed on the route: without a dependency array this rebuilt the
       observer after every single render of the app. */
  }, [key])
}
