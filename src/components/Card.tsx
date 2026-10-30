import Chips from './Chips'

/**
 * One thing, at a glance.
 *
 * Three facts decide whether a reader wants the rest: what it is, one line
 * of what came of it, and what it was made with. Those three go on the face;
 * everything else is behind a click. A card that opens something says so and
 * behaves like a control — one that does not stays a plain box, because an
 * invitation to click that leads nowhere is worse than no invitation.
 */
export default function Card({
  kind, when, title, line, stack, more, onOpen, href, tint, pending,
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
  /** The label on the affordance. Its presence is what makes this a button. */
  more?: string
  onOpen?: () => void
  href?: string
}) {
  const inside = (
    <>
      {(kind || when) && (
        <p className="card-eyebrow">
          <span>{kind}</span>
          {when && <span>{when}</span>}
        </p>
      )}
      <h4 className="card-title" style={tint ? { color: `var(--${tint}-deep)` } : undefined}>
        {title}
      </h4>
      {line && <p className="card-line">{line}</p>}
      {stack && stack.length > 0 && <Chips items={stack} label="Stack" />}
      {pending && <p className="card-pending">Needs a description</p>}
      {more && <p className="card-more">{more}</p>}
    </>
  )

  if (onOpen) {
    return (
      <button type="button" className="card" onClick={onOpen} aria-haspopup="dialog">
        {inside}
      </button>
    )
  }
  if (href) {
    return <a className="card" href={href}>{inside}</a>
  }
  return <article className="card">{inside}</article>
}
