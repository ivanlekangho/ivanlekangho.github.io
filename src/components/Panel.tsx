import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

/**
 * A section, as a lit sheet floating over the stage.
 *
 * Nothing on this site scrolls the page — the hall stays where it is and
 * the content arrives on top of it. Each panel is its own route, so deep
 * links and the back button both work, and closing one is just going back
 * to the room.
 */
export default function Panel({
  title, index, children, wide = false,
}: {
  /** Names the sheet for assistive tech and labels its header. The section
   *  inside keeps its own heading — the header here stays a small label so
   *  the two don't say the same thing twice. */
  title: string
  /** Its place in the index — the same number the navigation shows. */
  index?: string
  children: React.ReactNode
  wide?: boolean
}) {
  const navigate = useNavigate()
  const box = useRef<HTMLDivElement>(null)
  const restoreTo = useRef<Element | null>(null)

  const close = () => navigate('/')

  useEffect(() => {
    restoreTo.current = document.activeElement
    box.current?.focus()
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }
    document.addEventListener('keydown', onKey)
    /* the hall must not scroll underneath the sheet */
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
      /* give focus back to whatever opened this, not to the top of the room */
      ;(restoreTo.current as HTMLElement | null)?.focus?.()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title])

  return (
    <div className="panel-layer">
      {/* clicking the hall closes the sheet; it is not a control, so it is
          hidden from the accessibility tree and Escape does the same job */}
      <div className="panel-scrim" onClick={close} aria-hidden="true" />
      <div
        ref={box}
        className={wide ? 'panel panel-wide' : 'panel'}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
      >
        <header className="panel-head">
          <p className="panel-eyebrow">
            {index && <span className="panel-num">{index}</span>}{title}
          </p>
          <button type="button" className="panel-close" onClick={close} aria-label="Close">
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <path d="M6 6 L18 18 M18 6 L6 18" fill="none" stroke="currentColor"
                strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </header>
        <div className="panel-body">{children}</div>
      </div>
    </div>
  )
}
