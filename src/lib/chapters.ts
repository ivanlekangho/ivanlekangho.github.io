import { useEffect, useState } from 'react'

/**
 * The three measurements the chaptered page runs on.
 *
 * All three publish CSS custom properties rather than inline styles,
 * because every one of them is read by several rules at once — the hero's
 * height, the snap padding, the rail's offset — and a value that several
 * rules share should live in one place that they all point at.
 */

/**
 * The header's real height, as a variable.
 *
 * Everything vertical on these pages is measured from the bar: the hero is
 * one screen *less the bar*, each chapter is the same, and the snap
 * padding has to equal it exactly or every section lands with its heading
 * tucked underneath. Hard-coding 3.5rem worked until the labels wrapped at
 * some width and it did not.
 *
 * A ResizeObserver rather than a resize listener, because the bar can
 * change height without the window changing size at all — a font finishing
 * loading does it.
 */
export function useBarHeight() {
  useEffect(() => {
    const bar = document.querySelector('.menu')
    if (!bar || typeof ResizeObserver !== 'function') return
    const publish = () => {
      const h = Math.round(bar.getBoundingClientRect().height)
      if (h > 0) document.documentElement.style.setProperty('--bar-h', `${h}px`)
    }
    publish()
    const ro = new ResizeObserver(publish)
    ro.observe(bar)
    return () => {
      ro.disconnect()
      document.documentElement.style.removeProperty('--bar-h')
    }
  }, [])
}

/**
 * How far the sheet has come up over the hero, 0 to 1.
 *
 * The hero is sticky and the sheet scrolls over the top of it, so this is
 * simply how much of one screen has been scrolled — at 1 the sheet's top
 * edge has reached the top of the hero and the hero is entirely covered.
 * The number drives a scale and an opacity in CSS, so the handoff is one
 * value with several consequences rather than three listeners.
 *
 * Written straight to the custom property inside a rAF rather than held in
 * React state: this changes on every scroll frame, and putting it through
 * a render would re-render the entire page sixty times a second to move
 * two numbers that only CSS reads.
 */
export function useHandoff(enabled = true) {
  useEffect(() => {
    const root = document.documentElement
    if (!enabled || matchMedia('(prefers-reduced-motion: reduce)').matches) {
      root.style.setProperty('--handoff', '0')
      return () => root.style.removeProperty('--handoff')
    }
    let raf = 0
    const measure = () => {
      raf = 0
      const hero = document.querySelector('.chapters-hero')
      const span = hero ? hero.getBoundingClientRect().height : window.innerHeight
      const p = span > 0 ? Math.min(1, Math.max(0, window.scrollY / span)) : 0
      root.style.setProperty('--handoff', p.toFixed(4))
    }
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(measure) }
    measure()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      root.style.removeProperty('--handoff')
    }
  }, [enabled])
}

/**
 * How far each chapter has been covered by the next one, 0 to 1.
 *
 * The chapters are sticky and stack: each pins under the bar and the next
 * comes up over it. This is the same handoff the hero gets, so the covered
 * one can shrink and fade exactly as the hero does.
 *
 * It is JavaScript and not `animation-timeline: view()`, which is what it
 * was written as first and which does not work here: a view timeline
 * measures the subject's own progress across the scrollport, and a sticky
 * box pinned under the bar has no progress to measure — it is not moving.
 * Measured, the animation simply never left 0% while the stack stacked
 * correctly around it. What actually governs the recede is the NEXT
 * chapter's position, so that is what this reads.
 *
 * One listener for the whole page, one rAF, and the values land on custom
 * properties rather than in React state, because they change on every
 * scroll frame and only CSS reads them.
 */
export function useStack(enabled = true) {
  useEffect(() => {
    if (!enabled) return
    const quiet = matchMedia('(prefers-reduced-motion: reduce)').matches
    const cards = [...document.querySelectorAll<HTMLElement>('.chapter, .chapters-foot')]
    if (!cards.length) return
    if (quiet) {
      cards.forEach((c) => c.style.setProperty('--cover', '0'))
      return
    }
    let raf = 0
    const measure = () => {
      raf = 0
      const bar = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--bar-h')) || 0
      const span = window.innerHeight - bar
      cards.forEach((card, i) => {
        const next = cards[i + 1]
        if (!next || span <= 0) { card.style.setProperty('--cover', '0'); return }
        /* 0 when the next card's top is a full screen below the bar line,
           1 when it has reached it and the cover is complete. */
        const gap = next.getBoundingClientRect().top - bar
        const p = Math.min(1, Math.max(0, 1 - gap / span))
        card.style.setProperty('--cover', p.toFixed(4))
      })
    }
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(measure) }
    measure()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      cards.forEach((c) => c.style.removeProperty('--cover'))
    }
  }, [enabled])
}

/**
 * Which chapter is being read, for the rail.
 *
 * The band is the middle of the screen rather than the whole of it: with a
 * full-height root margin two neighbouring chapters are both "in view" at
 * every moment between them, and the dot flickers between the two. A
 * narrow band in the middle has exactly one answer almost all the time,
 * and the `ids` order breaks the tie when it does not.
 */
export function useActiveChapter(ids: string[]) {
  const [active, setActive] = useState(ids[0] ?? null)

  useEffect(() => {
    if (typeof IntersectionObserver !== 'function') return
    const els = ids
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[]
    if (!els.length) return

    const live = new Set<string>()
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) live.add(e.target.id)
          else live.delete(e.target.id)
        }
        const here = ids.filter((id) => live.has(id))
        if (here.length) setActive(here[here.length - 1])
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
    /* join, not the array: a fresh array every render would rebuild the
       observer on every render. */
  }, [ids.join(',')])

  return active
}
