import { useEffect, useRef, useState } from 'react'
import { BOOKS, pageSrc } from '../data/books'

/**
 * The same document on a phone, where a book is the wrong object.
 *
 * The book opposite this file is built on a spread: two pages side by
 * side, a leaf that turns about the spine, a tap to go forward. On a
 * 375px screen none of that survives. The spread collapses to one page,
 * the fold has nothing to fold against, and paging through twenty-six
 * pages of a score becomes twenty-six deliberate taps on a 2.2rem arrow —
 * when the one gesture the reader's thumb is already making, and has been
 * making all the way down the page, is a scroll.
 *
 * So on a phone the document is simply its pages, in a column, and you
 * read it the way you read everything else on a phone. No controls at
 * all: the only thing left to say is where you are, and that is a number.
 *
 * Every page is in the document from the start — the scroll position has
 * to mean something, and a column that grows as you reach the bottom of
 * it is a column you cannot get to the end of. What is deferred is the
 * bytes: each box is reserved from the ratio in the manifest, so the
 * column is its full height on the first frame and the images drop into
 * boxes that are already the right shape. Without the declared size this
 * fails completely rather than badly, which it has done on this site
 * before: a lazy image with no box is 2px tall, 2px is never near the
 * viewport, and the fetch never fires.
 */

/** How many to fetch up front. Two, so the second is there before the
 *  first scroll rather than after it. */
const EAGER = 2

export default function Pages({ href, label }: { href: string; label: string }) {
  const book = BOOKS[href]
  const [at, setAt] = useState(1)
  const column = useRef<HTMLDivElement>(null)

  /* Which page is at the middle of the screen. The observer's root is the
     viewport and not the sheet, which is allowed here and is the simpler
     of the two: the sheet is `position: fixed`, so a page scrolling inside
     it moves against the viewport exactly as it moves against the sheet.
     The margins leave a band a few percent tall across the middle, so the
     page being counted is the one under the reader's eye rather than the
     one that has just appeared at the bottom. */
  useEffect(() => {
    const el = column.current
    if (!el || !book) return
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setAt(Number((e.target as HTMLElement).dataset.page))
        }
      },
      { rootMargin: '-48% 0px -48% 0px' },
    )
    el.querySelectorAll('.doc-page').forEach((p) => io.observe(p))
    return () => io.disconnect()
  }, [book])

  /* Same as the book's: a document added without running the renderer has
     no pages to show, and an empty column would look like a failure to
     load rather than a step that was missed. */
  if (!book) {
    return (
      <p className="book-bare">
        This document has no page images yet. Run <code>npm run book-pages</code>.
      </p>
    )
  }

  const ratio = `${book.w} / ${book.h}`

  return (
    <div className="doc-pages" ref={column}>
      {Array.from({ length: book.pages }, (_, i) => i + 1).map((n) => (
        <div key={n} className="doc-page" data-page={n} style={{ aspectRatio: ratio }}>
          <img
            src={pageSrc(book.slug, n)}
            alt={n === 1 ? `${label}, cover` : `Page ${n}`}
            loading={n <= EAGER ? 'eager' : 'lazy'}
            decoding="async"
          />
        </div>
      ))}

      {/* Sticky to the foot of the scrollport, so it is in view the whole
          way down and in the way of nothing. It is the book's folio with
          the controls taken off it, which is all a folio ever was. */}
      <p className="doc-at" aria-hidden="true">{at} / {book.pages}</p>
    </div>
  )
}
