import { useEffect, useMemo, useRef, useState } from 'react'
import { HARMONY, soundingAt } from '../../data/piano'
import { mix, periodicity, plot, sine, temperamentError } from '../../lib/acoustics'
import { parseChord, SUGGESTIONS, type Chord } from '../../lib/chords'
import { useChordSound } from '../../lib/chordSound'
import { hz, label, midi, ratioTo } from '../../lib/tuning'
import Keyboard from './Keyboard'

/**
 * The engineer's reading: type a chord, see why it sounds like that.
 *
 * It does one thing, and it does it in one screenful. There is no
 * scrollback — each chord replaces the last — because the room owns the
 * wheel at every stop including this one, and a pane that swallowed the
 * wheel would trap you at the bottom of the rail.
 *
 * Every number is computed from the pitches, not looked up: ratios against
 * the lowest note, how far equal temperament sits from them, and the period
 * over which the summed sines come back round, which is the actual answer to
 * why some chords settle and others grind. The waveform is the sum of one
 * pure sine per note, and so is the audio, so the picture and the sound are
 * the same object.
 */

const W = 680
const H = 96

/**
 * Where an AI would plug in.
 *
 * The ask was to send what you type through a model. On a static site served
 * from GitHub Pages there is no server to hold a key, and a key in the
 * browser is a key anyone can read out of the bundle — so the default path
 * is the parser in lib/chords.ts, which is deterministic and offline and
 * gets Bb13 right every time. Set VITE_CHORD_API to a URL that accepts
 * `{ text }` and answers `{ midi: number[], name?: string }` and freeform
 * input ("something like the end of Mahler 9") starts working, with the
 * parser as the fallback. That endpoint is the only part that has to live
 * somewhere with a secret.
 */
async function resolveChord(text: string): Promise<Chord | null> {
  const api = import.meta.env.VITE_CHORD_API
  if (api) {
    try {
      const r = await fetch(api, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ text }),
      })
      if (r.ok) {
        const j = (await r.json()) as { midi?: number[]; name?: string }
        if (j.midi?.length) {
          const { spell } = await import('../../lib/chords')
          const lo = Math.min(...j.midi)
          const pitches = j.midi.sort((a, b) => a - b).map((n) => spell(n, false))
          return {
            symbol: text.trim(),
            name: j.name ?? 'as read by the model',
            pitches,
            names: pitches.map(label),
            intervals: j.midi.map((n) => n - lo),
          }
        }
      }
    } catch { /* fall through to the parser */ }
  }
  return parseChord(text)
}

const f2 = (n: number) => n.toFixed(2)

export default function Terminal({ live }: { live: boolean }) {
  const [line, setLine] = useState('')
  const [chord, setChord] = useState<Chord | null>(() => parseChord('Cmaj7'))
  const [bad, setBad] = useState<string | null>(null)
  const input = useRef<HTMLInputElement>(null)

  const freqs = useMemo(() => (chord ? chord.pitches.map(hz) : []), [chord])
  const sound = useChordSound(freqs)

  /* Nothing should keep ringing once the rail leaves this stop. */
  useEffect(() => { if (!live) sound.stop() }, [live, sound])

  async function run(text: string) {
    if (!text.trim()) return
    const c = await resolveChord(text)
    if (c) { setChord(c); setBad(null) } else { setBad(text.trim()) }
  }

  const sorted = chord ? [...chord.pitches].sort((a, b) => midi(a) - midi(b)) : []
  const { ratios, period, verdict } = periodicity(sorted)
  const f0 = sorted.length ? hz(sorted[0]) : 1
  /* A window a little over one repeat, so you can see it come back round. */
  const span = Math.min(0.09, (period + 0.35) / f0)

  return (
    <div className="term" aria-label="Type a chord and see why it sounds the way it does">
      <div className="term-bar">
        <span className="term-name">python3 · chords.py</span>
        <span className="term-hint">why it sounds the way it does</span>
      </div>

      <div className="term-view">
        {chord && (
          <>
            <div className="term-wave">
              <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} preserveAspectRatio="none"
                aria-hidden="true">
                <line x1="0" y1={H / 2} x2={W} y2={H / 2} stroke="var(--rule)" strokeWidth="1" />
                {/* every note on its own, faintly, and then their sum */}
                {freqs.map((f, i) => (
                  <polyline key={i} points={plot(sine(f, span, 1200), W, H * 0.8)}
                    transform={`translate(0 ${H * 0.1})`}
                    fill="none" stroke="var(--accent-soft)" strokeWidth="0.8" opacity="0.38" />
                ))}
                <polyline points={plot(mix(freqs, span, 2000), W, H)}
                  fill="none" stroke="var(--accent)" strokeWidth="1.6" strokeLinejoin="round" />
                {/* where the whole shape starts over */}
                {period / f0 < span && (
                  <line x1={(W * (period / f0)) / span} y1="2" x2={(W * (period / f0)) / span} y2={H - 2}
                    stroke="var(--t2-mid)" strokeWidth="1" strokeDasharray="3 3" />
                )}
              </svg>
              <p className="term-cap">
                {freqs.length} sines, summed · one repeat marked · {f2(span * 1000)} ms
              </p>
            </div>

            <Keyboard pitches={sorted} />

            <div className="term-read">
              <div>
                <p className="term-sym">{chord.symbol}</p>
                <p className="term-name-full">{chord.name}</p>
                <p className={`term-verdict is-${verdict}`}>
                  repeats every {period} periods of {chord.names[0] ?? label(sorted[0])} — {verdict}
                </p>
              </div>
              <table>
                <tbody>
                  {sorted.map((p, i) => {
                    const r = ratioTo(sorted[0], p)
                    const err = temperamentError(sorted[0], p)
                    return (
                      <tr key={label(p) + i}>
                        <td>{chord.names[i] ?? label(p)}</td>
                        <td>{f2(hz(p))} Hz</td>
                        <td>{r.num}/{r.den}</td>
                        <td>{i === 0 ? 'root' : `${err >= 0 ? '+' : ''}${err}¢`}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <pre className="term-py">{`freqs = [${freqs.map(f2).join(', ')}]
y = sum(np.sin(2*np.pi*f*t) for f in freqs)   # ${ratios.join(' ')}`}</pre>
          </>
        )}

        {bad && (
          <p className="term-bad">
            Can’t read <b>{bad}</b>. Try a chord symbol — Cmaj7, F♯m7b5, Bb13, Dsus4/A.
          </p>
        )}
      </div>

      <div className="term-chips">
        {HARMONY.map((h, i) => (
          <button key={h.atBeat} type="button" disabled={!live}
            title={`Chord ${i + 1} of the phrase — ${h.numeral}`}
            onClick={() => {
              const p = soundingAt(h.atBeat).sort((a, b) => midi(a) - midi(b))
              setChord({
                symbol: h.symbol, name: `${h.name} · ${h.numeral} in the phrase`, pitches: p,
                names: p.map(label), intervals: p.map((x) => midi(x) - midi(p[0])),
              })
              setBad(null)
            }}>{h.symbol}</button>
        ))}
        <span className="term-chip-sep" aria-hidden="true" />
        {SUGGESTIONS.map((c) => (
          <button key={c} type="button" disabled={!live} onClick={() => { setLine(c); void run(c) }}>{c}</button>
        ))}
      </div>

      <form className="term-prompt"
        onSubmit={(e) => { e.preventDefault(); void run(line); input.current?.focus({ preventScroll: true }) }}>
        <span aria-hidden="true">&gt;&gt;&gt;</span>
        <input
          ref={input}
          value={line}
          onChange={(e) => setLine(e.target.value)}
          placeholder="enter a chord here"
          aria-label="Enter a chord"
          spellCheck={false}
          autoComplete="off"
          disabled={!live}
        />
        <button type="button" className={sound.playing ? 'term-sound is-on' : 'term-sound'}
          onClick={sound.toggle} disabled={!live || !freqs.length}
          aria-pressed={sound.playing}
          aria-label={sound.playing ? 'Stop the chord' : 'Play the chord'}>
          <svg viewBox="0 0 24 24" width="13" height="13" aria-hidden="true">
            {sound.playing
              ? <path d="M9 5v14M15 5v14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              : <path d="M8 5.5 19 12 8 18.5Z" fill="currentColor" />}
          </svg>
          {sound.playing ? 'sound on' : 'sound'}
        </button>
      </form>
    </div>
  )
}
