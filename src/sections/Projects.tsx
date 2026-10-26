import Todo from '../components/Todo'

export default function Projects() {
  return (
    <section id="projects" className="section">
      <div className="shell">
        <p className="eyebrow">Projects</p>
        <h2>Selected work</h2>
        <div className="rule-short" />

        <article className="card" style={{ borderColor: 'var(--accent-mid)' }}>
          <h3 style={{ fontSize: 'var(--step-2)' }}>Flutterer</h3>
          <p style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 'var(--space-3)' }}>
            {['Django REST Framework', 'JWT', 'React', 'MySQL / RDS', 'EC2', 'S3'].map((s) => (
              <span key={s} className="tag">{s}</span>
            ))}
          </p>
          <p>
            A social app. Backend built and tested locally — 13 endpoints, full flow
            verified end to end: register, post, like, comment, follow, timeline.
            Frontend and AWS deployment in progress.
          </p>
          <Todo>
            Placeholder card, per your note — the description above is just the facts
            from your brief. Repo link and live link when they exist.
          </Todo>
        </article>

        <Todo>
          Two to four more projects. Small finished things are worth more here than
          big unfinished ones — right now this section has one entry and it isn&rsquo;t
          done, which is thin. If you&rsquo;d rather, the Cancer Society tools can also
          appear here as technical cards, though they&rsquo;d then be on the page twice.
        </Todo>
      </div>
    </section>
  )
}
