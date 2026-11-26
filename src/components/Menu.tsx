import { NavLink, useLocation } from 'react-router-dom'
import { PAGES } from '../lib/pages'
import { scrollToTop } from '../lib/scroll'

/**
 * The bar.
 *
 * Five labels ruled into equal cells, and nothing else — the name that
 * used to sit at its left is its own element now (components/Brand), which
 * is what stopped the labels jumping sideways every time it appeared.
 *
 * The bar reserves the room that name needs with a padding that travels
 * with it, on the same curve and over the same duration, so the two read
 * as one movement rather than as a bar reacting to something.
 *
 * The hall is deliberately not here. It is the end of the argument rather
 * than a tab, and it is reached from the foot of Creative, where somebody
 * who has just listened to the compositions is the likeliest person to
 * want it.
 */
export default function Menu({ open }: { open: boolean }) {
  const { pathname } = useLocation()
  /* Clicking the entry for the page you are already on changes no route, so
     ToTop never fires and you stay halfway down where you were. Smooth
     here, unlike a navigation: this is a return, and you should see the
     page go past. */
  const same = (to: string) => (e: React.MouseEvent) => {
    if (pathname !== to) return
    e.preventDefault()
    scrollToTop()
  }

  return (
    <header className={open ? 'menu is-open' : 'menu'}>
      <nav className="menu-inner" aria-label="Sections">
        <ul>
          {PAGES.map((p) => (
            <li key={p.path}>
              <NavLink
                to={p.path}
                className={({ isActive }) => (isActive ? 'menu-link is-here' : 'menu-link')}
                onClick={same(p.path)}
              >
                {p.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  )
}
