import Todo from '../components/Todo'
import ToneLegend from '../components/ToneLegend'

/**
 * About — the whole person in one sheet: who, where now, where from, and
 * what the four colours mean. Education, the stack and the Now page used
 * to be three more destinations; they were three thin pages, and a reader
 * who has opened "About" has already asked for all of it.
 */

const STUDY = [
  { place: 'Stanford University', what: 'Computer science, intended major', when: 'to June 2028' },
  { place: 'University of Sydney', what: 'Chancellor’s Award', when: 'TODO' },
  { place: 'NZQA Scholarship', what: 'Calculus', when: 'TODO' },
  { place: 'NZQA Scholarship', what: 'Physics', when: 'TODO' },
]

const STACK = [
  { level: 'Fluent', family: 't1', items: 'Python · Django / DRF' },
  { level: 'Working', family: 't2', items: 'React · SQL · Tkinter · AWS basics' },
  { level: 'Learning', family: 't3', items: 'AWS deployment · German · Mandarin · Hakka' },
]

export default function About() {
  return (
    <section id="about" className="section">
      <h1 className="h-hero">
        Three <span style={{ color: 'var(--t1-deep)' }}>l</span>
        <span style={{ color: 'var(--t2-deep)' }}>a</span>
        <span style={{ color: 'var(--t3-deep)' }}>n</span>
        <span style={{ color: 'var(--t4-deep)' }}>g</span>uages,<br />one grammar
      </h1>

      <p className="lede">
        Stanford CS (intended), expected June 2028. Baritone. Volunteer software
        for the Cancer Society of New Zealand, Greater Wellington.
      </p>

      <Todo>
        Opening paragraph. Your draft has the second half — “I sing Schubert in
        German I’m still learning to pronounce properly…” — but the first line
        (where you’re from, your family’s background) is still yours to write.
        Also still open: how much of the queer framing you want stated here
        versus left as subtext.
      </Todo>

      <h2 className="h-rule">Right now</h2>
      <Todo>
        Three to five real lines: what you’re building, learning, reading,
        singing. Edit src/sections/About.tsx directly — no build step, no CMS.
      </Todo>

      <h2 className="h-rule">Study</h2>
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
        Two things to resolve. (1) The GPA: 4.13/4.00 is impossible — Stanford’s
        scale tops out at 4.30, so either it’s 4.13/4.30 or that figure is from a
        previous institution. (2) The sequence: NZQA is New Zealand secondary, the
        Chancellor’s Award is Sydney, and you’re now at Stanford. Did you attend
        Sydney first? I need the real order to present this honestly.
      </Todo>

      <h2 className="h-rule">Stack</h2>
      <ul className="index">
        {STACK.map((s) => (
          <li key={s.level} className="index-row">
            <span className="index-main" style={{ color: `var(--${s.family}-deep)` }}>{s.level}</span>
            <span className="index-sub">{s.items}</span>
            <span className="index-meta" />
          </li>
        ))}
      </ul>
      <Todo>
        Confirm the groupings — I split your brief’s TODOs by guess. The
        languages sit in “learning” alongside the technical ones; tell me if
        you’d rather they had their own line.
      </Todo>

      <h2 className="h-rule">Four colours</h2>
      <ToneLegend />
    </section>
  )
}
