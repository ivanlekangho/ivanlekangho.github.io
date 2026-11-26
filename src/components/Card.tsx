import Chips from './Chips'
import Mark from './Mark'
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
 *
 * `minimal` strips the face back to the number, the organisation and the
 * name of the thing, and sends the sentence and the stack behind the
 * click. On a panel of nine tiles that is the difference between a page
 * you can take in and a page you have to read: the sentence was never the
 * reason anyone clicked, and nine of them stacked up is a wall of grey
 * that makes the nine numbers — the actual content — harder to find.
 */


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
  kind, when, org, title, line, stack, more, onOpen, href, tint, pending,
  metric, featured, attachments, minimal,
}: {
  kind?: string
  when?: string
  /** The company, school or ensemble. The loudest thing on the card after
   *  the number — it is what a reader scans a portfolio for. */
  org?: string
  title?: string
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
  /** Face carries the number and the name only; the rest waits behind the
   *  click. */
  minimal?: boolean
  /** The label on the affordance. Its presence is what makes this a button. */
  more?: string
  onOpen?: () => void
  href?: string
}) {
  const cls = [
    'card', featured ? 'card-lead' : '', minimal ? 'card-min' : '',
  ].filter(Boolean).join(' ')
  const inside = (
    <>
      {(kind || when) && (
        <p className="card-eyebrow">
          <span>{kind}</span>
          {when && <span>{when}</span>}
        </p>
      )}
      {org && <p className="card-org">{org}</p>}
      {metric && (
        <p className="card-metric">
          <b>{metric.value}</b>
          <span>{metric.label}</span>
        </p>
      )}
      {title && (
        <h4 className="card-title" style={tint ? { color: `var(--${tint}-deep)` } : undefined}>
          {title}
        </h4>
      )}
      {line && !minimal && <p className="card-line">{line}</p>}
      {stack && stack.length > 0 && !minimal && <Chips items={stack} label="Stack" />}
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
