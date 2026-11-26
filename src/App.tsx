import { useEffect } from 'react'
import { Navigate, Route, Routes, useLocation, useParams } from 'react-router-dom'
import Hero from './components/Hero'
import Menu from './components/Menu'
import Hall from './components/stage/Hall'
import { goToPanel, useDeck } from './lib/deck'
import { useHallScroll } from './lib/hallScroll'
import { useReveal } from './lib/reveal'
import About from './sections/About'
import Impact from './sections/Impact'
import Creative from './sections/Creative'
import Education from './sections/Education'
import Contact from './sections/Contact'
import Post from './pages/Post'

/**
 * One page, read sideways.
 *
 * Six panels in a row, each exactly one screen: the name, then the work,
 * then the music, the schools, the address, and the recital room at the far
 * end. The wheel, the arrow keys and the bar across the top all move between
 * them; a panel holding more than a screen still scrolls down inside itself.
 * lib/deck.ts is where that is decided.
 *
 * The hall used to be the first thing anybody met and is now the last.
 * That is a real demotion and it is the right one: the room is an argument
 * about one phrase of Schubert read three ways, and it is a much better
 * thing to arrive at than to be stopped by. Nothing about it changed except
 * where it sits — the lights, the rail and the three readings are as they
 * were, and the wheel still walks them once you are in there.
 *
 * About is a panel of its own, between the schools and the address. In a
 * page that scrolls down, a screen of biography in the middle is a wall
 * across the thing people came to look at, which is why it spent a while as
 * a sheet. Read sideways it costs nothing: it is one swipe, and anyone who
 * does not want it passes it in the gesture they were already making.
 */

/** Where the old URLs went. Nobody's bookmark breaks. */
const MOVED: [string, string][] = [
  ['/recital', '/#creative'],
  ['/music', '/#creative'],
  ['/about', '/#about'],
  ['/work', '/#impact'],
  ['/impact', '/#impact'],
  ['/projects', '/#impact'],
  ['/skills', '/#education'],
  ['/education', '/#education'],
  ['/now', '/'],
  ['/writing', '/#impact'],
  ['/how-i-think', '/'],
  ['/log', '/#impact'],
  ['/contact', '/#contact'],
]

/** Hashes that named a section before it was renamed. */
const ALIAS: Record<string, string> = { music: 'creative', recital: 'creative', work: 'impact' }

function MovedPost() {
  const { slug } = useParams()
  return <Navigate to={`/writing/${slug}`} replace />
}

function Home() {
  return (
    <div className="deck">
      <Hero />
      <Impact />
      <Creative />
      <Education />
      <About />
      <Contact />
      <Hall />
    </div>
  )
}

/**
 * React Router owns the path but not the fragment, so arriving at /#impact
 * from outside — or from a redirect — needs the move done by hand. It goes
 * through the deck rather than through scrollIntoView: a panel is a column
 * in a horizontal scroller, and asking the browser to bring it into view
 * will often scroll the nearest ancestor instead and leave the deck between
 * two panels.
 */
function HashScroll() {
  const { pathname, hash, key } = useLocation()
  useEffect(() => {
    if (!hash) return
    const raw = decodeURIComponent(hash.slice(1))
    const id = ALIAS[raw] ?? raw
    /* The panel may not be laid out yet on a first load or a redirect — web
       fonts alone move everything — so this keeps asking for a few frames
       rather than moving once to the wrong place. */
    let raf = 0
    let tries = 0
    const go = () => {
      /* No animation on the first attempt: arriving at a URL should put you
         where the URL says, not slide you there from the hero. */
      if (goToPanel(id, tries === 0 ? 'auto' : 'smooth')) return
      /* A post is an ordinary vertical document with ordinary anchors. */
      const el = document.getElementById(id)
      if (el) { el.scrollIntoView({ behavior: 'smooth' }); return }
      if (tries++ < 30) raf = requestAnimationFrame(go)
    }
    raf = requestAnimationFrame(go)
    return () => cancelAnimationFrame(raf)
  }, [pathname, hash, key])
  return null
}

export default function App() {
  const { pathname } = useLocation()
  const onHome = pathname === '/'
  const at = useDeck(onHome)
  useHallScroll(onHome)
  useReveal(pathname)

  return (
    <>
      <a href="#impact" className="sr-only">Skip to content</a>
      <Menu at={onHome ? at : 1} onHome={onHome} />
      <HashScroll />
      <main id="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/writing/:slug" element={<Post />} />
          {MOVED.map(([from, to]) => (
            <Route key={from} path={from} element={<Navigate to={to} replace />} />
          ))}
          <Route path="/log/:slug" element={<MovedPost />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  )
}
