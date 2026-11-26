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
     * The room takes the wheel back.
     *
     * It lost it when the hero went in above it: hijacking the wheel means
     * holding the page still, and a region mid-document cannot hold a
     * vertically scrolling page still — it has to argue with the scroll
     * engine for the position on every frame, and measured, that argument
     * had no stable winner. The rail either pinned the reader in the room
     * with no way out, or let the page run past all three stops without
     * advancing one.
     *
     * The page does not scroll vertically any more. It is a row of panels
     * that scrolls sideways (lib/deck.ts), the hall is the last of them,
     * and a panel that is not scrolling vertically has nothing to argue
     * with: there is no vertical position for the room and the page to
     * disagree about. So the wheel is the rail's again wherever the room
     * is the screen, which is what it was built to be.
     *
     * Order matters between the two. This listens on the window in the
     * CAPTURE phase and the deck listens on the deck, so the room is asked
     * first; when it takes the gesture it stops the event dead and the deck
     * never sees it. When it declines — downward at the last stop, upward
     * at the first — the event carries on and the deck turns the page.
     * That is the whole handover: the rail walks to its end, and the next
     * gesture leaves.
     */
    let timer = 0
    let touchY: number | null = null
    let gesture: number | null = null
    let arrivedAt = 0

    /**
     * The room owns the wheel while the room is the screen.
     *
     * The test is how much of the window the room covers, on BOTH axes.
     * That word is the whole content of this comment, because leaving it
     * out is a real bug that was really here: with only the vertical
     * coverage measured, the hall panel reported itself as the screen from
     * four panels away, since a panel in a horizontal deck is full height
     * wherever it is sitting. The room then swallowed every wheel event on
     * the site and spent it on a rail nobody could see — Creative looked
     * like a page that had simply stopped scrolling.
     *
     * Position was the first thing tried, before the deck existed, and was
     * wrong for its own reason: a snapped panel used to rest with its top
     * at the menu line rather than at zero, so a `top <= 4` test never
     * fired once. Coverage does not care about the offset. It does have to
     * be coverage of the window, and a window has two dimensions.
     */
    const inHall = () => {
      const el = document.querySelector('.hall')
      if (!el) return false
      const r = el.getBoundingClientRect()
      const down = Math.min(r.bottom, window.innerHeight) - Math.max(r.top, 0)
      const across = Math.min(r.right, window.innerWidth) - Math.max(r.left, 0)
      return down >= window.innerHeight * 0.85 && across >= window.innerWidth * 0.85
    }

    let wasAway = !inHall()

    /* The `data-in-hall` marker that used to live here is gone with the
       rule it served. It existed so the room could suspend the page's
       vertical snapping while it held the wheel — two systems, one scroll
       position. The page has no vertical snapping to suspend now, nothing
       in the stylesheet read the attribute any more, and its two listeners
       were on the window, which the deck's scrolling never reaches: it
       would have sat there reporting the wrong answer forever. */

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
      /* Taken. The deck listens further down the same event and must not
         also turn the page with it. */
      e.stopPropagation()
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
      e.stopPropagation()
      advance(dy)
    }
    const onTouchEnd = () => { touchY = null }

    window.addEventListener('wheel', onWheel, { passive: false, capture: true })
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: false, capture: true })
    window.addEventListener('touchend', onTouchEnd, { passive: true })
    return () => {
      window.removeEventListener('wheel', onWheel, { capture: true })
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove, { capture: true })
      window.removeEventListener('touchend', onTouchEnd)
      clearTimeout(timer)
    }
  }, [enabled, setPos, goTo])
}
