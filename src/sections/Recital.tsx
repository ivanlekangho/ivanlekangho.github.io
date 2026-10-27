import StaffNotation from '../components/StaffNotation'
import Todo from '../components/Todo'
import { PIECE } from '../data/phrase'
import { PIANO_PIECE } from '../data/piano'

export default function Recital() {
  return (
    <section id="recital" className="section">
      <div className="shell">
        <p className="eyebrow">Recital room</p>
        <h2>Three pieces, and why</h2>
        <div className="rule-short" />

        <article className="card" style={{ background: 'var(--paper)', padding: 'var(--space-6)' }}>
          <p className="eyebrow" style={{ color: 'var(--accent-deep)' }}>Piece one</p>
          <h3 style={{ fontSize: 'var(--step-2)' }}>
            <em>{PIECE.title}</em> {PIECE.catalogue}
          </h3>
          <p className="muted" style={{ fontSize: 'var(--step--1)' }}>
            {PIECE.composer} · text by {PIECE.poet}, {PIECE.year} · German ·{' '}
            {PIECE.key}, baritone
          </p>

          <div style={{ margin: 'var(--space-5) 0' }}>
            <StaffNotation width={620} gap={11} />
          </div>

          <blockquote style={{ margin: '0 0 var(--space-4)', paddingLeft: 'var(--space-4)', borderLeft: '2px solid var(--accent-mid)' }}>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--step-1)', marginBottom: 'var(--space-1)' }}>
              {PIECE.german}
            </p>
            <p className="muted" style={{ marginBottom: 0 }}>{PIECE.englishGloss}</p>
          </blockquote>

          {/* The Mandarin reading of the line. This used to sit under the
              stage; it belongs with the piece, not with the room. */}
          <p className="muted" style={{ fontSize: 'var(--step--1)', maxWidth: '58ch' }}>
            <span className="han" style={{ fontSize: 'var(--step-0)', color: 'var(--ink)' }}>
              {PIECE.mandarin}
            </span>{' '}— {PIECE.mandarinPinyin} — “{PIECE.mandarinGloss}”.
            {' '}{PIECE.mandarinNote}
          </p>
          <p className="muted" style={{ fontSize: 'var(--step--1)', maxWidth: '58ch' }}>
            {PIANO_PIECE.summary}
          </p>

          {/* Native audio element, styled minimally. Waveform comes later from a
              pre-generated peaks file rather than decoding the whole track at runtime. */}
          <Todo>
            Audio for this piece (m4a or mp3, please not WAV — see the README on repo
            size). Drop it at public/audio/der-wanderer.m4a and it plays. Also: why you
            chose it, and what was technically hard — the range, the shift out of the
            minor opening, breath control, whatever it actually was.
          </Todo>
        </article>

        <Todo>
          Pieces two and three. Any other Schubert or Mendelssohn you sing, plus the
          same for each: language, why you chose it, what was hard, a lyric excerpt
          with translation, and a score page so the notation snippet is real.
        </Todo>

        <div className="motif motif-divider" aria-hidden="true" />

        <Todo>
          Friedrich&rsquo;s <em>Wanderer above the Sea of Fog</em> — duotone treatment,
          as agreed. Drop the image at public/img/friedrich.jpg and I&rsquo;ll tint it
          into the paper-and-wisteria range. It&rsquo;s public domain (1818), so there&rsquo;s
          no rights question. The caption will say plainly that the painting and the
          song aren&rsquo;t historically connected.
        </Todo>
      </div>
    </section>
  )
}
