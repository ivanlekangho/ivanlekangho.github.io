import { useState } from 'react'
import Player from '../components/Player'
import Todo from '../components/Todo'
import WorkGrid from '../components/WorkGrid'
import { MUSIC, WORKS, type Work } from '../data/portfolio'

/**
 * Creative — two things you can hear, and one you can watch.
 *
 * This section used to be seven cards, each a sentence about a thing that
 * happened. The difference between a card saying "a setting for lower-voice
 * choir on a German text" and three minutes of the choir singing it is the
 * difference between a portfolio and a CV, and every card on this site is
 * at best the first of those.
 *
 * So the composition and the performance come first and come whole: the
 * recording on the page, the programme beside it, the score behind a link
 * for anyone who wants to check the claim. The ensembles and the
 * instruments follow as a list, which is all they ever were.
 */

/** A video that admits it when the file is not there. */
function Reel({ src, label, poster }: { src: string; label: string; poster?: string }) {
  const [bad, setBad] = useState(false)
  if (bad) {
    return (
      <div className="reel-missing">
        <p>The recording of this recital is not on the site yet.</p>
      </div>
    )
  }
  return (
    <video
      className="reel"
      src={src}
      poster={poster}
      controls
      preload="metadata"
      playsInline
      aria-label={label}
      onError={() => setBad(true)}
    />
  )
}

function Stage({ work }: { work: Work }) {
  return (
    <article className="work" data-reveal>
      <header className="work-head">
        <p className="work-kind">
          <span>{work.kind}</span>
          <span className="work-when">{work.when}</span>
        </p>
        <h3 className="work-title">{work.title}</h3>
        <p className="work-scoring">{work.scoring}</p>
      </header>

      <div className="work-body">
        <div className="work-media">
          {work.media?.kind === 'audio' && (
            <Player src={work.media.src} label={work.media.label} />
          )}
          {work.media?.kind === 'video' && (
            <Reel src={work.media.src} label={work.media.label} poster={work.photo?.src} />
          )}

          {work.photo && work.media?.kind === 'audio' && (
            <figure className="work-photo">
              <img src={work.photo.src} alt={work.photo.caption} loading="lazy" />
              <figcaption>{work.photo.caption}</figcaption>
            </figure>
          )}
        </div>

        <div className="work-aside">
          {work.honour && <p className="work-honour">{work.honour}</p>}
          {work.where && <p className="work-where">{work.where}</p>}
          {work.note && <p className="work-note">{work.note}</p>}

          {work.programme && (
            <ol className="programme">
              {work.programme.map((p) => (
                <li key={p.work}>
                  <span className="programme-work">{p.work}</span>
                  <span className="programme-by">{p.composer}</span>
                  {p.movements && (
                    <span className="programme-mvts">{p.movements.join(' · ')}</span>
                  )}
                </li>
              ))}
            </ol>
          )}

          {work.docs && (
            <p className="work-docs">
              {work.docs.map((d) => (
                <a key={d.label} className="att" href={d.href} target="_blank" rel="noreferrer">
                  {d.label}
                </a>
              ))}
            </p>
          )}
        </div>
      </div>
    </article>
  )
}

export default function Creative() {
  const compositions = WORKS.filter((w) => w.kind === 'Composition')
  const performances = WORKS.filter((w) => w.kind === 'Performance')

  return (
    <section id="creative" className="band">
      <div className="shell">
        <p className="eyebrow">Creative</p>
        <h2 className="h-hero" data-reveal>Written, and played</h2>
        <p className="lede" data-reveal>
          Press play. Everything else on this site is a description of
          something; these are the things themselves.
        </p>

        <h3 className="h-rule">Composition</h3>
        <div className="works">
          {compositions.map((w) => <Stage key={w.id} work={w} />)}
        </div>

        <h3 className="h-rule">Performance</h3>
        <div className="works">
          {performances.map((w) => <Stage key={w.id} work={w} />)}
        </div>

        <h3 className="h-rule">Ensembles</h3>
        <WorkGrid items={MUSIC} tight />

        <Todo>
          <b>Introduction and Rondo has a score and a recording and no words.</b>{' '}
          Its thirteen-page research report is on your machine but it is a
          scan, so I could not read it — one or two sentences from you on what
          the piece is doing and it is finished. Two other things: the{' '}
          <em>Abendlied</em> score is only inside your combined AS submission
          PDF, so export a clean one from the Sibelius file to{' '}
          <code>public/scores/abendlied.pdf</code> and it appears beside the
          recording. And <em>Dorian</em>, for baroque jazz combo, is a third
          composition I found but have not put up — say the word.
        </Todo>
        <Todo>
          <b>The recital has its sound but not its picture.</b> The whole
          17:34 is on the page above — that is the camera’s own audio, so it
          is the performance and not a separate take. The video itself is
          1.19GB of 720p at 9Mbps, and a seventeen-minute video does not
          compress under GitHub’s 100MB-per-file limit at any quality worth
          watching. Put it on YouTube or Vimeo as unlisted and I will embed
          it beside the programme; that is also the only version that will
          not make the repository slow to clone.
        </Todo>
        <Todo>
          <b>Who is in the Cadenza photograph?</b> I have captioned it as the
          King’s choirs on stage, which is all I can see. If you are
          conducting in it, that is a different caption and a better one. It
          is also forty identifiable school pupils on a public site — your
          call, and an easy crop to the stage if you would rather.
        </Todo>
      </div>
    </section>
  )
}
