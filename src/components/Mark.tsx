import type { Attachment } from '../data/portfolio'

/** Drawn rather than imported, at 14px, on the current colour — one
 *  hairline vocabulary, and no icon font for six glyphs. */
export default function Mark({ kind }: { kind: Attachment['kind'] }) {
  const d = {
    /* a sheet with a turned corner */
    pdf: 'M4 1.5h5.5L12.5 4.5V14.5H4Z M9.5 1.5V4.5H12.5',
    excerpt: 'M4 1.5h5.5L12.5 4.5V14.5H4Z M9.5 1.5V4.5H12.5',
    report: 'M4 1.5h5.5L12.5 4.5V14.5H4Z M9.5 1.5V4.5H12.5 M6 9.5h4.5 M6 11.5h3',
    /* a quaver */
    score: 'M6.5 12.5V3.5L12 2V10',
    audio: 'M6.5 12.5V3.5L12 2V10',
    /* a frame with a play triangle */
    video: 'M2.5 3.5h11v9h-11Z M7 6.5 10.5 8 7 9.5Z',
    /* a branch */
    repo: 'M5 2.5V13.5 M5 6.5H9a2 2 0 0 1 2 2v5',
    link: 'M6.5 9.5 9.5 6.5 M6 4.5 8 2.5a3 3 0 0 1 4.2 4.2L10.5 8.5 M10 11.5 8 13.5a3 3 0 0 1-4.2-4.2L5.5 7.5',
  }[kind]
  const round = kind === 'score' || kind === 'audio'
  return (
    <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true" className="att-mark">
      <path d={d} fill="none" stroke="currentColor" strokeWidth="1.3"
        strokeLinecap="round" strokeLinejoin="round" />
      {round && <circle cx="4.6" cy="12.5" r="2.1" fill="currentColor" />}
      {round && <circle cx="10.1" cy="10" r="2.1" fill="currentColor" />}
    </svg>
  )
}
