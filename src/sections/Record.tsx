import Chips from '../components/Chips'
import Fold from '../components/Fold'
import Todo from '../components/Todo'
import ToneLegend from '../components/ToneLegend'

/**
 * Record — the CV material, in one place, at the end.
 *
 * All of this used to be above the work: five tables inside About and two
 * more inside Work, so the page opened with a list of prizes and a reader
 * reached the first actual project about four screens down. It is the same
 * information; it is just no longer the first thing said. Someone who wants
 * the dates comes looking, and someone who does not never has to scroll
 * past them.
 */

const ROLES = [
  {
    org: 'Cancer Society of New Zealand',
    role: 'Software & Data Engineer Intern, Wellington — the three tools are under Impact',
    when: 'Jun – Sep 2026',
  },
  {
    org: 'Stanford School of Engineering',
    role: 'Section leader, CS106A and CS106B — Python, then C++ and data structures, for 15–20 students a quarter. Under Impact.',
    when: 'Mar 2026 – present',
  },
  {
    org: 'Stanford Speech and Cognitive Development Lab',
    role: 'Research assistant — Python preprocessing and annotation pipelines for speech data, validating ASR models against naturalistic recordings under IRB protocol',
    when: 'Jan 2026 – present',
  },
]

/**
 * Positions, not participation. Ivan held seven titles in his last year of
 * school; these are the ones that came with something to run. The current
 * one goes first — a leadership list in reverse chronology opens on what
 * somebody was five years ago.
 */
const LEADERSHIP = [
  {
    org: 'Mixed Company, Stanford',
    role: 'Musical Director — Stanford’s oldest all-gender a cappella group',
    when: '2026 – present',
  },
  {
    org: 'Phi Kappa Psi, Stanford chapter',
    role: 'Deputy Chair, Risk Management and Violence Intervention & Prevention',
    when: 'Sep 2026 – present',
  },
  {
    org: 'Senior Prefect, King’s College',
    role: 'Head of the prefect body in his final year',
    when: '2024',
  },
  {
    org: 'Cultural Leader, King’s College',
    role: 'Prefect responsible for every music and cultural group in the school',
    when: '2024',
  },
  {
    org: 'Student President, Scholars’ Common Room',
    role: 'Academic prefect running tutoring and academic events, including the peer-tutoring club started inside it',
    when: '2024',
  },
]

const COURSEWORK = [
  'Data structures & algorithms', 'Advanced algorithms', 'Computer security',
  'Internet architecture & protocols', 'Machine structures', 'Probability',
  'Artificial intelligence', 'Machine learning',
]

/**
 * The high-school record, cut hard. Ivan sent five years of it; what is here
 * is the part that would still matter to someone reading this in ten years —
 * firsts, a world placing, national olympiads. The form prizes, the
 * competition distinctions and the virtual work experiences are real and are
 * deliberately not here: a portfolio that lists everything tells a reader you
 * could not tell which parts counted.
 */
const HONOURS = [
  { what: 'Top in the World', where: 'Cambridge AS-Level Thinking Skills', when: '2023', family: 't2' },
  { what: 'Top in New Zealand', where: 'Cambridge AS-Level Music', when: '2023', family: 't2' },
  { what: 'Ranked first in year, five years running', where: 'King’s College, Auckland', when: '2020 – 2024', family: 't1' },
  { what: 'First in New Zealand, twice', where: 'University of Otago Senior Science Quiz, Years 12 and 13', when: '2023, 2024', family: 't1' },
  { what: 'Second in New Zealand', where: 'NZ Physics and Maths Competition', when: '2021', family: 't3' },
  { what: 'Silver medal', where: 'New Zealand Chemistry Olympiad', when: '2024', family: 't3' },
  { what: 'Bronze medal', where: 'New Zealand Physics Olympiad', when: '2023', family: 't3' },
  { what: 'Scholarship, Calculus and Physics', where: 'NZQA', when: '2022 – 2023', family: 't0' },
  { what: '7A* and 1A', where: 'Cambridge International Examinations', when: '2024', family: 't0' },
  { what: 'Summa cum laude', where: 'National Latin Exam', when: '2021', family: 't0' },
  { what: 'A+ with distinction', where: 'University of Auckland Young Scholars — MATHS199: cryptography, modelling, graph theory', when: '2024', family: 't0' },
  { what: 'Australasian Schools Debate Championships', where: 'Represented King’s College, Premier Advanced 1 team', when: '2024', family: 't0' },
]

const LANGUAGES = [
  { name: 'Hakka', family: 't3', note: 'First language, spoken at home. Eroding where it came from.' },
  { name: 'Mandarin', family: 't2', note: 'The language that was treated as the useful one.' },
  { name: 'English', family: 't0', note: 'New Zealand, then California.' },
  { name: 'Sung, not spoken', family: 't1', note: 'German, Latin, French, Māori, Samoan, Tongan and ten more — fifteen languages in choir, on IPA and a lot of coaching.' },
]

const STACK = [
  { level: 'Fluent', family: 't1', items: ['Python', 'SQL', 'JavaScript'] },
  { level: 'Working', family: 't2', items: ['C', 'C++', 'React', 'Django', 'NumPy', 'pandas', 'Git', 'AWS EC2', 'S3', 'RDS'] },
  { level: 'Also on the shelf', family: 't3', items: ['MATLAB', 'LaTeX', 'VBA', 'Excel', 'Notion'] },
]

export default function Record() {
  return (
    <section id="record" className="band">
      <div className="shell">
        <p className="eyebrow">Record</p>
        <h2 className="h-hero">The paperwork</h2>

        <p className="lede">
          Roles, positions, study, prizes, languages and tools. Here rather than at
          the top, because none of it is the point.
        </p>

        <Fold title="Roles" count={`${ROLES.length}`} open>
        <ul className="index">
          {ROLES.map((r) => (
            <li key={r.org} className="index-row">
              <span className="index-main">{r.org}</span>
              <span className="index-sub">{r.role}</span>
              <span className="index-meta">{r.when}</span>
            </li>
          ))}
        </ul>
        </Fold>

        <Fold title="Leadership" count={`${LEADERSHIP.length}`} open>
        <ul className="index">
          {LEADERSHIP.map((r) => (
            <li key={r.org} className="index-row">
              <span className="index-main">{r.org}</span>
              <span className="index-sub">{r.role}</span>
              <span className="index-meta">{r.when}</span>
            </li>
          ))}
        </ul>
        </Fold>

        <Fold title="Study">
        <ul className="index">
          <li className="index-row">
            <span className="index-main">Stanford University</span>
            <span className="index-sub">B.S. Computer Science, B.S. Mathematics</span>
            <span className="index-meta">to Jun 2028</span>
          </li>
          <li className="index-row">
            <span className="index-main">Coursework</span>
            <span className="index-sub"><Chips items={COURSEWORK} label="Coursework" /></span>
            <span className="index-meta" />
          </li>
          <li className="index-row">
            <span className="index-main">King’s College, Auckland</span>
            <span className="index-sub">Senior Prefect, Cultural Leader, CIE and NZQA</span>
            <span className="index-meta">to 2024</span>
          </li>
        </ul>
        <Todo>
          Two things. (1) The University of Sydney Chancellor’s Award was in your
          first brief but not on your résumé or in the list you just sent, so it is
          off the site until you tell me where it belongs. (2) Your résumé says GPA
          4.10/4.00, which can’t be right on a 4.00 scale — Stanford’s tops out at
          4.30. I’ve left it off the site, which is normal for a portfolio, but fix
          the résumé.
        </Todo>
        </Fold>

        <Fold title="Honours" count={`${HONOURS.length}`}>
        <ul className="index">
          {HONOURS.map((h) => (
            <li key={h.what + h.where} className="index-row">
              <span className="index-main" style={{ color: `var(--${h.family}-mid)` }}>{h.what}</span>
              <span className="index-sub">{h.where}</span>
              <span className="index-meta">{h.when}</span>
            </li>
          ))}
        </ul>
        </Fold>

        <Fold title="Languages" count={`${LANGUAGES.length}`}>
        <ul className="index">
          {LANGUAGES.map((l) => (
            <li key={l.name} className="index-row">
              <span className="index-main" style={{ color: `var(--${l.family}-mid)` }}>{l.name}</span>
              <span className="index-sub">{l.note}</span>
              <span className="index-meta" />
            </li>
          ))}
        </ul>
        <Todo>
          Hakka tones. Inventories run to six or more and vary by variety, so the
          four-colour system can’t hold them and I am not guessing. Tell me which
          variety you speak — Sabah Hakka, and which sub-variety — and its Chao
          tone values, and it gets its own treatment on the neutral family rather
          than forcing new hues into the palette.
        </Todo>
        </Fold>

        <Fold title="Stack">
        <ul className="index">
          {STACK.map((s) => (
            <li key={s.level} className="index-row">
              <span className="index-main" style={{ color: `var(--${s.family}-mid)` }}>{s.level}</span>
              <span className="index-sub"><Chips items={s.items} label={s.level} /></span>
              <span className="index-meta" />
            </li>
          ))}
        </ul>
        </Fold>

        <Fold title="Four colours">
          <ToneLegend />
        </Fold>
      </div>
    </section>
  )
}
