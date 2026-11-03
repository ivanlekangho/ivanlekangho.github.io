import Todo from '../components/Todo'
import WorkGrid from '../components/WorkGrid'
import { MUSIC } from '../data/portfolio'

/**
 * Music.
 *
 * No lede. The heading names the four things and the cards are the four
 * things; a paragraph in between saying "classical baritone, saxophonist,
 * violinist" was the heading again in a longer form.
 *
 * Weight goes on the directorship, the composition and the research —
 * the three that are work rather than record — by making them the
 * featured cards in the data. Emphasis as layout rather than as adjective.
 */
export default function Music() {
  return (
    <section id="music" className="band">
      <div className="shell">
        <p className="eyebrow">Music</p>
        <h2 className="h-hero" data-reveal>Voice, saxophone,<br />violin, composition</h2>

        <WorkGrid items={MUSIC} tight />

        <Todo>
          Two attachment slots are waiting on this page and they are the two
          worth filling first: a recording of <em>Abendlied</em> at{' '}
          <code>public/audio/abendlied.m4a</code> and a score page beside it.
          Thirty seconds of audio is worth more than the card it sits on. The
          saxophone project wants its PDF and, more than that, its answer.
        </Todo>
      </div>
    </section>
  )
}
