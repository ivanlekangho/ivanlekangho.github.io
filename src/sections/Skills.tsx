import Todo from '../components/Todo'

const GROUPS: { label: string; family: string; items: string[] }[] = [
  { label: 'Fluent',  family: 't1', items: ['Python', 'Django / DRF'] },
  { label: 'Working', family: 't2', items: ['React', 'SQL', 'Tkinter', 'AWS (basics)'] },
  { label: 'Learning', family: 't3', items: ['AWS deployment', 'German', 'Mandarin', 'Hakka'] },
]

export default function Skills() {
  return (
    <section id="skills" className="section">
      <div className="shell">
        <p className="eyebrow">Stack</p>
        <h2>Grouped by how honest I can be about it</h2>
        <div className="rule-short" />
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          {GROUPS.map((g) => (
            <div key={g.label}>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--step--1)', letterSpacing: '0.1em', textTransform: 'uppercase', color: `var(--${g.family}-deep)` }}>
                {g.label}
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {g.items.map((i) => (
                  <li key={i} style={{ padding: '4px 0', borderBottom: '1px solid var(--rule)' }}>{i}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <Todo>
          Confirm the groupings — I split your brief&rsquo;s TODOs by guess. Languages
          (German, Mandarin, Hakka) are in &ldquo;learning&rdquo; alongside the technical
          ones; tell me if you&rsquo;d rather they lived in their own group.
        </Todo>
      </div>
    </section>
  )
}
