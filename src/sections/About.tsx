import Chapters, { type Chapter } from '../components/Chapters'
import Wanderer from '../components/score/Wanderer'
import Todo from '../components/Todo'

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
  const chapters: Chapter[] = [
    {
      id: 'the-line',
      label: 'The line',
      body: (
        <>
          <p className="eyebrow" data-reveal>The line</p>
          <div className="about-text" data-reveal>
            <p className="about-lede">
              <em>I am a stranger everywhere.</em> My favourite line in any
              song. Schubert gives it to a baritone with nowhere to be from,
              and these are the bars that carry it.
            </p>
          </div>
          <Wanderer />
        </>
      ),
    },
    {
      id: 'the-work',
      label: 'The work',
      body: (
        <>
          <p className="eyebrow" data-reveal>The work</p>
          <h2 className="chapter-head" data-reveal>
            Who is this built to understand?
          </h2>
          <div className="about-text" data-reveal>
            <p>
              I want to make fewer people strangers in their own world — work
              where technology, language and art meet, and one question
              underneath all of it. A database that could not answer a question
              about a patient. Authorship that does not count the Global South.
              A model that answers in Hakka, my first language, confidently and
              wrongly.
            </p>
          </div>
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
    >
      <Todo>
        The second sentence of the first paragraph is mine, not yours: you asked
        for something about why this line is the centrepiece and that is my
        guess at it. Replace it — the real reason will be better than a
        plausible one. Still open too: how much of the queer framing you want
        stated here rather than left as subtext. And this is two screens now
        rather than a sheet, so there is room for the longer story if you want
        one — the Hakka paragraph that was cut would sit here.
      </Todo>
    </Chapters>
  )
}
