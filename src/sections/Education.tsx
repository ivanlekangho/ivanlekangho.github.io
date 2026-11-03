import Chips from '../components/Chips'
import Todo from '../components/Todo'

/**
 * Education — two institutions, and what was done inside each.
 *
 * This replaces Record, which was six tables of paperwork sorted by kind:
 * every role in one list, every prize in another, so Stanford and a New
 * Zealand secondary school were interleaved throughout and a reader had to
 * reassemble the chronology themselves. Sorted by place instead, it reads
 * in one pass — here is where he is, here is what he runs there, here is
 * what he did before.
 *
 * The clubs sit with the institution rather than in a leadership list,
 * because that is what they are: things run inside a school.
 */

const COURSEWORK = [
  'Data structures & algorithms', 'Advanced algorithms', 'Computer security',
  'Internet architecture & protocols', 'Machine structures', 'Probability',
  'Artificial intelligence', 'Machine learning',
]

/**
 * The school record, cut hard. Ivan sent five years of it; what is here is
 * the part that would still matter to someone reading in ten years —
 * firsts, a world placing, national olympiads. The form prizes and the
 * competition distinctions are real and are deliberately not here: a
 * portfolio that lists everything tells a reader you could not tell which
 * parts counted.
 */
const KINGS_HONOURS = [
  { what: 'Top in the World', where: 'Cambridge AS-Level Thinking Skills', when: '2023' },
  { what: 'Top in New Zealand', where: 'Cambridge AS-Level Music', when: '2023' },
  { what: 'First in year, five years running', where: 'King’s College', when: '2020 – 2024' },
  { what: 'First in New Zealand, twice', where: 'Otago Senior Science Quiz, Years 12 and 13', when: '2023, 2024' },
  { what: 'Second in New Zealand', where: 'NZ Physics and Maths Competition', when: '2021' },
  { what: 'Silver medal', where: 'New Zealand Chemistry Olympiad', when: '2024' },
  { what: 'Bronze medal', where: 'New Zealand Physics Olympiad', when: '2023' },
  { what: 'Scholarship, Calculus and Physics', where: 'NZQA', when: '2022 – 2023' },
  { what: '7A* and 1A', where: 'Cambridge International Examinations', when: '2024' },
  { what: 'Summa cum laude', where: 'National Latin Exam', when: '2021' },
  { what: 'A+ with distinction', where: 'University of Auckland Young Scholars, MATHS199', when: '2024' },
  { what: 'Australasian Schools Debate Championships', where: 'Premier Advanced 1 team', when: '2024' },
]

const KINGS_ROLES = [
  { org: 'Senior Prefect', role: 'Head of the prefect body, final year', when: '2024' },
  { org: 'Cultural Leader', role: 'Responsible for every music and cultural group in the school', when: '2024' },
  { org: 'Student President, Scholars’ Common Room', role: 'Academic prefect — tutoring, academic events, and the peer-tutoring club started inside it', when: '2024' },
]

const STANFORD_CLUBS = [
  { org: 'Mixed Company', role: 'Musical Director — Stanford’s oldest all-gender a cappella group', when: '2026 – present' },
  { org: 'Phi Kappa Psi', role: 'Deputy Chair, Risk Management and Violence Intervention & Prevention', when: 'Sep 2026 – present' },
]

function Rows({ items, className }: {
  items: { org?: string; what?: string; role?: string; where?: string; when: string }[]
  className?: string
}) {
  return (
    <ul className={className ? `index ${className}` : 'index'}>
      {items.map((r) => (
        <li key={(r.org ?? r.what)! + r.when} className="index-row">
          <span className="index-main">{r.org ?? r.what}</span>
          <span className="index-sub">{r.role ?? r.where}</span>
          <span className="index-meta">{r.when}</span>
        </li>
      ))}
    </ul>
  )
}

export default function Education() {
  return (
    <section id="education" className="band">
      <div className="shell">
        <p className="eyebrow">Education</p>
        <h2 className="h-hero" data-reveal>Two schools</h2>

        <div className="edu" data-reveal>
          <h3 className="edu-org">Stanford University</h3>
          <p className="edu-deg">B.S. Computer Science, B.S. Mathematics</p>
          <p className="edu-when">to June 2028</p>
          <Chips items={COURSEWORK} label="Coursework" />
          <Rows items={STANFORD_CLUBS} />
        </div>

        <div className="edu" data-reveal>
          <h3 className="edu-org">King’s College, Auckland</h3>
          <p className="edu-deg">Cambridge International and NZQA</p>
          <p className="edu-when">to 2024</p>
          <Rows items={KINGS_ROLES} />
          <Rows items={KINGS_HONOURS} className="edu-honours" />
        </div>

        <Todo>
          The University of Sydney Chancellor’s Award was in your first brief but
          not on your résumé, so it is off the site until you say where it
          belongs. And there is nothing under Stanford but coursework and two
          clubs — if there are results, grants or awards from the last two years,
          this is where they go.
        </Todo>
      </div>
    </section>
  )
}
