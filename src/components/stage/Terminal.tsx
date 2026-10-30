import { Fragment, memo, useEffect, useMemo, useRef, useState } from 'react'
import { HARMONY } from '../../data/piano'
import { beatsIn, periodicity } from '../../lib/acoustics'
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
 * The beat strip runs on its own clock.
 *
 * The waveform above it is a few milliseconds wide, because that is the
 * scale a chord's shape lives on. Beating lives three orders of magnitude
 * below that — a swell and a dip a few times a second — so it cannot be
 * drawn on the same axis as the thing it is happening to.
 *
 * Fixed, not fitted to the chord. The point of the strip is that you switch
 * tuning systems and compare, and an axis that rescaled itself to each one
 * would make every system look the same. 1.2 seconds holds one slow swell
 * of a tempered fifth and thirty of a pythagorean third, which is the range
 * these systems actually span.
 */
const BEAT_SPAN = 1.2
const BEAT_H = 15
const BEAT_MID = BEAT_H / 2
const BEAT_A = BEAT_H * 0.44

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

/**
 * One lane of the beat strip: the amplitude envelope of two partials that
 * were supposed to land on the same frequency and did not.
 *
 * Two equal sines Δf apart sum to a single tone whose amplitude follows
 * |cos(π·Δf·t)| — full, then nothing, then full again, Δf times a second.
 * That is drawn here literally, top and bottom, so a pure interval is a
 * solid bar and a tempered one is a row of spindles. Sampled in proportion
 * to how many of those spindles there are, so a slow lane stays cheap and a
 * fast one keeps its points.
 */
function envelope(rate: number) {
  const cycles = rate * BEAT_SPAN
  /* Twenty-two samples per spindle, which at this lane height is past the
     point where more of them change the drawing — and a hundred and fifty
     fewer per lane than the first version, which put forty kilobytes of
     path data in the document for three thin ribbons. */
  const n = Math.min(700, Math.max(120, Math.round(cycles * 22)))
  const top: string[] = []
  const bot: string[] = []
  for (let i = 0; i <= n; i++) {
    const x = ((i / n) * W).toFixed(1)
    const a = Math.abs(Math.cos(Math.PI * cycles * (i / n))) * BEAT_A
    top.push(`${x},${(BEAT_MID - a).toFixed(1)}`)
    bot.push(`${x},${(BEAT_MID + a).toFixed(1)}`)
  }
  return `M${top.join('L')}L${bot.reverse().join('L')}Z`
}

/** Enough keyboard to hold a chord, with the chord near the middle of it. */
function rangeFor(c: Chord) {
  const ms = c.pitches.map(midi)
  return keyboardRange(Math.min(...ms), Math.max(...ms))
}
const lane = (i: number) => `var(${LANE[i % LANE.length]})`

/**
 * The phrase's own resolution, so the terminal opens on the piece — but
 * voiced where the parser voices everything else rather than where the
 * pianist's left hand actually puts it. Schubert's D2 is a rumble as a
 * bare sine, and opening on a chord three octaves below the one you get
 * when you type its name is a confusing first impression. It is still the
 * phrase's last chord, and still labelled as such.
 */
function openingChord(): Chord {
  const last = HARMONY[HARMONY.length - 1]
  return parseChord(last.symbol) ?? parseChord('C')!
}

/**
 * Wrapped in `memo` because the rail re-renders the hall on every frame of a
 * scroll and this pane is the most expensive thing in it: four polylines of
 * nine hundred points each, plus three beat envelopes. Its only prop is a
 * boolean, so memo turns sixty renders a second into two — one when the stop
 * arrives and one when it leaves.
 */
function Terminal({ live }: { live: boolean }) {
  const [line, setLine] = useState('')
  const [chord, setChord] = useState<Chord | null>(openingChord)
  const [tuning, setTuning] = useState<TuningId>('equal')
  const [bad, setBad] = useState<string | null>(null)
  /* Fixed while you build a chord by hand, so the keys do not move under
     your finger; it follows along only when a new chord is typed. */
  const [keys, setKeys] = useState(() => rangeFor(openingChord()))
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
    setKeys(rangeFor(c))
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

  /* What the mistuning above actually does. Memoised because the envelopes
     are a few thousand coordinates each and a pointer moving across the
     waveform re-renders this component on every frame. */
  const beat = useMemo(() => beatsIn(sorted, freqs), [sorted, freqs])
  const envs = useMemo(() => beat.map((b) => envelope(b.rate)), [beat])
  const fastest = beat.reduce((m, b) => Math.max(m, b.rate), 0)

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

  /* The sum and the component sines, built once per chord rather than once
     per render: hovering the waveform sets state sixty times a second, and
     each of these is a nine-hundred-point string. */
  const sumPath = useMemo(() => path(sumAt, SUM_A), [freqs, span, peak])    // eslint-disable-line react-hooks/exhaustive-deps
  const partPaths = useMemo(() => freqs.map((f) => path(partial(f), PART_A)), [freqs, span]) // eslint-disable-line react-hooks/exhaustive-deps

  const fromPiece = HARMONY.find((h) => chord && h.symbol === chord.symbol)

  return (
    <div className="term" aria-label="Type or play a chord and see why it sounds the way it does">
      <div className="term-bar">
        <span className="term-name">chords.py</span>
        {/* Four unlabelled words in the corner of a bar read as a status
            line, not as a control — so the group says what it is, and the
            buttons are boxed rather than left as bare text. The strip
            below points back up here, because the strip is the thing these
            four words change. */}
        <div className="term-tuner">
          <span className="term-tune-label">tuning</span>
          <div className="term-tune" role="group" aria-label="Tuning system">
            {TUNINGS.map((t) => (
              <button key={t.id} type="button" title={t.blurb} disabled={!live}
                className={t.id === tuning ? 'is-on' : undefined}
                aria-pressed={t.id === tuning}
                onClick={() => setTuning(t.id)}>{t.name}</button>
            ))}
          </div>
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
                {partPaths.map((d, i) => (
                  <polyline key={i} points={d} fill="none"
                    stroke={lane(i)} strokeWidth="1"
                    opacity={only === null ? 0.6 : only === i ? 1 : 0.12} />
                ))}
              </g>

              <polyline points={sumPath} fill="none" stroke="var(--accent)"
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

            {/* What the tuning does, on the timescale it does it on.
                Each lane is one pair of partials that the interval says
                should coincide: solid where they do, spindled where they
                miss, and the spindles come at the rate the chord wobbles.
                Switch systems and the whole block redraws — which is the
                only way to make a four-cent difference visible. */}
            {beat.length > 0 && (
              <div className="term-beat">
                <p className="term-beat-head">
                  <b>beating</b>
                  <span>
                    {fastest < 0.05
                      ? 'every coincidence exact — nothing beats'
                      : `fastest ${fastest.toFixed(1)} a second, over ${BEAT_SPAN}s`}
                  </span>
                  <span className="term-beat-cue">tuning, top right ↗</span>
                </p>

                {beat.map((b, k) => {
                  const lo = chord.names[b.i] ?? label(sorted[b.i])
                  const hi = chord.names[b.j] ?? label(sorted[b.j])
                  const pure = b.rate < 0.05
                  return (
                    <Fragment key={`${b.i}-${b.j}`}>
                      <span className="term-beat-pair">
                        <span className="term-swatch" style={{ background: lane(b.i) }} />
                        <span className="term-swatch" style={{ background: lane(b.j) }} />
                        {b.num}:{b.den}
                      </span>
                      <svg className="term-beat-lane" viewBox={`0 0 ${W} ${BEAT_H}`}
                        preserveAspectRatio="none" role="img"
                        aria-label={`${b.num} times ${lo} against ${b.den} times ${hi}, near ${f2(b.at)} hertz: ${
                          pure ? 'exact, no beating'
                            : `${b.rate.toFixed(1)} ${b.rough ? 'a second, heard as roughness' : 'wobbles a second'}`}`}>
                        {/* Higher up the series is quieter, so a coincidence
                            at the fifth partial is a beat you cannot miss
                            and one at the sixteenth is a suspicion. */}
                        <path d={envs[k]} fill={lane(b.j)}
                          opacity={Math.max(0.42, Math.min(1, 4 / b.num))} />
                      </svg>
                      <span className={`term-beat-rate${
                        pure ? ' is-pure' : b.rough ? ' is-rough' : ''}`}>
                        {pure ? 'pure' : `${b.rate.toFixed(1)}/s`}
                        {/* The number, felt. One cycle of this dot is one
                            swell and dip of that pair — at eleven a second
                            it shivers, at two it throbs, and a pure
                            interval sits still. */}
                        <i className="term-beat-dot" aria-hidden="true"
                          style={pure || b.rough ? undefined
                            : { animationDuration: `${(1 / b.rate).toFixed(3)}s` }} />
                      </span>
                    </Fragment>
                  )
                })}
              </div>
            )}

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

export default memo(Terminal)
