import Chapters, { type Chapter } from '../components/Chapters'
import Wanderer from '../components/score/Wanderer'

/**
 * About — a screen of its own.
 *
 * It has now been three things. A full section in a scrolling page, which
 * was a heading, two paragraphs and eight hundred pixels of air. Then a
 * sheet behind a click, which fixed the air by hiding the biography one
 * layer down. Now a panel in the deck, which is the first arrangement that
 * costs nothing: in a page read sideways a panel is not a wall across the
 * middle of anything — it is one swipe, and the reader who does not want it
 * passes it in the same gesture they were making anyway.
 *
 * The quotation is the page. It is set in the score's own face rather than
 * the page's, because it is a line of Schubert and because the room at the
 * far right is built out of the bar that carries it; the two should look
 * like the same thing said twice. Everything else here is deliberately one
 * column and short — the point of the panel is that the line gets to be
 * large, not that there is more to read.
 */
export default function About() {
  /* One chapter, not two.
  
     The line and the mission were a chapter each, and split that way the
     first was a quotation with no argument under it and the second an
     argument with no reason to be on this page. Joined, the paragraph does
     what it was always trying to do: the song says the thing, and the next
     sentence says what he intends to do about it. "Who is this built to
     understand?" is gone with the split — it was a heading introducing the
     sentence directly beneath it. */
  const chapters: Chapter[] = [
    {
      id: 'my-mission',
      label: 'My mission',
      body: (
        <>
          <p className="eyebrow" data-reveal>My mission</p>
          <div className="about-text" data-reveal>
            <p className="about-lede">
              <em>&ldquo;I am a stranger everywhere.&rdquo;</em>
            </p>
            <p>
              This is my favourite lyric in any song I have performed. Schubert
              wrote it for a man searching for a homeland where happiness and
              security might be found. As a queer person of colour making a
              life in a new country, I recognise myself in him. I want to make
              fewer people strangers in their own world. I am drawn to the
              intersection of technology, art and society, three worlds that
              can seem so disconnected.
            </p>
          </div>
          <Wanderer />
        </>
      ),
    },
  ]

  return (
    <Chapters
      /* Fremdling is the word the line turns on — the stranger, not the
         everywhere — so that is the one in red. */
      title={<>&ldquo;Ich bin ein<br /><em>Fremdling</em> überall&rdquo;</>}
      subtitle={<>&mdash; Schubert, <cite>Der Wanderer</cite>, D.489</>}
      chapters={chapters}
    />
  )
}
