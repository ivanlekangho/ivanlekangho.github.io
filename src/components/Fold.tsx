import type { ReactNode } from 'react'

/**
 * A heading that holds a table shut until someone wants it.
 *
 * Record is six tables — study, prizes, languages, tools — and open they
 * run to four thousand pixels, which is a quarter of the page spent on
 * things that are true but not the point. Shut, they are six lines, and a
 * reader who came for the dates is one click from each of them.
 *
 * A real <details>, not a scripted accordion: it opens without JavaScript,
 * the browser gives it the right role and state for free, and ⌘F finds the
 * text inside a closed one in current browsers.
 */
export default function Fold({
  title, count, open, children,
}: {
  title: string
  /** What is inside, said on the outside — a closed fold should not be a
   *  guess about whether it is worth opening. */
  count?: string
  open?: boolean
  children: ReactNode
}) {
  return (
    <details className="fold" open={open}>
      <summary>
        <span className="fold-title">{title}</span>
        {count && <span className="fold-count">{count}</span>}
      </summary>
      <div className="fold-body">{children}</div>
    </details>
  )
}
