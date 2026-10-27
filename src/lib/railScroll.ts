import { useEffect, useRef } from 'react'
import { useMode } from './mode'
import { MODES, STOP_AT } from './palette'

/**
 * Scrolling moves the rail.
 *
 * The page has nothing to scroll — the hall is pinned and sections arrive
 * on top of it — so the wheel would otherwise do nothing at all, which on
 * a site this unusual reads as broken rather than as deliberate. Here it
 * does the one thing a reader would want it to: walks the room from
 * musician through linguist to engineer, lights and scores together.
 *
 * It scrubs while the wheel is turning and settles on the nearest stop
 * once it stops, the same contract as dragging the rail: you can look at
 * a half-lit room, but you are never left in one.
 */

/** Wheel travel, in pixels, for the whole rail end to end. */
const SPAN = 620
/** How long after the last wheel event to call the gesture finished. */
const SETTLE = 170

export function useRailScroll(enabled: boolean) {
  const { pos, setPos, goTo } = useMode()
  const posRef = useRef(pos)
  posRef.current = pos

  useEffect(() => {
    if (!enabled) return
    let timer = 0
    let touchY: number | null = null
    /* Where the gesture has got to so far. Reading the rendered position
       instead would lose every event that arrives before React has
       re-rendered — and a trackpad fires several per frame, so a flick
       would move the rail by one event's worth and stop. */
    let gesture: number | null = null

    const settle = () => {
      const p = gesture ?? posRef.current
      gesture = null
      let best = 0
      for (let i = 1; i < STOP_AT.length; i++) {
        if (Math.abs(STOP_AT[i] - p) < Math.abs(STOP_AT[best] - p)) best = i
      }
      goTo(MODES[best])
    }

    /* Anything with its own scrollbar keeps the wheel: a panel's body, and
       the nav strip phones get along the bottom. */
    const theirs = (t: EventTarget | null) =>
      t instanceof Element && !!t.closest('.panel-layer, .float-nav')

    const advance = (dy: number) => {
      const next = Math.min(1, Math.max(0, (gesture ?? posRef.current) + dy / SPAN))
      gesture = next
      setPos(next)
      clearTimeout(timer)
      timer = window.setTimeout(settle, SETTLE)
    }

    const onWheel = (e: WheelEvent) => {
      if (theirs(e.target)) return
      e.preventDefault()
      advance(e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY)
    }

    const onTouchStart = (e: TouchEvent) => {
      touchY = theirs(e.target) ? null : e.touches[0].clientY
    }
    const onTouchMove = (e: TouchEvent) => {
      if (touchY === null) return
      const y = e.touches[0].clientY
      /* A phone swipe covers far less distance than a wheel gesture, so it
         gets more of the rail per pixel. */
      advance((touchY - y) * 2.2)
      touchY = y
    }
    const onTouchEnd = () => { touchY = null }

    window.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: true })
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
