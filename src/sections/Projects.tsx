import Todo from '../components/Todo'
import WorkGrid from '../components/WorkGrid'
import { PROJECTS } from '../data/portfolio'

/**
 * Projects — the technical work, as a grid rather than a scroll.
 *
 * The work for the cancer charity is engineering too, and used to sit here
 * in full. It is under Impact now, which is where it belongs: the reason it
 * exists is not that it was interesting to build.
 */
export default function Projects() {
  return (
    <section id="projects" className="band">
      <div className="shell">
        <p className="eyebrow">Projects</p>
        <h2 className="h-hero">Who gets counted,<br />and who decides</h2>

        <p className="lede">
          Research and software. Each one opens — the numbers, the method, and
          what it would have taken for the result to be wrong.
        </p>

        <WorkGrid items={PROJECTS} />

        <Todo>
          Two or three more projects, and links for the ones here. The authorship
          paper needs its figures or its aggregated numbers (there is a note inside
          its card saying which). Flutterer needs a repo link and a live link if it
          still runs. Right now a reader takes both on trust.
        </Todo>
      </div>
    </section>
  )
}
