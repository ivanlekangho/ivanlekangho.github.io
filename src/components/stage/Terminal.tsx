import { useEffect, useMemo, useRef, useState } from 'react'
import { HARMONY, soundingAt } from '../../data/piano'
import { periodicity } from '../../lib/acoustics'
import { identify, parseChord, SUGGESTIONS, type Chord } from '../../lib/chords'
import { useChordSound } from '../../lib/chordSound'
import { centsBetween, freqsIn, TUNINGS, type TuningId } from '../../lib/temperament'
import { label, midi, ratioTo } from '../../lib/tuning'
import Keyboard, { keyboardRange } from './Keyboard'

/**
 * The engineer's reading: a chord, and why it sounds like that.
 *
 * One chord at a time and no scrollback, because the room owns the wheel at
 * every stop including this one, and a pane that swallowed the wheel would
 * strand you at the bottom of the rail. Each chord replaces the last.
 *
 * Nothing here is a lookup of an answer someone wrote down. The ratios come
 * from the pitches, the frequencies come from the pitches and the chosen
 * tuning, the drawing is the sum of one sine per frequency, and the audio is
 * the same sines — so the picture and the sound are the same object, and
 * changing the tuning changes all of it at once.
 */

const W = 680
const H = 104
const MID = H / 2
const SUM_A = H * 0.42          /* amplitude of the sum */
const PART_A = H * 0.30         /* and of each note under it */
const LANE = ['--t1-mid', '--t2-mid', '--t3-mid', '--t4-mid', '--t0-mid', '--accent']

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
          const c = identify(j.midi)
          if (c) return j.name ? { ...c, name: j.name } : c
        }
      }
    } catch { /* fall through to the parser */ }
  }
  return parseChord(text)
}

const f2 = (n: number) => n.toFixed(2)
const lane = (i: number) => `var(${LANE[i % LANE.length]})`

/** The phrase's own resolution, so the terminal opens on the piece. */
function openingChord(): Chord {
  const last = HARMONY[HARMONY.length - 1]
  return identify(soundingAt(last.atBeat).map(midi)) ?? parseChord('D')!
}

export default function Terminal({ live }: { live: boolean }) {
  const [line, setLine] = useState('')
  const [chord, setChord] = useState<Chord | null>(openingChord)
  const [tuning, setTuning] = useState<TuningId>('equal')
  const [bad, setBad] = useState<string | null>(null)
  /* Fixed while you build a chord by hand, so the keys do not move under
     your finger; it follows along only when a new chord is typed. */
  const [keys, setKeys] = useState(() => keyboardRange(midi(openingChord().pitches[0])))
  const [at, setAt] = useState<number | null>(null)      /* hover, 0–1 along the window */
  const [only, setOnly] = useState<number | null>(null)  /* one note, isolated */
  const input = useRef<HTMLInputElement>(null)
  const wave = useRef<SVGSVGElement>(null)

  const sorted = useMemo(
    () => (chord ? [...chord.pitches].sort((a, b) => midi(a) - midi(b)) : []),
    [chord],
  )
  const freqs = useMemo(() => freqsIn(sorted, tuning), [sorted, tuning])
  const sound = useChordSound(freqs)

  /* Nothing should keep ringing once the rail leaves this stop. */
  useEffect(() => { if (!live) sound.stop() }, [live, sound])

  function land(c: Chord) {
    setChord(c)
    setBad(null)
    setKeys(keyboardRange(midi([...c.pitches].sort((a, b) => midi(a) - midi(b))[0])))
  }

  async function run(text: string) {
    if (!text.trim()) return
    const c = await resolveChord(text)
    if (c) land(c); else setBad(text.trim())
  }

  /** A key press edits the chord in place rather than replacing it.
   *  Read off the previous state rather than off this render, or two keys
   *  pressed inside one frame — which is what playing a chord with one hand
   *  looks like to React — would both resolve against the chord before
   *  either of them, and the first would be lost. */
  function toggle(m: number) {
    setChord((prev) => {
      const held = new Set((prev?.pitches ?? []).map(midi))
      held.has(m) ? held.delete(m) : held.add(m)
      return identify([...held])
    })
    setBad(null)
  }

  const { period, verdict } = periodicity(sorted)
  const f0 = freqs.length ? Math.min(...freqs) : 1
  /* A little over one repeat where the chord repeats soon, and six cycles
     of the bass where it does not — past that the component sines cross
     each other so often they stop being readable as lines. */
  const span = Math.min(6, period + 0.35) / f0

  /** The chosen tuning against the simple ratio the ear is listening for. */
  const rows = sorted.map((p, i) => {
    const r = ratioTo(sorted[0], p)
    const pure = 1200 * Math.log2(r.num / r.den)
    return { p, i, r, off: Math.round(centsBetween(freqs[0], freqs[i]) - pure) }
  })
  const worst = rows.reduce((n, r) => Math.max(n, Math.abs(r.off)), 0)

  /* The sum, and each note under it. Sampled here rather than through the
     helper so the two share one time axis and one amplitude convention. */
  const path = (f: (t: number) => number, amp: number, n = 900) => {
    const pts: string[] = []
    for (let i = 0; i <= n; i++) {
      const t = (i / n) * span
      pts.push(`${((i / n) * W).toFixed(1)},${(MID - f(t) * amp).toFixed(1)}`)
    }
    return pts.join(' ')
  }
  const partial = (f: number) => (t: number) => Math.sin(2 * Math.PI * f * t)
  const raw = (t: number) => {
    let v = 0
    for (const f of freqs) v += Math.sin(2 * Math.PI * f * t)
    return v
  }
  /* Normalised by what the sum actually reaches over the window, not by the
     number of notes: sines rarely all peak together, and dividing by the
     count draws a chord quieter the more notes are in it. */
  const peak = useMemo(() => {
    let m = 0
    for (let i = 0; i <= 400; i++) {
      let v = 0
      for (const f of freqs) v += Math.sin(2 * Math.PI * f * ((i / 400) * span))
      m = Math.max(m, Math.abs(v))
    }
    return m || 1
  }, [freqs, span])
  const sumAt = (t: number) => raw(t) / peak
  const tHover = at === null ? 0 : at * span

  const fromPiece = HARMONY.find((h) => chord && h.symbol === chord.symbol)

  return (
    <div className="term" aria-label="Type or play a chord and see why it sounds the way it does">
      <div className="term-bar">
        <span className="term-name">chords.py</span>
        <div className="term-tune" role="group" aria-label="Tuning system">
          {TUNINGS.map((t) => (
            <button key={t.id} type="button" title={t.blurb} disabled={!live}
              className={t.id === tuning ? 'is-on' : undefined}
              aria-pressed={t.id === tuning}
              onClick={() => setTuning(t.id)}>{t.name}</button>
          ))}
        </div>
      </div>

      <div className="term-view">
        {chord && (
          <>
            <div className="term-id">
              <p className="term-sym">{chord.symbol}</p>
              <p className="term-name-full">
                {chord.name}{fromPiece && <em> — {fromPiece.numeral} of the phrase</em>}
              </p>
              <p className={`term-verdict is-${verdict}`}>{verdict}</p>
            </div>

            <svg ref={wave} className="term-wave" viewBox={`0 0 ${W} ${H}`} height={H}
              width="100%" preserveAspectRatio="none"
              role="img" aria-label={`The ${freqs.length} notes summed, over ${f2(span * 1000)} milliseconds`}
              onPointerMove={(e) => {
                const r = wave.current?.getBoundingClientRect()
                if (r) setAt(Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)))
              }}
              onPointerLeave={() => setAt(null)}>
              <line x1="0" y1={MID} x2={W} y2={MID} stroke="var(--rule)" strokeWidth="1" />

              {/* each note on its own, under the sum, once you go looking */}
              <g className="term-parts" style={{ opacity: at === null && only === null ? 0.22 : 1 }}>
                {freqs.map((f, i) => (
                  <polyline key={i} points={path(partial(f), PART_A)} fill="none"
                    stroke={lane(i)} strokeWidth="1"
                    opacity={only === null ? 0.6 : only === i ? 1 : 0.12} />
                ))}
              </g>

              <polyline points={path(sumAt, SUM_A)} fill="none" stroke="var(--accent)"
                strokeWidth="1.6" strokeLinejoin="round" />

              {/* where the whole shape starts over, if the window reaches it */}
              {period / f0 < span && (
                <line x1={(W * (period / f0)) / span} y1="2" x2={(W * (period / f0)) / span} y2={H - 2}
                  stroke="var(--ink-3)" strokeWidth="1" strokeDasharray="2 4" />
              )}

              {at !== null && (
                <g className="term-cross">
                  <line x1={at * W} y1="0" x2={at * W} y2={H} stroke="var(--ink-3)" strokeWidth="0.8" />
                  {freqs.map((f, i) => (
                    <circle key={i} cx={at * W} cy={MID - Math.sin(2 * Math.PI * f * tHover) * PART_A}
                      r="2.1" fill={lane(i)} />
                  ))}
                  <circle cx={at * W} cy={MID - sumAt(tHover) * SUM_A} r="2.8" fill="var(--accent)" />
                  <text x={at * W < W - 70 ? at * W + 6 : at * W - 6} y="11"
                    textAnchor={at * W < W - 70 ? 'start' : 'end'} className="term-tick">
                    {(tHover * 1000).toFixed(2)} ms
                  </text>
                </g>
              )}
            </svg>

            <div className="term-read">
              <table onPointerLeave={() => setOnly(null)}>
                <tbody>
                  {rows.map(({ p, i, r, off }) => (
                    <tr key={label(p) + i} onPointerEnter={() => setOnly(i)}
                      className={only === i ? 'is-only' : undefined}>
                      <td><span className="term-swatch" style={{ background: lane(i) }} />
                        {chord.names[i] ?? label(p)}</td>
                      <td>{f2(freqs[i])} Hz</td>
                      <td>{r.num}/{r.den}</td>
                      <td>{i === 0 ? 'root' : `${off >= 0 ? '+' : ''}${off}¢`}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="term-side">
                <pre className="term-py">{`QUALITY = {…, ${JSON.stringify(chord.quality.suffix)}: (${chord.quality.semis.join(', ')})}   # suffix -> semitones
notes = {${rows.map(({ i, p }) => `${JSON.stringify(chord.names[i] ?? label(p))}: ${f2(freqs[i])}`).join(', ')}}
y = sum(sin(2*pi*f*t) for f in notes.values())`}</pre>
                <p className="term-cap">
                  repeats every {period} periods of {chord.names[0] ?? label(sorted[0])};{' '}
                  {worst === 0 ? 'every interval pure' : `worst interval ${worst}¢ from pure`}
                </p>
              </div>
            </div>
          </>
        )}

        {/* Outside the conditional above: lifting every finger off the
            keyboard should not take the keyboard away with them. */}
        <div className="term-keys">
          <Keyboard pitches={sorted} from={keys.from} to={keys.to}
            onToggle={live ? toggle : undefined} />
        </div>

        {!chord && <p className="term-cap">Nothing held. Press a key, or type a chord.</p>}
        {bad && <p className="term-bad">Can’t read <b>{bad}</b>.</p>}
      </div>

      <form className="term-prompt"
        onSubmit={(e) => { e.preventDefault(); void run(line); input.current?.focus({ preventScroll: true }) }}>
        <span aria-hidden="true">&gt;&gt;&gt;</span>
        <input
          ref={input}
          value={line}
          onChange={(e) => setLine(e.target.value)}
          placeholder={`enter a chord here, e.g. ${SUGGESTIONS.slice(0, 2).join(', ')}`}
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
          {sound.playing ? 'on' : 'play'}
        </button>
      </form>
    </div>
  )
}
