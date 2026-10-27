import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Link, useParams } from 'react-router-dom'
import Todo from '../components/Todo'
import ToneLegend from '../components/ToneLegend'
import { POSTS } from '../lib/posts'

/**
 * Writing — the essay and the log in one sheet. A post opens in the same
 * sheet at /writing/<slug>, so reading one is a route change rather than a
 * second destination to find.
 */

function Post({ slug }: { slug: string }) {
  const post = POSTS.find((p) => p.slug === slug)
  if (!post) {
    return (
      <section className="section">
        <h1 className="h-hero">No such post</h1>
        <p><Link to="/writing">Back to the writing</Link></p>
      </section>
    )
  }
  return (
    <article className="section">
      <p className="eyebrow">{post.date}{post.draft && ' · draft'}</p>
      <h1 className="h-hero">{post.title}</h1>
      <div className="prose">
        <Markdown remarkPlugins={[remarkGfm]}>{post.body}</Markdown>
      </div>
      <p style={{ marginTop: 'var(--space-7)' }}><Link to="/writing">← Everything else</Link></p>
    </article>
  )
}

export default function Writing() {
  const { slug } = useParams()
  if (slug) return <Post slug={slug} />

  return (
    <section className="section">
      <h1 className="h-hero">A fugue and a refactor<br />feel like the same activity</h1>

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
        writing in the whole brief and it should be in your words, not mine. Aim
        for ~200 words. One structural note: the room already makes this claim and
        the two scores demonstrate it, so this page should go somewhere neither
        can — argue it, or tell the story of when you first noticed.
      </Todo>

      <h2 className="h-rule">Why four colours</h2>
      <ToneLegend />
      <Todo>
        Hakka. You said it’s still part of the story, but Hakka tone inventories
        run to six or more and vary by variety, so a four-colour system can’t hold
        it. Tell me which variety you speak and its tone values, and I’ll give
        Hakka its own treatment on the neutral family rather than forcing new hues
        into the palette.
      </Todo>

      <h2 className="h-rule">Log</h2>
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
              <span className="index-meta">{p.date}{p.draft && ' · draft'}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
