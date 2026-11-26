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
 * WHAT THIS DOES INSTEAD. The page's own snapping is off and the document
 * is locked, so nothing moves the page except this file. A gesture inside a
 * section reads it. A gesture at a section's EDGE fills a budget, and
 * crossing that budget moves exactly one section, to the top of it. See
 * the note on BUDGET for the three numbers that make that work.
 *
 * The ambiguity that sank every earlier version was a gesture doing two
 * jobs: the reader could not tell, before they moved, whether this flick
 * would scroll the paragraph in front of them or replace the whole screen.
 * The budget is what resolves it. The two jobs are now different efforts
 * rather than the same effort in different places, and the charge is shown
 * while it fills so the difference is visible before it is committed to.
 *
 * The rail and the arrows stay, and they are not a fallback: they are how
 * you cross four sections at once, which no amount of pushing should do.
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

/* ---- the charge -----------------------------------------------------
   What it takes to cross from one section to the next.

   A gesture at a section's edge does not advance the page; it fills a
   budget, and crossing the budget advances it. Three numbers, and the
   third is the one that matters most.

   BUDGET is how hard. A mouse notch is about 100–120px of deltaY in
   Chrome, so 320 is roughly three notches: deliberate on a wheel, a short
   firm push on a trackpad. Under ~200 it fires by accident; over ~450 the
   page feels stuck.

   DECAY is what stops the budget being a tally instead of a gesture.
   Without it, ten idle nudges spread over a minute eventually add up to a
   jump and the page feels haunted. 180ms of silence empties it, and so
   does a change of direction.

   QUIET_MS, already above, is the one that makes "never skip" true. A
   trackpad keeps emitting for 300–800ms after your fingers leave the pad,
   so the lock is not released when the animation ends — it is released
   when the animation has ended AND the input has gone silent. No browser
   flags inertial events, so silence is the only honest way to tell the
   tail of one gesture from the start of the next.

   TOUCH_BUDGET is the same idea in the units a finger works in: how far
   you dragged past the edge. */
const BUDGET = 320
const TOUCH_BUDGET = 110
const DECAY_MS = 180

/**
 * One wheel event, in pixels, whatever units it arrived in.
 *
 * `deltaMode` is 0 for pixels, 1 for lines and 2 for pages, and a budget
 * counted in pixels is meaningless against the other two — a line-mode
 * mouse reports 3 and a page-mode one reports 1, so both would push
 * against a 320px budget for ever and the page would never move for them.
 */
const PX_PER_LINE = 16
function pixels(e: WheelEvent) {
  if (e.deltaMode === 1) return e.deltaY * PX_PER_LINE
  if (e.deltaMode === 2) return e.deltaY * window.innerHeight
  return e.deltaY
}

const quiet = () =>
  typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches

let raf = 0
let busy = false
let lastInput = 0
let settle = 0

/** How full the budget is, and which way it is being pushed. */
let charge = 0
let chargeDir: 1 | -1 | 0 = 0
let decay = 0

/**
 * Show the reader the charge.
 *
 * A threshold with no feedback is indistinguishable from a page that is
 * ignoring you — the first push does nothing, and nothing is exactly what
 * a broken control does. So the fraction goes onto the document as
 * `--push` and the direction as `data-push`, and the arrow for that
 * direction fills while the section leans a few pixels the way you are
 * pushing it. The moment a reader sees the ring move, 320px stops being
 * arbitrary and starts being a weight.
 */
function showCharge() {
  const root = document.documentElement
  root.style.setProperty('--push', (charge / BUDGET).toFixed(3))
  if (chargeDir === 0) root.removeAttribute('data-push')
  else root.setAttribute('data-push', chargeDir > 0 ? 'down' : 'up')
}

function dropCharge() {
  charge = 0
  chargeDir = 0
  window.clearTimeout(decay)
  showCharge()
}

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
  dropCharge()
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

    /* THE DOCUMENT IS LOCKED, and this is what finally makes "you cannot
       scroll between sections" true rather than mostly true.
       
       Swallowing the wheel was never enough. A page with a 4000px document
       and a visible scrollbar can be moved half a dozen other ways: drag
       the scrollbar, press an arrow key or Home or End, middle-click and
       autoscroll, drag with a touchscreen, use a trackpad's momentum tail.
       Each one needed its own handler and the list never ended.
       
       `overflow: hidden` on the scrolling element ends all of them at
       once, and — measured — leaves the two things that have to keep
       working untouched: `window.scrollTo` still moves the page exactly
       (verified landing on 878 to the pixel), and the chapters are still
       `position: sticky` against it, so the stack still stacks. The
       scrollbar goes with it, which is honest: there is nothing for a
       reader to drag any more.
       
       Scoped to this hook, so it applies only to chaptered pages. The post
       pages are prose and must scroll like prose. */
    const root = document.documentElement
    const hadOverflow = root.style.overflow
    root.style.overflow = 'hidden'

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

    /** Add to the budget, and spend it if it is full. */
    const push = (amount: number, dir: 1 | -1, budget: number) => {
      /* A change of direction is a new gesture, not a continuation. */
      if (dir !== chargeDir) { charge = 0; chargeDir = dir }
      charge += amount
      window.clearTimeout(decay)
      decay = window.setTimeout(dropCharge, DECAY_MS)
      if (charge < budget) { showCharge(); return }
      /* Full. `go` ends in `glideTo`, which empties the budget and takes
         the lock; the lock is not released until the page has arrived AND
         the pointer has gone quiet, which is what stops the tail of this
         same flick spending a second one. */
      go(dir)
    }

    const onWheel = (e: WheelEvent) => {
      /* Pinch-zoom and a sheet over the page are not ours. */
      if (e.ctrlKey || document.documentElement.hasAttribute('data-sheet')) return
      lastInput = performance.now()
      if (busy) { e.preventDefault(); return }
      const dy = pixels(e)
      if (Math.abs(dy) < WAKE) return
      /* Inside a section with room left to scroll: this is reading, and
         reading is untouched. */
      if (readingInside(e.target, dy)) { dropCharge(); return }
      /* At the edge. The page cannot move on its own — the document is
         locked — so this is swallowed either way; what it does instead is
         fill the budget. */
      e.preventDefault()
      /* Capped at the budget, not below it. An earlier version clamped
         each event to 120px to stop one freak event spending everything,
         and that was the wrong instinct twice over: it threw away genuine
         effort, and a device that reports a whole gesture in one event
         could never fill the budget at all. Measured here, the harness
         sends a ten-tick push as a single deltaY of 1000 and the page
         never moved. One event carrying 320px of intent IS a strong
         scroll, and should be spent as one. */
      push(Math.min(Math.abs(dy), BUDGET), dy > 0 ? 1 : -1, BUDGET)
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
    /* Touch spends the same budget, measured the way a finger measures:
       how far you dragged past the edge, rather than how much delta the
       wheel reported. The page is locked, so nothing rubber-bands under
       the finger — the ring and the lean are the feedback instead. */
    let lastY = 0
    const onTouchMove = (e: TouchEvent) => {
      if (document.documentElement.hasAttribute('data-sheet')) return
      const t = e.touches[0]
      if (!t) return
      const dy = lastY - t.clientY
      lastY = t.clientY
      if (!dy) return
      lastInput = performance.now()
      if (busy) return
      if (readingInside(e.target, dy)) { dropCharge(); return }
      push(Math.min(Math.abs(dy), 40), dy > 0 ? 1 : -1, TOUCH_BUDGET)
    }

    let touching = false
    const onTouchStart = (e: TouchEvent) => {
      lastY = e.touches[0]?.clientY ?? 0
      dropCharge()
      touching = true
      halt()
      /* Where the reader is NOW, so the correction returns them to it
         rather than to whichever marker the fling happened to end up
         nearest. */
      anchored = anchor
    }
    const onTouchEnd = () => {
      touching = false
      dropCharge()
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
    window.addEventListener('touchmove', onTouchMove, { passive: true })
    window.addEventListener('touchend', onTouchEnd, { passive: true })
    window.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      halt()
      dropCharge()
      root.style.removeProperty('--push')
      root.style.overflow = hadOverflow
      window.clearTimeout(idle)
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onTouchEnd)
      window.removeEventListener('scroll', onScroll)
    }
  }, [enabled])
}
