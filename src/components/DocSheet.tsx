import Book from './Book'
import Sheet from './Sheet'
import type { Attachment } from '../data/portfolio'

/**
 * A score, opened where you are standing.
 *
 * These used to be links that threw you into a new tab, which on a page
 * built around listening is the one thing a reader should not have to do:
 * the recording is playing, and leaving the page to look at the music
 * either stops it or buries it behind a tab. So the score comes to the
 * page instead, over the top of it, and closing it puts you back exactly
 * where you were with the sound still running.
 *
 * What is in it is a book, not a PDF frame. The browser's viewer brings
 * paging, zoom, search and print for free and was what this used first,
 * and it was wrong for one reason that outweighed all of them: it is a
 * grey application pasted into a page made of paper and one red, and it
 * cannot be made to look like the thing it is showing. A score is a
 * printed object and now it opens like one.
 *
 * The PDF has not gone anywhere. The line under the book offers it, which
 * covers everything the viewer was good at — searching it, printing it,
 * reading it on a device where a two-page spread is too small — and covers
 * the case where the page images have not been rendered.
 */
export default function DocSheet({
  doc, title, onClose,
}: { doc: Attachment; title: string; onClose: () => void }) {
  return (
    <Sheet onClose={onClose} label={`${title} — ${doc.label}`} wide>
      <p className="sheet-eyebrow">{title}</p>
      <h2 className="sheet-title">{doc.label}</h2>

      {doc.href && <Book href={doc.href} label={`${title} — ${doc.label}`} />}

      <p className="doc-escape">
        <a href={doc.href} target="_blank" rel="noreferrer">Open the PDF</a>
        {' · '}
        <a href={doc.href} download>download it</a> — for searching, printing,
        or reading on something a spread will not fit on.
      </p>
    </Sheet>
  )
}
