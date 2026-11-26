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
 * This screen is deliberately outside the lighting board. Everything below
 * it is lit by three interpolated keyframes; this is a flat light panel
 * with one red, and it does not change as the rail moves. It is the only
 * part of the site that does not.
 */
export default function Hero() {
  const toRoom = () => {
    const hall = document.querySelector('.hall')
    hall?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <section className="hero" aria-label="Ivan Ho">
      {/* The bar and the name are one band, because together they are a
          third of the screen and the red is the other two. */}
      <div className="hero-top">
        <nav className="hero-nav" aria-label="Sections">
          <a href="#impact">Impact</a>
          <a href="#music">Creative</a>
          <a href="#education">Education</a>
          <a href="#contact">Contact</a>
        </nav>
        <p className="hero-name">Ivan Ho</p>
      </div>

      <div className="hero-shot">
        <img src="/ivan-ho.png" alt="Ivan Ho" className="hero-portrait" />
        {/* The design draws a slider arrow here. There is one portrait, so
            rather than leave a control that slides nothing, it carries you
            to the room below — which is the only place this screen goes. */}
        <button type="button" className="hero-next" onClick={toRoom}>
          <img src="/hero-arrow.svg" alt="" aria-hidden="true" />
          <span className="sr-only">To the recital room</span>
        </button>
      </div>
    </section>
  )
}
