import { Link, useLocation } from 'react-router-dom'
import { useMode } from '../lib/mode'
import type { Mode } from '../lib/palette'

/**
 * The index.
 *
 * Five numbered lines set in mono down the right edge of the room — a
 * contents page, not a toolbar. The icon rail it replaces was eleven
 * little glyphs, and eleven little glyphs is what every generated
 * portfolio looks like; a word says what a drawn circle only gestures at.
 *
 * The rail re-weights this list: the destinations that belong to the
 * current reading come forward and the rest recede. It never hides
 * anything, so nobody can miss half the site by not touching a control.
 */

export type Section = {
  num: string
  to: string
  label: string
  affinity: Mode[]
  wide?: boolean
}

export const SECTIONS: Section[] = [
  { num: '01', to: '/about',   label: 'About',   affinity: ['musician', 'linguist'], wide: true },
  { num: '02', to: '/recital', label: 'Recital', affinity: ['musician'], wide: true },
  { num: '03', to: '/work',    label: 'Work',    affinity: ['engineer'], wide: true },
  { num: '04', to: '/writing', label: 'Writing', affinity: ['linguist', 'engineer'], wide: true },
  { num: '05', to: '/contact', label: 'Contact', affinity: ['musician', 'linguist', 'engineer'] },
]

export default function FloatingNav() {
  const { mode } = useMode()
  const here = useLocation().pathname

  return (
    <nav className="float-nav" aria-label="Sections">
      <ol>
        {SECTIONS.map((s) => {
          const lit = s.affinity.includes(mode)
          const open = here === s.to || here.startsWith(s.to + '/')
          return (
            <li key={s.to}>
              <Link
                to={s.to}
                aria-current={open ? 'page' : undefined}
                className={`${lit ? 'is-lit' : 'is-dim'}${open ? ' is-open' : ''}`}
              >
                <span className="nav-num">{s.num}</span>
                <span className="nav-label">{s.label}</span>
              </Link>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
