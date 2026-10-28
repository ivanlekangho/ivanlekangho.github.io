import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { MODES, STOP_AT, modeAt, paletteAt, type Mode } from './palette'

export type { Mode }

const KEY = 'ivan-site-mode'
const REDUCED = () =>
  typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches

type Ctx = {
  /** Continuous rail position, 0 (musician) → 0.5 (linguist) → 1 (engineer). */
  pos: number
  /** Nearest named stop. What the copy and the nav weighting key off. */
  mode: Mode
  /** Scrub, for the drag handle. No easing — the pointer is the easing. */
  setPos: (p: number) => void
  /** Travel to a stop, bringing the lights up over the way. */
  goTo: (m: Mode) => void
}

const ModeCtx = createContext<Ctx>({ pos: 0, mode: 'musician', setPos: () => {}, goTo: () => {} })

/** Everything that reads as light is written straight onto <html>, so the
 *  hall, the panels, the instrument and the score are lit by one source. */
function paint(p: number) {
  const el = document.documentElement
  const vars = paletteAt(p)
  for (const k in vars) el.style.setProperty(k, vars[k])
  el.dataset.mode = modeAt(p)
}

export function ModeProvider({ children }: { children: React.ReactNode }) {
  const [pos, setPosState] = useState<number>(() => {
    const saved = localStorage.getItem(KEY)
    const i = MODES.indexOf(saved as Mode)
    return i >= 0 ? STOP_AT[i] : 0
  })

  const raf = useRef(0)
  /* goTo reads the live position without re-creating itself every frame. */
  const posRef = useRef(pos)
  posRef.current = pos

  /* Painted before the browser gets a chance to show the frame, or someone
     who left in engineer mode sees a flash of the dark hall on load. */
  useLayoutEffect(() => { paint(pos) }, [pos])

  useEffect(() => {
    localStorage.setItem(KEY, modeAt(pos))
  }, [pos])

  useEffect(() => () => cancelAnimationFrame(raf.current), [])

  const setPos = useCallback((p: number) => {
    cancelAnimationFrame(raf.current)
    setPosState(Math.min(1, Math.max(0, p)))
  }, [])

  const goTo = useCallback((m: Mode) => {
    const to = STOP_AT[MODES.indexOf(m)]
    cancelAnimationFrame(raf.current)
    if (REDUCED()) { setPosState(to); return }

    /* Long enough to read as a lighting cue rather than a UI state change,
       short enough that walking the rail does not feel like waiting for it.
       A board operator crossfades in about a second; this is the quick
       version of that gesture. */
    const from = posRef.current
    const t0 = performance.now()
    const D = 520
    const step = (now: number) => {
      const k = Math.min(1, (now - t0) / D)
      /* ease-in-out: lights don't snap on, and they don't snap off */
      const e = k < 0.5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2
      setPosState(from + (to - from) * e)
      if (k < 1) raf.current = requestAnimationFrame(step)
    }
    raf.current = requestAnimationFrame(step)
  }, [])

  return (
    <ModeCtx.Provider value={{ pos, mode: modeAt(pos), setPos, goTo }}>
      {children}
    </ModeCtx.Provider>
  )
}

export const useMode = () => useContext(ModeCtx)
