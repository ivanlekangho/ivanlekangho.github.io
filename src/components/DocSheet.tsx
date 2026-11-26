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
 * The frame is the browser's own PDF viewer. That is a deliberate choice
 * over rendering the pages here: it brings paging, zoom, text selection,
 * search, print and the reader's own accessibility settings, none of which
 * would be worth writing again and all of which somebody will want on
 * eight pages of a choral score.
 *
 * Where it cannot do that — an inline PDF frame is unreliable on iOS, and
 * some browsers and extensions refuse it outright — the escape line below
 * is the whole answer, so it is always present rather than conditional on
 * detecting a failure that cannot be detected from in here.
 */
export default function DocSheet({
  doc, title, onClose,
}: { doc: Attachment; title: string; onClose: () => void }) {
  return (
    <Sheet onClose={onClose} label={`${title} — ${doc.label}`} wide>
      <p className="sheet-eyebrow">{title}</p>
      <h2 className="sheet-title">{doc.label}</h2>

      <iframe
        className="doc-frame"
        src={doc.href}
        title={`${title} — ${doc.label}`}
        loading="lazy"
      />

      <p className="doc-escape">
        Not showing?{' '}
        <a href={doc.href} target="_blank" rel="noreferrer">Open it in a new tab</a>
        {' · '}
        <a href={doc.href} download>download the PDF</a>.
      </p>
    </Sheet>
  )
}
