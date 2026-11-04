import Sheet from './Sheet'
import Todo from './Todo'

/**
 * About, behind a click.
 *
 * It used to be a full screen between the hall and the work: a heading, two
 * paragraphs, and eight hundred pixels of air around them. The two
 * paragraphs are the same two paragraphs — they are just no longer a
 * destination you scroll through to reach the thing you came for.
 *
 * The doorway is in the hall, under the name, and carries the quotation
 * and its translation so that a reader who never clicks has still been
 * told the one thing that matters. That is the trade this makes: the page
 * is a screen shorter and the biography is one click further away.
 */
export default function AboutSheet({ onClose }: { onClose: () => void }) {
  return (
    <Sheet onClose={onClose} label="About Ivan Ho">
      <p className="sheet-eyebrow">About</p>
      <h2 className="sheet-title">&ldquo;Ich bin ein Fremdling überall&rdquo;</h2>
      <p className="sheet-sub">Der Wanderer, D.489 — the line at the top of this page</p>

      <p className="sheet-lede">
        <em>I am a stranger everywhere.</em> My favourite line in any song.
        Schubert gives it to a baritone with nowhere to be from, and the room
        at the top of this page is built out of the bars that carry it: one
        phrase, read three ways.
      </p>
      <p>
        I want to make fewer people strangers in their own world — work where
        technology, language and art meet, and one question underneath all of
        it: who is this built to understand? A database that could not answer
        a question about a patient. Authorship that does not count the Global
        South. A model that answers in Hakka, my first language, confidently
        and wrongly.
      </p>

      <Todo>
        The second sentence of the first paragraph is mine, not yours: you
        asked for something about why this line is the centrepiece and that is
        my guess at it. Replace it — the real reason will be better than a
        plausible one. Still open too: how much of the queer framing you want
        stated here rather than left as subtext. And now that this is a sheet
        rather than a section, it has room for the longer story if you want
        one — the Hakka paragraph that was cut would sit well here.
      </Todo>
    </Sheet>
  )
}
