import { useCallback, useEffect, useRef, useState } from 'react'
import { AUDIO_SRC, END_SECONDS, beatAt } from '../data/timing'
import { VOICE_ONSET } from './beatmap'

/**
 * The recording, and the one number the score needs from it.
 *
 * `beat` is null whenever nothing is playing, which is what tells every
 * notehead to go back to being ink. While the audio runs it is read off
 * `currentTime` once a frame and converted by the map in data/timing.ts,
 * so the score follows the actual performance rather than a metronome.
 */

export type Playback = {
  /** False until a recording is actually sitting in public/audio. */
  available: boolean
  playing: boolean
  /** Beats into the phrase, or null when stopped. */
  beat: number | null
  toggle: () => void
  stop: () => void
}

export function usePlayback(): Playback {
  const el = useRef<HTMLAudioElement | null>(null)
  const raf = useRef(0)
  const [available, setAvailable] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [beat, setBeat] = useState<number | null>(null)

  /* A HEAD request rather than simply pointing <audio> at the path: until
     the recording exists, that would be a media error in every console and
     a broken-looking control on the page. */
  useEffect(() => {
    let dead = false
    fetch(AUDIO_SRC, { method: 'HEAD' })
      .then((r) => {
        /* The content type matters: a dev server answers an unknown path
           with index.html and a 200, and GitHub Pages answers it with our
           404.html. Either one would light up a play button for a file
           that isn't there. */
        const type = r.headers.get('content-type') ?? ''
        if (!dead && r.ok && !type.startsWith('text/')) setAvailable(true)
      })
      .catch(() => { /* offline or blocked: treat as no recording */ })
    return () => { dead = true }
  }, [])

  const stop = useCallback(() => {
    cancelAnimationFrame(raf.current)
    const a = el.current
    if (a) { a.pause(); a.currentTime = 0 }
    setPlaying(false)
    setBeat(null)
  }, [])

  const toggle = useCallback(() => {
    if (!available) return
    if (!el.current) {
      el.current = new Audio(AUDIO_SRC)
      el.current.preload = 'auto'
    }
    const a = el.current
    if (!a.paused) {
      a.pause()
      cancelAnimationFrame(raf.current)
      setPlaying(false)
      return
    }
    const follow = () => {
      setBeat(beatAt(a.currentTime))
      /* The file may run on past the phrase — a whole song, eventually. The
         score only knows these two bars, so it steps back once they end. */
      if (a.currentTime > END_SECONDS + 0.4 || a.ended) { stop(); return }
      raf.current = requestAnimationFrame(follow)
    }
    void a.play().then(() => {
      setPlaying(true)
      raf.current = requestAnimationFrame(follow)
    }).catch(() => setAvailable(false))
  }, [available, stop])

  useEffect(() => () => {
    cancelAnimationFrame(raf.current)
    el.current?.pause()
  }, [])

  /* Calibration. Open the site with ?tap, play, and hit SPACE on each
     syllable; the console prints the array to paste into timing.ts. This is
     the only honest way to get these numbers — a sung line is not a grid. */
  useEffect(() => {
    if (!new URLSearchParams(location.search).has('tap')) return
    const taps: number[] = []
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== 'Space' || !el.current) return
      e.preventDefault()
      taps.push(Number(el.current.currentTime.toFixed(3)))
      const left = VOICE_ONSET.length - taps.length
      console.log(
        `[tap] ${taps.length}/${VOICE_ONSET.length}` +
        (left > 0 ? ` — ${left} to go` : ' — paste this as ONSET_SECONDS:'),
        left > 0 ? '' : `\nexport const RECORDING = { onsets: [${taps.join(', ')}] }`,
      )
      if (left === 0) taps.length = 0
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return { available, playing, beat, toggle, stop }
}
