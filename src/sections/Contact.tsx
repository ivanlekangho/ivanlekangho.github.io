const LINKS = [
  { label: 'Email', value: 'hoivan@stanford.edu', href: 'mailto:hoivan@stanford.edu' },
  { label: 'GitHub', value: 'github.com/ivanlekangho', href: 'https://github.com/ivanlekangho' },
  { label: 'LinkedIn', value: 'linkedin.com/in/ivanhonz', href: 'https://www.linkedin.com/in/ivanhonz' },
]

export default function Contact() {
  return (
    <section id="contact" className="band band-last">
      <div className="shell">
        <p className="eyebrow">Contact</p>
        <h2 className="h-hero">Say hello</h2>

        <ul className="index">
          {LINKS.map((l) => (
            <li key={l.label} className="index-row">
              <span className="index-main"><a href={l.href}>{l.label}</a></span>
              <span className="index-sub">{l.value}</span>
              <span className="index-meta" />
            </li>
          ))}
        </ul>

        <p className="colophon">
          Built from scratch. Vite, React, TypeScript, plain CSS. The notation, the
          hall and the Steinway are hand-written SVG — no template, no CSS
          framework, no animation library. Cabinet Grotesk and Commit Mono.
          {' '}<a href="https://github.com/ivanlekangho/ivanlekangho.github.io">Source</a>.
        </p>
      </div>
    </section>
  )
}
