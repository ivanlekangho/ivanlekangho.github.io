import { useEffect, useRef, useState } from 'react'

const prefersReduced = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Returns 0→1 for how far a tall element has travelled through the viewport.
 *
 * The whole centerpiece runs off this single number. Notation, tone contour and
 * code are three projections of the same note array, all indexed by `progress`,
 * which is what makes the morph mean something rather than being three graphics
 * crossfading.
 *
 * Two signals drive it, on purpose:
 *   - a passive `scroll` listener, which is the RELIABLE one. It fires even when
 *     requestAnimationFrame is throttled (background tab, low-power mode, some
 *     headless contexts). Without it the section can freeze mid-morph.
 *   - a requestAnimationFrame loop while the section is on screen, which is the
 *     SMOOTHING one. It keeps the morph fluid during iOS momentum scrolling,
 *     where scroll events can arrive in clumps.
 * Either alone has a failure mode; together they don't. The cost of the overlap
 * is one getBoundingClientRect per scroll event, which is a rounding error.
 *
 * We only ever READ layout, never write it in the same pass, so there is no
 * forced synchronous reflow. prefers-reduced-motion snaps to the three discrete
 * states instead of animating between them.
 */
export function useScrollProgress<T extends HTMLElement>() {
  const ref = useRef<T | null>(null)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // Dev-only escape hatch: /?p=0.42 pins progress so the staging can be
    // inspected (and screenshotted) at any point without scrolling to it.
    if (import.meta.env.DEV) {
      const pinned = new URLSearchParams(window.location.search).get('p')
      if (pinned !== null) {
        setProgress(Math.min(1, Math.max(0, Number(pinned) || 0)))
        return
      }
    }

    let raf = 0
    let onScreen = false
    const reduced = prefersReduced()

    const compute = () => {
      const r = el.getBoundingClientRect()
      const travel = r.height - window.innerHeight
      // Before the element's top reaches the viewport top, progress is 0.
      // After its bottom passes the viewport bottom, progress is 1.
      const raw = travel > 0 ? -r.top / travel : 1 - r.bottom / window.innerHeight
      const p = Math.min(1, Math.max(0, raw))
      setProgress(reduced ? (p < 0.34 ? 0 : p < 0.67 ? 0.5 : 1) : p)
    }

    const tick = () => {
      compute()
      if (onScreen) raf = requestAnimationFrame(tick)
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting
        cancelAnimationFrame(raf)
        if (onScreen) raf = requestAnimationFrame(tick)
        else compute() // settle on a final value so it never freezes part-way
      },
      { threshold: 0 },
    )

    io.observe(el)
    window.addEventListener('scroll', compute, { passive: true })
    window.addEventListener('resize', compute)
    compute()

    return () => {
      io.disconnect()
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', compute)
      window.removeEventListener('resize', compute)
    }
  }, [])

  return { ref, progress }
}

/** Linear interpolate. */
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t

/** Map t from [inMin,inMax] to [0,1], clamped. The workhorse for staging. */
export const range = (t: number, inMin: number, inMax: number) =>
  Math.min(1, Math.max(0, (t - inMin) / (inMax - inMin)))

/** Smooth the ends of a 0→1 ramp so nothing starts or stops abruptly. */
export const ease = (t: number) => t * t * (3 - 2 * t)
