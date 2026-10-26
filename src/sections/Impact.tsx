import Todo from '../components/Todo'

/**
 * Cancer Society. Its own section, per Ivan.
 *
 * Deliberately redacted, agreed with Ivan: no vendor name, no schema column
 * names, no named supervisor. The organisation holds patient case data, and
 * publishing "this charity runs this product, here is its undocumented schema,
 * here is who administers it" is a disclosure surface for no benefit. The
 * engineering story survives intact without any of it.
 */
const PROJECTS = [
  {
    title: 'Volunteer rostering system',
    stack: ['Excel/VBA', 'Python', 'Microsoft Graph API'],
    built: [
      'Fixed a datetime coercion bug that silently shifted rostered times.',
      'Redesigned the calendar import so contiguous blocks merge instead of exporting one entry per slot.',
      'Replaced a fragile COM automation dependency with a Graph API pipeline.',
    ],
    todo: 'How manual was the old process, how often did the date bug actually break scheduling, how many staff roster through this, and roughly how much time it saves.',
  },
  {
    title: 'Client lookup desktop app',
    stack: ['Python', 'Tkinter', 'MySQL'],
    built: [
      'Reverse-engineered an undocumented legacy case-management schema with no declared foreign keys.',
      'Built a desktop search tool over it and packaged it for a Windows machine with no developer tooling.',
    ],
    todo: 'How staff looked records up before this existed, and how slow or error-prone that was.',
    sensitive: true,
  },
  {
    title: 'Shared task and asset system, five regional hubs',
    stack: ['Notion', 'Notion AI'],
    built: [
      'Designed a three-database schema for tasks, assets and hub ownership.',
      'Shipped pre-filled CSVs and a build prompt so each hub could stand the system up itself.',
    ],
    todo: 'Whether hubs were duplicating work or just lacked shared visibility, how many of the five have onboarded, and any rough sense of time saved.',
  },
]

export default function Impact() {
  return (
    <section id="impact" className="section">
      <div className="shell">
        <p className="eyebrow">Social impact</p>
        <h2>Cancer Society, Greater Wellington</h2>
        <div className="rule-short" />
        <p className="lede">
          Volunteer software for a regional cancer support charity — internal tools
          for the people doing the actual work.
        </p>

        <div className="grid grid-2" style={{ marginTop: 'var(--space-6)' }}>
          {PROJECTS.map((p) => (
            <article key={p.title} className="card">
              <h3>{p.title}</h3>
              <p style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 'var(--space-3)' }}>
                {p.stack.map((s) => <span key={s} className="tag">{s}</span>)}
              </p>
              <ul style={{ paddingLeft: '1.1rem', margin: '0 0 var(--space-3)' }}>
                {p.built.map((b) => <li key={b}>{b}</li>)}
              </ul>
              {p.sensitive && (
                <p className="muted" style={{ fontSize: 'var(--step--1)', marginBottom: 'var(--space-3)' }}>
                  Described at the level of the technical problem only. No product name,
                  no schema detail, nothing about what the records contain.
                </p>
              )}
              <Todo>{p.todo}</Todo>
            </article>
          ))}
        </div>

        <p className="muted" style={{ marginTop: 'var(--space-5)', fontSize: 'var(--step--1)' }}>
          Rough numbers beat precise ones here — &ldquo;saves the roster coordinator a
          few hours most weeks&rdquo; is worth more than nothing.
        </p>
      </div>
    </section>
  )
}
