import Todo from '../components/Todo'
import ToneLegend from '../components/ToneLegend'

export default function About() {
  return (
    <section id="about" className="section">
      <div className="shell">
        <h1 style={{ maxWidth: '18ch' }}>
          Three <span style={{ color: 'var(--t1-deep)' }}>l</span>
          <span style={{ color: 'var(--t2-deep)' }}>a</span>
          <span style={{ color: 'var(--t3-deep)' }}>n</span>
          <span style={{ color: 'var(--t4-deep)' }}>g</span>uages,
          <br /><em>one grammar</em>
        </h1>
        <div className="rule-short" />

        <Todo>
          Opening paragraph. Your draft has the second half — “I sing Schubert in
          German I'm still learning to pronounce properly…” — but the first line
          (where you're from, your family's background) is still yours to write.
          Also still open: how much of the queer framing you want stated here
          versus left as subtext.
        </Todo>

        <p className="lede">
          Stanford CS (intended), expected June 2028. Baritone. Volunteer software
          for the Cancer Society of New Zealand, Greater Wellington.
        </p>

        <Todo>
          Pull-quote from the Cancer Society work goes here (your call: one line on
          why that work matters to you).
        </Todo>

        <div style={{ marginTop: 'var(--space-6)' }}>
          <p className="eyebrow">The palette</p>
          <p className="muted" style={{ fontSize: 'var(--step--1)' }}>
            Four accents, four Mandarin tones, plus the neutral. Used consistently
            everywhere on this site.
          </p>
          <ToneLegend />
        </div>
      </div>
    </section>
  )
}
