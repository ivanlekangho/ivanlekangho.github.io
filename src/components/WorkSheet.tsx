import Chips from './Chips'
import Player from './Player'
import Sheet from './Sheet'
import type { Item } from '../data/portfolio'

/**
 * The back of a card.
 *
 * Both of the exhibits that used to be drawn frames are real documents now:
 * the authorship figure is in the sheet below, and the Uyghur paper is a
 * PDF reachable from its card.
 */

/**
 * The figure behind the authorship paper.
 *
 * This was a dashed frame reading "Figure: the 8.9% deficit, by country"
 * with a note under it asking Ivan for the real thing, drawn deliberately
 * rather than filled with an invented chart — a fabricated figure on a
 * paper about who gets counted would have been the exact failure the paper
 * describes. The real one is here now, pulled out of the notebook's own
 * output at full resolution.
 *
 * ONE figure, not the five from the poster. This is the one that
 * corroborates rather than restates: nineteen disciplines, every one of
 * them pointing the same way, with the non-significant markers greyed so
 * the figure does its own robustness check in public. The headline numbers
 * are already in the bullets; a chart that repeats them earns nothing.
 */
function AuthorshipExhibit() {
  return (
    <figure className="sheet-figure">
      <img
        src="/figures/authorship-by-field.png"
        alt="Dumbbell plot of 19 academic disciplines. For each, an open circle marks the Global South last-authorship deficit, from −16.6% in Chemistry to +0.5% in Earth and Planetary Sciences, and a filled circle marks the first-authorship surplus, from +2.4% to +18.0%. Every discipline except Earth and Planetary Sciences shows a significant deficit."
        width={1270}
        height={1455}
      />
      <figcaption>
        Last-authorship deficit and first-authorship surplus, by discipline.
        Open circles are the credit, filled circles the execution; bars are
        95% confidence intervals and grey markers are not significant at
        p&nbsp;&lt;&nbsp;0.05.
      </figcaption>
    </figure>
  )
}

/**
 * The phrase a skimming reader should catch, marked `**like this**`.
 *
 * A sheet of eight bullets is read by scanning first and reading second,
 * and the scan should land on the figures that made the tile worth opening
 * and on the job that earned them. Split on the markers rather than
 * reaching for a Markdown dependency: this is one rule, used in one place,
 * and a parser for it would be more code than the rule.
 */
function lift(text: string) {
  return text.split('**').map((part, i) =>
    i % 2 ? <b key={i} className="bullet-lift">{part}</b> : part)
}

export default function WorkSheet({ item, onClose }: { item: Item; onClose: () => void }) {
  return (
    <Sheet onClose={onClose} label={item.fullTitle ?? item.title ?? item.org ?? 'Detail'}>
      {/* The date in brackets rather than behind a third dash: "Cancer
          Society of New Zealand — Internship — Jun – Sep 2026" put an
          em dash between every pair of a three-part line, and the last one
          was separating a label from a date, which brackets say better. */}
      <p className="sheet-eyebrow">
        {[item.org, item.kind].filter(Boolean).join(' — ')}
        {item.when && <span className="sheet-when"> ({item.when})</span>}
      </p>
      <h2 className="sheet-title">{item.fullTitle ?? item.title ?? item.org}</h2>
      {item.stack && item.stack.length > 0 && <Chips items={item.stack} label="Stack" />}

      {item.exhibit === 'authorship' && <AuthorshipExhibit />}

      {/* A film of the work, where there is one. It goes above the bullets
          rather than under them: a classroom in Chin State is the evidence
          and the bullets are the account of it, and a reader who watches
          thirty seconds has understood more than the two lines will tell
          them. The same transport as everywhere else on the site, so it
          carries the ±10 skips and a scrubber that works on a phone. */}
      {item.film && (
        <figure className="sheet-film">
          <Player src={item.film.src} kind="video" label={item.title ?? item.org ?? 'Film'} />
          {item.film.caption && <figcaption>{item.film.caption}</figcaption>}
        </figure>
      )}

      {item.soon && (
        <p className="sheet-soon">More coming soon</p>
      )}

      {item.bullets && item.bullets.length > 0 && (
        <ul className="bullets">
          {item.bullets.map((b) => <li key={b}>{lift(b)}</li>)}
        </ul>
      )}

      {/* The photograph closes the sheet rather than opening it: the work
          is the argument and the picture is the person who did it, and in
          that order it reads as evidence instead of as a hero shot. It was
          at the foot of the Health chapter, where it belonged to all four
          tiles instead of to the one it is actually of. */}
      {item.photo && (
        <figure className="sheet-photo">
          <img src={item.photo.src} alt={item.photo.caption}
            width={item.photo.width} height={item.photo.height} />
          <figcaption>{item.photo.caption}</figcaption>
        </figure>
      )}

      {item.href && (
        <p className="sheet-link"><a href={item.href}>{item.href.replace(/^https?:\/\//, '')}</a></p>
      )}
    </Sheet>
  )
}
