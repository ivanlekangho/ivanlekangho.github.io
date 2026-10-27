import { Link, Route, Routes } from 'react-router-dom'
import FloatingNav from './components/FloatingNav'
import Panel from './components/Panel'
import RecitalRoom from './components/stage/RecitalRoom'
import About from './sections/About'
import Work from './sections/Work'
import Impact from './sections/Impact'
import Projects from './sections/Projects'
import Recital from './sections/Recital'
import Education from './sections/Education'
import Skills from './sections/Skills'
import Contact from './sections/Contact'
import HowIThink from './pages/HowIThink'
import Log from './pages/Log'
import Now from './pages/Now'

/**
 * The hall is always mounted. Every other route is a sheet over the top of
 * it, which is why the stage never reloads, the lighting never resets, and
 * the back button closes a panel instead of leaving the site.
 */

const SHEETS: { path: string; title: string; wide?: boolean; el: React.ReactNode }[] = [
  { path: '/about', title: 'About', el: <About /> },
  { path: '/work', title: 'Work', el: <Work /> },
  { path: '/impact', title: 'Cancer Society', wide: true, el: <Impact /> },
  { path: '/projects', title: 'Projects', wide: true, el: <Projects /> },
  { path: '/recital', title: 'Recital', el: <Recital /> },
  { path: '/education', title: 'Education', el: <Education /> },
  { path: '/skills', title: 'Skills', wide: true, el: <Skills /> },
  { path: '/contact', title: 'Contact', el: <Contact /> },
  { path: '/how-i-think', title: 'How I think', el: <HowIThink /> },
  { path: '/now', title: 'Now', el: <Now /> },
  { path: '/log', title: 'Log', el: <Log /> },
  { path: '/log/:slug', title: 'Log', el: <Log /> },
]

export default function App() {
  return (
    <>
      <a href="#main" className="sr-only">Skip to content</a>
      <Link to="/" className="brand-mark">
        Ivan Ho<small>Baritone · Stanford CS</small>
      </Link>

      <main id="main">
        <RecitalRoom />
        <Routes>
          <Route path="/" element={null} />
          {SHEETS.map(({ path, title, wide, el }) => (
            <Route key={path} path={path}
              element={<Panel title={title} wide={wide}>{el}</Panel>} />
          ))}
          <Route path="*" element={null} />
        </Routes>
      </main>

      <FloatingNav />
    </>
  )
}
