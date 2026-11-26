import { useEffect, useState } from 'react'

/**
 * The site reads left to right.
 *
 * Six panels in a row, each exactly one screen wide, in a horizontal
 * scroller that snaps. The reader moves between them with the wheel, a
 * trackpad swipe, the arrow keys or the bar at the top; inside a panel that
 * holds more than a screen, the wheel still scrolls down the way it always
 * did. Those two are the whole problem this file solves, because a mouse
 * wheel only has one axis and both of them want it.
 *
 * The rule that decides is about where a gesture BEGINS, not where it ends:
 *
 *   begins with the panel able to scroll further   -> the panel's gesture,
 *                                                     and it stays the
 *                                                     panel's to the end
 *   begins with the panel already at its edge      -> the deck's gesture,
 *                                                     worth exactly one
 *                                                     panel
 *
 * Deciding per EVENT instead was the first attempt and it is wrong in a way
 * that only shows up on a trackpad: a flick down a long panel reaches the
 * bottom with most of its momentum left, and that leftover momentum is read
 * as a fresh instruction and throws the reader two panels along. Momentum
 * belongs to the gesture that produced it. A gesture is over when the events
 * stop arriving for GAP milliseconds, which is also how the hall decides,
 * and for the same reason.
 *
 * One panel per gesture, never two, is then free: the deck's gesture
 * disarms itself the moment it spends itself.
 */

/**
 * What the bar offers, in bar order.
 *
 * It lives beside PANELS rather than in the component that draws it, for two
 * reasons. The lists have to agree — every id here must be a panel there —
 * and keeping them in one file is the only way that stays true. And a module
 * that exports a React component must export nothing else, or React Fast
 * Refresh gives up on it and hot-patches the page without remounting: stale
 * effects keep running against state the new code cannot see. That cost an
 * hour of chasing a bug in this file that was never in this file.
 *
 * About has an id like the rest: it is a panel of its own now, not a sheet.
 */
export const SECTIONS = [
  /* Two words because the panel is both: the Cancer Society work and the
     papers are the same question asked from a job and from a desk, and
     "Impact" alone read as the charity half only. */
  { id: 'impact', label: 'Work/Impact' },
  { id: 'creative', label: 'Creative' },
  { id: 'education', label: 'Education' },
  { id: 'about', label: 'About' },
  { id: 'contact', label: 'Contact' },
] as const

/** Document order. The hall is last and deliberately has no entry in the bar. */
export const PANELS = ['hero', 'impact', 'creative', 'education', 'about', 'contact', 'hall'] as const
export type PanelId = (typeof PANELS)[number]

/** Events closer together than this belong to one gesture. */
const GAP = 170
/** How long after the last scroll event the deck is considered to have landed. */
const LAND = 120
/**
 * How long to keep believing our own instruction over the measurement.
 *
 * A page turn is an animation, and while it runs the deck's scroll position
 * is a point between two panels that rounds to whichever is nearer. If the
 * settle below trusted that reading it would overwrite the panel we are on
 * our way to with the one we are passing, and the next gesture would then
 * step from the wrong place. So an instruction outranks a measurement until
 * the measurement agrees with it — or until this long has passed, after
 * which something has gone wrong with the animation and the measurement is
 * the better of two bad answers.
 */
const PATIENCE = 1200
/** A touch drag has to mean it before it counts as a page turn. */
const SWIPE = 44

const deckEl = () => document.querySelector('.deck') as HTMLElement | null
const reduced = () =>
  typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches
const panelsOf = (deck: HTMLElement) => Array.from(deck.children) as HTMLElement[]
const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n))

/** Which panel the deck is resting on, measured rather than remembered. */
function measure(deck: HTMLElement) {
  const w = deck.clientWidth || 1
  return clamp(Math.round(deck.scrollLeft / w), 0, panelsOf(deck).length - 1)
}

/**
 * Send the reader to a panel by name. Used by the bar, the hero's arrow and
 * the old hash URLs, so every route into a panel goes through one place.
 */
export function goToPanel(id: string, behavior: ScrollBehavior = 'smooth') {
  const deck = deckEl()
  if (!deck) return false
  const i = panelsOf(deck).findIndex((p) => p.id === id)
  if (i < 0) return false
  deck.scrollTo({ left: i * deck.clientWidth, behavior: reduced() ? 'auto' : behavior })
  return true
}

/**
 * The wheel, the keyboard and the swipe — and the current panel, which the
 * bar needs in order to say where you are and to get out of the way on the
 * first screen.
 */
export function useDeck(enabled: boolean) {
  const [at, setAt] = useState(0)

  useEffect(() => {
    if (!enabled) return
    const deck = deckEl()
    if (!deck) return

    /* The panel the deck is resting on. Held rather than measured on every
       event, because during a smooth scroll the measurement is a point
       halfway between two panels and stepping from a halfway point lands
       somewhere nobody asked for. Updated optimistically when we move the
       deck ourselves, and from the measurement once the deck lands — the
       second is what catches a trackpad swipe or a dragged scrollbar. */
    let cur = measure(deck)
    setAt(cur)

    /** A page turn we asked for and have not seen arrive. */
    let pending: number | null = null
    let asked = 0

    const go = (i: number) => {
      const n = clamp(i, 0, panelsOf(deck).length - 1)
      if (n === cur) return
      cur = n
      setAt(n)
      pending = n
      asked = performance.now()
      /* Anyone who asked for less motion gets the panel rather than the
         journey to it. */
      deck.scrollTo({ left: n * deck.clientWidth, behavior: reduced() ? 'auto' : 'smooth' })
    }

    /* ---- the wheel ------------------------------------------------ */
    let lastEvent = 0
    /** Does the gesture in progress belong to the deck? */
    let armed = false

    /** A sheet is a scroll container over the top of everything. */
    const sheetUp = () => document.documentElement.hasAttribute('data-sheet')
    /** Anything that declared it keeps its own scrolling. */
    const theirs = (t: EventTarget | null) =>
      t instanceof Element && !!t.closest('[data-keeps-scroll]')

    /** How much vertical room the current panel has left in a direction. */
    const roomBelow = (dy: number) => {
      const panel = panelsOf(deck)[cur]
      if (!panel) return false
      const room = panel.scrollHeight - panel.clientHeight
      if (room <= 2) return false
      return dy > 0 ? panel.scrollTop < room - 1 : panel.scrollTop > 1
    }

    const onWheel = (e: WheelEvent) => {
      if (sheetUp() || theirs(e.target)) return
      const unit = e.deltaMode === 1 ? 16 : 1
      const dy = e.deltaY * unit
      const dx = e.deltaX * unit
      /* A genuinely sideways gesture is a trackpad doing exactly what the
         deck wants. Hands off — the browser's own snapping is better at it
         than anything written here. */
      if (Math.abs(dx) > Math.abs(dy)) return
      if (!dy) return

      const now = performance.now()
      if (now - lastEvent > GAP) armed = !roomBelow(dy)
      lastEvent = now

      /* The panel's gesture: let it scroll, and keep letting it even after
         it hits the bottom. */
      if (!armed) return
      e.preventDefault()
      go(cur + (dy > 0 ? 1 : -1))
      /* Spent. Everything left of this gesture — momentum included — is
         swallowed above rather than turned into a second page. */
      armed = false
    }

    /* ---- the keyboard --------------------------------------------- */
    const onKey = (e: KeyboardEvent) => {
      if (sheetUp() || e.metaKey || e.ctrlKey || e.altKey) return
      const t = e.target
      if (t instanceof HTMLElement &&
          (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return
      if (e.key === 'ArrowRight') { e.preventDefault(); go(cur + 1) }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); go(cur - 1) }
      else if (e.key === 'Home') { e.preventDefault(); go(0) }
      else if (e.key === 'End') { e.preventDefault(); go(panelsOf(deck).length - 1) }
    }

    /* ---- touch -----------------------------------------------------
       A sideways drag is native: mandatory snapping plus scroll-snap-stop
       already turns one swipe into one panel, and nothing here improves on
       it. What is handled is the OTHER swipe — a reader on a phone whose
       thumb goes up the screen out of habit, on a panel with nothing below
       to scroll to. Natively that does nothing at all, which reads as a
       dead page, so it turns into a page instead. On a panel that does have
       more below, it is left alone and scrolls. */
    let sx = 0, sy = 0, turned = false, tracking = false
    const onTouchStart = (e: TouchEvent) => {
      tracking = !sheetUp() && !theirs(e.target) && e.touches.length === 1
      turned = false
      if (!tracking) return
      sx = e.touches[0].clientX
      sy = e.touches[0].clientY
    }
    const onTouchMove = (e: TouchEvent) => {
      if (!tracking || turned) return
      const dx = sx - e.touches[0].clientX
      const dy = sy - e.touches[0].clientY
      if (Math.abs(dy) < SWIPE || Math.abs(dy) <= Math.abs(dx)) return
      if (roomBelow(dy)) { tracking = false; return }
      turned = true
      if (e.cancelable) e.preventDefault()
      go(cur + (dy > 0 ? 1 : -1))
    }
    const onTouchEnd = () => { tracking = false }

    /* ---- where we landed ------------------------------------------ */
    let settle = 0
    const onScroll = () => {
      clearTimeout(settle)
      settle = window.setTimeout(() => {
        const i = measure(deck)
        if (pending !== null) {
          if (i === pending || performance.now() - asked > PATIENCE) pending = null
          /* Still on its way. Our instruction stands. */
          else return
        }
        if (i !== cur) { cur = i; setAt(i) }
      }, LAND)
    }

    /* A resize changes what one panel is worth, so the deck has to be put
       back on the panel it was on or it ends up between two. */
    const onResize = () => deck.scrollTo({ left: cur * deck.clientWidth })

    /* Capture, so this runs before anything inside a panel, and on the deck
       rather than the window so the hall — which listens on the window in
       the capture phase — gets first refusal on the wheel while it is the
       screen. See lib/hallScroll.ts. */
    deck.addEventListener('wheel', onWheel, { passive: false })
    deck.addEventListener('touchstart', onTouchStart, { passive: true })
    deck.addEventListener('touchmove', onTouchMove, { passive: false })
    deck.addEventListener('touchend', onTouchEnd, { passive: true })
    deck.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('keydown', onKey)
    window.addEventListener('resize', onResize)
    return () => {
      deck.removeEventListener('wheel', onWheel)
      deck.removeEventListener('touchstart', onTouchStart)
      deck.removeEventListener('touchmove', onTouchMove)
      deck.removeEventListener('touchend', onTouchEnd)
      deck.removeEventListener('scroll', onScroll)
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('resize', onResize)
      clearTimeout(settle)
    }
  }, [enabled])

  return at
}
