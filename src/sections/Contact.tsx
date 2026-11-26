import Chapters, { type Chapter } from '../components/Chapters'

const LINKS = [
  { label: 'Email', value: 'hoivan@stanford.edu', href: 'mailto:hoivan@stanford.edu' },
  { label: 'GitHub', value: 'github.com/ivanlekangho', href: 'https://github.com/ivanlekangho' },
  { label: 'LinkedIn', value: 'linkedin.com/in/ivanhonz', href: 'https://www.linkedin.com/in/ivanhonz' },
]

export default function Contact() {
  const chapters: Chapter[] = [
    {
      id: 'reach-me',
      label: 'Reach me',
      body: (
        <>
          <p className="eyebrow" data-reveal>Reach me</p>
          <h2 className="chapter-head" data-reveal>Three ways, all of them read</h2>
          <ul className="index" data-reveal>
            {LINKS.map((l) => (
              <li key={l.label} className="index-row">
                <span className="index-main"><a href={l.href}>{l.label}</a></span>
                <span className="index-sub">{l.value}</span>
                <span className="index-meta" />
              </li>
            ))}
          </ul>
        </>
      ),
    },
    {
      id: 'colophon',
      label: 'Colophon',
      body: (
        <>
          <p className="eyebrow" data-reveal>Colophon</p>
          <h2 className="chapter-head" data-reveal>How this was made</h2>
          <p className="colophon" data-reveal>
            Built from scratch. Vite, React, TypeScript, plain CSS. The notation,
            the hall and the Steinway are hand-written SVG — no template, no CSS
            framework, no animation library. Geist and Commit Mono.
            {' '}<a href="https://github.com/ivanlekangho/ivanlekangho.github.io">Source</a>.
          </p>
        </>
      ),
    },
  ]

  return <Chapters title="Say hello" chapters={chapters} />
}
