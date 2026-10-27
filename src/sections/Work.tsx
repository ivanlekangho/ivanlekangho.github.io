import Todo from '../components/Todo'

/**
 * Work — paid and volunteer roles, the Cancer Society engineering in full,
 * and the personal projects, in one sheet. Three destinations before this;
 * they all answered the same question.
 *
 * The Cancer Society material is deliberately redacted, agreed with Ivan:
 * no vendor name, no schema column names, no named supervisor. The
 * organisation holds patient case data, and publishing "this charity runs
 * this product, here is its undocumented schema, here is who administers
 * it" is a disclosure surface for no benefit. The engineering story
 * survives intact without any of it.
 */

const ROLES = [
  {
    org: 'Cancer Society of New Zealand, Greater Wellington',
    role: 'Software volunteer, IESO team',
    when: 'TODO — start date to present',
  },
  {
    org: 'Code4Myanmar / Inspirit AI',
    role: 'Python instructor — beginner Python, Chin State, Myanmar',
    when: 'TODO — dates, and whether this is one organisation or two',
  },
  { org: 'Stanford Speech Lab', role: 'TODO — role and what you did', when: 'TODO' },
  { org: 'Stanford Section Leader', role: 'TODO — which course, what you were responsible for', when: 'TODO' },
]

const CHARITY = [
  {
    title: 'Volunteer rostering system',
    stack: 'Excel/VBA · Python · Microsoft Graph API',
    built: [
      'Fixed a datetime coercion bug that silently shifted rostered times.',
      'Redesigned the calendar import so contiguous blocks merge instead of exporting one entry per slot.',
      'Replaced a fragile COM automation dependency with a Graph API pipeline.',
    ],
    todo: 'How manual was the old process, how often did the date bug actually break scheduling, how many staff roster through this, and roughly how much time it saves.',
  },
  {
    title: 'Client lookup desktop app',
    stack: 'Python · Tkinter · MySQL',
    built: [
      'Reverse-engineered an undocumented legacy case-management schema with no declared foreign keys.',
      'Built a desktop search tool over it and packaged it for a Windows machine with no developer tooling.',
      'Described here at the level of the technical problem only — no product name, no schema detail, nothing about what the records contain.',
    ],
    todo: 'How staff looked records up before this existed, and how slow or error-prone that was.',
  },
  {
    title: 'Shared task and asset system, five regional hubs',
    stack: 'Notion · Notion AI',
    built: [
      'Designed a three-database schema for tasks, assets and hub ownership.',
      'Shipped pre-filled CSVs and a build prompt so each hub could stand the system up itself.',
    ],
    todo: 'Whether hubs were duplicating work or just lacked shared visibility, how many of the five have onboarded, and any rough sense of time saved.',
  },
]

export default function Work() {
  return (
    <section id="work" className="section">
      <h1 className="h-hero">Built for someone<br />who needed it</h1>

      <p className="lede">
        Most of this is internal tooling for a cancer support charity: unglamorous
        software with a named person waiting on the other end of it.
      </p>

      <h2 className="h-rule">Roles</h2>
      <ul className="index">
        {ROLES.map((r) => (
          <li key={r.org} className="index-row">
            <span className="index-main">{r.org}</span>
            <span className="index-sub">{r.role}</span>
            <span className="index-meta">{r.when}</span>
          </li>
        ))}
      </ul>
      <Todo>
        Dates for every role, plus whether the Cancer Society work is remote now
        that you’re at Stanford — it changes how I describe it. Tutoring counts
        too if you want it here.
      </Todo>

      <h2 className="h-rule">Cancer Society, Greater Wellington</h2>
      {CHARITY.map((p) => (
        <article key={p.title} className="entry">
          <div className="entry-head">
            <h3>{p.title}</h3>
            <p className="entry-meta">{p.stack}</p>
          </div>
          <div className="entry-body">
            <ul className="bullets">
              {p.built.map((b) => <li key={b}>{b}</li>)}
            </ul>
            <Todo>{p.todo}</Todo>
          </div>
        </article>
      ))}
      <Todo>
        Rough numbers beat precise ones here — “saves the roster coordinator a few
        hours most weeks” is worth more than nothing. Three figures and this
        section stops being a description and starts being evidence.
      </Todo>

      <h2 className="h-rule">Projects</h2>
      <article className="entry">
        <div className="entry-head">
          <h3>Flutterer</h3>
          <p className="entry-meta">Django REST Framework · JWT · React · MySQL / RDS · EC2 · S3</p>
        </div>
        <div className="entry-body">
          <p>
            A social app. Backend built and tested locally — 13 endpoints, full
            flow verified end to end: register, post, like, comment, follow,
            timeline. Frontend and AWS deployment in progress.
          </p>
          <Todo>
            Placeholder card, per your note — the description above is just the
            facts from your brief. Repo link and live link when they exist.
          </Todo>
        </div>
      </article>
      <Todo>
        Two to four more projects. Small finished things are worth more here than
        big unfinished ones — right now this list has one entry and it isn’t
        done, which is thin.
      </Todo>
    </section>
  )
}
