import { useEffect, useRef } from 'react'
import { useMode } from './mode'
import { MODES, STOP_AT } from './palette'

/**
 * Scrolling the hall walks the lights; scrolling past them leaves the room.
 *
 * The first screen is a performance with three readings, and the obvious
 * gesture for "show me the next one" is the wheel. So while the hall is the
 * thing on screen, the wheel drives the rail instead of the page. Once the
 * lights are full up — engineer, the last stop — it stops intercepting and
 * the site scrolls like any other site. Coming back up to the top walks the
 * rail in reverse, so the room is never a thing you can only pass through
 * once.
 *
 * It scrubs while the gesture is running and settles on the nearest stop
 * when it ends, the same contract as dragging the rail.
 */

/** Wheel travel, in pixels, for the whole rail end to end. */
const SPAN = 560
/** How long after the last event to call the gesture finished. */
const SETTLE = 130
/**
 * Momentum from a flick that ended at the top of the page keeps arriving
 * for a while. Without this the rail rewinds itself the instant you scroll
 * back up to the hall, which feels like the page grabbing the wheel.
 */
const ARRIVAL_GRACE = 420

export function useHallScroll(enabled: boolean) {
  const { pos, setPos, goTo } = useMode()
  const posRef = useRef(pos)
  posRef.current = pos

  useEffect(() => {
    if (!enabled) return
    /**
     * The room only takes the wheel when the room is the first screen.
     *
     * It no longer is — the hero is above it — and that one fact undoes
     * the whole mechanism. Hijacking the wheel means holding the page
     * still, which a region can only do at scroll zero, where there is
     * nowhere above to be pushed to. Mid-document it has to argue with
     * the scroll engine for the position on every frame, and the argument
     * has no stable winner: measured, the rail either pinned the reader
     * in the room with no way down to the work, or let the page run past
     * all three stops without advancing one of them.
     *
     * So below the fold the rail is driven by its own control — the three
     * stops are buttons and the handle drags — and the wheel belongs to
     * the page, which is what a reader expects of a section that is not
     * the first thing they met. Put the hall back at the top and this
     * wakes up again on its own.
     */
    if ((document.querySelector('.hall') as HTMLElement | null)?.offsetTop) return
    let timer = 0
    let touchY: number | null = null
    let gesture: number | null = null
    let arrivedAt = 0

    /**
     * The room owns the wheel while the room is the screen.
     *
     * This used to be `scrollY <= 1`, because the hall was the first thing
     * in the document. It is the second thing now — the hero is above it —
     * so being at the top of the page no longer means being in the room.
     *
     * The test is how much of the window the room covers, not where its
     * top edge is. Position was the first thing I tried and it was wrong:
     * a snapped panel rests with its top at the menu line, 56px down, not
     * at zero, so a `top <= 4` test never fired once and the rail simply
     * ignored the wheel. Coverage does not care about the offset.
     */
    const inHall = () => {
      const el = document.querySelector('.hall')
      if (!el) return false
      const r = el.getBoundingClientRect()
      const covered = Math.min(r.bottom, window.innerHeight) - Math.max(r.top, 0)
      return covered >= window.innerHeight * 0.85
    }

    let wasAway = !inHall()

    /**
     * While the room has the wheel, the page has no snap.
     *
     * These two systems both insist on owning the scroll position, and
     * they cannot both have it. The hall holds the page still and spends
     * the wheel on the rail; mandatory snapping keeps relocating the page
     * to the nearest snap position. That conflict was invisible while the
     * hall was the first thing in the document, because scroll zero is a
     * place snap cannot drag you away from. Second in the document, they
     * fight: the reader ends up pinned in the room with no way down to the
     * work, and a downward gesture can throw the page upward.
     *
     * So the room suspends snapping for as long as it is the screen — the
     * same exception an open sheet already takes. Leaving re-arms it, and
     * by then the next panel is most of the window, so snap settles onto
     * the thing you were heading for anyway.
     */
    const marker = () => {
      const root = document.documentElement
      if (inHall()) root.setAttribute('data-in-hall', '')
      else root.removeAttribute('data-in-hall')
    }
    marker()
    window.addEventListener('scroll', marker, { passive: true })
    window.addEventListener('resize', marker)

    /** Which stop a gesture began from, so it cannot travel past the next
     *  one. Null between gestures. */
    let fromStop: number | null = null

    /** Index of the stop nearest a rail position. */
    const nearest = (p: number) => {
      let best = 0
      for (let i = 1; i < STOP_AT.length; i++) {
        if (Math.abs(STOP_AT[i] - p) < Math.abs(STOP_AT[best] - p)) best = i
      }
      return best
    }

    const settle = () => {
      const p = gesture ?? posRef.current
      gesture = null
      fromStop = null
      goTo(MODES[nearest(p)])
    }

    /** Anything with its own scrollbar keeps the wheel. */
    const theirs = (t: EventTarget | null) =>
      t instanceof Element && !!t.closest('[data-keeps-scroll]')

    /**
     * One gesture, one stop.
     *
     * The rail is 560px of wheel travel end to end, which a single trackpad
     * flick clears easily — so a flick used to carry musician straight past
     * linguist to engineer, and the middle reading, which is the one the
     * whole room is arguing for, could be skipped without ever being seen.
     *
     * So a gesture remembers the stop it began at and cannot travel beyond
     * the adjacent one. Momentum after your fingers lift belongs to the
     * same gesture and is spent against the same ceiling; the next stop
     * needs a new one. Scrubbing the rail by hand is unaffected — that goes
     * through setPos directly and is not a gesture.
     */
    const advance = (dy: number) => {
      if (fromStop === null) fromStop = nearest(posRef.current)
      const lo = STOP_AT[Math.max(0, fromStop - 1)]
      const hi = STOP_AT[Math.min(STOP_AT.length - 1, fromStop + 1)]
      const raw = (gesture ?? posRef.current) + dy / SPAN
      const next = Math.min(hi, Math.max(lo, raw))
      gesture = next
      setPos(next)
      clearTimeout(timer)
      timer = window.setTimeout(settle, SETTLE)
    }

    /** True when this gesture belongs to the rail rather than to the page. */
    const mine = (dy: number) => {
      /* While the piece sheet is up it owns the wheel, not the room. */
      if (document.documentElement.hasAttribute('data-sheet')) return false
      const here = inHall()
      if (wasAway && here) { arrivedAt = performance.now(); wasAway = false }
      if (!here) { wasAway = true; return false }
      if (performance.now() - arrivedAt < ARRIVAL_GRACE) return false
      const p = gesture ?? posRef.current
      /* Downward past the last stop, or upward before the first, is the
         page's business. */
      return dy > 0 ? p < 1 - 1e-3 : p > 1e-3
    }

    const onWheel = (e: WheelEvent) => {
      if (theirs(e.target)) return
      const dy = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY
      if (!mine(dy)) return
      e.preventDefault()
      advance(dy)
    }

    const onTouchStart = (e: TouchEvent) => {
      touchY = theirs(e.target) ? null : e.touches[0].clientY
    }
    const onTouchMove = (e: TouchEvent) => {
      if (touchY === null) return
      const y = e.touches[0].clientY
      /* A phone swipe covers far less distance than a wheel gesture, so it
         gets more of the rail per pixel. */
      const dy = (touchY - y) * 2.4
      touchY = y
      if (!mine(dy)) return
      if (e.cancelable) e.preventDefault()
      advance(dy)
    }
    const onTouchEnd = () => { touchY = null }

    window.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: false })
    window.addEventListener('touchend', onTouchEnd, { passive: true })
    return () => {
      document.documentElement.removeAttribute('data-in-hall')
      window.removeEventListener('scroll', marker)
      window.removeEventListener('resize', marker)
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onTouchEnd)
      clearTimeout(timer)
    }
  }, [enabled, setPos, goTo])
}
