/**
 * What the bar offers, in bar order.
 *
 * One list, used by the bar that draws it and by the router that answers
 * it, so the two cannot drift. `path` is the real URL — these are pages
 * now, not anchors, so every one of them is somewhere a reader can link a
 * friend to and somewhere the back button understands.
 *
 * The recital room is deliberately not here. It is the end of the argument
 * rather than a tab, and it is reached from the foot of Creative, where
 * somebody who has just listened to the compositions is the person most
 * likely to want it.
 */
export const PAGES = [
  /* Two words because the panel is both: the Cancer Society work and the
     papers are the same question asked from a job and from a desk, and
     "Impact" alone read as the charity half only. */
  { path: '/impact', label: 'Work/Impact' },
  { path: '/creative', label: 'Creative' },
  { path: '/education', label: 'Education' },
  { path: '/about', label: 'About' },
  { path: '/contact', label: 'Contact' },
] as const

export type PagePath = (typeof PAGES)[number]['path']
