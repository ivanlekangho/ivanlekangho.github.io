import { copyFileSync, mkdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'

/**
 * Give every route a real file.
 *
 * GitHub Pages serves static files and knows nothing about a client-side
 * router, so a visit to /impact finds no /impact and falls back to
 * 404.html. The usual trick is to make 404.html a copy of index.html, and
 * it does work in a browser — the app loads and the router sorts it out —
 * but it is served with a 404 status. Measured on the deployed site: every
 * sub-page returned 404 while rendering perfectly. A browser shrugs at
 * that; a crawler does not, and the pages simply would not be indexed.
 *
 * So each route also gets its own directory with its own index.html. Those
 * are served as 200. 404.html stays as the catch-all for everything else —
 * a mistyped URL, and the post pages, whose paths are not known here.
 *
 * The list is read out of src/lib/pages.ts rather than repeated, so a page
 * added to the bar cannot be forgotten here. /home is added by hand
 * precisely because it is not in that list.
 */
const root = join(import.meta.dirname, '..')
const index = join(root, 'dist', 'index.html')

const pages = readFileSync(join(root, 'src', 'lib', 'pages.ts'), 'utf8')
const routes = [...pages.matchAll(/path:\s*'(\/[a-z-]+)'/g)].map((m) => m[1])
/* Not in the bar: the front page is reached from the name in the corner. */
routes.push('/home')

if (routes.length < 2) {
  console.error('routes.mjs: found %d routes in pages.ts — refusing to run', routes.length)
  process.exit(1)
}

copyFileSync(index, join(root, 'dist', '404.html'))
for (const route of routes) {
  const out = join(root, 'dist', route.slice(1), 'index.html')
  mkdirSync(dirname(out), { recursive: true })
  copyFileSync(index, out)
}
console.log('routes: %s + 404.html', routes.join(' '))
