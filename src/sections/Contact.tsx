import Chapters, { type Chapter } from '../components/Chapters'
import { FIELD, LEADS, type Greeting } from '../data/greetings'

/**
 * Say Hello — in twenty-four languages, seven of them out loud.
 *
 * The greetings are the page, not an ornament on it. This is a site about
 * who a system is built to understand, written by somebody whose first
 * language a model answers in confidently and wrongly, and the contact page
 * is the one place where saying the same simple thing twenty-four ways is
 * the argument rather than a decoration of it.
 *
 * Each word carries its own `lang`, which is what gets it the right face
 * from the system and the right voice from a screen reader, and `dir` where
 * the script runs the other way. Arabic and Hebrew render wrongly without
 * it, and this is not the site to get that wrong on.
 *
 * The cloud itself is hidden from assistive technology. Not because the
 * words do not matter — because twenty-four greetings read aloud in a row,
 * with no context and no pause, is noise where the page's actual content is
 * three links. The seven that lead are named in the key below, which is
 * read.
 */
function Cloud() {
  const all: Greeting[] = [...FIELD, ...LEADS]
  return (
    <div className="greetings" aria-hidden="true">
      {all.map((g, i) => (
        <span
          key={g.word + g.lang}
          className={g.name ? 'greet is-lead' : 'greet'}
          lang={g.lang}
          dir={g.rtl ? 'rtl' : undefined}
          style={{
            '--x': `${g.x}%`,
            '--y': `${g.y}%`,
            '--s': g.size,
            '--o': g.ink,
            /* Spread so they do not all breathe together, which would read
               as one object pulsing rather than as a field. */
            '--d': `${(i % 7) * 0.9}s`,
          } as React.CSSProperties}
        >
          {g.word}
        </span>
      ))}
    </div>
  )
}

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
      id: 'in-which-language',
      label: 'Languages',
      body: (
        <>
          <p className="eyebrow" data-reveal>Languages</p>
          <h2 className="chapter-head" data-reveal>In whichever of these you like</h2>
          <ul className="key" data-reveal>
            {LEADS.map((g) => (
              <li key={g.word + g.lang}>
                <span className="key-word" lang={g.lang} dir={g.rtl ? 'rtl' : undefined}>
                  {g.word}
                </span>
                <span className="key-name">{g.name}</span>
              </li>
            ))}
          </ul>
          <p className="aside" data-reveal>
            你好 is the same two characters in both scripts, so the pair above
            is 哈囉 and 哈喽 — “hello” itself, which does differ.
          </p>
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

  return (
    <Chapters
      title={<em>Say Hello</em>}
      backdrop={<Cloud />}
      chapters={chapters}
    />
  )
}
