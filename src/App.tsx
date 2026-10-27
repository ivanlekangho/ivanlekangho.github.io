import { Link, Navigate, Route, Routes, useParams } from 'react-router-dom'
import FloatingNav, { SECTIONS } from './components/FloatingNav'
import Panel from './components/Panel'
import RecitalRoom from './components/stage/RecitalRoom'
import About from './sections/About'
import Work from './sections/Work'
import Recital from './sections/Recital'
import Contact from './sections/Contact'
import Writing from './pages/Writing'

/**
 * The hall is always mounted. Every other route is a sheet over the top of
 * it, which is why the stage never reloads, the lighting never resets, and
 * the back button closes a panel instead of leaving the site.
 *
 * Five destinations, down from eleven. The old eleven were mostly one thin
 * page each — a four-line education page, a stack page, a now page — and a
 * reader who opens "About" has already asked for all three. Everything
 * those pages held is still here; it is just no longer eleven doors.
 */

const PANELS: Record<string, React.ReactNode> = {
  '/about': <About />,
  '/recital': <Recital />,
  '/work': <Work />,
  '/writing': <Writing />,
  '/contact': <Contact />,
}

/** Where the eleven old URLs went. Someone's bookmark should still land. */
const MOVED: [string, string][] = [
  ['/impact', '/work'],
  ['/projects', '/work'],
  ['/education', '/about'],
  ['/skills', '/about'],
  ['/now', '/about'],
  ['/how-i-think', '/writing'],
  ['/log', '/writing'],
]

/** /log/<slug> is now /writing/<slug>; the slug has to survive the move. */
function MovedPost() {
  const { slug } = useParams()
  return <Navigate to={`/writing/${slug}`} replace />
}

export default function App() {
  return (
    <>
      <a href="#main" className="sr-only">Skip to content</a>
      <Link to="/" className="brand-mark">
        <span className="brand-name">Ivan Ho</span>
        <span className="brand-sub">Baritone · Stanford CS</span>
      </Link>

      <main id="main">
        <RecitalRoom />
        <Routes>
          <Route path="/" element={null} />
          {SECTIONS.map((s) => (
            <Route key={s.to} path={s.to}
              element={<Panel title={s.label} index={s.num} wide={s.wide}>{PANELS[s.to]}</Panel>} />
          ))}
          <Route path="/writing/:slug"
            element={<Panel title="Writing" index="04" wide>{<Writing />}</Panel>} />
          {MOVED.map(([from, to]) => (
            <Route key={from} path={from} element={<Navigate to={to} replace />} />
          ))}
          <Route path="/log/:slug" element={<MovedPost />} />
          <Route path="*" element={null} />
        </Routes>
      </main>

      <FloatingNav />
    </>
  )
}
