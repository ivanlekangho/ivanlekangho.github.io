import Todo from '../components/Todo'

export default function Education() {
  return (
    <section id="education" className="section">
      <div className="shell">
        <p className="eyebrow">Education</p>
        <h2>Degree and awards</h2>
        <div className="rule-short" />
        <ul style={{ paddingLeft: '1.1rem', maxWidth: 'var(--measure)' }}>
          <li>Stanford University — Computer Science (intended major), expected June 2028</li>
          <li>University of Sydney Chancellor&rsquo;s Award</li>
          <li>NZQA Scholarship, Calculus</li>
          <li>NZQA Scholarship, Physics</li>
        </ul>
        <Todo>
          Two things to resolve. (1) The GPA: 4.13/4.00 is impossible — Stanford&rsquo;s
          scale tops out at 4.30, so either it&rsquo;s 4.13/4.30 or that figure is from a
          previous institution. (2) The sequence: NZQA is New Zealand secondary, the
          Chancellor&rsquo;s Award is Sydney, and you&rsquo;re now at Stanford. Did you attend
          Sydney first? I need the real order to present this honestly.
        </Todo>
      </div>
    </section>
  )
}
