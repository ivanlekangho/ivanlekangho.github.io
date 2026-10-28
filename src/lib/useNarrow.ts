import { useEffect, useState } from 'react'

/** True on anything a phone would call a screen. Shared so the stage and
 *  the score agree on where "narrow" starts. */
export function useNarrow(query = '(max-width: 62rem)') {
  const [narrow, setNarrow] = useState(
    () => typeof matchMedia === 'function' && matchMedia(query).matches,
  )
  useEffect(() => {
    const m = matchMedia(query)
    const on = () => setNarrow(m.matches)
    m.addEventListener('change', on)
    return () => m.removeEventListener('change', on)
  }, [query])
  return narrow
}
