import { useEffect, useRef, type ReactNode } from 'react'

/**
 * An overlay, and the five things every overlay on this site has to get
 * right: escape closes it, the scrim closes it, focus moves into it and
 * comes back out to whatever opened it, the room stops owning the wheel
 * while it is up, and the page behind it does not scroll.
 *
 * Extracted from PieceSheet, which was the only overlay here until the work
 * grid needed one per card. The behaviour is shared; only the skin is not.
 *
 * Two skins. `paper` is foxed parchment and belongs to the score, because
 * that is what a score is printed on. `panel` follows the lighting board
 * like the rest of the page, and is for everything that is not a score — a
 * paper on authorship inequality laid out on simulated parchment would be a
 * costume, not a design.
 */
export default function Sheet({
  onClose, label, tone = 'panel', children,
}: {
  onClose: () => void
  label: string
  tone?: 'paper' | 'panel'
  children: ReactNode
}) {
  const box = useRef<HTMLDivElement>(null)
  const restore = useRef<Element | null>(null)

  useEffect(() => {
    restore.current = document.activeElement
    box.current?.focus()
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    /* The room normally owns the wheel; while a sheet is up it does not. */
    document.documentElement.setAttribute('data-sheet', '')
    return () => {
      document.removeEventListener('keydown', onKey)
      document.documentElement.removeAttribute('data-sheet')
      ;(restore.current as HTMLElement | null)?.focus?.()
    }
  }, [onClose])

  return (
    <div className="sheet-layer">
      <div className="sheet-scrim" onClick={onClose} aria-hidden="true" />
      <div className={tone === 'paper' ? 'sheet sheet-paper' : 'sheet sheet-panel'}
        role="dialog" aria-modal="true" aria-label={label}
        ref={box} tabIndex={-1} data-keeps-scroll>
        <button type="button" className="sheet-close" onClick={onClose} aria-label="Close">
          <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true">
            <path d="M6 6 L18 18 M18 6 L6 18" fill="none" stroke="currentColor"
              strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
        <div className="sheet-body">{children}</div>
      </div>
    </div>
  )
}
