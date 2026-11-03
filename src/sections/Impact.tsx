import Todo from '../components/Todo'
import WorkGrid from '../components/WorkGrid'
import { CHARITY, IMPACT } from '../data/portfolio'

/**
 * Impact — the charity engineering, the paper on Uyghur linguistic
 * marginalisation, the teaching in Chin State, the pharmacy.
 *
 * These were scattered across three headings before: an internship under
 * Roles, a paper under Projects, two entries in a Service list at the very
 * bottom. Nothing connected them except that they are the same motive.
 * Grouped, they are the argument the About section makes; apart, they were
 * four lines on four lists.
 */
export default function Impact() {
  return (
    <section id="impact" className="band">
      <div className="shell">
        <p className="eyebrow">Impact</p>
        <h2 className="h-hero">Built for someone<br />who needed it</h2>

        <p className="lede">
          A cancer support charity’s internal tooling, two quarters of
          introductory computer science, two research labs, a paper on who is
          pushed out of digital space and one on who a gene drive has to ask, six
          weeks of Python taught into Chin State, and four years behind a
          pharmacy counter. All of it has a named person on the other end.
        </p>

        <h3 className="h-rule">Cancer Society of New Zealand</h3>
        <p className="entry-meta">Software &amp; Data Engineer Intern, Wellington — Jun – Sep 2026</p>

        <figure className="photo">
          <div className="photo-slot">
            <p>Photograph</p>
            <p className="exhibit-note">public/photos/cancer-society.jpg</p>
          </div>
          <figcaption>Volunteering with the Cancer Society — photograph to come</figcaption>
        </figure>
        <Todo>
          Your photo. Drop it at <code>public/photos/cancer-society.jpg</code> (or
          .webp — any width from about 1200px up) and it replaces the frame above.
          A caption would help: where it was taken and what was happening. This is
          the only picture of you anywhere on the site, so it is doing a lot of
          work.
        </Todo>

        <WorkGrid items={CHARITY} />

        <p className="aside">
          Halfway through, I went out to the Society’s patient housing lodges —
          where people stay when treatment is in a city they don’t live in. It is
          difficult to think of a database as an abstraction after that.
        </p>
        <Todo>
          That paragraph is my reading of one line in your brief. Write it
          yourself — it is the most important sentence in this section and it
          should sound like you. Also useful here: how slow the old process
          actually was in human terms, and how many staff depend on each tool.
        </Todo>

        <h3 className="h-rule">Elsewhere</h3>
        <WorkGrid items={IMPACT} />
        <Todo>
          <b>Two labs, two titles, no descriptions.</b> SPOG and SoyaLab are both
          a name and nothing else, because a name is all I have and a lab is not
          something to invent a description for. For each: what it stands for,
          what the lab works on, and what your part in it is. And the question
          that matters most — is either of them the Stanford Speech and Cognitive
          Development Lab already listed under Record? If so, say which, and I
          will merge rather than list one person’s lab twice under two names.
        </Todo>
        <Todo>
          <b>The gene drive paper.</b> I have your argument but not the artefact:
          its real title, when you wrote it and what it was for, and whether
          there is a PDF or a passage you want readable. The card is currently
          titled by description rather than by name. While you are there, the
          Uyghur paper’s excerpt frame is still empty — one of those two filled
          is worth more than both described.
        </Todo>
        <Todo>
          Dates for Code4Myanmar — which six weeks, and which year.
        </Todo>
      </div>
    </section>
  )
}
