import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Hearing the picture.
 *
 * The waveform on screen is the sum of one pure sine per note, so the audio
 * is too — no harmonics, no sampled piano. What you see is literally what
 * you hear, which is the only reason the drawing is worth showing. It does
 * mean the chord sounds like an organ rather than a Steinway; that is the
 * honest trade.
 *
 * Nothing is created until someone presses play, because an AudioContext
 * built before a gesture is an AudioContext the browser suspends.
 */

const PEAK = 0.17
const FADE = 0.06

export function useChordSound(freqs: number[]) {
  const ctx = useRef<AudioContext | null>(null)
  const voices = useRef<{ osc: OscillatorNode; gain: GainNode }[]>([])
  const [playing, setPlaying] = useState(false)

  const stop = useCallback(() => {
    const c = ctx.current
    if (c) {
      const t = c.currentTime
      for (const v of voices.current) {
        v.gain.gain.cancelScheduledValues(t)
        v.gain.gain.setValueAtTime(v.gain.gain.value, t)
        v.gain.gain.linearRampToValueAtTime(0, t + FADE)
        v.osc.stop(t + FADE + 0.02)
      }
    }
    voices.current = []
    setPlaying(false)
  }, [])

  const start = useCallback(() => {
    if (!freqs.length) return
    ctx.current ??= new AudioContext()
    const c = ctx.current
    void c.resume()
    const t = c.currentTime
    const per = PEAK / Math.sqrt(freqs.length)
    voices.current = freqs.map((f) => {
      const osc = c.createOscillator()
      const gain = c.createGain()
      osc.type = 'sine'
      osc.frequency.value = f
      gain.gain.setValueAtTime(0, t)
      gain.gain.linearRampToValueAtTime(per, t + FADE)
      osc.connect(gain).connect(c.destination)
      osc.start(t)
      return { osc, gain }
    })
    setPlaying(true)
  }, [freqs])

  const toggle = useCallback(() => { playing ? stop() : start() }, [playing, start, stop])

  /* A chord that changes under a held note should become the new chord, and
     a component that unmounts should not keep ringing. */
  useEffect(() => { if (playing) { stop(); start() } /* eslint-disable-next-line */ }, [freqs.join(',')])
  useEffect(() => stop, [stop])

  return { playing, toggle, stop }
}
