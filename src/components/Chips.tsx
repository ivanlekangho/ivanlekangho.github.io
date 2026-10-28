/**
 * A set of named things — languages, a stack, the instruments in a band.
 *
 * Boxed rather than strung together with middots: a list of skills separated
 * by punctuation reads as prose you have to parse, and the same list as
 * discrete objects reads at a glance. The boxes are hairlines, not pills.
 */
export default function Chips({
  items, family, label,
}: { items: string[]; family?: string; label?: string }) {
  return (
    <ul className="chips" aria-label={label}>
      {items.map((i) => (
        <li key={i} style={family ? { color: `var(--${family}-mid)`, borderColor: `var(--${family}-deep)` } : undefined}>
          {i}
        </li>
      ))}
    </ul>
  )
}
