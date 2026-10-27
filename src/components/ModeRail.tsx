import { useCallback, useRef } from 'react'
import { useMode } from '../lib/mode'
import { MODES, STOP_AT, type Mode } from '../lib/palette'

/**
 * The dimmer.
 *
 * This is the most important control on the site, so it is a rail rather
 * than a button: three stops you can click, or drag between to scrub the
 * lights and both scores continuously. Releasing always lands on a stop —
 * leaving the house half-lit is a state nobody chose.
 *
 *   musician   score as written, house lights down
 *   linguist   Mandarin tone and harmony, lights to half
 *   engineer   code and physics, full cold wash
 */

const BLURB: Record<Mode, string> = {
  musician: 'As written',
  linguist: 'As tone, as harmony',
  engineer: 'As data, as moving air',
}

export default function ModeRail() {
  const { pos, mode, setPos, goTo } = useMode()
  const track = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)

  const fractionAt = (clientX: number) => {
    const r = track.current?.getBoundingClientRect()
    if (!r || r.width === 0) return pos
    return Math.min(1, Math.max(0, (clientX - r.left) / r.width))
  }

  const snap = useCallback((p: number) => {
    let best = 0
    for (let i = 1; i < STOP_AT.length; i++) {
      if (Math.abs(STOP_AT[i] - p) < Math.abs(STOP_AT[best] - p)) best = i
    }
    goTo(MODES[best])
  }, [goTo])

  const onDown = (e: React.PointerEvent) => {
    dragging.current = true
    e.currentTarget.setPointerCapture(e.pointerId)
    setPos(fractionAt(e.clientX))
  }
  const onMove = (e: React.PointerEvent) => {
    if (dragging.current) setPos(fractionAt(e.clientX))
  }
  const onUp = (e: React.PointerEvent) => {
    if (!dragging.current) return
    dragging.current = false
    snap(fractionAt(e.clientX))
  }

  const onKey = (e: React.KeyboardEvent) => {
    const i = MODES.indexOf(mode)
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { goTo(MODES[Math.min(2, i + 1)]); e.preventDefault() }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { goTo(MODES[Math.max(0, i - 1)]); e.preventDefault() }
    if (e.key === 'Home') { goTo(MODES[0]); e.preventDefault() }
    if (e.key === 'End') { goTo(MODES[2]); e.preventDefault() }
  }

  return (
    <div className="rail">
      <p className="rail-blurb">{BLURB[mode]}</p>

      <div
        ref={track}
        className="rail-track"
        role="slider"
        tabIndex={0}
        aria-label="Reading: musician, linguist, or engineer"
        aria-valuemin={0}
        aria-valuemax={2}
        aria-valuenow={MODES.indexOf(mode)}
        aria-valuetext={mode}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onKeyDown={onKey}
      >
        <span className="rail-line" aria-hidden="true" />
        <span className="rail-fill" style={{ width: `${pos * 100}%` }} aria-hidden="true" />
        {STOP_AT.map((at, i) => (
          <span key={MODES[i]} className="rail-tick" style={{ left: `${at * 100}%` }} aria-hidden="true" />
        ))}
        <span className="rail-knob" style={{ left: `${pos * 100}%` }} aria-hidden="true" />
      </div>

      <div className="rail-stops">
        {MODES.map((m, i) => (
          <button
            key={m}
            type="button"
            className={m === mode ? 'rail-stop is-on' : 'rail-stop'}
            style={{ left: `${STOP_AT[i] * 100}%` }}
            aria-pressed={m === mode}
            onClick={() => goTo(m)}
          >
            {m}
          </button>
        ))}
      </div>
    </div>
  )
}
