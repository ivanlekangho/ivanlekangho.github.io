import Todo from '../components/Todo'

export default function Contact() {
  return (
    <section id="contact" className="section">
      <div className="shell">
        <p className="eyebrow">Contact</p>
        <h2>Say hello</h2>
        <div className="rule-short" />
        <p>
          <a href="https://github.com/ivanlekangho">github.com/ivanlekangho</a>
        </p>
        <Todo>
          Which email to display publicly (your Stanford address, or something else?),
          LinkedIn, and anything else you want linked.
        </Todo>
        <p className="muted" style={{ fontSize: 'var(--step--1)', marginTop: 'var(--space-7)' }}>
          Built from scratch — Vite, React, hand-engraved SVG notation. No template.
        </p>
      </div>
    </section>
  )
}
