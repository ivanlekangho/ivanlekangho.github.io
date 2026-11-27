import Book from './Book'
import Pages from './Pages'
import Sheet from './Sheet'
import { PHONE, useMedia } from '../lib/media'
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
 * The PDF has not gone anywhere: the button under the book opens it in a
 * tab of its own, which covers everything the viewer was good at —
 * searching, printing, reading it on something a spread will not fit on —
 * and lets a reader save it from there if they want it.
 *
 * On a phone it is not a book. Everything the book is built on is a thing
 * a 375px screen does not have: room for two pages, a spine between them,
 * a pointer to turn the leaf with. What that screen does have is a thumb
 * already scrolling, so the document is a column of its pages and you
 * read it the way you read the rest of the site. See components/Pages.
 */
export default function DocSheet({
  doc, title, onClose,
}: { doc: Attachment; title: string; onClose: () => void }) {
  const phone = useMedia(PHONE)
  return (
    <Sheet onClose={onClose} label={`${title} — ${doc.label}`} wide>
      <p className="sheet-eyebrow">{title}</p>
      <h2 className="sheet-title">{doc.label}</h2>

      {doc.href && (phone
        ? <Pages href={doc.href} label={`${title} — ${doc.label}`} />
        : <Book href={doc.href} label={`${title} — ${doc.label}`} />)}

      {/* One button, and it opens the file rather than saving it: a reader
          who wants it on disk can save it from there, and a reader who only
          wanted to search or print it never has to put a file on their
          machine at all. Two links — "open" beside "download" — made them
          choose between the same thing twice. */}
      <p className="doc-get">
        <a href={doc.href} target="_blank" rel="noreferrer">Download</a>
      </p>
    </Sheet>
  )
}
