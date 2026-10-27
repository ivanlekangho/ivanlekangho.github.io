import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

/**
 * The menu bar.
 *
 * It is not there while you are in the hall — the hall is one screen with
 * one control on it, and a navigation bar across the top of it would be a
 * second thing to read. It arrives the moment you leave, and from then on
 * every part of the site, the hall included, is one click away.
 *
 * The icon rail this replaces was eleven glyphs, then five words floating
 * at the edge of the room. Both were navigation pretending not to be
 * navigation. A bar is what people expect once a page scrolls.
 */

export const SECTIONS = [
  { id: 'room', label: 'The room' },
  { id: 'about', label: 'About' },
  { id: 'work', label: 'Work' },
  { id: 'writing', label: 'Writing' },
  { id: 'contact', label: 'Contact' },
]

export default function Menu() {
  const onHome = useLocation().pathname === '/'
  /* A post has no hall above it, so the bar is simply always there. */
  const [shown, setShown] = useState(!onHome)
  const [here, setHere] = useState<string | null>(null)

  useEffect(() => {
    if (!onHome) { setShown(true); return }
    const onScroll = () => setShown(window.scrollY > window.innerHeight * 0.4)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [onHome])

  /* Which section is being read, so the bar can say where you are. The
     observer band sits in the upper third of the viewport: a section counts
     as current once its top has passed under the bar, not when it first
     peeks in from below.
     Several sections can be inside that band at once, so the callback
     maintains the set and picks the furthest down the page. Taking the last
     entry in the callback instead left the bar one section behind, because
     the order entries arrive in is not document order. */
  useEffect(() => {
    if (!onHome) return
    const els = SECTIONS.map((s) => document.getElementById(s.id)).filter(Boolean) as HTMLElement[]
    if (!els.length) return
    const live = new Set<string>()
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) live.add(e.target.id)
          else live.delete(e.target.id)
        }
        const ids = SECTIONS.map((s) => s.id).filter((id) => live.has(id))
        setHere(ids.length ? ids[ids.length - 1] : null)
      },
      { rootMargin: '-15% 0px -60% 0px', threshold: 0 },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [onHome])

  const top = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setHere(null)
  }

  return (
    <header className={shown ? 'menu is-shown' : 'menu'}>
      <nav className="menu-inner" aria-label="Sections">
        {onHome ? (
          <button type="button" className="menu-brand" onClick={top}>
            Ivan Ho<span>The hall</span>
          </button>
        ) : (
          <Link to="/" className="menu-brand">Ivan Ho<span>Back to the hall</span></Link>
        )}

        <ul>
          {SECTIONS.map((s) => (
            <li key={s.id}>
              <a href={onHome ? `#${s.id}` : `/#${s.id}`}
                className={here === s.id ? 'is-here' : undefined}
                aria-current={here === s.id ? 'true' : undefined}>
                {s.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  )
}
