import { useEffect, useState } from 'react'

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
/** ...but not for ever. See `arrived` and the rising test below. */
const HOLD_MAX_MS = 700
/** A delta this much bigger than the one before it is a person, not a
 *  tail: inertial scrolling only ever decays. */
const RISE = 1.2
/** Ignore the shiver a trackpad emits when a finger merely rests on it. */
const WAKE = 4
/* ---- the charge -----------------------------------------------------
   What it takes to cross from one section to the next.

   A gesture at a section's edge does not advance the page; it fills a
   budget, and crossing the budget advances it. Three numbers, and the
   third is the one that matters most.

   BUDGET is how hard. A mouse notch is about 100–120px of deltaY in
   Chrome, so 200 is two notches — Ivan's setting, after 320 and 260 both
   felt heavy. It is at the light end of what works: much under this and a
   single emphatic notch starts carrying the page away on its own, which is
   the thing the budget exists to prevent. Over ~450 the page feels stuck.

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
   you dragged past the edge. It is larger than the wheel's, because a
   drag is a long gesture next to a notch — at 110 a half-screen pull
   spent it without meaning to. */
const BUDGET = 200
const TOUCH_BUDGET = 320
/** Silence this long empties the budget. Long enough to survive the gaps
 *  in a slow, steady push: a trackpad held at a constant pressure emits
 *  events several tens of milliseconds apart, and at 180 the ring was
 *  draining between them while the finger was still on the pad. */
const DECAY_MS = 260
/** And it drains over this, rather than vanishing. */
const DRAIN_MS = 260

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
/** Whether the page has finished moving, as distinct from whether the
 *  lock has opened. Between the two is where the tail is swallowed. */
let arrived = false
let arrivedAt = 0
/** The last swallowed magnitude, for telling a tail from a new push. */
let lastMag = Infinity

let charge = 0
let chargeDir: 1 | -1 | 0 = 0
/** Which budget this charge is being measured against. The wheel's and a
 *  finger's are different sizes, and the ring has to be drawn against the
 *  one actually in force — against the wheel's it read full at 62% of a
 *  drag and then sat there, promising a move that was still 120px away. */
let chargeBudget = BUDGET
let decay = 0
let drain = 0

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
  root.style.setProperty('--push', Math.min(1, charge / chargeBudget).toFixed(3))
  if (chargeDir === 0) root.removeAttribute('data-push')
  else root.setAttribute('data-push', chargeDir > 0 ? 'down' : 'up')
}

/**
 * Let the budget go — by draining it, not by deleting it.
 *
 * Setting it straight to zero made the ring vanish, which reads as a
 * glitch rather than as a weight being released: a reader who stops
 * pushing for a moment saw their progress disappear between one frame and
 * the next and could not tell whether the page had registered anything at
 * all. Easing it back down shows the charge returning, which is the honest
 * picture of what is happening and is also the thing that tells them to
 * push harder rather than longer.
 *
 * `instant` is for the cases where there is nothing to show: the budget
 * was just spent, or the reader has gone back to reading inside a section.
 */
function dropCharge(instant = false) {
  window.clearTimeout(decay)
  if (drain) cancelAnimationFrame(drain)
  drain = 0

  if (instant || charge <= 0) {
    charge = 0
    chargeDir = 0
    showCharge()
    return
  }

  const from = charge
  const t0 = performance.now()
  const step = (now: number) => {
    const p = Math.min(1, (now - t0) / DRAIN_MS)
    charge = from * (1 - p * p)
    showCharge()
    if (p < 1) { drain = requestAnimationFrame(step); return }
    drain = 0
    charge = 0
    chargeDir = 0
    showCharge()
  }
  drain = requestAnimationFrame(step)
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
  arrived = false
  lastMag = Infinity
  /* Instant: the budget was just spent, so there is no weight left to
     show returning. */
  dropCharge(true)
  const from = window.scrollY
  const dist = to - from

  /* Whatever happens next, the index follows the page. */
  const land = () => setStop(nearest(stops(), window.scrollY))

  /**
   * Open the lock once the tail has passed.
   *
   * Waiting for silence is right for a fling, whose tail goes on firing
   * for several hundred milliseconds after the fingers lift. It is wrong
   * for a reader who simply keeps scrolling: every swallowed event
   * refreshed `lastInput`, so the silence never came and the lock never
   * opened. They had to stop — and what they noticed themselves doing was
   * moving the mouse, because moving it takes long enough to count as
   * stopping.
   *
   * So silence is no longer the only way out. The ceiling below bounds the
   * wait, and `onWheel` opens it early when it sees a delta rising, which
   * momentum never does.
   */
  const release = () => {
    arrived = true
    arrivedAt = performance.now()
    lastMag = Infinity
    const wait = () => {
      const now = performance.now()
      if (now - lastInput > QUIET_MS || now - arrivedAt > HOLD_MAX_MS) { busy = false; return }
      settle = window.setTimeout(wait, 60)
    }
    wait()
  }

  if (Math.abs(dist) < 1 || quiet()) {
    window.scrollTo(0, to)
    busy = true
    land()
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
    land()
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
  face(i, y >= window.scrollY)
  glideTo(y)
}

const nearest = (ys: number[], y: number) =>
  ys.reduce((best, _, i) => (Math.abs(ys[i] - y) < Math.abs(ys[best] - y) ? i : best), 0)

/** The chapter body under this event, if it can still scroll that way. */
/**
 * How far the section ON SCREEN can still scroll that way.
 *
 * Returns the scroller and the pixels left in it, so a gesture can be
 * SPLIT rather than classified. The old version answered yes-or-no —
 * "is this reading?" — and that is what made reading and pushing two
 * separate gestures: a reader had to scroll to the end of a section,
 * stop, and start again to build any charge. One motion now does both,
 * because the part of a flick that runs off the end of the content is
 * handed straight to the budget.
 *
 * IT DOES NOT LOOK AT THE EVENT'S TARGET, and that is the point. Chrome
 * latches a wheel sequence to whatever was under the cursor when it
 * began, so for a few hundred milliseconds after the page moves, events
 * are still delivered to the chapter that just left the screen. Resolving
 * the scroller from the target therefore fed the gesture to a section the
 * reader could not see: it had room, so it absorbed everything, the
 * budget never filled, and the page sat still until the mouse was moved
 * and the latch re-hit-tested. Which is exactly the symptom — "I have to
 * jiggle the mouse before I can scroll again".
 *
 * The chapters are sticky and only one of them is ever on screen, so the
 * section under the gesture is simply the section we are stopped on. The
 * index already knows which that is.
 */
/** The body of the section on screen. Stop 0 is the title, which has none. */
function activeScroller() {
  return document.querySelectorAll<HTMLElement>('.chapter-scroll')[atStop - 1] ?? null
}

function roomBelow(dy: number) {
  const el = activeScroller()
  if (!el) return null
  const span = el.scrollHeight - el.clientHeight
  if (span <= 1) return null
  const left = dy > 0 ? span - el.scrollTop : el.scrollTop
  return { el, left: Math.max(0, left) }
}

/* ---- which stop we are on ------------------------------------------
   One source of truth, owned here because this file is the only thing
   that can move the page.

   The rail and the arrows used to work this out for themselves, from
   `useAtTop` (a scroll listener) and `useActiveChapter` (an
   IntersectionObserver). Two mechanisms, both indirect, and the first of
   them had a latch: it throttled through requestAnimationFrame behind an
   `if (!raf)` guard, so one frame that never arrived left it permanently
   deaf. Measured: the page resting at 2532 with the title dot still lit,
   and a synthetic scroll event not waking it.

   Nothing infers position now. The page moves in exactly one place, and
   that place says where it landed. */
let atStop = 0
const watchers = new Set<(i: number) => void>()

function setStop(i: number) {
  if (i === atStop) return
  atStop = i
  watchers.forEach((fn) => fn(i))
}

/** The index of the stop the page is resting on. 0 is the title screen. */
export function useStopIndex() {
  const [i, setI] = useState(atStop)
  useEffect(() => {
    /* The page may have moved between module load and this mount. */
    setI(atStop)
    watchers.add(setI)
    return () => { watchers.delete(setI) }
  }, [])
  return i
}

export function useSectionSnap(enabled = true) {
  useEffect(() => {
    if (!enabled) return
    /* A fresh page starts at its title; a resize can move the stops
       without the page having moved. */
    setStop(nearest(stops(), window.scrollY))
    const onResize = () => setStop(nearest(stops(), window.scrollY))
    window.addEventListener('resize', onResize)

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
      face(next, dir > 0)
      glideTo(ys[next])
    }

    /** Add to the budget, and spend it if it is full. */
    const push = (amount: number, dir: 1 | -1, budget: number) => {
      /* Nothing that way. Pushing down on the last section used to go on
         filling a budget that `go` would then decline to spend, which left
         a half-drawn ring sitting on screen promising a move that could
         never happen — and promising it next to a down arrow that is not
         even rendered there any more. */
      const ys = stops()
      const next = nearest(ys, window.scrollY) + dir
      if (next < 0 || next >= ys.length) { dropCharge(true); return }
      /* Pushing again catches the budget before it has finished draining,
         so a reader who pauses and resumes picks up where they were
         instead of starting over. */
      if (drain) { cancelAnimationFrame(drain); drain = 0 }
      /* A change of direction is a new gesture, not a continuation. */
      if (dir !== chargeDir) { charge = 0; chargeDir = dir }
      chargeBudget = budget
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
      const dy = pixels(e)

      if (busy) {
        e.preventDefault()
        const mag = Math.abs(dy)
        /* A tail only ever decays. A delta bigger than the one before it
           is the reader pushing again, so the lock opens now rather than
           waiting for a silence that an unbroken scroll will never
           provide — and this event is theirs to spend. */
        if (arrived && mag > lastMag * RISE + 4) {
          window.clearTimeout(settle)
          busy = false
        } else {
          lastMag = Math.min(lastMag, mag)
          return
        }
      }
      /* Too small to count for anything, but NOT nothing: a finger held
         steady on a trackpad emits a stream of one- and two-pixel events,
         and returning here without touching the timer let the budget drain
         away underneath a reader who was still pushing. The gesture is
         alive; it is just not adding much. */
      if (Math.abs(dy) < WAKE) {
        if (chargeDir !== 0) {
          window.clearTimeout(decay)
          decay = window.setTimeout(dropCharge, DECAY_MS)
        }
        return
      }
      /* One motion, split between the two things it can do.
      
         The section takes as much of this event as it still has room for
         and the remainder goes into the budget, so a flick that runs off
         the end of the content carries straight on into the ring without
         the reader having to stop and start again. The whole gesture is
         continuous; it is only the budget that makes the last part of it
         cost something. */
      const room = roomBelow(dy)
      if (room && room.left > 0) {
        const used = Math.min(Math.abs(dy), room.left)
        room.el.scrollTop += Math.sign(dy) * used
        const over = Math.abs(dy) - used
        e.preventDefault()
        if (over > 0) push(over, dy > 0 ? 1 : -1, BUDGET)
        else dropCharge(true)
        return
      }
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
      const kroom = roomBelow(dir)
      if (kroom && kroom.left > 0) return
      lastInput = performance.now()
      if (busy) { e.preventDefault(); return }
      e.preventDefault()
      go(dir)
    }

    /* The settle-correction that used to live here is gone. It eased the
       page back onto a stop after a native touch scroll had left it
       between two — and with the document locked there is no native touch
       scroll of the page to correct. */
    /* Touch spends the same budget, measured the way a finger measures:
       how far you dragged past the edge.

       IT DOES NOT SCROLL THE SECTION ITSELF. The wheel path has to, because
       the document is locked and a swallowed wheel event moves nothing —
       but a finger dragging inside `.chapter-scroll` is scrolled by the
       platform, with its own momentum, and adding `scrollTop +=` on top of
       that moved the content twice for one drag. So touch only watches:
       while the section still has somewhere to go the browser is in
       charge, and the budget starts filling at the edge. The gesture is
       continuous either way, which is the point.

       The budget is larger here than on a wheel. A drag is a long gesture
       next to a notch, and at 110 a half-screen pull spent it without
       meaning to. */
    let lastY = 0
    const onTouchMove = (e: TouchEvent) => {
      if (document.documentElement.hasAttribute('data-sheet')) return
      const t = e.touches[0]
      if (!t) return
      const dy = lastY - t.clientY
      lastY = t.clientY
      if (!dy) return
      lastInput = performance.now()

      if (busy) {
        /* No tail to wait out: a finger that is still moving is a person,
           and once the page has landed the next drag is theirs. The wheel
           needs a rising-delta test for this; touch does not, because
           momentum after a lift produces no touchmove at all. */
        if (!arrived) return
        window.clearTimeout(settle)
        busy = false
      }

      const el = activeScroller()
      if (el) {
        const span = el.scrollHeight - el.clientHeight
        const atEdge = dy > 0 ? el.scrollTop >= span - 1 : el.scrollTop <= 1
        if (span > 1 && !atEdge) { dropCharge(true); return }
      }
      push(Math.min(Math.abs(dy), 40), dy > 0 ? 1 : -1, TOUCH_BUDGET)
    }

    const onTouchStart = (e: TouchEvent) => {
      lastY = e.touches[0]?.clientY ?? 0
      dropCharge(true)
      halt()
    }
    const onTouchEnd = () => { dropCharge() }

    window.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('keydown', onKey)
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: true })
    window.addEventListener('touchend', onTouchEnd, { passive: true })

    return () => {
      halt()
      dropCharge(true)
      root.style.removeProperty('--push')
      root.style.overflow = hadOverflow
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onTouchEnd)
      window.removeEventListener('resize', onResize)
    }
  }, [enabled])
}
