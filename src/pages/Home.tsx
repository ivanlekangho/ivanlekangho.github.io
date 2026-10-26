import About from '../sections/About'
import Work from '../sections/Work'
import Impact from '../sections/Impact'
import Projects from '../sections/Projects'
import Centerpiece from '../components/Centerpiece'
import Recital from '../sections/Recital'
import Education from '../sections/Education'
import Skills from '../sections/Skills'
import Contact from '../sections/Contact'

export default function Home() {
  return (
    <>
      <About />
      <div className="motif motif-divider" aria-hidden="true" />
      <Work />
      <Impact />
      <Projects />
      <Centerpiece />
      <Recital />
      <Education />
      <Skills />
      <Contact />
    </>
  )
}
