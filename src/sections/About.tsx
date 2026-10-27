import Todo from '../components/Todo'
import ToneLegend from '../components/ToneLegend'

/**
 * About — who, where from, and why the four colours.
 *
 * The facts here are Ivan's, from his brief and his résumé; the sentences
 * are mine until he rewrites them, which is what the note at the end of
 * the first block says. Nothing is invented.
 */

const STUDY = [
  { place: 'Stanford University', what: 'B.S. Computer Science · B.S. Mathematics', when: 'to Jun 2028' },
  { place: 'Coursework', what: 'Data structures & algorithms · advanced algorithms · computer security · internet architecture & protocols · machine structures · probability · AI · machine learning', when: '' },
  { place: 'University of Sydney', what: 'Chancellor’s Award', when: 'TODO' },
  { place: 'NZQA Scholarship', what: 'Calculus · Physics', when: 'TODO' },
]

const LANGUAGES = [
  { name: 'Hakka', family: 't3', note: 'First language, spoken at home. Eroding where it came from.' },
  { name: 'Mandarin', family: 't2', note: 'The language that was treated as the useful one.' },
  { name: 'English', family: 't0', note: 'New Zealand, then California.' },
  { name: 'Sung, not spoken', family: 't1', note: 'German, Latin, French, Māori, Samoan, Tongan and ten more — fifteen languages in choir, on IPA and a lot of coaching.' },
]

const STACK = [
  { level: 'Fluent', family: 't1', items: 'Python · SQL · JavaScript' },
  { level: 'Working', family: 't2', items: 'C · C++ · React · Django · NumPy / pandas · Git · AWS (EC2, S3, RDS)' },
  { level: 'Also on the shelf', family: 't3', items: 'MATLAB · LaTeX · VBA · Excel' },
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
              <span className="index-main" style={{ color: `var(--${l.family}-deep)` }}>{l.name}</span>
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
          {STUDY.map((s) => (
            <li key={s.place + s.what} className="index-row">
              <span className="index-main">{s.place}</span>
              <span className="index-sub">{s.what}</span>
              <span className="index-meta">{s.when}</span>
            </li>
          ))}
        </ul>
        <Todo>
          Two things. (1) Dates for the Sydney Chancellor’s Award and the NZQA
          scholarships, and the real order — NZQA is New Zealand secondary, the
          Chancellor’s Award is Sydney, you are now at Stanford, and I still don’t
          know whether Sydney came in between. (2) Your résumé says GPA 4.10/4.00,
          which can’t be right on a 4.00 scale — Stanford’s tops out at 4.30. I’ve
          left it off the site entirely, which is normal for a portfolio, but fix
          the résumé.
        </Todo>

        <h3 className="h-rule">Stack</h3>
        <ul className="index">
          {STACK.map((s) => (
            <li key={s.level} className="index-row">
              <span className="index-main" style={{ color: `var(--${s.family}-deep)` }}>{s.level}</span>
              <span className="index-sub">{s.items}</span>
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
