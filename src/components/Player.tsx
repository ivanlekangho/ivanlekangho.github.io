import { useEffect, useRef, useState } from 'react'

/**
 * A recording, played where it sits.
 *
 * The native audio control is a browser widget: it brings its own grey, its
 * own corner radius and its own idea of what a page looks like, and on a
 * sheet of paper with one red on it that reads as a thing pasted in from
 * somewhere else. This is the same three controls in the site's own hand.
 *
 * The scrubber is a real range input rather than a drawn bar. That decision
 * is worth more than it looks: keyboard seeking, drag, touch, the step
 * semantics and the screen-reader announcement all come with it, and all of
 * them would otherwise have to be written and none of them would be written
 * as well.
 *
 * If the file is missing or the codec is refused, the element says so and
 * offers the file as a download instead — an audio player that silently
 * does nothing when pressed is worse than an honest link.
 */

const clock = (s: number) => {
  if (!Number.isFinite(s)) return '–:––'
  const m = Math.floor(s / 60)
  const r = Math.floor(s % 60)
  return `${m}:${String(r).padStart(2, '0')}`
}

export default function Player({ src, label }: { src: string; label: string }) {
  const ref = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [at, setAt] = useState(0)
  const [len, setLen] = useState(NaN)
  const [bad, setBad] = useState(false)

  /* The element is the source of truth, not this component: it can be
     paused by the OS, by another tab, by a headphone unplugging. So the
     state follows the element's events rather than the button's clicks. */
  useEffect(() => {
    const a = ref.current
    if (!a) return
    const onTime = () => setAt(a.currentTime)
    const onMeta = () => setLen(a.duration)
    const onPlay = () => setPlaying(true)
    const onPause = () => setPlaying(false)
    const onEnd = () => { setPlaying(false); setAt(0) }
    const onError = () => setBad(true)
    a.addEventListener('timeupdate', onTime)
    a.addEventListener('loadedmetadata', onMeta)
    a.addEventListener('durationchange', onMeta)
    a.addEventListener('play', onPlay)
    a.addEventListener('pause', onPause)
    a.addEventListener('ended', onEnd)
    a.addEventListener('error', onError)
    return () => {
      a.removeEventListener('timeupdate', onTime)
      a.removeEventListener('loadedmetadata', onMeta)
      a.removeEventListener('durationchange', onMeta)
      a.removeEventListener('play', onPlay)
      a.removeEventListener('pause', onPause)
      a.removeEventListener('ended', onEnd)
      a.removeEventListener('error', onError)
    }
  }, [])

  const toggle = () => {
    const a = ref.current
    if (!a) return
    if (a.paused) a.play().catch(() => setBad(true))
    else a.pause()
  }

  const seek = (v: number) => {
    const a = ref.current
    if (!a || !Number.isFinite(len)) return
    a.currentTime = v
    setAt(v)
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
    <div className="player">
      {/* preload="metadata" so the scrubber knows the length before anyone
          presses play, without fetching several megabytes nobody asked
          for. */}
      <audio ref={ref} src={src} preload="metadata" />
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
    </div>
  )
}
