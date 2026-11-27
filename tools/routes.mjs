import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

/**
 * Give every route a real file, with its own head.
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
 * Copying index.html was not enough on its own, though, and that is the
 * second half of this. Five pages were being served the one title and the
 * one description — "Ivan Ho", five times — which is the state a search
 * engine reads as five copies of one page. The body cannot be fixed here
 * (it is a client-rendered app, and the markup arrives empty), but the
 * head can, and the head is what a result in a list is made of: the title
 * is the blue line, the description is the grey one under it. Both now
 * come from src/data/seo.json, which the app reads too, so the tab and
 * the search result cannot say different things.
 *
 * The list of routes is read out of src/lib/pages.ts rather than repeated,
 * so a page added to the bar cannot be forgotten here. /home is added by
 * hand precisely because it is not in that list.
 */
const root = join(import.meta.dirname, '..')
const dist = join(root, 'dist')

const SEO = JSON.parse(readFileSync(join(root, 'src', 'data', 'seo.json'), 'utf8'))
const { origin } = SEO.site

const pages = readFileSync(join(root, 'src', 'lib', 'pages.ts'), 'utf8')
const routes = [...pages.matchAll(/path:\s*'(\/[a-z-]+)'/g)].map((m) => m[1])
/* Not in the bar: the front page is reached from the name in the corner. */
routes.unshift('/home')

if (routes.length < 2) {
  console.error('routes.mjs: found %d routes in pages.ts — refusing to run', routes.length)
  process.exit(1)
}
/* A route with no copy would be published with the template's head, which
   is the duplicate-title bug coming back quietly. Fail the build instead. */
const naked = routes.filter((r) => !SEO.pages[r])
if (naked.length) {
  console.error('routes.mjs: no seo.json entry for %s — refusing to run', naked.join(' '))
  process.exit(1)
}

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;')
  .replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/**
 * Who the site is about, in the one format a search engine reads as fact
 * rather than as prose.
 *
 * On the front page only. Repeating a Person on all six would not be
 * wrong, but it says the same thing six times, and the front page is the
 * one a result for the name should land on. `alternateName` is there
 * because the site calls him Ivan Ho and the world half the time calls
 * him Ivan Le Kang Ho — the scores are signed that way, the repositories
 * are under it — and a search for either should find this.
 */
const person = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: SEO.site.name,
  alternateName: SEO.site.fullName,
  url: `${origin}/home`,
  image: `${origin}${SEO.site.image}`,
  jobTitle: 'Student, composer and performer',
  alumniOf: { '@type': 'EducationalOrganization', name: 'King’s College, Auckland' },
  affiliation: { '@type': 'CollegeOrUniversity', name: 'Stanford University' },
  nationality: { '@type': 'Country', name: 'New Zealand' },
  sameAs: SEO.site.sameAs,
}

/** The head this template was shipped with, replaced route by route. */
const template = readFileSync(join(dist, 'index.html'), 'utf8')

/* Vite writes this file fresh on every build, and the tags below are
   added to it rather than swapped into it — so running against output
   that has already been through here would append a second set. It
   cannot happen under `npm run build`, which is the point of saying so
   out loud rather than trusting it. */
if (template.includes('rel="canonical"')) {
  console.error('routes.mjs: dist/index.html already has a head — run vite build first')
  process.exit(1)
}

function head(route) {
  const { title, description } = SEO.pages[route]
  const url = `${origin}${route}`
  const card = `${origin}${SEO.site.image}`
  const tags = [
    /* Which URL this page really lives at. /home is also served at / and
       at /home.html, and without this they are three addresses with the
       same page on them, which is a thing to be ranked rather than a page. */
    `<link rel="canonical" href="${url}" />`,
    `<meta property="og:type" content="${route === '/home' ? 'profile' : 'website'}" />`,
    `<meta property="og:site_name" content="${esc(SEO.site.name)}" />`,
    `<meta property="og:title" content="${esc(title)}" />`,
    `<meta property="og:description" content="${esc(description)}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:image" content="${card}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(title)}" />`,
    `<meta name="twitter:description" content="${esc(description)}" />`,
    `<meta name="twitter:image" content="${card}" />`,
  ]
  if (route === '/home') {
    tags.push(`<script type="application/ld+json">${JSON.stringify(person)}</script>`)
  }
  return template
    .replace(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`)
    .replace(
      /<meta name="description" content="[^"]*" \/>/,
      `<meta name="description" content="${esc(description)}" />\n    ${tags.join('\n    ')}`,
    )
}

/* Every route three ways, because GitHub Pages answers a bare /impact
   with a 301 to /impact/ when only the directory exists — so the address
   bar gained a trailing slash on some pages and not others depending on
   how you arrived. `impact.html` is served for /impact directly; the
   directory still answers /impact/. Neither redirects, and both are the
   same app. The canonical tag is what keeps the three from competing. */
for (const route of routes) {
  const name = route.slice(1)
  const html = head(route)
  writeFileSync(join(dist, `${name}.html`), html)
  mkdirSync(join(dist, name), { recursive: true })
  writeFileSync(join(dist, name, 'index.html'), html)
}

/* The bare domain is the front page. It is the address people type and
   the one they will link, and the app redirects it to /home, so it is
   served with /home's head and points at /home as the canonical. */
writeFileSync(join(dist, 'index.html'), head('/home'))
copyFileSync(join(dist, 'index.html'), join(dist, '404.html'))

/* Every address worth having, in the order a reader meets them, with the
   day of the build as the date. A sitemap does not make a page rank; it
   makes a page known, which is the part that is otherwise left to whether
   anyone happens to link to it. */
const day = new Date().toISOString().slice(0, 10)
const urls = routes.map((r) => `  <url>
    <loc>${origin}${r}</loc>
    <lastmod>${day}</lastmod>
  </url>`).join('\n')
writeFileSync(join(dist, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`)

console.log('routes: %s + 404.html, sitemap.xml', routes.join(' '))
