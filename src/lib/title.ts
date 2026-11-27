import { useEffect } from 'react'
import SEO from '../data/seo.json'

/**
 * The tab says which page you are on.
 *
 * Every route is served with its own `<title>` already — tools/routes.mjs
 * writes it into that route's HTML file, which is the copy a search engine
 * reads and the only copy it reads. This is for the other half: once the
 * app has loaded, moving between pages is a click and no HTML is fetched,
 * so without this the tab, the history entry and the bookmark all still
 * say whatever page was opened first.
 *
 * Both halves come out of the same seo.json, so a title cannot be one
 * thing in a search result and another in the tab.
 */
const TITLES = SEO.pages as Record<string, { title: string; description: string }>

export function useTitle(pathname: string) {
  useEffect(() => {
    /* A path with no entry of its own — a post, a mistyped URL on its way
       to the redirect — keeps the name rather than inventing a title for
       something that is about to become another page anyway. */
    document.title = TITLES[pathname]?.title ?? SEO.site.name
  }, [pathname])
}
