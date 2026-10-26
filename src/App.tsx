import { useEffect } from 'react'
import { Link, Route, Routes, useLocation } from 'react-router-dom'
import Nav from './components/Nav'
import FloatingNav from './components/FloatingNav'
import Home from './pages/Home'
import HowIThink from './pages/HowIThink'
import Log from './pages/Log'
import Now from './pages/Now'

/** Hash links from other routes (/#recital) need a nudge after navigation. */
function HashScroll() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash) {
      const el = document.querySelector(hash)
      if (el) { el.scrollIntoView({ behavior: 'smooth' }); return }
    }
    window.scrollTo({ top: 0 })
  }, [pathname, hash])
  return null
}

export default function App() {
  const home = useLocation().pathname === '/'
  return (
    <>
      <a href="#main" className="sr-only">Skip to content</a>
      {/* The recital room is a full-viewport pinned stage, so it can't share
          the top of the screen with a bar — the stage ends up cropped. On the
          front page the floating rail is the navigation, and the name sits as
          a small fixed mark instead. */}
      {home ? <Link to="/" className="brand-mark">Ivan Ho</Link> : <Nav />}
      <HashScroll />
      <main id="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/how-i-think" element={<HowIThink />} />
          <Route path="/log" element={<Log />} />
          <Route path="/log/:slug" element={<Log />} />
          <Route path="/now" element={<Now />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
      <FloatingNav />
    </>
  )
}
