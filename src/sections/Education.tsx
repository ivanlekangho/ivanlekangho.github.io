import { useState } from 'react'
import Chapters, { type Chapter } from '../components/Chapters'
import Chips from '../components/Chips'
import Sheet from '../components/Sheet'
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
 *
 * Tiles, like Work/Impact, rather than the accordion this used first. Two
 * patterns for the same job — a thing you click to see more of — is one
 * pattern more than a reader should have to learn on one site, and the
 * tiles came first.
 */

/**
 * A tile with a number on it and a sheet behind it.
 *
 * Deliberately not WorkGrid: that is built around a portfolio Item, and
 * forcing a coursework list and a prize table into that shape to borrow a
 * grid would be the data bending to the component. This borrows the card's
 * own class instead, so they look like the tiles they are meant to look
 * like, and keeps its own content.
 */
function Tile({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button type="button" className="card card-min" onClick={() => setOpen(true)}>
        {/* No count. "8 courses" and "2 roles" were the loudest thing on
            these tiles and the least worth reading — a tally of a list is
            not a finding, and next to Work/Impact's 95% and 60k it borrowed
            a form built for numbers that mean something. The name of the
            thing takes the size and the red instead. */}
        <h4 className="card-title edu-tile-name">{title}</h4>
        <span className="card-foot"><span className="card-more">Read more</span></span>
      </button>
      {open && (
        <Sheet onClose={() => setOpen(false)} label={title}>
          <h2 className="sheet-title">{title}</h2>
          {children}
        </Sheet>
      )}
    </>
  )
}

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

/* Cultural, then academic, then the prefect body: Ivan's order, which is
   also the useful one, running from what he was elected to do to the body
   he sat on rather than from the grandest title down.
   
   Head Prefect (Academic) and President of the Scholars' Common Room are
   ONE office, not two. They were listed separately and that read as four
   posts where there are three. */
const KINGS_ROLES = [
  { org: 'Head Prefect (Cultural)', role: 'For all 30+ music and cultural groups', when: '2024' },
  { org: 'Head Prefect (Academic)', role: 'President of the Scholars’ Common Room, for tutoring and academic events', when: '2024' },
  { org: 'Senior Prefect', role: '1 of 15 representing the student body', when: '2024' },
]

const STANFORD_CLUBS = [
  { org: 'Mixed Company', role: 'Musical Director for Stanford’s oldest all-gender, all-genre a cappella group', when: '2026 – present' },
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
  const chapters: Chapter[] = [
    {
      id: 'stanford',
      label: 'Stanford',
      body: (
        <>
          <p className="eyebrow" data-reveal>University</p>
          <h2 className="chapter-head" data-reveal>Stanford University</h2>
          <p className="edu-deg" data-reveal>
            B.S. Computer Science, B.S. Mathematics
            <span>Graduation: June 2028</span>
          </p>

          <div className="cards cards-tight" data-reveal>
            <Tile title="Coursework">
              <Chips items={COURSEWORK} label="Coursework" />
            </Tile>
            <Tile title="Leadership">
              <Rows items={STANFORD_CLUBS} className="edu-roles" />
            </Tile>
          </div>
        </>
      ),
    },
    {
      id: 'kings',
      label: 'King’s College',
      body: (
        <>
          <p className="eyebrow" data-reveal>High School</p>
          <h2 className="chapter-head" data-reveal>King’s College, Auckland</h2>
          <p className="edu-deg" data-reveal>
            Dux/Valedictorian 2024
            <span>7A* and 1A at Cambridge International A-Level</span>
          </p>

          <div className="cards cards-tight" data-reveal>
            <Tile title="Leadership">
              <Rows items={KINGS_ROLES} className="edu-roles" />
            </Tile>
            <Tile title="Awards">
              <Rows items={KINGS_HONOURS} className="edu-honours" />
            </Tile>
          </div>
        </>
      ),
    },
  ]

  return (
    <Chapters title="My Education" chapters={chapters}>
      <Todo>
        There is nothing under Stanford but coursework and two clubs — if there
        are results, grants or awards from the last two years, this is where
        they go.
      </Todo>
    </Chapters>
  )
}
