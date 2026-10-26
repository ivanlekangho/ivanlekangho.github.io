import Todo from '../components/Todo'
import ToneLegend from '../components/ToneLegend'

export default function HowIThink() {
  return (
    <div className="shell section">
      <p className="eyebrow">How I think</p>
      <h1 style={{ fontSize: 'var(--step-4)', maxWidth: '22ch' }}>
        A fugue and a refactor feel like the same activity
      </h1>
      <div className="rule-short" />

      <div style={{ maxWidth: 'var(--measure)' }}>
        <p>
          Both start with a subject — a musical phrase or a function — stated
          plainly, so you know what you&rsquo;re listening for. Then it comes back
          changed. A different voice carries it, or the same phrase drops into a
          new key. A good refactor doesn&rsquo;t touch what a function does; it
          changes who&rsquo;s carrying the idea, and how clearly. A good fugue keeps
          its subject and just keeps finding new rooms for it to stand in.
        </p>
        <p>
          This is part of why linguistics never felt separate from either one. A
          Mandarin syllable carries part of its meaning in pitch. Get the tone
          wrong and the word changes — it doesn&rsquo;t just sound wrong. Code has a
          similar brittleness. Change one character and the meaning breaks, not
          just the look of it.
        </p>
      </div>

      <Todo>
        This is your draft from the brief, lightly tightened — it&rsquo;s the strongest
        writing in the whole brief and it should be in your words, not mine. Aim
        for ~200 words. One structural note: the homepage headline already makes
        this <em>claim</em> and the centerpiece <em>demonstrates</em> it, so this
        page should go somewhere neither can — argue it, or tell the story of
        when you first noticed. Don&rsquo;t summarise the site.
      </Todo>

      <div style={{ marginTop: 'var(--space-7)' }}>
        <p className="eyebrow">Why four colours</p>
        <ToneLegend />
        <Todo>
          Hakka. You said it&rsquo;s still part of the story, but Hakka tone inventories
          run to six or more and vary by variety, so a four-colour system can&rsquo;t
          hold it. Tell me which variety you speak and its tone values, and I&rsquo;ll
          give Hakka its own treatment on the neutral family rather than forcing
          new hues into the palette.
        </Todo>
      </div>
    </div>
  )
}
