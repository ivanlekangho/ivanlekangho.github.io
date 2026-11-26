import { useEffect } from 'react'

/**
 * The section snap, driven here instead of by CSS.
 *
 * WHY THIS EXISTS. `scroll-snap-type: y mandatory` was doing this job and
 * could not be made to do it reliably. Three faults, all measured on
 * /impact:
 *
 *   - It intermittently refuses to place a target and answers with the END
 *     OF THE DOCUMENT. A plain `window.scrollTo(0, 0)` from the foot of the
 *     page landed at 2634 — the last scrollable pixel — one run, and at 0
 *     the next, with nothing else changed. That is the bug where the page
 *     "runs away to the end and gets stuck".
 *   - `scroll-snap-stop: always` does not constrain a gesture that is being
 *     consumed by a nested scroller and then chained outward, and every
 *     chapter here has a nested scroller. So a fling could cross several
 *     sections at once.
 *   - It fought every programmatic scroll, which is why lib/scroll had to
 *     switch the snap off for the length of each jump before this.
 *
 * Switching to `proximity` fixed the refusals and lost the snap: measured,
 * one gesture from the title screen came to rest at 400px, half way down
 * the hero, which is the thing the brief most wanted not to happen.
 *
 * WHAT THIS DOES INSTEAD. The page's own snapping is off, and a gesture no
 * longer moves between sections AT ALL. Scrolling walks you through a
 * section's own content and stops at its edge; the rail down the left is
 * how you cross from one section to the next.
 *
 * That is Ivan's decision after living with the one-section-per-gesture
 * version, and it is the honest end of this road. Every arrangement that
 * let a gesture cross a boundary had the same problem in a different
 * costume: the reader cannot tell, before they move, whether this gesture
 * will scroll the paragraph in front of them or replace the whole screen.
 * One gesture doing two jobs is the ambiguity, and no amount of tuning the
 * threshold removes it. Separating them removes it: the wheel is for
 * reading, the rail is for going.
 *
 * The cost is that the rail is now load-bearing, so it cannot be the
 * hover-only decoration it was — it is labelled at all times, and it is
 * present on a phone, where it used to be display:none. A navigation
 * control that is the only way to move cannot be hidden on the device most
 * people will read this on.
 *
 * WHAT IT DELIBERATELY DOES NOT TOUCH. A gesture whose target is a chapter
 * that can still scroll in that direction is let through untouched — that
 * is reading inside a section, and it has to feel like ordinary scrolling.
 * Only a gesture at a section's edge becomes a section move.
 *
 * Touch is handled differently, by correcting after the fact rather than by
 * intercepting: preventing touchmove to run an animation instead fights the
 * platform's own momentum and feels broken on a phone in a way no desktop
 * testing catches. A touch scroll runs natively and is eased onto the
 * nearest section once it stops, which cannot run away because the
 * correction is always to the nearest marker.
 */

/** Long enough to read as travel, short enough not to feel held up. */
const GLIDE_MS = 480
/** A fling keeps firing after the animation ends; it has to go quiet first. */
const QUIET_MS = 140
/** Ignore the shiver a trackpad emits when a finger merely rests on it. */
const WAKE = 4
/** How far off a marker a touch scroll has to settle before it is corrected. */
const SLACK = 8

const quiet = () =>
  typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches

let raf = 0
let busy = false
let lastInput = 0
let settle = 0

const easeInOutCubic = (p: number) =>
  p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2

/** Stop whatever this module is currently animating. */
export function halt() {
  if (raf) cancelAnimationFrame(raf)
  raf = 0
  busy = false
  window.clearTimeout(settle)
}

/**
 * Move the page to `to`, and hold off further input until it has arrived
 * AND the pointer has gone quiet. The second half is what makes one fling
 * one section: the tail of a trackpad fling goes on firing for a few
 * hundred milliseconds after the gesture, and releasing the lock the moment
 * the animation ends simply hands that tail the next section.
 */
export function glideTo(to: number, onDone?: () => void) {
  halt()
  const from = window.scrollY
  const dist = to - from

  const release = () => {
    const wait = () => {
      if (performance.now() - lastInput > QUIET_MS) { busy = false; return }
      settle = window.setTimeout(wait, 60)
    }
    wait()
  }

  if (Math.abs(dist) < 1 || quiet()) {
    window.scrollTo(0, to)
    busy = true
    onDone?.()
    release()
    return
  }

  busy = true
  const t0 = performance.now()

  /* requestAnimationFrame is not guaranteed to keep running, and when it
     stops the page is left parked between two sections — which is the one
     state this whole module exists to make impossible. Two guards, because
     the two causes are different:
     
     A hidden tab is throttled to a crawl or stopped outright, and announces
     itself; the journey completes on the spot.
     
     Everything else does NOT announce itself. Frames are also throttled in
     a background window, an occluded one, and an embedded view that never
     sets `document.hidden` at all — measured right here, in the app's own
     browser pane, where a 480ms glide froze part-way and `document.hidden`
     stayed false throughout. So a timer runs behind the animation and ends
     it regardless. Belt and braces on a scroll position is worth it: the
     failure it prevents is the reader stranded mid-page. */
  const finish = () => {
    window.clearTimeout(backstop)
    document.removeEventListener('visibilitychange', onHide)
    if (raf) cancelAnimationFrame(raf)
    window.scrollTo(0, to)
    raf = 0
    onDone?.()
    release()
  }
  const onHide = () => { if (document.hidden) finish() }
  document.addEventListener('visibilitychange', onHide)
  const backstop = window.setTimeout(finish, GLIDE_MS + 240)

  const step = (now: number) => {
    raf = 0
    const p = Math.min(1, (now - t0) / GLIDE_MS)
    window.scrollTo(0, Math.round(from + dist * easeInOutCubic(p)))
    if (p < 1) { raf = requestAnimationFrame(step); return }
    finish()
  }
  raf = requestAnimationFrame(step)
}

/** The y every section starts at, measured off the zero-height markers. */
function stops(): number[] {
  const bar = parseFloat(
    getComputedStyle(document.documentElement).getPropertyValue('--bar-h'),
  ) || 0
  /* The markers are in normal flow and have no height, so their rect IS
     their layout position — which is the entire reason they exist rather
     than the cards being measured. The cards are sticky and all report the
     same pinned rectangle. */
  return [...document.querySelectorAll<HTMLElement>('.snap-at')].map((m) =>
    Math.max(0, Math.round(m.getBoundingClientRect().top + window.scrollY - bar)),
  )
}

/**
 * Put a section's body where the reader is arriving from.
 *
 * Going forward you meet a section at its beginning; coming back you meet
 * it where you left off, which is its end. Setting this explicitly is also
 * what fixes the other half of the old "stuck" complaint: parked at the
 * foot of the page with every inner scroller at its maximum, the first
 * gesture back did nothing visible because the whole of it went into
 * unwinding one of them.
 */
function face(index: number, forward: boolean) {
  const cards = document.querySelectorAll<HTMLElement>('.chapter-scroll')
  const el = cards[index - 1]
  if (!el) return
  el.scrollTop = forward ? 0 : el.scrollHeight - el.clientHeight
}

/** The y of stop `i` — 0 is the title screen, 1 the first chapter. */
export function stopY(i: number): number | null {
  const ys = stops()
  return i >= 0 && i < ys.length ? ys[i] : null
}

/**
 * Go to one stop by index.
 *
 * The rail, the bar and the cue all use this rather than measuring a
 * chapter, and they have to: a chapter is `position: sticky`, so once it is
 * pinned its rectangle is the PINNED rectangle and not its place in the
 * document. Measuring it then returns the position the page is already at,
 * which is exactly what the dots did — measured, with the page at the foot
 * of /impact every dot computed a target of 2634 and nothing moved. The
 * markers have no such problem, which is why they exist.
 */
export function goToStop(i: number) {
  const y = stopY(i)
  if (y === null) return
  anchorAt(i)
  face(i, y >= window.scrollY)
  glideTo(y)
}

const nearest = (ys: number[], y: number) =>
  ys.reduce((best, _, i) => (Math.abs(ys[i] - y) < Math.abs(ys[best] - y) ? i : best), 0)

/** The chapter body under this event, if it can still scroll that way. */
function readingInside(target: EventTarget | null, dy: number) {
  const el = target instanceof Element ? target.closest('.chapter-scroll') : null
  if (!el) return false
  const room = el.scrollHeight - el.clientHeight
  if (room <= 1) return false
  if (dy < 0) return el.scrollTop > 1
  return el.scrollTop < room - 1
}

/** Where a touch correction should return to. Set by whatever moved the
 *  page on purpose: the rail, the cue, a key. */
let anchor = 0
export const anchorAt = (i: number) => { anchor = i }

export function useSectionSnap(enabled = true) {
  useEffect(() => {
    if (!enabled) return

    const go = (dir: 1 | -1) => {
      const ys = stops()
      if (ys.length < 2) return
      const here = nearest(ys, window.scrollY)
      const next = here + dir
      if (next < 0 || next >= ys.length) return
      anchorAt(next)
      face(next, dir > 0)
      glideTo(ys[next])
    }

    const onWheel = (e: WheelEvent) => {
      /* Pinch-zoom and a sheet over the page are not ours. */
      if (e.ctrlKey || document.documentElement.hasAttribute('data-sheet')) return
      lastInput = performance.now()
      if (busy) { e.preventDefault(); return }
      const dy = e.deltaY
      if (Math.abs(dy) < WAKE) return
      /* Inside a section with room left to scroll: this is reading, and it
         is the one thing the wheel still does. */
      if (readingInside(e.target, dy)) return
      /* At a section's edge the gesture stops here. It does NOT advance:
         crossing between sections is the rail's job now. Swallowed rather
         than left alone, because letting it through would scroll the page
         off its section and leave the reader between two of them. */
      e.preventDefault()
    }

    const KEYS: Record<string, 1 | -1> = {
      PageDown: 1, PageUp: -1, ' ': 1,
    }
    const onKey = (e: KeyboardEvent) => {
      if (document.documentElement.hasAttribute('data-sheet')) return
      const t = e.target
      /* Never steal a key from something being typed into. */
      if (t instanceof HTMLElement
        && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return

      if (e.key === 'Home' || e.key === 'End') {
        const ys = stops()
        if (!ys.length) return
        e.preventDefault()
        const i = e.key === 'Home' ? 0 : ys.length - 1
        face(i, e.key === 'Home')
        glideTo(ys[i])
        return
      }
      /* The keyboard KEEPS its section navigation, and that is deliberate
         rather than an oversight. A reader on a keyboard has no rail to
         point at without tabbing to it, and Page Down is unambiguous in a
         way a wheel gesture is not: nobody presses it by accident while
         reading a paragraph. */
      const dir = KEYS[e.key]
      if (!dir) return
      if (readingInside(t, dir)) return
      lastInput = performance.now()
      if (busy) { e.preventDefault(); return }
      e.preventDefault()
      go(dir)
    }

    /* Touch: let the platform scroll, then ease back to the section the
       reader was on. `nearest` would advance them, which is the thing a
       gesture no longer does. */
    let idle = 0
    let anchored = anchor
    const correct = () => {
      if (busy || document.documentElement.hasAttribute('data-sheet')) return
      const ys = stops()
      if (ys.length < 2) return
      const y = ys[Math.min(anchored, ys.length - 1)]
      if (Math.abs(y - window.scrollY) > SLACK) glideTo(y)
    }
    let touching = false
    const onTouchStart = () => {
      touching = true
      halt()
      /* Where the reader is NOW, so the correction returns them to it
         rather than to whichever marker the fling happened to end up
         nearest. */
      anchored = anchor
    }
    const onTouchEnd = () => {
      touching = false
      window.clearTimeout(idle)
      idle = window.setTimeout(correct, 220)
    }
    const onScroll = () => {
      if (!touching) return
      window.clearTimeout(idle)
      idle = window.setTimeout(correct, 220)
    }

    window.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('keydown', onKey)
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchend', onTouchEnd, { passive: true })
    window.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      halt()
      window.clearTimeout(idle)
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchend', onTouchEnd)
      window.removeEventListener('scroll', onScroll)
    }
  }, [enabled])
}
