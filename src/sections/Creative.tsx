import { useRef, useState } from 'react'
import DocSheet from '../components/DocSheet'
import Mark from '../components/Mark'
import Player from '../components/Player'
import Todo from '../components/Todo'
import WorkGrid from '../components/WorkGrid'
import { MUSIC, WORKS, type Attachment, type Work } from '../data/portfolio'

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

/**
 * The score, offered properly.
 *
 * It was a row of small chips under the prose, at the size this site uses
 * for a filename — which is the wrong size for the only piece of evidence
 * on the card. A reader who has just listened to three minutes of a choir
 * is being asked one question, "do you want to see the music", and the
 * control for it should be the second loudest thing in the block after the
 * play button. So: the score leads, filled in the same red; anything that
 * is not a score follows it outlined, because a research report is a
 * footnote to a recital and a score is not.
 */
function Docs({ docs, title }: { docs: Attachment[]; title: string }) {
  const [open, setOpen] = useState<Attachment | null>(null)
  const scores = docs.filter((d) => d.kind === 'score')
  const rest = docs.filter((d) => d.kind !== 'score')
  return (
    <>
      <ul className="docs">
        {[...scores, ...rest].map((d) => (
          <li key={d.label}>
            <button
              type="button"
              className={d.kind === 'score' ? 'doc-btn doc-btn-lead' : 'doc-btn'}
              onClick={() => setOpen(d)}
              aria-haspopup="dialog"
            >
              <Mark kind={d.kind} />
              <span className="doc-btn-text">
                <span className="doc-btn-label">{d.label}</span>
                {d.meta && <span className="doc-btn-meta">{d.meta}</span>}
              </span>
            </button>
          </li>
        ))}
      </ul>
      {open && <DocSheet doc={open} title={title} onClose={() => setOpen(null)} />}
    </>
  )
}

const clock = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`

/**
 * The programme, as a way in.
 *
 * A recital of five movements is not one seventeen-minute object, and a
 * reader who wants the Habañera should not have to hunt for it with a
 * scrub bar. Every movement is a button carrying its own start, and the
 * one currently sounding is marked — so the list is both the contents and
 * the position indicator, which is what a programme in your hand does
 * while you sit in the room.
 */
function Programme({
  works, now, onSeek,
}: {
  works: NonNullable<Work['programme']>
  now: number
  onSeek: (t: number) => void
}) {
  /* The movement under way is the last one that has started. Computed from
     the flattened list rather than per work, because the works run on from
     one another without a gap. */
  const all = works.flatMap((w) => w.movements ?? [])
  const live = all.reduce<number | null>((best, m) => (now + 0.25 >= m.at ? m.at : best), null)

  return (
    <ol className="programme">
      {works.map((w) => (
        <li key={w.work}>
          <p className="programme-work">{w.work}</p>
          <p className="programme-by">{w.composer}</p>
          {w.movements && (
            <ul className="movements">
              {w.movements.map((m) => (
                <li key={m.title}>
                  <button
                    type="button"
                    className={live === m.at ? 'mvt is-live' : 'mvt'}
                    onClick={() => onSeek(m.at)}
                    aria-current={live === m.at ? 'true' : undefined}
                  >
                    <span className="mvt-at">{clock(m.at)}</span>
                    <span className="mvt-title">{m.title}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ol>
  )
}

function Stage({ work }: { work: Work }) {
  const media = useRef<HTMLMediaElement | null>(null)
  const [now, setNow] = useState(0)

  /** Jump there and start, because clicking a movement means "play this". */
  const seek = (t: number) => {
    const m = media.current
    if (!m) return
    m.currentTime = t
    setNow(t)
    void m.play().catch(() => {})
  }

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
        {/* The picture sits above the bar that drives it — the video for
            the recital, the photograph for Abendlied, which has no moving
            picture of itself but has the hall it was sung in. Same shape
            either way: look at the thing, then the controls under it. */}
        <div className="work-media">
          {work.photo && !work.media?.film && (
            <figure className="work-photo">
              <img src={work.photo.src} alt={work.photo.caption} loading="lazy" />
              <figcaption>{work.photo.caption}</figcaption>
            </figure>
          )}

          {work.media && (
            <Player
              src={work.media.src}
              kind={work.media.kind}
              film={work.media.film}
              poster={work.photo?.src}
              label={work.media.label}
              mediaRef={media}
              onTime={setNow}
            />
          )}
        </div>

        <div className="work-aside">
          {work.honour && <p className="work-honour">{work.honour}</p>}
          {work.where && <p className="work-where">{work.where}</p>}
          {work.note && <p className="work-note">{work.note}</p>}

          {work.programme && (
            <Programme works={work.programme} now={now} onSeek={seek} />
          )}

          {work.docs && <Docs docs={work.docs} title={work.title} />}
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
        <h2 className="h-hero" data-reveal>Composer and Performer</h2>
        <p className="lede lede-list" data-reveal>
          Voice, Strings, Woodwind: Ensemble and Solo
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
          <em>Abendlied</em> score here is cut out of your combined AS
          submission with Ghostscript, so it carries that document's
          typesetting rather than a clean export — if you would rather, send a
          fresh PDF from the Sibelius file and I will swap it in. And{' '}
          <em>Dorian</em>, for baroque jazz combo, is a third composition I
          found, with its own written commentary, that is not up yet.
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
