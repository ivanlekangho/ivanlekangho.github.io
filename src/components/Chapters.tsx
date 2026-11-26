import { Fragment, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { useActiveChapter, useAtTop, useBarHeight, useHandoff, useStack } from '../lib/chapters'
import { goToStop, useSectionSnap } from '../lib/sectionSnap'
import { PAGES } from '../lib/pages'

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
  const atTop = useAtTop()
  useSectionSnap()

  /* The title screen's dot is labelled with the page's own name in the bar
     — Work/Impact, Education — taken from the same list the bar draws
     itself from, so the rail cannot start calling a page something the bar
     does not. */
  const { pathname } = useLocation()
  const page = PAGES.find(
    (p) => pathname === p.path || pathname.startsWith(`${p.path}/`),
  )

  /* By INDEX, not by element. Everything that moves these pages moves
     through lib/sectionSnap, for two reasons: it arrives on the same curve
     a wheel gesture does, and it reads the position off the markers. A
     chapter cannot be measured — it is sticky, so once it is pinned its
     rectangle is where it is pinned and not where it lives, and a dot that
     measured it computed "the position you are already at". Stop 0 is the
     title screen and stop i+1 is chapter i. */
  const go = (i: number) => goToStop(i)

  /* Which stop the reader is on, as an index into the rail: 0 is the title
     screen and i+1 is chapter i. The arrows need it to know when they have
     run out of page, and the alternative — reading it back off the DOM —
     would be a second source of truth for something the dots already
     know. */
  const stops = (page ? 1 : 0) + chapters.length
  const here = atTop ? 0 : Math.max(0, chapters.findIndex((c) => c.id === active) + 1)

  return (
    <>
      {/* The rail is fixed and outside the sheet, so it does not travel
          with the thing it is reporting on. */}
      <nav className="rail-dots" aria-label="Sections on this page">
        {/* Up and down, either side of the dots.
        
            The dots say where you are and let you jump anywhere; the arrows
            are for the reader who just wants the next thing and should not
            have to read four labels to find out which one that is. Two ways
            to the same place, which is right for the only control that moves
            this page — and the arrows are the one a reader will find without
            being told, because every page they have ever read has them.
            
            Disabled at the ends rather than hidden: a control that vanishes
            at the top of the page is a control whose absence has to be
            interpreted. */}
        <button
          type="button"
          className="rail-step"
          onClick={() => go(here - 1)}
          disabled={here <= 0}
          aria-label="Previous section"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 14.5 12 8.5 18 14.5" fill="none" stroke="currentColor"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <ul>
          {/* The title screen, as the first stop on the rail. Without it
              the rail began at the first chapter and had nothing to say
              while the title filled the screen — and, worse, lit the first
              chapter's dot there, so the one place the rail was wrong was
              the first place a reader saw it. */}
          {page && (
            <li>
              <button
                type="button"
                className={atTop ? 'dot is-here' : 'dot'}
                onClick={() => go(0)}
                aria-current={atTop ? 'true' : undefined}
              >
                <span className="dot-mark" aria-hidden="true" />
                <span className="dot-label">{page.label}</span>
              </button>
            </li>
          )}
          {chapters.map((c, i) => (
            <li key={c.id}>
              <button
                type="button"
                className={!atTop && active === c.id ? 'dot is-here' : 'dot'}
                onClick={() => go(i + 1)}
                aria-current={!atTop && active === c.id ? 'true' : undefined}
              >
                <span className="dot-mark" aria-hidden="true" />
                <span className="dot-label">{c.label}</span>
              </button>
            </li>
          ))}
        </ul>

        <button
          type="button"
          className="rail-step"
          onClick={() => go(here + 1)}
          disabled={here >= stops - 1}
          aria-label="Next section"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 9.5 12 15.5 18 9.5" fill="none" stroke="currentColor"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
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
            onClick={() => go(1)} aria-label="Scroll to the first section">
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
