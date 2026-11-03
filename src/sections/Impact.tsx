import Todo from '../components/Todo'
import WorkGrid from '../components/WorkGrid'
import { GROUPS, byGroup } from '../data/portfolio'

/**
 * Impact — all of it, in three groups.
 *
 * Projects and Impact used to be two sections, which left the reader to
 * work out for themselves that a paper about who gets counted as an author
 * and a database that could not answer a question about a patient are the
 * same concern in different clothes. They are not separate subjects. They
 * are work, research and a side project, and the question underneath is
 * the same one in all three.
 *
 * So the question is the heading, the three groups are three kinds of
 * answer, and each group opens on its strongest item at twice the width.
 */
export default function Impact() {
  return (
    <section id="impact" className="band">
      <div className="shell">
        <p className="eyebrow">Impact</p>
        <h2 className="h-hero" data-reveal>Who is this<br />built to understand?</h2>

        <p className="lede" data-reveal>One question, in three registers.</p>

        <h3 className="h-rule">Cancer Society</h3>
        <figure className="photo">
          <div className="photo-slot">
            <p>Photograph</p>
            <p className="exhibit-note">public/photos/cancer-society.jpg</p>
          </div>
          <figcaption>Volunteering with the Cancer Society</figcaption>
        </figure>
        <p className="aside">
          Halfway through, I went out to the Society’s patient housing lodges —
          where people stay when treatment is in a city they don’t live in. It is
          difficult to think of a database as an abstraction after that.
        </p>
        <Todo>
          Your photo, at <code>public/photos/cancer-society.jpg</code> — the only
          picture of you anywhere on the site, so it is doing a lot of work. And
          that paragraph is my reading of one line in your brief: write it
          yourself, it is the most important sentence in this section.
        </Todo>

        {GROUPS.map((g) => (
          <div key={g.id} className="group" data-reveal>
            <h3 className="h-rule">{g.title}</h3>
            <p className="group-gloss">{g.gloss}</p>
            <WorkGrid items={byGroup(g.id)} />
          </div>
        ))}

        <Todo>
          <b>Two labs, two titles, no descriptions.</b> SPOG and SoyaLab are each
          a name and nothing else. For both: what it stands for, what the lab
          works on, what your part in it is — and is either of them the Stanford
          Speech and Cognitive Development Lab, so I can stop listing one lab
          twice under two names?
        </Todo>
        <Todo>
          <b>Nothing here can be opened yet.</b> Every attachment slot on these
          cards is declared and empty, which is why the paperclips only appear
          while you are running the site locally — a greyed-out “Paper” that
          opens nothing is worse for a reader than no mention of a paper. Fill
          them and they go live on their own: <code>public/papers/</code> for the
          three papers, a repo URL for Flutterer, the Uyghur excerpt as text
          rather than a PDF. Code4Myanmar still needs its dates.
        </Todo>
      </div>
    </section>
  )
}
