import { useEffect, useRef, useState, type RefObject } from 'react'

/**
 * A recording, played where it sits.
 *
 * The native media control is a browser widget: it brings its own grey, its
 * own corner radius and its own idea of what a page looks like, and on a
 * sheet of paper with one red on it that reads as a thing pasted in from
 * somewhere else. This is the same controls in the site's own hand.
 *
 * One transport, whichever the medium — and sometimes two files behind it.
 * A `film` is a SILENT picture slaved to the audio that is actually
 * playing. That split is forced: see the note on Media in data/portfolio,
 * but briefly, the one encoder on this machine will not produce a file
 * that is both watchable and listenable under GitHub's size limit, so the
 * picture comes from a small heavily-compressed copy with its own sound
 * thrown away and the sound comes from a proper extract. Both are cut from
 * the same tape at the same offset, so they agree to within 40ms at the
 * start; the loop below keeps them agreeing for the next seventeen
 * minutes.
 *
 * Giving the video its own native controls as well was the other option
 * and it is worse: two scrub bars for one performance, eighty pixels
 * apart, and a reader has to work out which one is real.
 *
 * The scrubber is a real range input rather than a drawn bar. That decision
 * is worth more than it looks: keyboard seeking, drag, touch, the step
 * semantics and the screen-reader announcement all come with it, and all of
 * them would otherwise have to be written and none of them would be written
 * as well.
 *
 * If the file is missing or the codec is refused, the element says so and
 * offers the file as a download instead — a player that silently does
 * nothing when pressed is worse than an honest link.
 *
 * Only one thing on the page sounds at a time. Three recordings sitting a
 * few hundred pixels apart is three chances to end up with a choir and a
 * saxophone playing over each other, and the reader's first move then is
 * not to choose between them, it is to leave.
 */

/** Seconds a skip button moves. */
const JUMP = 10

/**
 * Take the page's one pair of ears.
 *
 * It asks the DOM rather than keeping a register of players, which means it
 * also silences media this component did not create — a video, an embed, a
 * future second player — and cannot go stale when one unmounts mid-play.
 * Pausing something already paused is free and fires no event, so there is
 * no loop here between this and the `pause` listeners below.
 */
function claimTheRoom(mine: HTMLMediaElement) {
  for (const el of document.querySelectorAll<HTMLMediaElement>('audio, video')) {
    if (el !== mine && !el.paused) el.pause()
  }
}

const clock = (s: number) => {
  if (!Number.isFinite(s)) return '–:––'
  const m = Math.floor(s / 60)
  const r = Math.floor(s % 60)
  return `${m}:${String(r).padStart(2, '0')}`
}

export default function Player({
  src, label, kind = 'audio', film, end, poster, mediaRef, onTime,
}: {
  src: string
  label: string
  kind?: 'audio' | 'video'
  /** A silent picture to run against `src`. */
  film?: string
  /**
   * Stop here rather than at the end of the file.
   *
   * Abendlied's recording runs five seconds past the music into the
   * applause, and Ivan wants it to end at 2:24. Capping it here rather
   * than re-cutting the file is not laziness: the only encoder available
   * would re-compress the whole thing to remove five seconds it could
   * simply decline to play, and the reader cannot tell the difference —
   * the scrubber ends at 2:24 and so does the sound.
   */
  end?: number
  poster?: string
  /** Handed in when something outside needs to seek this — the programme
   *  list, which jumps to a movement. */
  mediaRef?: RefObject<HTMLMediaElement | null>
  onTime?: (t: number) => void
}) {
  const own = useRef<HTMLMediaElement | null>(null)
  const ref = mediaRef ?? own
  const pic = useRef<HTMLVideoElement | null>(null)
  /* A video with usable sound of its own is simply the master. The split
     into picture-plus-audio is only for the recital, whose small copy has
     16kHz sound. */
  const videoIsMaster = kind === 'video' && !film
  const [playing, setPlaying] = useState(false)
  const [at, setAt] = useState(0)
  const [len, setLen] = useState(NaN)
  const [bad, setBad] = useState(false)

  /* The element is the source of truth, not this component: it can be
     paused by the OS, by another tab, by a headphone unplugging, or by
     another player on this page claiming the room. So the state follows the
     element's events rather than the button's clicks. */
  useEffect(() => {
    const a = ref.current
    if (!a) return
    const onTimeUpdate = () => {
      if (end !== undefined && a.currentTime >= end) {
        a.pause()
        a.currentTime = end
      }
      setAt(a.currentTime)
      onTime?.(a.currentTime)
    }
    const onMeta = () => setLen(end !== undefined ? Math.min(end, a.duration) : a.duration)
    const onPlay = () => { claimTheRoom(a); setPlaying(true) }
    const onPause = () => setPlaying(false)
    const onEnd = () => { setPlaying(false); setAt(0); onTime?.(0) }
    const onError = () => setBad(true)
    a.addEventListener('timeupdate', onTimeUpdate)
    a.addEventListener('seeked', onTimeUpdate)
    a.addEventListener('loadedmetadata', onMeta)
    a.addEventListener('durationchange', onMeta)
    a.addEventListener('play', onPlay)
    a.addEventListener('pause', onPause)
    a.addEventListener('ended', onEnd)
    a.addEventListener('error', onError)
    return () => {
      a.removeEventListener('timeupdate', onTimeUpdate)
      a.removeEventListener('seeked', onTimeUpdate)
      a.removeEventListener('loadedmetadata', onMeta)
      a.removeEventListener('durationchange', onMeta)
      a.removeEventListener('play', onPlay)
      a.removeEventListener('pause', onPause)
      a.removeEventListener('ended', onEnd)
      a.removeEventListener('error', onError)
    }
    /* onTime is a fresh closure on every render of the parent; depending on
       it would tear every listener down four times a second. */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /**
   * Keep the picture with the sound.
   *
   * The audio is the master and the only clock; the picture is dragged
   * along behind it. Correcting every frame would fight the video's own
   * decoder and show as stutter, so it is left alone until it is a quarter
   * of a second out — past that a listener can see the difference between
   * a tongued note and the sound of it. Nothing here runs unless there is
   * a picture to keep.
   */
  useEffect(() => {
    if (!film) return
    const a = ref.current
    const v = pic.current
    if (!a || !v) return
    v.muted = true
    const follow = () => {
      if (Math.abs(v.currentTime - a.currentTime) > 0.25) v.currentTime = a.currentTime
      if (a.paused) { if (!v.paused) v.pause() }
      else if (v.paused) void v.play().catch(() => {})
    }
    const id = window.setInterval(follow, 250)
    a.addEventListener('seeked', follow)
    a.addEventListener('play', follow)
    a.addEventListener('pause', follow)
    return () => {
      window.clearInterval(id)
      a.removeEventListener('seeked', follow)
      a.removeEventListener('play', follow)
      a.removeEventListener('pause', follow)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [film])

  const toggle = () => {
    const a = ref.current
    if (!a) return
    if (a.paused) a.play().catch(() => setBad(true))
    else a.pause()
  }

  const seek = (v: number) => {
    const a = ref.current
    if (!a || !Number.isFinite(len)) return
    const t = Math.min(len, Math.max(0, v))
    a.currentTime = t
    setAt(t)
    onTime?.(t)
  }

  /* Skips work before the duration is known — hence the clamp against
     `len` only where it exists. Ten seconds is the figure every player a
     reader has used settles on, and the point of matching it is that
     nobody has to find out what these two buttons do. */
  const jump = (by: number) => {
    const a = ref.current
    if (!a) return
    const t = Math.max(0, a.currentTime + by)
    a.currentTime = Number.isFinite(len) ? Math.min(len, t) : t
    setAt(a.currentTime)
    onTime?.(a.currentTime)
  }

  const full = () => {
    const v = film ? pic.current : ref.current
    if (v instanceof HTMLVideoElement) v.requestFullscreen?.().catch(() => {})
  }

  if (bad) {
    return (
      <p className="player-bad">
        This browser would not play the recording.{' '}
        <a href={src} download>Download it instead</a>.
      </p>
    )
  }

  return (
    <div className="player-block">
      {/* preload="metadata" so the scrubber knows the length before anyone
          presses play, without fetching tens of megabytes nobody asked
          for. */}
      {film && (
        <video
          ref={pic}
          className="reel"
          src={film}
          poster={poster}
          preload="metadata"
          playsInline
          muted
          /* It carries no sound and no controls, so it is decoration as far
             as assistive technology is concerned — the transport below is
             the thing that is labelled and operable. */
          aria-hidden="true"
          tabIndex={-1}
          onClick={toggle}
        />
      )}
      {videoIsMaster ? (
        <video
          ref={ref as RefObject<HTMLVideoElement>}
          className="reel"
          src={src}
          poster={poster}
          preload="metadata"
          playsInline
          aria-label={label}
          onClick={toggle}
        />
      ) : (
        <audio ref={ref as RefObject<HTMLAudioElement>} src={src} preload="metadata" />
      )}

      <div className="player">
        {/* Set as the number and nothing else. The circular-arrow glyph
            every player uses needs the figure inside its loop to be legible
            at about 8px, and at that size it was a smudge with a 10 in it —
            the two words are clearer than the icon they were decorating. */}
        <button type="button" className="player-jump" onClick={() => jump(-JUMP)}
          aria-label={`Back ${JUMP} seconds`}>&minus;{JUMP}</button>

        <button
          type="button"
          className={playing ? 'player-go is-playing' : 'player-go'}
          onClick={toggle}
          aria-label={playing ? `Pause ${label}` : `Play ${label}`}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            {playing
              ? <><rect x="7" y="5" width="3.6" height="14" /><rect x="13.4" y="5" width="3.6" height="14" /></>
              : <path d="M8 5.2 19 12 8 18.8Z" />}
          </svg>
        </button>

        <button type="button" className="player-jump" onClick={() => jump(JUMP)}
          aria-label={`Forward ${JUMP} seconds`}>+{JUMP}</button>

        <input
          className="player-seek"
          type="range"
          min={0}
          max={Number.isFinite(len) ? len : 0}
          value={at}
          step="any"
          disabled={!Number.isFinite(len)}
          onChange={(e) => seek(Number(e.target.value))}
          aria-label={`Seek within ${label}`}
        />

        <p className="player-clock">
          <span>{clock(at)}</span>
          <span className="player-clock-sep">/</span>
          <span>{clock(len)}</span>
        </p>

        {(film || kind === 'video') && (
          <button type="button" className="player-full" onClick={full}
            aria-label="Full screen">
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M4 9V4h5 M15 4h5v5 M20 15v5h-5 M9 20H4v-5"
                fill="none" stroke="currentColor" strokeWidth="1.9"
                strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}
