import { useEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Brand from './components/Brand'
import Menu from './components/Menu'
import Hall from './components/stage/Hall'
import { useHallScroll } from './lib/hallScroll'
import { useReveal } from './lib/reveal'
import About from './sections/About'
import Impact from './sections/Impact'
import Creative from './sections/Creative'
import Education from './sections/Education'
import Contact from './sections/Contact'
import Post from './pages/Post'

/**
 * A site with pages.
 *
 * It spent a while as a horizontal deck — six screens in a row that the
 * wheel walked sideways — and that is gone. What it cost was ordinary:
 * the back button meant nothing, a section could not be linked to, and
 * the name in the corner had to appear and disappear as you travelled,
 * which is the thing that finally made it not worth keeping.
 *
 * So: one page per section at its own URL, scrolling the way a page
 * scrolls, and the bar across the top to move between them. The front page
 * is the name at full size; every other page is the same name shrunk into
 * the corner of the bar, and it travels between the two (components/Brand).
 *
 * The recital room keeps its route and is reached from the foot of
 * Creative rather than from the bar.
 */

/** Where the old URLs went — the deck's hashes included. Nobody's bookmark
 *  breaks, and the hashes have to be caught in JS because a fragment never
 *  reaches the router. */
const MOVED: [string, string][] = [
  ['/recital', '/creative'],
  ['/music', '/creative'],
  ['/work', '/impact'],
  ['/projects', '/impact'],
  ['/writing', '/impact'],
  ['/log', '/impact'],
  ['/skills', '/education'],
  ['/now', '/'],
  ['/how-i-think', '/'],
]

const HASH_TO_PATH: Record<string, string> = {
  hero: '/',
  impact: '/impact',
  work: '/impact',
  creative: '/creative',
  music: '/creative',
  education: '/education',
  about: '/about',
  contact: '/contact',
  hall: '/hall',
}

/**
 * The deck's URLs were fragments — /#creative — and a fragment is never
 * sent anywhere a router can see it. Anyone arriving on one of those is
 * arriving from a link somebody already shared, so it is translated here
 * and the address bar is corrected.
 */
function Hashes() {
  const { hash, pathname } = useLocation()
  useEffect(() => {
    if (!hash) return
    const to = HASH_TO_PATH[decodeURIComponent(hash.slice(1))]
    if (to && to !== pathname) window.location.replace(to)
    else if (to) window.history.replaceState(null, '', pathname)
  }, [hash, pathname])
  return null
}

/** Every page starts at its own top. Without this, clicking from halfway
 *  down one page lands you halfway down the next. */
function ToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

export default function App() {
  const { pathname } = useLocation()
  const open = pathname === '/'
  useHallScroll(pathname === '/hall')
  useReveal(pathname)

  return (
    <>
      <a href="#main" className="sr-only">Skip to content</a>
      <Brand open={open} />
      <Menu open={open} />
      <Hashes />
      <ToTop />
      <main id="main" className={open ? 'page is-front' : 'page'}>
        <Routes>
          <Route path="/" element={null} />
          <Route path="/impact" element={<Impact />} />
          <Route path="/creative" element={<Creative />} />
          <Route path="/education" element={<Education />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/hall" element={<Hall />} />
          <Route path="/writing/:slug" element={<Post />} />
          {MOVED.map(([from, to]) => (
            <Route key={from} path={from} element={<Navigate to={to} replace />} />
          ))}
          <Route path="/log/:slug" element={<Navigate to="/impact" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  )
}
