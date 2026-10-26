import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Link, useParams } from 'react-router-dom'
import { POSTS } from '../lib/posts'

export default function Log() {
  const { slug } = useParams()

  if (slug) {
    const post = POSTS.find((p) => p.slug === slug)
    if (!post) {
      return (
        <div className="shell section">
          <h2>No such post</h2>
          <p><Link to="/log">Back to the log</Link></p>
        </div>
      )
    }
    return (
      <article className="shell section">
        <p className="eyebrow">{post.date}{post.draft && ' · draft'}</p>
        <h1 style={{ fontSize: 'var(--step-4)' }}>{post.title}</h1>
        <div className="rule-short" />
        <div style={{ maxWidth: 'var(--measure)' }}>
          <Markdown remarkPlugins={[remarkGfm]}>{post.body}</Markdown>
        </div>
        <p style={{ marginTop: 'var(--space-7)' }}><Link to="/log">&larr; All posts</Link></p>
      </article>
    )
  }

  return (
    <div className="shell section">
      <p className="eyebrow">Log</p>
      <h1 style={{ fontSize: 'var(--step-4)' }}>Build logs and other thinking</h1>
      <div className="rule-short" />
      {POSTS.length === 0 ? (
        <p className="lede">Nothing here yet.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: 'var(--space-4)' }}>
          {POSTS.map((p) => (
            <li key={p.slug} className="card">
              <p className="eyebrow" style={{ marginBottom: 'var(--space-1)' }}>
                {p.date}{p.draft && ' · draft'}
              </p>
              <h3 style={{ marginBottom: 'var(--space-2)' }}>
                <Link to={`/log/${p.slug}`} style={{ textDecoration: 'none', color: 'var(--ink)' }}>
                  {p.title}
                </Link>
              </h3>
              <p className="muted" style={{ marginBottom: 'var(--space-2)' }}>{p.summary}</p>
              {p.tags.map((t) => <span key={t} className="tag" style={{ marginRight: 6 }}>{t}</span>)}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
