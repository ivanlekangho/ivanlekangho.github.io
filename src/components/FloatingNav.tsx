import { Link } from 'react-router-dom'
import { useMode } from '../lib/mode'

/**
 * Persistent navigation that floats at the edge of the recital room rather
 * than sitting in a bar above it — the room should feel like a place you're
 * standing in, not a page with a header.
 */

type Item = { to: string; label: string; icon: React.ReactNode }

const s = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }

const ITEMS: Item[] = [
  { to: '/#about', label: 'About', icon: <g {...s}><circle cx="12" cy="9" r="3.4" /><path d="M5.5 19c1.3-3.4 4-5 6.5-5s5.2 1.6 6.5 5" /></g> },
  { to: '/#work', label: 'Work', icon: <g {...s}><rect x="3.5" y="7.5" width="17" height="11.5" rx="2" /><path d="M9 7.5V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1.5" /></g> },
  { to: '/#impact', label: 'Cancer Society', icon: <g {...s}><path d="M12 19.5S4.5 15 4.5 9.8A3.8 3.8 0 0 1 12 8a3.8 3.8 0 0 1 7.5 1.8c0 5.2-7.5 9.7-7.5 9.7Z" /></g> },
  { to: '/#projects', label: 'Projects', icon: <g {...s}><path d="M8.5 7.5 4 12l4.5 4.5M15.5 7.5 20 12l-4.5 4.5" /></g> },
  { to: '/how-i-think', label: 'How I think', icon: <g {...s}><path d="M12 4.5c-4 0-6 2.6-6 5.2 0 3.6 4.6 4.3 4.6 7a1.9 1.9 0 0 0 3.5 1c.7-1.3-.6-2.3-.6-3.4 0-2 4.5-2.4 4.5-5.6 0-2.4-2-4.2-6-4.2Z" /></g> },
  { to: '/#recital', label: 'Recital', icon: <g {...s}><circle cx="8" cy="17" r="2.6" /><path d="M10.6 17V6l8-1.6v10" /><circle cx="16" cy="15.4" r="2.6" /></g> },
  { to: '/log', label: 'Log', icon: <g {...s}><path d="M5 6.5h14M5 11h14M5 15.5h9" /></g> },
  { to: '/now', label: 'Now', icon: <g {...s}><circle cx="12" cy="12" r="7.5" /><path d="M12 7.6V12l3 1.8" /></g> },
  { to: '/#contact', label: 'Contact', icon: <g {...s}><rect x="3.5" y="5.5" width="17" height="13" rx="2" /><path d="m4 7 8 5.5L20 7" /></g> },
]

export default function FloatingNav() {
  const { mode, toggle } = useMode()
  const next = mode === 'musician' ? 'engineer' : 'musician'
  return (
    <nav className="float-nav" aria-label="Sections">
      <ul>
        <li>
          <button onClick={toggle} title={`Switch to ${next} mode`} aria-label={`Switch to ${next} mode`}
            className="float-mode">
            <svg viewBox="0 0 24 24" width="19" height="19" aria-hidden="true">
              {mode === 'musician'
                ? <g {...s}><circle cx="8" cy="17" r="2.6" /><path d="M10.6 17V6l8-1.6v10" /><circle cx="16" cy="15.4" r="2.6" /></g>
                : <g {...s}><path d="M8.5 7.5 4 12l4.5 4.5M15.5 7.5 20 12l-4.5 4.5" /></g>}
            </svg>
            <span>{mode} mode</span>
          </button>
        </li>
        {ITEMS.map((i) => (
          <li key={i.to + i.label}>
            <Link to={i.to} title={i.label} aria-label={i.label}>
              <svg viewBox="0 0 24 24" width="19" height="19" aria-hidden="true">{i.icon}</svg>
              <span>{i.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
