import Todo from '../components/Todo'

export default function Contact() {
  return (
    <section id="contact" className="section">
      <h1 className="h-hero">Say hello</h1>
      <ul className="index">
        <li className="index-row">
          <span className="index-main"><a href="https://github.com/ivanlekangho">GitHub</a></span>
          <span className="index-sub">github.com/ivanlekangho</span>
          <span className="index-meta" />
        </li>
      </ul>
      <Todo>
        Which email to display publicly (your Stanford address, or something
        else?), LinkedIn, and anything else you want linked.
      </Todo>
      <p className="colophon">
        Built from scratch. Vite, React, TypeScript, plain CSS. The notation,
        the hall and the Steinway are hand-written SVG. No template, no CSS
        framework, no animation library.
      </p>
    </section>
  )
}
