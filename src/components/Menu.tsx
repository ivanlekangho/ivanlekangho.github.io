import { Link } from 'react-router-dom'
import { PANELS, SECTIONS, goToPanel } from '../lib/deck'

/**
 * The bar.
 *
 * It is the hero's own nav bar, kept. On the first screen that bar is part
 * of the picture — four boxes ruled across the top third, above the name —
 * and when the reader moves right it stays exactly where it was and in
 * exactly the same hand, so it reads as one bar that the page slid out from
 * under rather than as two bars that look alike. That is the whole reason
 * it is hairline boxes and not a floating pill.
 *
 * Which is also why it is absent on the hero: the hero is already drawing
 * it. Showing both would be the same bar twice, two pixels apart.
 *
 * Five entries, and the hall is deliberately not one of them. It sits at
 * the far right as the thing the site arrives at, and an entry in the bar
 * would turn the end of the argument into a tab.
 *
 * Every entry now simply goes to a panel — About included, which used to be
 * the one button here that opened a layer instead of travelling.
 */


export default function Menu({ at, onHome }: { at: number; onHome: boolean }) {
  /* Hidden on the hero, which has the bar built into it. A post has no hero
     above it, so the bar is simply always there. */
  const shown = !onHome || at > 0
  const here = onHome ? PANELS[at] : null

  const home = (e: React.MouseEvent) => {
    if (!onHome) return
    e.preventDefault()
    goToPanel('hero')
  }

  return (
    <header className={shown ? 'menu is-shown' : 'menu'}>
      <nav className="menu-inner" aria-label="Sections">
        {onHome ? (
          <a href="#hero" className="menu-brand" onClick={home}>Ivan Ho</a>
        ) : (
          <Link to="/" className="menu-brand">Ivan Ho</Link>
        )}

        <ul>
          {SECTIONS.map((s) => (
            <li key={s.id}>
              <a
                href={onHome ? `#${s.id}` : `/#${s.id}`}
                className={here === s.id ? 'menu-link is-here' : 'menu-link'}
                aria-current={here === s.id ? 'true' : undefined}
                onClick={(e) => {
                  if (!onHome) return
                  e.preventDefault()
                  goToPanel(s.id)
                }}
              >
                {s.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  )
}
