import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Link, useParams } from 'react-router-dom'
import { POSTS } from '../lib/posts'

/** A single log post, on its own page rather than inside a panel. */
export default function Post() {
  const { slug } = useParams()
  const post = POSTS.find((p) => p.slug === slug)

  if (!post) {
    return (
      <section className="band band-last">
        <div className="shell">
          <h1 className="h-hero">No such post</h1>
          <p><Link to="/#writing">Back to the writing</Link></p>
        </div>
      </section>
    )
  }

  return (
    <article className="band band-last">
      <div className="shell">
        <p className="eyebrow">{post.date}{post.draft && ' — draft'}</p>
        <h1 className="h-hero">{post.title}</h1>
        <div className="prose">
          <Markdown remarkPlugins={[remarkGfm]}>{post.body}</Markdown>
        </div>
        <p style={{ marginTop: 'var(--space-8)' }}>
          <Link to="/#writing">← Everything else</Link>
        </p>
      </div>
    </article>
  )
}
