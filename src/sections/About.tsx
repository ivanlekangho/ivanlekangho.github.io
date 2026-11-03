import Todo from '../components/Todo'

/**
 * About — two paragraphs.
 *
 * It was four paragraphs of biography followed by five tables, and it was
 * the first thing after the hall, which meant the site opened with its own
 * CV. The tables are in Record at the foot of the page now, and the
 * biography is gone: this is the one claim the rest of the page is evidence
 * for, and nothing else.
 *
 * The heading is in quotation marks because it is a quotation — the line
 * the baritone is singing at the top of the page. Unmarked it read as a
 * statement the site was making in German for no reason.
 *
 * The second paragraph does the job the biography used to: "my first
 * language" is four words and it is the whole personal stake, where the
 * paragraph it replaces took forty to say the same thing less sharply.
 */
export default function About() {
  return (
    <section id="about" className="band">
      <div className="shell">
        <p className="eyebrow">About</p>
        <h2 className="h-hero">&ldquo;Ich bin ein<br />Fremdling überall&rdquo;</h2>

        <div className="prose">
          <p className="lede">
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
        </div>

        <Todo>
          The second sentence of the first paragraph is mine, not yours: you
          asked for something about why this line is the centrepiece and that is
          my guess at it. Replace it — the real reason will be better than a
          plausible one. Still open too: how much of the queer framing you want
          stated here rather than left as subtext.
        </Todo>
      </div>
    </section>
  )
}
