import Todo from '../components/Todo'
import WorkGrid from '../components/WorkGrid'
import { MUSIC } from '../data/portfolio'

/**
 * Music.
 *
 * The room at the top of the page is one phrase in close-up; this is the
 * rest of it. Ordered by what someone hiring or auditioning would want
 * first — what he is doing now, then voice, then the instruments, then the
 * two things he made himself — not chronologically, and not by prize count.
 */
export default function Music() {
  return (
    <section id="music" className="band">
      <div className="shell">
        <p className="eyebrow">Music</p>
        <h2 className="h-hero">Fifteen languages,<br />two of them mine</h2>

        <p className="lede">
          Classical baritone, saxophonist, violinist, and usually the one running
          the rehearsal. The room at the top of this page is one phrase of Schubert
          in close-up; this is where the rest of it comes from.
        </p>

        <WorkGrid items={MUSIC} />

        <p className="aside">
          Fifteen languages sung against two spoken — German, Latin, French, Māori,
          Samoan, Tongan and the rest learned phonetically in IPA until a native
          speaker stopped wincing. It is where the precision about sounds I do not
          own comes from.
        </p>

        <Todo>
          Two things that would turn lines on a list into evidence. A recording or
          a score page for <em>Abendlied</em> — thirty seconds of audio is worth the
          whole card. And the saxophone project itself, if you can share it: a PDF
          in <code>public/papers/</code>, plus what the answer turned out to be.
        </Todo>
      </div>
    </section>
  )
}
