import { useEffect, useState } from 'react'

/**
 * A media query, as state.
 *
 * Nearly everything on this site that changes with the width changes in
 * CSS, where it belongs. This is for the one case CSS cannot answer: when
 * the narrow layout is not a restyling of the wide one but a different
 * thing altogether, built from different markup. The book and the scroll
 * are that — one is a stage with a leaf that turns, the other is every
 * page in a column — and the alternative, rendering both and hiding one,
 * would put twenty-six page images into the document to show none of them.
 */
export function useMedia(query: string) {
  /* Read it on the first render rather than in an effect. Starting false
     and correcting afterwards would mount the wide version on a phone and
     then throw it away, which for the book means its images are fetched
     before anything decides they are not wanted. */
  const [on, setOn] = useState(
    () => typeof matchMedia === 'function' && matchMedia(query).matches,
  )

  useEffect(() => {
    const mq = matchMedia(query)
    const tell = () => setOn(mq.matches)
    tell()
    mq.addEventListener('change', tell)
    return () => mq.removeEventListener('change', tell)
  }, [query])

  return on
}

/** The width below which a spread is two postage stamps. Matches the
 *  breakpoint the stylesheet uses for the same decision. */
export const PHONE = '(max-width: 46rem)'
