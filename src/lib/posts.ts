/**
 * Posts are plain .md files in src/content/log. No CMS, no MDX toolchain —
 * writing a post means adding a file, which is the only pipeline that actually
 * gets used. Frontmatter is parsed here rather than pulling in gray-matter,
 * which is a Node library and would bloat the browser bundle.
 */

export type Post = {
  slug: string
  title: string
  date: string
  summary: string
  draft: boolean
  tags: string[]
  body: string
}

const files = import.meta.glob('../content/log/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

function parse(raw: string) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(raw)
  if (!m) return { meta: {} as Record<string, string>, body: raw }
  const meta: Record<string, string> = {}
  for (const line of m[1].split(/\r?\n/)) {
    const i = line.indexOf(':')
    if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim().replace(/^["']|["']$/g, '')
  }
  return { meta, body: m[2] }
}

export const POSTS: Post[] = Object.entries(files)
  .map(([path, raw]) => {
    const { meta, body } = parse(raw)
    return {
      slug: path.split('/').pop()!.replace(/\.md$/, ''),
      title: meta.title ?? 'Untitled',
      date: meta.date ?? '',
      summary: meta.summary ?? '',
      draft: meta.draft === 'true',
      tags: meta.tags ? meta.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      body,
    }
  })
  .sort((a, b) => b.date.localeCompare(a.date))
