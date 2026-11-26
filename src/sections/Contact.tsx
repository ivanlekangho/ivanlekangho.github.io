import Chapters, { type Chapter } from '../components/Chapters'
import { GREETINGS, TONGUES } from '../data/greetings'

/**
 * Say Hello — the instruction, in as many languages as the page holds.
 *
 * The phrases are the page, not an ornament on it. This is a site about who
 * a system is built to understand, written by somebody whose first language
 * a model answers in confidently and wrongly, and the contact page is the
 * one place where saying the same simple thing twenty-eight ways is the
 * argument rather than a decoration of it.
 *
 * Each phrase carries its own `lang`, which is what gets it the right face
 * from the system and the right voice from a screen reader, and `dir` where
 * the script runs the other way. Arabic and Hebrew render wrongly without
 * it, and this is not the site to get that wrong on.
 *
 * The cloud is hidden from assistive technology, and that is a decision
 * rather than an oversight: twenty-eight greetings read aloud in a row, with
 * no context and no pause, is noise where the page's actual content is three
 * links and a table. The languages Ivan actually speaks are in that table,
 * which is read.
 */
function Cloud() {
  return (
    <div className="greetings" aria-hidden="true">
      {GREETINGS.map((g, i) => (
        <span
          key={g.say + g.lang}
          className={g.size >= 1.8 ? 'greet is-lead' : 'greet'}
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
          {g.say}
        </span>
      ))}
    </div>
  )
}

const LINKS = [
  { label: 'Email', value: 'hoivan@stanford.edu', href: 'mailto:hoivan@stanford.edu' },
  { label: 'LinkedIn', value: 'linkedin.com/in/ivanhonz', href: 'https://www.linkedin.com/in/ivanhonz' },
  { label: 'GitHub', value: 'github.com/ivanlekangho', href: 'https://github.com/ivanlekangho' },
]

export default function Contact() {
  const chapters: Chapter[] = [
    {
      id: 'reach-me',
      label: 'Reach me',
      body: (
        <>
          {/* The heading carries the red now and the small label above it is
              gone. Two red lines stacked made the eyebrow look like a
              mis-set version of the heading rather than a label for it. */}
          <h2 className="chapter-head is-accent" data-reveal>Reach Me</h2>
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
          <h2 className="chapter-head is-accent" data-reveal>Languages</h2>
          {/* Each language in its own name first, then in English, then how
              well. The two Chinese rows differ in script as well as in
              language, and the characters themselves are the evidence of
              that — they carried "simplified" and "traditional" labels
              until the characters were left to say it. */}
          {/* The SAME grid as Reach Me above, by using the same classes
              rather than a second set tuned to look similar. The table had
              its own `.tongues` layout capped at 34rem, so it sat short and
              left while the links beside it ran the full width, and the
              three columns did not line up with the three above them. One
              list markup, one set of columns, both tables aligned. */}
          <ul className="index" data-reveal>
            {TONGUES.map((t) => (
              <li key={t.lang} className="index-row">
                <span className="index-main tongue-own" lang={t.lang}>{t.own}</span>
                <span className="index-sub">{t.name}</span>
                <span className="index-meta">{t.level}</span>
              </li>
            ))}
          </ul>
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
