import { Link, useLocation } from 'react-router-dom'
import { useMode } from '../lib/mode'
import type { Mode } from '../lib/palette'

/**
 * Navigation that floats at the edge of the room rather than sitting in a
 * bar above it, because the room should feel like a place you're standing
 * in. Every destination stays reachable in every mode — the rail changes
 * which ones are foregrounded, it never hides half the site.
 */

type Item = { to: string; label: string; affinity: Mode[]; icon: React.ReactNode }

const s = {
  fill: 'none', stroke: 'currentColor', strokeWidth: 1.5,
  strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const,
}

const ITEMS: Item[] = [
  { to: '/about', label: 'About', affinity: ['musician', 'linguist'], icon: <g {...s}><circle cx="12" cy="9" r="3.4" /><path d="M5.5 19c1.3-3.4 4-5 6.5-5s5.2 1.6 6.5 5" /></g> },
  { to: '/recital', label: 'Recital', affinity: ['musician'], icon: <g {...s}><circle cx="8" cy="17" r="2.6" /><path d="M10.6 17V6l8-1.6v10" /><circle cx="16" cy="15.4" r="2.6" /></g> },
  { to: '/impact', label: 'Cancer Society', affinity: ['musician', 'engineer'], icon: <g {...s}><path d="M12 19.5S4.5 15 4.5 9.8A3.8 3.8 0 0 1 12 8a3.8 3.8 0 0 1 7.5 1.8c0 5.2-7.5 9.7-7.5 9.7Z" /></g> },
  { to: '/how-i-think', label: 'How I think', affinity: ['linguist', 'engineer'], icon: <g {...s}><path d="M12 4.5c-4 0-6 2.6-6 5.2 0 3.6 4.6 4.3 4.6 7a1.9 1.9 0 0 0 3.5 1c.7-1.3-.6-2.3-.6-3.4 0-2 4.5-2.4 4.5-5.6 0-2.4-2-4.2-6-4.2Z" /></g> },
  { to: '/projects', label: 'Projects', affinity: ['engineer'], icon: <g {...s}><path d="M8.5 7.5 4 12l4.5 4.5M15.5 7.5 20 12l-4.5 4.5" /></g> },
  { to: '/work', label: 'Work', affinity: ['engineer'], icon: <g {...s}><rect x="3.5" y="7.5" width="17" height="11.5" rx="2" /><path d="M9 7.5V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1.5" /></g> },
  { to: '/skills', label: 'Skills', affinity: ['engineer'], icon: <g {...s}><path d="M4 18V9M10 18V5M16 18v-6M22 18v-9" /></g> },
  { to: '/education', label: 'Education', affinity: ['musician', 'linguist'], icon: <g {...s}><path d="M3 9.5 12 5.5l9 4-9 4-9-4Z" /><path d="M7 11.8V16c0 1.1 2.2 2 5 2s5-.9 5-2v-4.2" /></g> },
  { to: '/log', label: 'Log', affinity: ['linguist', 'engineer'], icon: <g {...s}><path d="M5 6.5h14M5 11h14M5 15.5h9" /></g> },
  { to: '/now', label: 'Now', affinity: ['musician', 'linguist', 'engineer'], icon: <g {...s}><circle cx="12" cy="12" r="7.5" /><path d="M12 7.6V12l3 1.8" /></g> },
  { to: '/contact', label: 'Contact', affinity: ['musician', 'linguist', 'engineer'], icon: <g {...s}><rect x="3.5" y="5.5" width="17" height="13" rx="2" /><path d="m4 7 8 5.5L20 7" /></g> },
]

export default function FloatingNav() {
  const { mode } = useMode()
  const here = useLocation().pathname

  return (
    <nav className="float-nav" aria-label="Sections">
      <ul>
        {ITEMS.map((i) => {
          const lit = i.affinity.includes(mode)
          const open = here === i.to || here.startsWith(i.to + '/')
          return (
            <li key={i.to}>
              <Link
                to={i.to}
                title={i.label}
                aria-label={i.label}
                aria-current={open ? 'page' : undefined}
                className={`${lit ? 'is-lit' : 'is-dim'}${open ? ' is-open' : ''}`}
              >
                <svg viewBox="0 0 24 24" width="19" height="19" aria-hidden="true">{i.icon}</svg>
                <span>{i.label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
