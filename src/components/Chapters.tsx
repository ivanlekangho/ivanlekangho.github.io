import { type ReactNode } from 'react'
import { useActiveChapter, useBarHeight, useHandoff } from '../lib/chapters'

/**
 * The shape every page of this site has.
 *
 * A sticky hero holding the page's title, and a sheet of chapters that
 * comes up over it as you scroll — each chapter one screen tall, snapping
 * into place, with a rail of dots down the left saying where you are.
 *
 * Three things in it are worth knowing before changing any of it:
 *
 * The hero does not move. It is `position: sticky` and the sheet scrolls
 * over the top of it; what looks like a card being pulled up is the sheet
 * arriving, not the hero leaving. The hero only shrinks and fades, by a
 * few percent, driven by `--handoff` — and that is the whole trick: if the
 * hero also translated, the two movements would fight at every scroll
 * position and neither would read as deliberate.
 *
 * Mandatory snapping is safe here for one reason, and it is the reason the
 * brief gives: a snap area taller than the viewport lets the scroll rest
 * anywhere inside it. So a chapter with more than a screen of content in
 * it scrolls through normally and only its top edge snaps. Without that
 * property, mandatory snapping on long sections stranded content out of
 * reach entirely — which it did, on this site, in an earlier arrangement.
 *
 * Everything vertical is measured from the bar through `--bar-h`, which a
 * ResizeObserver keeps true. The snap padding and the chapter height both
 * read it, and they have to agree exactly or every chapter lands with its
 * heading hidden under the bar.
 */

export type Chapter = {
  id: string
  /** The rail's label for this chapter. Shown on hover, read always. */
  label: string
  body: ReactNode
}

export default function Chapters({
  title, subtitle, chapters, children,
}: {
  /** The page's own title, set large and centred on the first screen. */
  title: ReactNode
  subtitle?: ReactNode
  chapters: Chapter[]
  /** Anything after the last chapter — notes, a way onward. */
  children?: ReactNode
}) {
  useBarHeight()
  useHandoff()
  const active = useActiveChapter(chapters.map((c) => c.id))

  const go = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <>
      {/* The rail is fixed and outside the sheet, so it does not travel
          with the thing it is reporting on. */}
      <nav className="rail-dots" aria-label="Sections on this page">
        <ul>
          {chapters.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                className={active === c.id ? 'dot is-here' : 'dot'}
                onClick={() => go(c.id)}
                aria-current={active === c.id ? 'true' : undefined}
              >
                <span className="dot-mark" aria-hidden="true" />
                <span className="dot-label">{c.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <header className="chapters-hero">
        <h1 className="chapters-title">{title}</h1>
        {subtitle && <p className="chapters-sub">{subtitle}</p>}
      </header>

      <div className="chapters-sheet">
        {chapters.map((c) => (
          <section key={c.id} id={c.id} className="chapter" aria-label={c.label}>
            <div className="shell">{c.body}</div>
          </section>
        ))}
        {children && <div className="chapters-foot"><div className="shell">{children}</div></div>}
      </div>
    </>
  )
}

/**
 * One item in a chapter, open on click, and only one open at a time.
 *
 * `<details name>` does the mutual exclusion in the browser rather than in
 * JavaScript, which means it also works before this bundle has parsed and
 * keeps the open state in the element where the browser's own find-in-page
 * can reach it. Where the attribute is not supported the elements simply
 * all open independently, which is a worse accordion and still a working
 * one — the failure mode is the reason to use the native element rather
 * than a reason not to.
 */
export function Fold({
  group, lead, meta, children, open,
}: {
  group: string
  lead: ReactNode
  meta?: ReactNode
  children: ReactNode
  open?: boolean
}) {
  return (
    <details className="item" name={group} open={open}>
      <summary>
        <span className="item-lead">{lead}</span>
        {meta && <span className="item-meta">{meta}</span>}
        <span className="item-mark" aria-hidden="true" />
      </summary>
      <div className="item-body">{children}</div>
    </details>
  )
}
