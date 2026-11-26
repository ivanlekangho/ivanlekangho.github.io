import { useState } from 'react'
import Todo from '../components/Todo'
import WorkGrid from '../components/WorkGrid'
import { GROUPS, byGroup } from '../data/portfolio'

/**
 * Work and impact, in three fields.
 *
 * The groups used to be Work, Research and Projects — a sort by what each
 * thing was to Ivan, which tells a reader nothing and actively hides the
 * point: the same question turns up in a cancer charity's database, in a
 * Stanford section room and in a bibliometric dataset, and filing those
 * three under "a job, a paper, a side project" buries exactly that. Sorted
 * by who the work was for, the set has an argument in it.
 *
 * Minimal on the face, everything behind the click. A tile carries the one
 * number worth seeing from across the room and the name of the thing; the
 * sentence, the stack and the detail are one click away in the sheet. That
 * is the whole design brief here — a reader should be able to take in nine
 * pieces of work in about four seconds and then choose one.
 */

/**
 * A photograph that appears the moment the file does.
 *
 * The site's rule is that a declared-but-missing thing must not be
 * promised, and a broken image icon over a caption is the worst version of
 * promising it. So this renders the picture if the file is served and a
 * marked slot if it is not, decided by the browser rather than by a build
 * flag — drop the file in and it is simply there.
 */
function Photo({ src, caption, note }: { src: string; caption: string; note?: string }) {
  const [missing, setMissing] = useState(false)
  return (
    <figure className="photo">
      {missing ? (
        <div className="photo-slot">
          <p>Photograph</p>
          <p className="exhibit-note">public{src}</p>
        </div>
      ) : (
        <img src={src} alt={caption} loading="lazy" onError={() => setMissing(true)} />
      )}
      <figcaption>
        {caption}
        {missing && note && <span className="photo-pending"> — {note}</span>}
      </figcaption>
    </figure>
  )
}

export default function Impact() {
  return (
    <section id="impact" className="band">
      <div className="shell">
        <p className="eyebrow">Work / Impact</p>
        <h2 className="h-hero" data-reveal>Innovative Tech for Good</h2>
        <p className="lede lede-list" data-reveal>Society, Education, Health</p>

        {GROUPS.map((g) => (
          <div key={g.id} className="group" data-reveal>
            <h3 className="h-rule">{g.title}</h3>
            <p className="group-gloss">{g.gloss}</p>
            <WorkGrid items={byGroup(g.id)} minimal />

            {/* The photograph closes the Health group rather than opening
                it: the work is the argument and the picture is the person
                who did it, and in that order it reads as evidence instead
                of as a hero shot. */}
            {g.id === 'health' && (
              <Photo
                src="/photos/daffodil-day.jpg"
                caption="Daffodil Day 2026: New Zealand’s largest fundraising campaign"
                note="your photo did not arrive as a file, so drop it here"
              />
            )}
          </div>
        ))}

        <Todo>
          <b>The Daffodil Day photograph needs its file.</b> It came through in
          the conversation but not as something I could copy, so save it to{' '}
          <code>public/photos/daffodil-day.jpg</code> and it appears on its own —
          the slot above is already pointing at it.
        </Todo>
        <Todo>
          <b>Two labs, two titles, no descriptions.</b> SPOG and SoyaLab are each
          a name and nothing else, and they are sitting under Society because
          that is where research went — if either is health or education work,
          say so and it moves. For both: what it stands for, what the lab works
          on, what your part in it is. And is either of them the Stanford Speech
          and Cognitive Development Lab, so I can stop listing one lab twice
          under two names?
        </Todo>
        <Todo>
          <b>Flutterer is in Society by elimination.</b> A social platform built
          to learn full-stack is not health and not education, so it went to the
          third field rather than getting a fourth of its own. If you would
          rather it sat somewhere else, or nowhere, say.
        </Todo>
        <Todo>
          <b>Nothing here can be opened yet.</b> Every attachment slot on these
          tiles is declared and empty, which is why the paperclips only appear
          while you are running the site locally — a greyed-out “Paper” that
          opens nothing is worse for a reader than no mention of a paper. Fill
          them and they go live on their own: <code>public/papers/</code> for the
          three papers, a repo URL for Flutterer, the Uyghur excerpt as text
          rather than a PDF. Code4Myanmar still needs its dates.
        </Todo>
      </div>
    </section>
  )
}
