import { useEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Brand from './components/Brand'
import Menu from './components/Menu'
import { scrollToTop } from './lib/scroll'
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
 * The recital room is gone. It walked one phrase of Schubert through three
 * readings on a rail, over a drawn stage, under a lighting board that
 * interpolated twenty-six colours a frame — a great deal of machinery for
 * one argument, and an argument that reads better stated twice and quietly
 * than performed once and loudly. What survives is the two halves of it
 * that were worth keeping: the engraved bar under About, and the tone
 * generator under Creative.
 */

/** Where the old URLs went — the deck's hashes included. Nobody's bookmark
 *  breaks, and the hashes have to be caught in JS because a fragment never
 *  reaches the router. */
const MOVED: [string, string][] = [
  /* The recital room is gone; its argument is in two places now — the
     score under About, the physics under Creative — so both of its old
     URLs land on the nearer of the two. */
  ['/recital', '/creative'],
  ['/hall', '/creative'],
  ['/music', '/creative'],
  ['/work', '/impact'],
  ['/projects', '/impact'],
  ['/writing', '/impact'],
  ['/log', '/impact'],
  ['/skills', '/education'],
  ['/now', '/home'],
  ['/how-i-think', '/home'],
]

const HASH_TO_PATH: Record<string, string> = {
  hero: '/home',
  impact: '/impact',
  work: '/impact',
  creative: '/creative',
  music: '/creative',
  education: '/education',
  about: '/about',
  contact: '/contact',
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

/**
 * Every page starts at its own top.
 *
 * Two things are needed and the obvious one is not enough. Scrolling to
 * zero on a route change handles going from one page to another; what it
 * does not handle is the browser putting you back where you were, which it
 * does on its own on a back or a reload — so restoration is turned off and
 * this owns the scroll position outright. Clicking the bar entry for the
 * page you are already on is handled in the bar itself, because the route
 * does not change and nothing here fires.
 *
 * `instant`, not smooth: arriving at a page should put you at its top, not
 * fly you there past content you did not ask to see. The html rule says
 * smooth, which is right for a click on a dot and wrong for a navigation.
 *
 * It goes through lib/scroll because a bare `scrollTo` does not work on
 * these pages: mandatory snapping refuses the jump. See the note there.
 */
function ToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
  }, [])
  useEffect(() => { scrollToTop(false) }, [pathname])
  return null
}

export default function App() {
  const { pathname } = useLocation()
  const open = pathname === '/home'
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
          {/* The front page has a name of its own. `/` is kept as the way
              in — a bare domain has to land somewhere — and replaces itself
              so the back button does not bounce between the two. */}
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={null} />
          <Route path="/impact" element={<Impact />} />
          <Route path="/creative" element={<Creative />} />
          <Route path="/education" element={<Education />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/writing/:slug" element={<Post />} />
          {MOVED.map(([from, to]) => (
            <Route key={from} path={from} element={<Navigate to={to} replace />} />
          ))}
          <Route path="/log/:slug" element={<Navigate to="/impact" replace />} />
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </main>
    </>
  )
}
