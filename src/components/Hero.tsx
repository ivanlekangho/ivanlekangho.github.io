import { SECTIONS, goToPanel } from '../lib/deck'

/**
 * The first screen — Ivan Ho, in red.
 *
 * Built from the Figma frame (20:1071), translated out of absolute
 * positioning into the proportions the design is actually made of, so it
 * holds at any width:
 *
 *   the bar + the name   one third of the screen, together
 *   the red              the other two thirds
 *   the portrait         165% of the red block's height, centred, pulled up
 *   the arrow            in a column 12.4% wide on the right
 *
 * The thirds are Ivan's, not the Figma file's: his frame is nearly square
 * and a browser window is not, so holding the file's own ratios put the
 * name over half the screen on a 16:9 display. The name is therefore sized
 * off the height of its slot and only capped by the width, rather than the
 * other way round — it is as large as a third of the screen allows.
 *
 * The portrait's own centre line in the design sits at exactly 50% of the
 * panel, so it is centred here rather than offset — the 200px left edge in
 * the Figma file is that, expressed the other way round.
 *
 * The bar is the same list the menu bar uses, so the two cannot drift: this
 * one is drawn into the picture, that one is fixed above the panels, and
 * they are one bar as far as a reader is concerned.
 *
 * The arrow was a slider control in the design, pointing right at a second
 * portrait that does not exist. It points right at the rest of the site
 * instead, which is where right now goes.
 */
export default function Hero() {
  return (
    <section className="hero" id="hero" aria-label="Ivan Ho">
      {/* The bar and the name are one band, because together they are a
          third of the screen and the red is the other two. */}
      <div className="hero-top">
        <nav className="hero-nav" aria-label="Sections">
          {SECTIONS.map((s) => (
            <a key={s.id} href={`#${s.id}`}
              onClick={(e) => { e.preventDefault(); goToPanel(s.id) }}>{s.label}</a>
          ))}
        </nav>
        <p className="hero-name">Ivan Ho</p>
      </div>

      <div className="hero-shot">
        <img src="/ivan-ho.png" alt="Ivan Ho" className="hero-portrait" />
        <button type="button" className="hero-next" onClick={() => goToPanel('impact')}>
          <img src="/hero-arrow.svg" alt="" aria-hidden="true" />
          <span className="sr-only">On to the work</span>
        </button>
      </div>
    </section>
  )
}
