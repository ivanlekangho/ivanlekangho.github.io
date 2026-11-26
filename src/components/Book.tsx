import { useEffect, useRef, useState } from 'react'
import { BOOKS, pageSrc } from '../data/books'

/**
 * A score, as the printed thing.
 *
 * It opens closed: the cover alone, centred, with the weight of paper under
 * it. Click, and the cover folds — and it is a real fold, not a card
 * dissolving. The leaf is two-faced: page 1 on the front, page 2 on the
 * back, `backface-visibility` deciding which you see. It turns about the
 * spine through 180° and lands as the left-hand page of the spread, which
 * is what a front cover actually does. At the same time the whole stage
 * slides half a page left, because the spine of a shut book is at the
 * cover's edge and the spine of an open one is in the middle of the view —
 * without that shift the cover appears to lurch sideways as it turns.
 *
 * The end of the fold and the static spread are the same picture: leaf back
 * (page 2) on the left, page 3 on the right. So the swap from animation to
 * state at the end of the turn has nothing to show for itself, which is the
 * point.
 *
 * Going back from the first spread closes the book again, through the same
 * fold reversed. A reader who opened it can shut it.
 *
 * Why pre-rendered images and not the browser's PDF viewer, which this
 * replaces: the viewer is a grey application pasted into a page of paper
 * and one red, it cannot be made to look like a book, and it will not
 * animate. The images come from tools/book-pages.mjs, so the first spread
 * is on screen in one frame rather than after a parse — which matters when
 * the act of opening is the animation.
 */

type Turn = 'shut' | 'opening' | 'open' | 'closing'

/** Matches --leaf-turn in the stylesheet. */
const TURN_MS = 900

export default function Book({ href, label }: { href: string; label: string }) {
  const book = BOOKS[href]
  const [turn, setTurn] = useState<Turn>('shut')
  /** The left page of the spread on view. Page 2 faces page 3, and so on. */
  const [left, setLeft] = useState(2)
  const timer = useRef(0)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const last = book ? (book.pages % 2 === 0 ? book.pages : book.pages - 1) : 2
  const moving = turn === 'opening' || turn === 'closing'

  const open = () => {
    if (turn !== 'shut') return
    setLeft(2)
    setTurn('opening')
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setTurn('open'), TURN_MS)
  }

  const shut = () => {
    if (turn !== 'open') return
    setTurn('closing')
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setTurn('shut'), TURN_MS)
  }

  /* Back from the first spread is not "nothing to do", it is closing the
     book — which is what the object in front of you would do. */
  const back = () => {
    if (moving) return
    if (left <= 2) shut()
    else setLeft((n) => Math.max(2, n - 2))
  }
  const forward = () => {
    if (moving) return
    if (turn === 'shut') open()
    else setLeft((n) => Math.min(last, n + 2))
  }

  /* Arrow keys page through, because a document open on screen with no
     keyboard is a document somebody cannot read. */
  useEffect(() => {
    if (!book) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); forward() }
      if (e.key === 'ArrowLeft') { e.preventDefault(); back() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  /* No page images for this one — it was added without running the
     renderer. Say so rather than showing an empty book. */
  if (!book) {
    return (
      <p className="book-bare">
        This document has no page images yet — run <code>npm run book-pages</code>.
      </p>
    )
  }

  const rightPage = Math.min(left + 1, book.pages)
  const showLeaf = turn !== 'open'

  return (
    <div className={`book is-${turn}`}>
      <div className="book-stage">
        {/* The spread underneath. While the book is shut the left half has
            nothing to show — the cover has not turned yet — so it is held
            back rather than peeping out beside the cover. */}
        <span className="book-half">
          <img src={pageSrc(book.slug, left)} alt={`Page ${left}`} />
        </span>
        <span className="book-half">
          {rightPage > left ? (
            <img src={pageSrc(book.slug, rightPage)} alt={`Page ${rightPage}`} />
          ) : null}
        </span>

        {showLeaf && (
          <span className="book-leaf" aria-hidden={turn !== 'shut'}>
            <span className="leaf-face leaf-front">
              <img src={pageSrc(book.slug, 1)} alt={`${label}, cover`} />
            </span>
            <span className="leaf-face leaf-back">
              <img src={pageSrc(book.slug, 2)} alt="" />
            </span>
          </span>
        )}

        {/* Shut, the whole cover is the control. */}
        {turn === 'shut' && (
          <button type="button" className="book-open" onClick={open}
            aria-label={`Open ${label}`} />
        )}
      </div>

      <div className="book-nav">
        <button type="button" className="book-arrow" onClick={back}
          disabled={moving || turn === 'shut'} aria-label="Previous page">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 4 7 12l8 8"
            fill="none" stroke="currentColor" strokeWidth="1.8"
            strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>

        <p className="book-folio">
          {turn === 'open' ? `${left}–${rightPage} of ${book.pages}` : `${book.pages} pages`}
        </p>

        <button type="button" className="book-arrow" onClick={forward}
          disabled={moving || (turn === 'open' && left >= last)} aria-label="Next page">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 4l8 8-8 8"
            fill="none" stroke="currentColor" strokeWidth="1.8"
            strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
      </div>

      {/* Preloaded so a turn is instant rather than a flash of nothing. */}
      <div className="book-preload" aria-hidden="true">
        {[left + 2, left + 3].filter((n) => n <= book.pages).map((n) => (
          <img key={n} src={pageSrc(book.slug, n)} alt="" />
        ))}
      </div>
    </div>
  )
}
