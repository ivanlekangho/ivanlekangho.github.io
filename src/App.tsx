import { useEffect, useState } from 'react'
import { Navigate, Route, Routes, useLocation, useParams } from 'react-router-dom'
import AboutSheet from './components/AboutSheet'
import Menu from './components/Menu'
import Hall from './components/stage/Hall'
import { useHallScroll } from './lib/hallScroll'
import { useReveal } from './lib/reveal'
import Impact from './sections/Impact'
import Music from './sections/Music'
import Education from './sections/Education'
import Contact from './sections/Contact'
import Post from './pages/Post'

/**
 * One page.
 *
 * The hall is the first screen and the wheel walks its three readings;
 * past the last one the page scrolls normally through everything else, and
 * the menu bar arrives as soon as the hall is behind you. Sections are
 * anchors on that page rather than routes, because the thing a reader
 * wants after the hall is the explanation of it, not a destination to go
 * and find.
 *
 * The URLs that used to open panels still work: they land on the matching
 * anchor, so nobody's bookmark breaks.
 */

/** Where the old panel URLs went. */
const MOVED: [string, string][] = [
  ['/recital', '/#music'],
  /* About is a sheet in the hall now, not a section, so its old URL lands
     at the top of the page where the doorway is. */
  ['/about', '/'],
  ['/work', '/#impact'],
  ['/impact', '/#impact'],
  ['/projects', '/#impact'],
  ['/skills', '/#education'],
  ['/education', '/#education'],
  ['/now', '/'],
  /* The writing section is gone; its two papers are cards under Impact. */
  ['/writing', '/#impact'],
  ['/how-i-think', '/'],
  ['/log', '/#impact'],
  ['/contact', '/#contact'],
]

function MovedPost() {
  const { slug } = useParams()
  return <Navigate to={`/writing/${slug}`} replace />
}

function Home({ onAbout }: { onAbout: () => void }) {
  return (
    <>
      <Hall onAbout={onAbout} />
      <Impact />
      <Music />
      <Education />
      <Contact />
    </>
  )
}

/**
 * React Router owns the path but not the fragment, so arriving at /#work
 * from outside — or from a redirect — needs the scroll done by hand. One
 * frame later, because the section has to exist first.
 */
function HashScroll() {
  const { pathname, hash, key } = useLocation()
  useEffect(() => {
    if (!hash) return
    const id = decodeURIComponent(hash.slice(1))
    /* The section may not be laid out yet on a first load or a redirect —
       web fonts alone move everything — so this keeps asking for a few
       frames rather than scrolling once into the wrong place. */
    let raf = 0
    let tries = 0
    const go = () => {
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
  const [about, setAbout] = useState(false)
  useHallScroll(onHome)
  useReveal(pathname)

  return (
    <>
      <a href="#impact" className="sr-only">Skip to content</a>
      <Menu onAbout={() => setAbout(true)} />
      <HashScroll />
      <main id="main">
        <Routes>
          <Route path="/" element={<Home onAbout={() => setAbout(true)} />} />
          <Route path="/writing/:slug" element={<Post />} />
          {MOVED.map(([from, to]) => (
            <Route key={from} path={from} element={<Navigate to={to} replace />} />
          ))}
          <Route path="/log/:slug" element={<MovedPost />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {about && <AboutSheet onClose={() => setAbout(false)} />}
    </>
  )
}
