import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import DocSheet from '../components/DocSheet'
import Mark from '../components/Mark'
import Player from '../components/Player'
import Todo from '../components/Todo'
import WorkGrid from '../components/WorkGrid'
import Chapters, { type Chapter } from '../components/Chapters'
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
 * play button. So both the score and the research report are filled in the
 * red: a report on an extended performance is not a footnote to it, it is
 * the part that says what the player was thinking, and on this site that
 * is the half nobody else publishes.
 */
function Docs({ docs, title }: { docs: Attachment[]; title: string }) {
  const [open, setOpen] = useState<Attachment | null>(null)
  const lead = (d: Attachment) => d.kind === 'score' || d.kind === 'report'
  const scores = docs.filter(lead)
  const rest = docs.filter((d) => !lead(d))
  return (
    <>
      <ul className="docs">
        {[...scores, ...rest].map((d) => (
          <li key={d.label}>
            <button
              type="button"
              className={lead(d) ? 'doc-btn doc-btn-lead' : 'doc-btn'}
              onClick={() => setOpen(d)}
              aria-haspopup="dialog"
            >
              <Mark kind={d.kind} />
              <span className="doc-btn-label">{d.label}</span>
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

/** A still that shows a marked slot rather than a broken image icon. */
function Still({ photo }: { photo: NonNullable<Work['photo']> }) {
  const [missing, setMissing] = useState(false)
  if (missing) {
    return (
      <figure className="work-photo">
        <div className="photo-slot">
          <p>Photograph</p>
          <p className="exhibit-note">public{photo.src}</p>
        </div>
        <figcaption>{photo.caption}</figcaption>
      </figure>
    )
  }
  return (
    <figure className={photo.stock ? 'work-photo is-stock' : 'work-photo'}>
      <img
        src={photo.src}
        alt={photo.stock
          ? `${photo.caption} — a stock photograph, not a picture of this performance`
          : photo.caption}
        loading="lazy"
        onError={() => setMissing(true)}
      />
      {photo.stock && (
        <span className="stock-note" aria-hidden="true">
          Stock image of a clarinet quintet — not this performance
        </span>
      )}
      <figcaption>{photo.caption}</figcaption>
    </figure>
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
        <p className="work-scoring">{work.scoringNote ?? work.scoring}</p>
      </header>

      <div className="work-body">
        {/* The picture sits above the bar that drives it — the video for
            the recital, the photograph for Abendlied, which has no moving
            picture of itself but has the hall it was sung in. Same shape
            either way: look at the thing, then the controls under it. */}
        <div className="work-media">

          {work.media && (
            <Player
              src={work.media.src}
              kind={work.media.kind}
              film={work.media.film}
              end={work.media.end}
              label={work.media.label}
              mediaRef={media}
              onTime={setNow}
            />
          )}
          {work.media?.caption && (
            <p className="media-caption">{work.media.caption}</p>
          )}

          {/* The photograph is not the work's poster. Abendlied's film is
              upright and the hall it was sung in is a wide shot, so using
              one as the other's poster changes the frame's shape the moment
              the metadata lands. It sits under the transport instead, where
              it is a second document rather than a stand-in for the first. */}
          {work.photo && <Still photo={work.photo} />}
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

  const chapters: Chapter[] = [
    {
      id: 'composition',
      label: 'Composition',
      body: (
        <>
          <p className="eyebrow" data-reveal>Composition</p>
          <h2 className="chapter-head" data-reveal>Written for people I knew</h2>
          <div className="works">
            {compositions.map((w) => <Stage key={w.id} work={w} />)}
          </div>
        </>
      ),
    },
    {
      id: 'performance',
      label: 'Performance',
      body: (
        <>
          <p className="eyebrow" data-reveal>Performance</p>
          <h2 className="chapter-head" data-reveal>One route through a continent</h2>
          <div className="works">
            {performances.map((w) => <Stage key={w.id} work={w} />)}
          </div>
        </>
      ),
    },
    {
      id: 'ensembles',
      label: 'Ensembles',
      body: (
        <>
          <p className="eyebrow" data-reveal>Ensembles</p>
          <h2 className="chapter-head" data-reveal>Choirs, a big band, an orchestra</h2>
          <WorkGrid items={MUSIC} tight minimal />

          {/* The room is not in the bar, because it is the end of an
              argument rather than a tab. This is where it belongs instead:
              whoever has just listened to the compositions is the likeliest
              person to want one phrase of Schubert read three ways. */}
          <p className="to-hall">
            <Link to="/hall">
              <span className="to-hall-line">&ldquo;Ich bin ein Fremdling überall&rdquo;</span>
              <span className="to-hall-gloss">
                The recital room — one phrase of Schubert, read three ways
              </span>
            </Link>
          </p>
        </>
      ),
    },
  ]

  return (
    <Chapters
      title="Composer and Performer"
      /* Read it as one sentence running on from the title, because that is
         how it is set and how it will be read: "Composer and performer, for
         voice, strings, woodwind and piano, in ensemble and alone."

         The prepositions were the other way round in the draft — "in" the
         instruments and "for" the ensembles — and that is the whole reason
         it sounded wrong. You write FOR an instrument and play IN an
         ensemble. "Alone" rather than "solo" for the same reason: the line
         beside it is a plural noun, and "solo" next to "ensembles" is an
         adjective doing a noun's job. */
      subtitle={<>For voice, strings, woodwind and piano<br />in ensemble and alone</>}
      chapters={chapters}
    >
      <Todo>
        <b>Is the clarinet quintet photograph licensed for this?</b> It is up,
        with the disclosure on it saying it is a stock image of a quintet and
        not this performance — but that disclosure is about honesty with a
        reader, and it does nothing about whose picture it is. If it came from
        a stock library, it needs the credit the licence asks for; if it was
        lifted from a search, it should come down and the slot will show again.
      </Todo>
      <Todo>
        <b>Introduction and Rondo describes itself from your report.</b> The
        forces, the Mozart instrumentation, the Saint-Saëns form and the
        A–B–A–C–A–coda are all yours, read out of the research report. Your
        clarinettist and the quartet are named in that report and are not named
        here, because they are other people — say the word and they go in with a
        credit. And the report says the live recording was never made, so the
        audio is labelled a playback of the score rather than a performance.
      </Todo>
      <Todo>
        <b><em>Dorian</em>, for baroque jazz combo, is a third composition</b> I
        found with its own written commentary, and it is not up yet.
      </Todo>
    </Chapters>
  )
}
