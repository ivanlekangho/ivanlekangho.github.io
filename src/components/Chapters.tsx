import { Fragment, type ReactNode } from 'react'
import { useActiveChapter, useBarHeight, useHandoff, useStack } from '../lib/chapters'
import { scrollToSection } from '../lib/scroll'

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
  title, subtitle, backdrop, chapters, children,
}: {
  /** The page's own title, set large and centred on the first screen. */
  title: ReactNode
  subtitle?: ReactNode
  /** Something behind the title, for a page that wants one. */
  backdrop?: ReactNode
  chapters: Chapter[]
  /** Anything after the last chapter — notes, a way onward. */
  children?: ReactNode
}) {
  useBarHeight()
  useHandoff()
  useStack()
  const active = useActiveChapter(chapters.map((c) => c.id))

  /* Not scrollIntoView: mandatory snapping refuses a programmatic jump, so
     every dot and the cue under the hero simply did nothing. See
     lib/scroll. */
  const go = (id: string) => scrollToSection(id)

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

      {/* The snap positions live on these, not on the cards.
          
          A snap area that is `position: sticky` is a snap area the browser
          cannot place: stacked cards all resolve to the same pinned
          rectangle, so "the nearest snap position" stops meaning anything
          and Chrome answers with the end of the document. That is the
          scroll running away to the bottom and refusing to come back.
          Measured: scrollTo(0) from 4220px landed at 4220 with mandatory
          snap on, and at 0 exactly with it off.
          
          A zero-height marker in normal flow has an unambiguous position,
          and sits exactly where its card's top edge belongs. */}
      <div className="snap-at" aria-hidden="true" />

      <header className="chapters-hero">
        {backdrop}
        <h1 className="chapters-title">{title}</h1>
        {subtitle && <p className="chapters-sub">{subtitle}</p>}
        {/* A first screen with nothing showing below the fold has to say
            there is something below the fold. A button rather than a glyph,
            because a reader who understands it may well want to press it. */}
        {chapters[0] && (
          <button type="button" className="chapters-down"
            onClick={() => go(chapters[0].id)} aria-label="Scroll to the first section">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 9.5 12 15.5 18 9.5" fill="none" stroke="currentColor"
                strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
      </header>

      <div className="chapters-sheet">
        {chapters.map((c, i) => (
          <Fragment key={c.id}>
          <div className="snap-at" aria-hidden="true" />
          <section id={c.id} className="chapter" aria-label={c.label}>
            {/* The card is exactly one screen and does not scroll; what
                scrolls is this, inside it. See the note in the stylesheet:
                it is the only way a stacked card can hold more than a
                screen of content and still be read. */}
            <div className="chapter-scroll">
              <div className="shell">
                {c.body}
                {/* The page's notes ride at the foot of its last section
                    rather than in a screen of their own. As their own card
                    they were a fourth full-height sticky panel with no snap
                    marker, and under mandatory snapping anything past the
                    last snap position cannot be reached at all: the scroll
                    stopped at 2532 of a possible 3376. In production the
                    notes render nothing, so that card was a blank screen
                    you could not even scroll to. Here they are simply the
                    end of the last section, and the last snap position is
                    the end of the page. */}
                {i === chapters.length - 1 && children}
              </div>
            </div>
          </section>
          </Fragment>
        ))}
      </div>
    </>
  )
}
