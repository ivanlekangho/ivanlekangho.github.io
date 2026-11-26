import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Link, Navigate, useParams } from 'react-router-dom'
import { POSTS } from '../lib/posts'

/**
 * A single log post, on its own page rather than inside a panel.
 *
 * A DRAFT IS NOT PUBLISHED. The one post in here is a skeleton — a heading
 * list with "DRAFT OUTLINE, not written yet" at the top and TODO under
 * every section — and `/writing/:slug` renders whatever it is given, so it
 * was a public page. Nothing links to it, which is not the same as nobody
 * reaching it: the SPA fallback serves this route to anyone with the URL,
 * crawlers included.
 *
 * So a draft goes where the other log URLs go. Same rule as the dev-only
 * notes and the "Needs a description" placeholder: a note from me to Ivan,
 * or a page Ivan has not written yet, is not a thing a reader should ever
 * be shown.
 */
export default function Post() {
  const { slug } = useParams()
  const post = POSTS.find((p) => p.slug === slug)

  if (post?.draft && !import.meta.env.DEV) return <Navigate to="/impact" replace />

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
        <p className="eyebrow">{post.date}{post.draft && ' (draft)'}</p>
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
