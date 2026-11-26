import Chapters, { type Chapter } from '../components/Chapters'
import Todo from '../components/Todo'
import WorkGrid from '../components/WorkGrid'
import { GROUPS, byGroup } from '../data/portfolio'

/**
 * Work and impact, in three fields.
 *
 * The groups used to be Work, Research and Projects — a sort by what each
 * thing was to Ivan, which tells a reader nothing and actively hides the
 * point: the same question turns up in a cancer charity's database, in a
 * Stanford section room and in a bibliometric dataset, and filing those
 * three under "a job, a paper, a side project" buries exactly that. Sorted
 * by who the work was for, the set has an argument in it.
 *
 * Health leads because the paid engineering is the strongest material
 * here, and because a reader who opens one thing should open that one.
 *
 * The three fields are the page's three chapters, which is also what the
 * rail down the left is counting. There is no written subtitle under the
 * title any more: the rail says what the three are, and saying it twice
 * on the same screen was the version before this.
 */

/* The `Photo` component that stood here is gone with the photograph it
   drew. Daffodil Day now sits inside the Cancer Society sheet, which is
   what it is a picture of — at the foot of the chapter it read as a
   portrait belonging to all four tiles at once. */

export default function Impact() {
  const chapters: Chapter[] = GROUPS.map((g) => ({
    id: g.id,
    label: g.title,
    body: (
      <>
        <p className="eyebrow" data-reveal>{g.title}</p>
        <h2 className="chapter-head" data-reveal>{g.gloss}</h2>
        <WorkGrid items={byGroup(g.id)} minimal />
      </>
    ),
  }))

  return (
    <Chapters title={<>Innovative Tech,<br />for <em>Good</em></>} chapters={chapters}>
      {/* The notes that stood here are answered. Both labs are written up,
          the Uyghur paper is published, Code For Myanmar has its dates, and
          Flutterer is deliberately without a repo. What is left is one
          document that genuinely does not exist yet, and the Gene drives
          card says "coming soon" on its own button rather than needing a
          note to me about it. */}
      <Todo>
        <b>Flutterer is in Society by elimination.</b> A social platform built
        to learn full-stack is not health and not education, so it went to the
        third field rather than getting a fourth of its own.
      </Todo>
    </Chapters>
  )
}
