import Chips from './Chips'
import Sheet from './Sheet'
import Todo from './Todo'
import type { Item } from '../data/portfolio'

/**
 * The back of a card.
 *
 * Two of these carry an exhibit — the authorship paper's figures and an
 * excerpt from the Uyghur paper — and both exhibits are frames waiting for
 * their contents. They are drawn as frames on purpose. A chart invented to
 * fill the space on a paper about who gets counted would be the exact
 * failure the paper is about, and this site does not have the figures yet.
 */

/** A slot for something that does not exist yet, at the size it will be. */
function Exhibit({ ratio, children }: { ratio: string; children: React.ReactNode }) {
  return <div className="exhibit" style={{ aspectRatio: ratio }}>{children}</div>
}

function AuthorshipExhibit() {
  return (
    <>
      <Exhibit ratio="16 / 9">
        <p>Figure — the 8.9% deficit, by country</p>
        <p className="exhibit-note">
          choropleth · forest plot by field · eighteen-year trend
        </p>
      </Exhibit>
      <Todo>
        The figures. Two ways to fill this, and the second is better. (1) Export
        the choropleth, the forest plot and the time series as PNGs and drop them
        in <code>public/figures/</code>. (2) Export the aggregated numbers — the
        per-country deficit, the per-field effect sizes with their confidence
        intervals, the yearly series — as CSV or JSON, and I will draw them here
        as SVG that reads in both light and dark and holds up at phone width,
        like everything else on this page. Until one of those exists this stays a
        frame: inventing a chart for a paper about who gets counted would be the
        exact failure the paper describes.
      </Todo>
    </>
  )
}

function UyghurExhibit() {
  return (
    <>
      <Exhibit ratio="3 / 2">
        <p>Excerpt — the three mechanisms</p>
        <p className="exhibit-note">
          state media · platform design · language policy
        </p>
      </Exhibit>
      <Todo>
        A sample of the paper. Either a few paragraphs you want read — the
        abstract, or the passage where the three mechanisms are pulled together —
        pasted here as text, or the PDF in <code>public/papers/</code> and this
        becomes a link to it. Text is better: a PDF is a download, and an excerpt
        gets read.
      </Todo>
    </>
  )
}

export default function WorkSheet({ item, onClose }: { item: Item; onClose: () => void }) {
  return (
    <Sheet onClose={onClose} label={item.title}>
      <p className="sheet-eyebrow">{item.kind}{item.when ? ` — ${item.when}` : ''}</p>
      <h2 className="sheet-title">{item.title}</h2>
      {item.stack && item.stack.length > 0 && <Chips items={item.stack} label="Stack" />}

      {item.exhibit === 'authorship' && <AuthorshipExhibit />}
      {item.exhibit === 'uyghur' && <UyghurExhibit />}

      {item.bullets && item.bullets.length > 0 && (
        <ul className="bullets">
          {item.bullets.map((b) => <li key={b}>{b}</li>)}
        </ul>
      )}

      {item.href && (
        <p className="sheet-link"><a href={item.href}>{item.href.replace(/^https?:\/\//, '')}</a></p>
      )}
    </Sheet>
  )
}
