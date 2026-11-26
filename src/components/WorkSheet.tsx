import Chips from './Chips'
import Player from './Player'
import Docs from './Docs'
import Sheet from './Sheet'
import { lift, plain } from '../lib/lift'
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
 * ONE figure, not the five from the poster, and it is the map: Ivan's
 * choice over the field plot I argued for. It answers the question the card
 * is actually about — which countries do the work and which get the credit
 * — in a form nobody needs a legend lesson to read, and the whole point of
 * the paper is that the pattern is geographic.
 */
function AuthorshipExhibit() {
  return (
    <figure className="sheet-figure">
      <img
        src="/figures/authorship-by-country.png"
        alt="World map shading each country by its mean Global South last-authorship deficit. Latin America, Africa, the Middle East, South Asia and South-East Asia are red, meaning researchers there are under-represented in last authorship relative to their share of the team. North America, Europe and Australia are blue or unshaded."
        width={2570}
        height={1595}
      />
      <figcaption>
        Mean last-authorship deficit per country. Red is a country whose
        researchers are under-represented among last authors relative to
        their share of the team; blue is over-represented. Grey is
        insufficient data.
      </figcaption>
    </figure>
  )
}

export default function WorkSheet({ item, onClose }: { item: Item; onClose: () => void }) {
  return (
    <Sheet onClose={onClose} label={plain(item.fullTitle ?? item.title ?? item.org ?? 'Detail')}>
      {/* The date in brackets rather than behind a third dash: "Cancer
          Society of New Zealand — Internship — Jun – Sep 2026" put an
          em dash between every pair of a three-part line, and the last one
          was separating a label from a date, which brackets say better. */}
      <p className="sheet-eyebrow">
        {[item.org, item.kind].filter(Boolean).join(' — ')}
        {item.when && <span className="sheet-when"> ({item.when})</span>}
      </p>
      <h2 className="sheet-title">{lift(item.fullTitle ?? item.title ?? item.org ?? '')}</h2>
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

      {/* The documents, as buttons, with a page-by-page preview behind
          each local one — the same control Creative's scores and reports
          use, so "Paper" here opens the way "Research report" does there. */}
      {item.docs && item.docs.length > 0 && (
        <div className="sheet-go">
          <Docs docs={item.docs} title={plain(item.fullTitle ?? item.title ?? '')} />
        </div>
      )}

      {item.href && !item.docs && (
        <p className="sheet-go">
          <a className="doc-btn doc-btn-lead" href={item.href}>
            <span className="doc-btn-label">{item.cta ?? 'Open'}</span>
          </a>
        </p>
      )}
    </Sheet>
  )
}
