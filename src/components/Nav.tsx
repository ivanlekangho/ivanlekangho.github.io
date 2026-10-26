import { Link, useLocation } from 'react-router-dom'

const LINKS = [
  { to: '/#about', label: 'About' },
  { to: '/#work', label: 'Work' },
  { to: '/#projects', label: 'Projects' },
  { to: '/#recital', label: 'Recital' },
  { to: '/how-i-think', label: 'How I think' },
  { to: '/log', label: 'Log' },
  { to: '/now', label: 'Now' },
]

export default function Nav() {
  const { pathname } = useLocation()
  return (
    <header
      style={{
        // Deliberately NOT sticky. The floating rail is what persists; a second
        // bar pinned at the top would both duplicate it and shorten the recital
        // room's sticky viewport, cutting the stage off at the bottom.
        borderBottom: '1px solid var(--rule)',
      }}
    >
      <nav
        className="shell"
        style={{
          display: 'flex', alignItems: 'center', gap: 'var(--space-5)',
          paddingBlock: 'var(--space-3)', flexWrap: 'wrap',
        }}
      >
        <Link to="/" style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--step-0)', textDecoration: 'none', color: 'var(--ink)' }}>
          Ivan Ho
        </Link>
        <ul style={{ display: 'flex', gap: 'var(--space-4)', listStyle: 'none', margin: 0, padding: 0, flexWrap: 'wrap' }}>
          {LINKS.map((l) => (
            <li key={l.to}>
              <Link
                to={l.to}
                style={{
                  fontSize: 'var(--step--1)', letterSpacing: '0.1em',
                  textTransform: 'uppercase', textDecoration: 'none',
                  color: pathname === l.to ? 'var(--accent-deep)' : 'var(--ink-3)',
                }}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  )
}
