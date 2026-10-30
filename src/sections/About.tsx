import Todo from '../components/Todo'

/**
 * About — short, now.
 *
 * It used to be four paragraphs of biography followed by five tables, and
 * it was the first thing after the hall, which meant the site opened with
 * its own CV. The tables moved to Record at the foot of the page, where a
 * reader goes once they already care; this is the one claim the rest of the
 * page is evidence for, and nothing else.
 *
 * The heading is the line the baritone is singing at the top of the page.
 * That is not a decoration: the room was built around this phrase before
 * anyone wrote this section, and the phrase turns out to be the thesis.
 */
export default function About() {
  return (
    <section id="about" className="band">
      <div className="shell">
        <p className="eyebrow">About</p>
        <h2 className="h-hero">Ich bin ein<br />Fremdling überall</h2>

        <div className="prose">
          <p className="lede">
            <em>I am a stranger everywhere.</em> It is the line the baritone sings
            at the top of this page, and it is the reason the room is up there at
            all.
          </p>
          <p>
            Hakka at home, Mandarin because Mandarin was the useful one, a New
            Zealand childhood, now computer science and mathematics at Stanford.
            Four places, and the sense in that line about all of them.
          </p>
          <p>
            What I want to do about it is social impact at the intersection of
            technology, language and art — because that intersection is where
            people stop feeling like strangers in their own world. The projects
            below are that claim being tested rather than asserted: who a database
            is built to understand, who gets counted as an author, whose language a
            model answers in confidently and wrongly.
          </p>
        </div>

        <Todo>
          These three paragraphs are your own sentence from the brief, tightened,
          plus the facts around it. The middle one especially should be in your
          words — it is the only autobiography left on the page now, so it is
          carrying what four paragraphs used to. Also still open: how much of the
          queer framing you want stated here rather than left as subtext.
        </Todo>
      </div>
    </section>
  )
}
