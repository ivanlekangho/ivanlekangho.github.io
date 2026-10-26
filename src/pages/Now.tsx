import Todo from '../components/Todo'

/** Edit LAST_UPDATED and the lines by hand. That's the whole point of a Now page. */
const LAST_UPDATED = 'TODO'

export default function Now() {
  return (
    <div className="shell section">
      <p className="eyebrow">Now</p>
      <h1 style={{ fontSize: 'var(--step-4)' }}>What I&rsquo;m doing at the moment</h1>
      <div className="rule-short" />
      <Todo>
        Three to five real lines: what you&rsquo;re building, learning, reading, singing.
        Edit src/pages/Now.tsx directly — no build step, no CMS.
      </Todo>
      <p className="muted" style={{ fontSize: 'var(--step--1)' }}>Last updated: {LAST_UPDATED}</p>
    </div>
  )
}
