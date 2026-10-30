import { Link } from 'react-router-dom'
import Card from '../components/Card'
import Todo from '../components/Todo'
import { POSTS } from '../lib/posts'

/**
 * Writing — the essay, the open questions, the log.
 *
 * The two papers are writing as well, and they are not duplicated here:
 * they sit with the work they came out of, and this section points at them
 * rather than listing them twice.
 *
 * The "looking into" list is deliberately phrased as open questions rather
 * than as expertise. Everything in it came from Ivan's own notes, and none
 * of it is finished work; saying otherwise would be the easiest way to make
 * this section untrue.
 */

const LOOKING = [
  {
    title: 'Language technology for languages without data',
    family: 't3',
    text: 'Models answer in Hakka confidently and wrongly. The languages with the most text get the best tools, better tools make a language easier to live in, and the gap compounds on its own. What does a usable system look like when the corpus is a few thousand sentences and most speakers are over sixty?',
  },
  {
    title: 'Who owns a recording of your grandmother',
    family: 't1',
    text: 'Indigenous language and data sovereignty — Te Hiku Media’s licence, Māori data sovereignty frameworks. A speech corpus is not a neutral asset, and the people who built the archive are usually not the people who end up monetising it.',
  },
  {
    title: 'Censorship as an engineering artefact',
    family: 't4',
    text: 'Chinese-language text analysis and platform asymmetry: what is sayable on Weibo, and what Douyin surfaces that TikTok does not for the same query. The interesting part is that the difference is measurable.',
  },
  {
    title: 'Who the health system is built to understand',
    family: 't2',
    text: 'Māori health outcomes in New Zealand, limited-English-proficiency patients in the US, and the stigma around STI and HIV care that keeps people out of a clinic they are entitled to walk into.',
  },
]

export default function Writing() {
  return (
    <section id="writing" className="band">
      <div className="shell">
        <p className="eyebrow">Writing</p>
        <h2 className="h-hero">A fugue and a refactor<br />feel like the same activity</h2>

        <div className="prose">
          <p>
            Both start with a subject — a musical phrase or a function — stated
            plainly, so you know what you’re listening for. Then it comes back
            changed. A different voice carries it, or the same phrase drops into a
            new key. A good refactor doesn’t touch what a function does; it changes
            who’s carrying the idea, and how clearly. A good fugue keeps its subject
            and just keeps finding new rooms for it to stand in.
          </p>
          <p>
            This is part of why linguistics never felt separate from either one. A
            Mandarin syllable carries part of its meaning in pitch. Get the tone
            wrong and the word changes — it doesn’t just sound wrong. Code has a
            similar brittleness. Change one character and the meaning breaks, not
            just the look of it.
          </p>
        </div>

        <Todo>
          This is your draft from the brief, lightly tightened — it’s the strongest
          writing you sent me and it should be in your words. Aim for ~200 words.
          One structural note: the hall above already makes this claim and the two
          scores demonstrate it, so this should go somewhere neither can — argue
          it, or tell the story of when you first noticed.
        </Todo>

        <h3 className="h-rule">Papers</h3>
        <p className="lede">
          The two longest things written are filed with the work they came out of:{' '}
          <a href="#projects">authorship inequality in international collaboration</a>
          {' '}under Projects, and{' '}
          <a href="#impact">the digital machinery of Uyghur oppression</a> under
          Impact. Both open to a sample.
        </p>

        <h3 className="h-rule">Looking into</h3>
        {/* Open questions, not expertise — and side by side rather than
            stacked, because four full-width paragraphs read as four essays
            you have to get through to find the one you care about. */}
        <div className="cards">
          {LOOKING.map((l) => (
            <Card key={l.title} kind="Question" title={l.title} line={l.text}
              tint={l.family} />
          ))}
        </div>

        <h3 className="h-rule">Log</h3>
        {POSTS.length === 0 ? (
          <p className="lede">Nothing here yet.</p>
        ) : (
          <ul className="index">
            {POSTS.map((p) => (
              <li key={p.slug} className="index-row">
                <span className="index-main">
                  <Link to={`/writing/${p.slug}`}>{p.title}</Link>
                </span>
                <span className="index-sub">{p.summary}</span>
                <span className="index-meta">{p.date}{p.draft && ' — draft'}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
