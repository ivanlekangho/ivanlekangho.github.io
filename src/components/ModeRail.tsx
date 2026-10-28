import { useCallback, useRef } from 'react'
import { useMode } from '../lib/mode'
import { MODES, STOP_AT } from '../lib/palette'

/**
 * The dimmer, down the left edge.
 *
 * It sits where a scrollbar would, because that is what it is: the thing
 * that moves you through the room. Three stops you can click, drag between,
 * or reach with the wheel, and releasing always lands on a stop — leaving
 * the house half-lit is a state nobody chose.
 *
 * The same markup serves the vertical rail on a desktop and the horizontal
 * one a phone gets; the pointer maths reads whichever axis the track is
 * longer in rather than being told twice.
 *
 *   musician   score as written, house lights down
 *   linguist   Mandarin tone and harmony, lights to half
 *   engineer   a chord, taken apart; full cold wash
 */
export default function ModeRail() {
  const { pos, mode, setPos, goTo } = useMode()
  const track = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)

  const fractionAt = (e: { clientX: number; clientY: number }) => {
    const r = track.current?.getBoundingClientRect()
    if (!r) return pos
    const vertical = r.height >= r.width
    const span = vertical ? r.height : r.width
    if (span === 0) return pos
    const along = vertical ? e.clientY - r.top : e.clientX - r.left
    return Math.min(1, Math.max(0, along / span))
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
    setPos(fractionAt(e))
  }
  const onMove = (e: React.PointerEvent) => { if (dragging.current) setPos(fractionAt(e)) }
  const onUp = (e: React.PointerEvent) => {
    if (!dragging.current) return
    dragging.current = false
    snap(fractionAt(e))
  }

  const onKey = (e: React.KeyboardEvent) => {
    const i = MODES.indexOf(mode)
    /* Down and right both mean "further along", the way scrolling does. */
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { goTo(MODES[Math.min(2, i + 1)]); e.preventDefault() }
    if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { goTo(MODES[Math.max(0, i - 1)]); e.preventDefault() }
    if (e.key === 'Home') { goTo(MODES[0]); e.preventDefault() }
    if (e.key === 'End') { goTo(MODES[2]); e.preventDefault() }
  }

  return (
    <div className="rail">
      <div className="rail-stops">
        {MODES.map((m, i) => (
          <button
            key={m}
            type="button"
            className={m === mode ? 'rail-stop is-on' : 'rail-stop'}
            style={{ '--at': `${STOP_AT[i] * 100}%` } as React.CSSProperties}
            aria-pressed={m === mode}
            onClick={() => goTo(m)}
          >
            <span className="rail-stop-num">{`0${i + 1}`}</span>{m}
          </button>
        ))}
      </div>

      <div
        ref={track}
        className="rail-track"
        role="slider"
        tabIndex={0}
        aria-label="Reading: musician, linguist, or engineer"
        aria-orientation="vertical"
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
        <span className="rail-fill" style={{ '--at': `${pos * 100}%` } as React.CSSProperties} aria-hidden="true" />
        {STOP_AT.map((at, i) => (
          <span key={MODES[i]} className="rail-tick"
            style={{ '--at': `${at * 100}%` } as React.CSSProperties} aria-hidden="true" />
        ))}
        <span className="rail-knob" style={{ '--at': `${pos * 100}%` } as React.CSSProperties} aria-hidden="true" />
      </div>
    </div>
  )
}
