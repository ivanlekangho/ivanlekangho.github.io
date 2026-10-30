import { useState } from 'react'
import Card from './Card'
import WorkSheet from './WorkSheet'
import type { Item } from '../data/portfolio'

/**
 * A grid of cards and the one sheet they all open into.
 *
 * The sheet lives here rather than per card so that only one can ever be
 * up, and so a card does not have to carry an overlay around with it.
 *
 * Whether a card opens at all is decided by whether there is anything
 * behind it: an item with bullets or an exhibit becomes a button, an item
 * with only a link becomes a link, and an item that is simply a fact — a
 * grade, a placing, a competition won — stays a plain box. Three states,
 * because pretending the third has more to say would make a reader click
 * through nine cards to find the two that do.
 */
export default function WorkGrid({ items, tight }: { items: Item[]; tight?: boolean }) {
  const [open, setOpen] = useState<Item | null>(null)

  return (
    <>
      <div className={tight ? 'cards cards-tight' : 'cards'}>
        {items.map((it) => {
          const opens = Boolean(it.exhibit || it.bullets?.length)
          return (
            <Card
              key={it.id}
              kind={it.kind}
              when={it.when}
              title={it.title}
              line={it.line}
              stack={it.stack}
              pending={!it.line}
              more={opens ? (it.cta ?? 'Read more') : it.href ? (it.cta ?? 'Visit') : undefined}
              onOpen={opens ? () => setOpen(it) : undefined}
              href={opens ? undefined : it.href}
            />
          )
        })}
      </div>
      {open && <WorkSheet item={open} onClose={() => setOpen(null)} />}
    </>
  )
}
