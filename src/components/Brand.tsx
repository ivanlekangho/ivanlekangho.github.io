import { Link } from 'react-router-dom'

/**
 * The name, which is also the front page.
 *
 * There used to be two of these and the join showed: a full-screen hero
 * with the name set large, and — on every other screen — a separate "Ivan
 * Ho" cell at the left of the bar. Moving between them, one vanished and
 * the other appeared, and because the cell takes width the five labels
 * jumped sideways at the same moment. Two elements pretending to be one
 * thing, badly.
 *
 * So there is one element. It is the front page when it is open and the
 * corner of the bar when it is shut, and it travels between those two
 * states rather than cutting. Clicking it when it is shut opens it again,
 * which is why it is a link to `/` and not a button: it is navigation, it
 * belongs in the back button, and a reader can middle-click it.
 *
 * What animates, and why only these things:
 *
 *   the box        width and height, which is the whole gesture
 *   the name       font-size, from display to label
 *   the red        opacity, so the portrait fades as the box leaves
 *
 * Transitioning a box's width and height is usually the wrong instinct —
 * it relayouts every frame — but there is exactly one of these on the
 * page and nothing inside it reflows except a single line of text, which
 * is a cost worth paying to avoid the alternative. The alternative is a
 * transform-based FLIP, which needs both states measured in JavaScript
 * before every transition and gets the text wrong anyway: a scaled
 * glyph is a blurry glyph at the small end, and this one lands as the
 * site's wordmark.
 *
 * It is a Link in BOTH states, and that is not a detail. The first version
 * rendered a div when open and a Link when shut, which reads as the
 * obvious thing — open, it is the page you are on, so it is not a link
 * anywhere. But React compares element TYPE: div and a are different, so
 * it tore the node out and built a new one on every navigation, and a
 * brand-new element has no previous width to transition from. Every
 * transition property was set correctly and not one of them ever ran.
 * Measured: tagName went DIV to A, the node identity changed, and a data
 * attribute set on the old one was simply gone.
 *
 * So one type, always, and `aria-current` carries what the div was there
 * to say. A wordmark that links home while you are already home is what
 * every site does anyway.
 */
export default function Brand({ open }: { open: boolean }) {
  const inner = (
    <>
      <span className="brand-word">Ivan Ho</span>
      <span className="brand-shot" aria-hidden="true">
        <img src="/ivan-ho.png" alt="" className="brand-portrait" />
      </span>
    </>
  )

  return (
    <Link
      to="/home"
      className={open ? 'brand is-open' : 'brand is-shut'}
      aria-label="Ivan Ho — home"
      aria-current={open ? 'page' : undefined}
    >
      {inner}
    </Link>
  )
}
