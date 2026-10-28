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
const SETTLE = 170
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
    let timer = 0
    let touchY: number | null = null
    let gesture: number | null = null
    let arrivedAt = 0
    let wasAway = window.scrollY > 1

    const settle = () => {
      const p = gesture ?? posRef.current
      gesture = null
      let best = 0
      for (let i = 1; i < STOP_AT.length; i++) {
        if (Math.abs(STOP_AT[i] - p) < Math.abs(STOP_AT[best] - p)) best = i
      }
      goTo(MODES[best])
    }

    /** Anything with its own scrollbar keeps the wheel. */
    const theirs = (t: EventTarget | null) =>
      t instanceof Element && !!t.closest('[data-keeps-scroll]')

    const advance = (dy: number) => {
      const next = Math.min(1, Math.max(0, (gesture ?? posRef.current) + dy / SPAN))
      gesture = next
      setPos(next)
      clearTimeout(timer)
      timer = window.setTimeout(settle, SETTLE)
    }

    /** True when this gesture belongs to the rail rather than to the page. */
    const mine = (dy: number) => {
      /* While the piece sheet is up it owns the wheel, not the room. */
      if (document.documentElement.hasAttribute('data-sheet')) return false
      const atTop = window.scrollY <= 1
      if (wasAway && atTop) { arrivedAt = performance.now(); wasAway = false }
      if (!atTop) { wasAway = true; return false }
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
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onTouchEnd)
      clearTimeout(timer)
    }
  }, [enabled, setPos, goTo])
}
