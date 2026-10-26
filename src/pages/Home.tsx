import About from '../sections/About'
import Work from '../sections/Work'
import Impact from '../sections/Impact'
import Projects from '../sections/Projects'
import RecitalRoom from '../components/stage/RecitalRoom'
import Recital from '../sections/Recital'
import Education from '../sections/Education'
import Skills from '../sections/Skills'
import Contact from '../sections/Contact'

export default function Home() {
  return (
    <>
      <RecitalRoom />
      <About />
      <div className="motif motif-divider" aria-hidden="true" />
      <Work />
      <Impact />
      <Projects />
      <Recital />
      <Education />
      <Skills />
      <Contact />
    </>
  )
}
