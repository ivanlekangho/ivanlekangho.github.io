import { useEffect, useState } from 'react'
import { BOOKS, pageSrc } from '../data/books'

/**
 * A score, as the printed thing.
 *
 * It opens closed: the title page alone, centred, with the weight of paper
 * under it. Click it and the cover turns — a real rotation about its left
 * edge, in perspective — and the document opens into a spread, two pages
 * side by side, which is how anybody who has read music has ever read it.
 *
 * Why pre-rendered images and not the browser's PDF viewer, which this
 * replaces: the viewer is a grey application pasted into a page of paper
 * and one red, it cannot be made to look like a book, and it will not
 * animate. The images come from tools/book-pages.mjs at build time, so the
 * first spread is on screen in one frame rather than after a parse — which
 * matters when the act of opening is the animation.
 *
 * The turn is one transform on one element, which is the only way it reads
 * as paper. Anything built out of two halves and a crossfade looks like
 * two halves and a crossfade.
 *
 * `--leaf` carries the rotation so the backing spread can react to it:
 * there is no point painting the left page until the cover has passed the
 * halfway mark, because until then the cover is in front of it.
 */

type Turn = 'shut' | 'turning' | 'open'

export default function Book({ href, label }: { href: string; label: string }) {
  const book = BOOKS[href]
  const [turn, setTurn] = useState<Turn>('shut')
  /** The left page of the spread on view. Page 2 faces page 3, and so on. */
  const [left, setLeft] = useState(2)

  /* Arrow keys page through, because a document open on screen with no
     keyboard is a document somebody cannot read. */
  useEffect(() => {
    if (turn !== 'open' || !book) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); setLeft((n) => Math.min(book.pages - 1, n + 2)) }
      if (e.key === 'ArrowLeft') { e.preventDefault(); setLeft((n) => Math.max(2, n - 2)) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [turn, book])

  /* No page images for this one — it was added without running the
     renderer. Say so rather than showing an empty book. */
  if (!book) {
    return (
      <p className="book-bare">
        This document has no page images yet — run <code>npm run book-pages</code>.{' '}
        <a href={href} target="_blank" rel="noreferrer">Open the PDF</a>.
      </p>
    )
  }

  const open = () => {
    if (turn !== 'shut') return
    setTurn('turning')
    /* The state follows the transition rather than a timer where it can,
       but a transition that never starts — reduced motion, a browser that
       declines — would leave the cover shut for ever, so there is a floor
       under it either way. */
    window.setTimeout(() => setTurn('open'), 760)
  }

  const last = book.pages % 2 === 0 ? book.pages : book.pages - 1
  const atStart = left <= 2
  const atEnd = left >= last

  if (turn !== 'open') {
    return (
      <div className={turn === 'turning' ? 'book is-turning' : 'book'}>
        <button type="button" className="book-cover" onClick={open}
          aria-label={`Open ${label} — ${book.pages} pages`}>
          <span className="book-leaf">
            <img src={pageSrc(book.slug, 1)} alt={`${label}, title page`} />
          </span>
          <span className="book-hint">{book.pages} pages — click to open</span>
        </button>
      </div>
    )
  }

  return (
    <div className="book is-open">
      <div className="book-spread" role="group" aria-label={`${label}, pages ${left} and ${left + 1}`}>
        <img className="book-page" src={pageSrc(book.slug, left)} alt={`Page ${left}`} />
        {left + 1 <= book.pages ? (
          <img className="book-page" src={pageSrc(book.slug, left + 1)} alt={`Page ${left + 1}`} />
        ) : (
          <span className="book-page is-blank" aria-hidden="true" />
        )}
      </div>

      <div className="book-controls">
        <button type="button" onClick={() => setLeft((n) => Math.max(2, n - 2))} disabled={atStart}>
          Previous
        </button>
        <p className="book-folio">
          {left}–{Math.min(left + 1, book.pages)} of {book.pages}
        </p>
        <button type="button" onClick={() => setLeft((n) => Math.min(last, n + 2))} disabled={atEnd}>
          Next
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
