import Chips from '../components/Chips'
import Todo from '../components/Todo'
import ToneLegend from '../components/ToneLegend'

/**
 * About — who, where from, and why the four colours.
 *
 * The facts here are Ivan's, from his brief and his résumé; the sentences
 * are mine until he rewrites them, which is what the note at the end of
 * the first block says. Nothing is invented.
 */

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

export default function About() {
  return (
    <section id="about" className="band">
      <div className="shell">
        <p className="eyebrow">About</p>
        <h2 className="h-hero">
          Three <span style={{ color: 'var(--t1-deep)' }}>l</span>
          <span style={{ color: 'var(--t2-deep)' }}>a</span>
          <span style={{ color: 'var(--t3-deep)' }}>n</span>
          <span style={{ color: 'var(--t4-deep)' }}>g</span>uages,<br />one grammar
        </h2>

        <div className="prose">
          <p className="lede">
            Chinese Malaysian family, Hakka at home, New Zealand childhood, now
            computer science and mathematics at Stanford. The through-line is
            language — which ones get treated as worth keeping, and who decides.
          </p>
          <p>
            Hakka was the language of the house and Mandarin was the useful one.
            Hakka got called rural, or improper, and the people saying so were
            often us. I have watched it thin out in my own hometown in Sabah: the
            grandparents speak it, the parents switch, the children answer in
            Mandarin or English. Nobody banned anything. It just stopped being
            worth the effort, one household at a time.
          </p>
          <p>
            What pulled that into computer science was noticing how badly language
            models handle Hakka. Not accented, not awkward — wrong, confidently.
            The languages with the most data get the best tools, the best tools
            make those languages easier to live in, and the gap widens on its own.
            That is a technical problem with a technical shape, which is most of
            why I am interested in NLP for languages that are not well served by
            it.
          </p>
          <p>
            Choir is the other half of the same habit. Fifteen languages sung,
            two spoken: you learn a line phonetically, in IPA, until a native
            speaker stops wincing. It makes you precise about sounds you do not
            own, which turns out to be good training for everything else here.
          </p>
        </div>

        <Todo>
          The four paragraphs above are your facts in my sentences. They should be
          in yours — especially the second one. Also still open: how much of the
          queer framing you want stated here rather than left as subtext.
        </Todo>

        <h3 className="h-rule">Languages</h3>
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

        <h3 className="h-rule">Study</h3>
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

        <h3 className="h-rule">Honours</h3>
        <ul className="index">
          {HONOURS.map((h) => (
            <li key={h.what + h.where} className="index-row">
              <span className="index-main" style={{ color: `var(--${h.family}-mid)` }}>{h.what}</span>
              <span className="index-sub">{h.where}</span>
              <span className="index-meta">{h.when}</span>
            </li>
          ))}
        </ul>

        <h3 className="h-rule">Stack</h3>
        <ul className="index">
          {STACK.map((s) => (
            <li key={s.level} className="index-row">
              <span className="index-main" style={{ color: `var(--${s.family}-mid)` }}>{s.level}</span>
              <span className="index-sub"><Chips items={s.items} label={s.level} /></span>
              <span className="index-meta" />
            </li>
          ))}
        </ul>

        <h3 className="h-rule">Four colours</h3>
        <ToneLegend />
      </div>
    </section>
  )
}
