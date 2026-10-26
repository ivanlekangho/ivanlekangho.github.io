import Todo from '../components/Todo'

const ROLES = [
  {
    org: 'Cancer Society of New Zealand — Greater Wellington',
    role: 'Software volunteer, IESO team',
    dates: 'TODO — start date to present',
    note: 'Three projects, described in full below.',
    anchor: '#impact',
  },
  {
    org: 'Code4Myanmar / Inspirit AI',
    role: 'Python instructor',
    dates: 'TODO — dates and format',
    note: 'Taught beginner Python to students in Chin State, Myanmar. TODO: are these one organisation or two?',
  },
  { org: 'Stanford Speech Lab', role: 'TODO — role', dates: 'TODO', note: 'TODO — what you actually did.' },
  { org: 'Stanford Section Leader', role: 'TODO — which course', dates: 'TODO', note: 'TODO — responsibilities.' },
]

export default function Work() {
  return (
    <section id="work" className="section">
      <div className="shell">
        <p className="eyebrow">Work</p>
        <h2>Where I&rsquo;ve worked</h2>
        <div className="rule-short" />
        <div className="grid">
          {ROLES.map((r) => (
            <article key={r.org} className="card">
              <h3 style={{ marginBottom: 'var(--space-1)' }}>{r.org}</h3>
              <p className="muted" style={{ marginBottom: 'var(--space-2)', fontSize: 'var(--step--1)' }}>
                {r.role} · {r.dates}
              </p>
              <p style={{ marginBottom: 0 }}>
                {r.note}{' '}
                {r.anchor && <a href={r.anchor}>Read more &darr;</a>}
              </p>
            </article>
          ))}
        </div>
        <Todo>
          Dates for every role, plus whether the Cancer Society work is remote now
          that you&rsquo;re at Stanford — it changes how I describe it. Tutoring
          counts too if you want it here.
        </Todo>
      </div>
    </section>
  )
}
