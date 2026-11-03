import Chips from './Chips'
import type { Attachment } from '../data/portfolio'

/**
 * One thing, at a glance.
 *
 * The old version was a paragraph with a border round it: four lines of
 * grey prose at one size, twelve times down a page, which is how a grid of
 * distinct things comes to look like wallpaper. This one is built around
 * the number instead. A metric set at display size is legible from across
 * the room, it differs from card to card, and on this site it is the most
 * trustworthy thing on offer — so it leads, the title follows, and the
 * sentence underneath is one sentence.
 *
 * Featured cards are twice as wide and set their metric twice as large.
 * The variation is the point: an even grid reads as a list, and a list is
 * what we were trying to get away from.
 */

/** Drawn rather than imported, at 14px, on the current colour — one
 *  hairline vocabulary, and no icon font for six glyphs. */
function Mark({ kind }: { kind: Attachment['kind'] }) {
  const d = {
    /* a sheet with a turned corner */
    pdf: 'M4 1.5h5.5L12.5 4.5V14.5H4Z M9.5 1.5V4.5H12.5',
    excerpt: 'M4 1.5h5.5L12.5 4.5V14.5H4Z M9.5 1.5V4.5H12.5',
    /* a quaver */
    score: 'M6.5 12.5V3.5L12 2V10',
    audio: 'M6.5 12.5V3.5L12 2V10',
    /* a branch */
    repo: 'M5 2.5V13.5 M5 6.5H9a2 2 0 0 1 2 2v5',
    link: 'M6.5 9.5 9.5 6.5 M6 4.5 8 2.5a3 3 0 0 1 4.2 4.2L10.5 8.5 M10 11.5 8 13.5a3 3 0 0 1-4.2-4.2L5.5 7.5',
  }[kind]
  const round = kind === 'score' || kind === 'audio'
  return (
    <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true" className="att-mark">
      <path d={d} fill="none" stroke="currentColor" strokeWidth="1.3"
        strokeLinecap="round" strokeLinejoin="round" />
      {round && <circle cx="4.6" cy="12.5" r="2.1" fill="currentColor" />}
      {round && <circle cx="10.1" cy="10" r="2.1" fill="currentColor" />}
    </svg>
  )
}

/**
 * The attachment row — the signal that there is something to open here
 * rather than something to read about.
 *
 * An attachment with no href has not been delivered, and those are shown
 * only while developing. In the built site a missing file leaves no trace,
 * because a greyed-out "Paper" that cannot be opened is worse for a reader
 * than no mention of a paper at all.
 */
export function Attachments({ items }: { items: Attachment[] }) {
  const live = items.filter((a) => a.href)
  const shown = import.meta.env.DEV ? items : live
  if (!shown.length) return null
  return (
    <p className="atts">
      {shown.map((a) =>
        a.href ? (
          <a key={a.label} className="att" href={a.href} onClick={(e) => e.stopPropagation()}>
            <Mark kind={a.kind} />{a.label}
          </a>
        ) : (
          <span key={a.label} className="att is-missing">
            <Mark kind={a.kind} />{a.label}
          </span>
        ),
      )}
    </p>
  )
}

export default function Card({
  kind, when, title, line, stack, more, onOpen, href, tint, pending,
  metric, featured, attachments,
}: {
  kind?: string
  when?: string
  title: string
  line?: string
  stack?: string[]
  /** One of the four tone families, where the title's colour carries
   *  meaning rather than decoration. */
  tint?: string
  /** Says out loud that the description is missing. A card with nothing in
   *  it but a title is four fifths empty space, and empty space reads as a
   *  bug rather than as a gap unless something labels it. */
  pending?: boolean
  metric?: { value: string; label: string }
  featured?: boolean
  attachments?: Attachment[]
  /** The label on the affordance. Its presence is what makes this a button. */
  more?: string
  onOpen?: () => void
  href?: string
}) {
  const cls = featured ? 'card card-lead' : 'card'
  const inside = (
    <>
      {(kind || when) && (
        <p className="card-eyebrow">
          <span>{kind}</span>
          {when && <span>{when}</span>}
        </p>
      )}
      {metric && (
        <p className="card-metric">
          <b>{metric.value}</b>
          <span>{metric.label}</span>
        </p>
      )}
      <h4 className="card-title" style={tint ? { color: `var(--${tint}-deep)` } : undefined}>
        {title}
      </h4>
      {line && <p className="card-line">{line}</p>}
      {stack && stack.length > 0 && <Chips items={stack} label="Stack" />}
      {pending && <p className="card-pending">Needs a description</p>}
      <span className="card-foot">
        {attachments && attachments.length > 0 && <Attachments items={attachments} />}
        {more && <span className="card-more">{more}</span>}
      </span>
    </>
  )

  if (onOpen) {
    return (
      <button type="button" className={cls} onClick={onOpen} aria-haspopup="dialog">
        {inside}
      </button>
    )
  }
  if (href) {
    return <a className={cls} href={href}>{inside}</a>
  }
  return <article className={cls}>{inside}</article>
}
