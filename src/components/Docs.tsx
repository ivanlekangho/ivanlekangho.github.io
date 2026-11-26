import { useState } from 'react'
import DocSheet from './DocSheet'
import Mark from './Mark'
import type { Attachment } from '../data/portfolio'

/**
 * The documents behind a piece of work, as buttons.
 *
 * Lifted out of Creative, where it was local, because the work cards need
 * exactly the same control: a reader who has read three bullets about a
 * paper is being asked one question, "do you want to read it", and the
 * control for that should be a button, not a filename in an attachment row
 * under the card. On the card it was a 10px chip competing with the title;
 * in the sheet it is the thing you came for.
 *
 * A document with no file yet still gets a button, disabled and labelled,
 * rather than being hidden. Hiding it tells a reader there is nothing;
 * saying "coming soon" tells them there is something and it is not ready,
 * and those are different facts.
 */
export default function Docs({ docs, title }: { docs: Attachment[]; title: string }) {
  const [open, setOpen] = useState<Attachment | null>(null)
  const lead = (d: Attachment) => d.kind === 'score' || d.kind === 'report'
  const scores = docs.filter(lead)
  const rest = docs.filter((d) => !lead(d))
  return (
    <>
      <ul className="docs">
        {[...scores, ...rest].map((d) => (
          <li key={d.label}>
            {d.href && /^https?:/.test(d.href) ? (
              /* Somewhere else on the web. A link, not a preview: there are
                 no page images for a repository, and a reader who presses
                 "Code and data" means to leave. */
              <a className="doc-btn" href={d.href}>
                <Mark kind={d.kind} />
                <span className="doc-btn-label">{d.label}</span>
              </a>
            ) : d.href ? (
              <button
                type="button"
                className={lead(d) ? 'doc-btn doc-btn-lead' : 'doc-btn'}
                onClick={() => setOpen(d)}
                aria-haspopup="dialog"
              >
                <Mark kind={d.kind} />
                <span className="doc-btn-label">{d.label}</span>
              </button>
            ) : (
              <span className="doc-btn is-soon">
                <Mark kind={d.kind} />
                <span className="doc-btn-label">{d.label}</span>
                <span className="doc-btn-meta">coming soon</span>
              </span>
            )}
          </li>
        ))}
      </ul>
      {open && <DocSheet doc={open} title={title} onClose={() => setOpen(null)} />}
    </>
  )
}
