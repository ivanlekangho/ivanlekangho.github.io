/**
 * The phrase a skimming reader should catch, marked `**like this**`.
 *
 * A card is read by scanning and a sheet of bullets twice as much so, and
 * the scan should land on the figures that made the tile worth opening and
 * on the job that earned them. One rule, so it is split on the markers
 * rather than reaching for a Markdown parser: the parser would be more code
 * than the rule.
 *
 * It lives here rather than in WorkSheet because the card and the sheet
 * both need it — the same job title is the heading of one and the first
 * bullet of the other, and it would be odd for the emphasis to survive the
 * click but not precede it.
 */
export function lift(text: string) {
  return text.split('**').map((part, i) =>
    i % 2 ? <b key={i} className="bullet-lift">{part}</b> : part)
}

/** The same string with the markers taken out, for an attribute. */
export const plain = (text: string) => text.replace(/\*\*/g, '')
