import Chips from '../components/Chips'
import Todo from '../components/Todo'

/**
 * Music.
 *
 * The room at the top of the page is one phrase in close-up; this is the
 * rest of it. Ordered by what someone hiring or auditioning would want
 * first: what he is doing now, then voice, then the instruments, then the
 * writing and the research — not chronologically, and not by prize count.
 */

const NOW = [
  {
    org: 'Mixed Company, Stanford',
    role: 'Musical Director — Stanford’s oldest all-gender a cappella group',
    when: '2026 – present',
    href: 'https://www.mixedco.com/',
  },
]

const VOICE = [
  {
    org: 'New Zealand Secondary Students’ Choir',
    role: 'Soloist — one of 56 singers nationally. Represented New Zealand at the China International Chorus Festival and won the Soong Ching Ling Foundation international competition.',
    when: '2023 – 2024',
  },
  {
    org: 'Kappella, King’s College',
    role: 'Choir leader — Silver at the National Big Sing, and four special awards at the regional competition.',
    when: '2024',
  },
  {
    org: 'All the King’s Men, King’s College',
    role: 'Choir leader and soloist — Gold at the National Big Sing in 2022, Bronze in 2024.',
    when: '2020 – 2024',
  },
]

const PLAYED = [
  {
    org: 'Alto saxophone',
    role: 'ABRSM Grade 8 with distinction. Principal alto in the Little Big Band — Gold at the National Youth Jazz Competition, Platinum at the Auckland Jazz Competition — and in the Premier Concert Band.',
    when: 'Grade 8, 2022',
  },
  {
    org: 'Violin',
    role: 'ABRSM Grade 6 with distinction. Deputy leader of the Symphony Orchestra and principal second violin.',
    when: 'Grade 6, 2020',
  },
  {
    org: 'King’s College Soloist Competition',
    role: 'Winner of the woodwind section twice, and twice awarded Best Musical Interpretation.',
    when: '2021 – 2023',
  },
]

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

        <h3 className="h-rule">Now</h3>
        <ul className="index">
          {NOW.map((r) => (
            <li key={r.org} className="index-row">
              <span className="index-main"><a href={r.href}>{r.org}</a></span>
              <span className="index-sub">{r.role}</span>
              <span className="index-meta">{r.when}</span>
            </li>
          ))}
        </ul>

        <h3 className="h-rule">Voice</h3>
        <ul className="index">
          {VOICE.map((r) => (
            <li key={r.org} className="index-row">
              <span className="index-main">{r.org}</span>
              <span className="index-sub">{r.role}</span>
              <span className="index-meta">{r.when}</span>
            </li>
          ))}
        </ul>
        <p className="aside">
          Fifteen languages sung against two spoken — German, Latin, French, Māori,
          Samoan, Tongan and the rest learned phonetically in IPA until a native
          speaker stopped wincing. It is where the precision about sounds I do not
          own comes from.
        </p>

        <h3 className="h-rule">Played</h3>
        <ul className="index">
          {PLAYED.map((r) => (
            <li key={r.org} className="index-row">
              <span className="index-main">{r.org}</span>
              <span className="index-sub">{r.role}</span>
              <span className="index-meta">{r.when}</span>
            </li>
          ))}
        </ul>

        <h3 className="h-rule">Written</h3>
        <article className="entry">
          <div className="entry-head">
            <h4>Abendlied</h4>
            <p className="entry-meta">German, lower-voice choir</p>
          </div>
          <div className="entry-body">
            <p>
              Highly commended in the NZCF–SOUNZ composition competition, and
              awarded Gold on its performance at the Upper North Island Cadenza
              festival.
            </p>
            <Chips items={['Choral', 'SATB lower voices', 'German text', '2023–2024']} />
            <Todo>
              A recording or a score page for Abendlied, if one exists. A composition
              nobody can hear is a line on a list; thirty seconds of audio is
              evidence.
            </Todo>
          </div>
        </article>

        <h3 className="h-rule">Researched</h3>
        <article className="entry">
          <div className="entry-head">
            <h4>How does the shape of an alto saxophone mouthpiece affect its sound?</h4>
            <p className="entry-meta">Cambridge International Project Qualification · 2024</p>
          </div>
          <div className="entry-body">
            <p>
              An extended research project on the acoustics of my own instrument —
              chamber geometry against timbre. It is the same question the terminal
              at the top of this page is asking about a chord, with a reed in place
              of a string.
            </p>
            <Chips items={['Acoustics', 'Physics', 'Saxophone', 'Extended project']} />
            <Todo>
              The IPQ itself, if you can share it — a PDF in public/ and a link here.
              Also: what the answer turned out to be.
            </Todo>
          </div>
        </article>
      </div>
    </section>
  )
}
