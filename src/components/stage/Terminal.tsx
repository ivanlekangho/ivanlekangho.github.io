import { useEffect, useMemo, useRef, useState } from 'react'
import { PHRASE } from '../../data/phrase'
import { HARMONY, PROGRESSION, soundingAt } from '../../data/piano'
import { beats, mix, periodicity, plot, sine, temperamentError } from '../../lib/acoustics'
import { hz, label, midi, ratioTo, type Pitch } from '../../lib/tuning'
import type { Step } from '../../data/phrase'

/**
 * The engineer's reading: a REPL, in the place the score was.
 *
 * It answers one question — why does this sound the way it does — with
 * arithmetic rather than adjectives. Every number it prints is computed from
 * the same pitches the score is engraved from (lib/acoustics.ts), so editing
 * a note in piano.ts changes the answers here too.
 *
 * It is not CPython. It is a small interpreter over a fixed command set, and
 * `help` says so, because a terminal that implies it is running a language it
 * isn't is the kind of thing an engineer looks at twice. The Python it prints
 * alongside each answer is the code that expresses the same calculation.
 */

const W = 620
const H = 52

type Block =
  | { k: 'in'; text: string }
  | { k: 'out'; text: string; dim?: boolean }
  | { k: 'py'; text: string }
  | { k: 'wave'; points: string; caption: string }
  | { k: 'rule' }

/* ------------------------------------------------------------------
   Parsing a note name the way a person would type it: F#3, Bb3, D4.
   ------------------------------------------------------------------ */
function parsePitch(s: string): Pitch | null {
  const m = /^([A-Ga-g])([#♯b♭]?)(-?\d)$/.exec(s.trim())
  if (!m) return null
  const step = m[1].toUpperCase() as Step
  const acc = m[2] === '#' || m[2] === '♯' ? 'sharp' : m[2] === 'b' || m[2] === '♭' ? 'flat' : undefined
  return { step, octave: Number(m[3]), accidental: acc }
}

const f2 = (n: number) => n.toFixed(2)
const pad = (s: string, n: number) => s + ' '.repeat(Math.max(0, n - s.length))

/** Three cycles of one note — enough to see the shape, few enough to count. */
function oneNote(p: Pitch): Block[] {
  const f = hz(p)
  const s = sine(f, 3 / f, 900)
  return [
    { k: 'py', text: `t = np.linspace(0, 3/${f2(f)}, 900)\ny = np.sin(2*np.pi*${f2(f)}*t)` },
    { k: 'wave', points: plot(s, W, H), caption: `${label(p)} — ${f2(f)} Hz, three cycles` },
  ]
}

const COMMANDS = ['help', 'melody', 'chords', 'why', 'wave F#3', 'chord 7', 'beats F#3 G3', 'clear']

export default function Terminal({ live }: { live: boolean }) {
  const [log, setLog] = useState<Block[]>([])
  const [line, setLine] = useState('')
  const scroll = useRef<HTMLDivElement>(null)
  const input = useRef<HTMLInputElement>(null)

  const banner = useMemo<Block[]>(() => [
    { k: 'out', text: 'der_wanderer — two bars of Schubert, as numbers.', dim: true },
    { k: 'out', text: 'Type a command or pick one below. `help` lists them.', dim: true },
  ], [])

  useEffect(() => { setLog(banner) }, [banner])
  useEffect(() => {
    const el = scroll.current
    if (el) el.scrollTop = el.scrollHeight
  }, [log])

  function run(raw: string) {
    const cmd = raw.trim()
    if (!cmd) return
    const [verb, ...args] = cmd.split(/\s+/)
    const out: Block[] = [{ k: 'in', text: cmd }]

    switch (verb.toLowerCase()) {
      case 'help':
        out.push(
          { k: 'out', text: 'melody            the nine sung notes, as frequencies' },
          { k: 'out', text: 'chords            the seven chords, as symbols and numerals' },
          { k: 'out', text: 'wave <note>       one sine. e.g. wave F#3, wave Bb3' },
          { k: 'out', text: 'chord <1-7>       the sum of a chord’s sines, and its repeat period' },
          { k: 'out', text: 'beats <a> <b>     how fast two notes beat against each other' },
          { k: 'out', text: 'why               why the last chord sounds settled' },
          { k: 'out', text: 'clear             empty the scrollback' },
          { k: 'rule' },
          { k: 'out', dim: true, text: 'Not CPython: a small interpreter over these commands. The' },
          { k: 'out', dim: true, text: 'arithmetic is real — same pitch data the score is engraved from.' },
        )
        break

      case 'melody': {
        out.push({ k: 'py', text: 'for n in phrase:\n    print(n.name, hz(n), n.syllable)' })
        for (const n of PHRASE) {
          const p: Pitch = { step: n.step, octave: n.octave, accidental: n.accidental }
          out.push({
            k: 'out',
            text: `${pad(label(p), 6)}${pad(f2(hz(p)) + ' Hz', 12)}${pad(String(midi(p)), 5)}${n.german ?? '—'}${n.han ? `  ${n.han} ${n.pinyin}` : ''}`,
          })
        }
        break
      }

      case 'chords': {
        out.push({ k: 'py', text: 'for c in harmony:\n    print(c.symbol, c.numeral, c.move, pitches(c))' })
        HARMONY.forEach((h, i) => {
          const notes = soundingAt(h.atBeat).map(label).join(' ')
          out.push({
            k: 'out',
            text: `${pad(String(i + 1), 3)}${pad(h.symbol, 8)}${pad(h.numeral, 11)}${pad(h.move, 22)}${notes}`,
          })
        })
        out.push({ k: 'rule' }, { k: 'out', dim: true, text: PROGRESSION.short })
        break
      }

      case 'wave': {
        const p = parsePitch(args[0] ?? '')
        if (!p) { out.push({ k: 'out', text: `wave: can’t read ${args[0] ?? '(nothing)'}. Try F#3, Bb3, D4.` }); break }
        out.push(...oneNote(p))
        break
      }

      case 'chord': {
        const i = Number(args[0])
        if (!(i >= 1 && i <= HARMONY.length)) {
          out.push({ k: 'out', text: `chord: pick 1–${HARMONY.length}. \`chords\` lists them.` })
          break
        }
        const h = HARMONY[i - 1]
        const pitches = soundingAt(h.atBeat)
        const sorted = [...pitches].sort((a, b) => midi(a) - midi(b))
        const f0 = hz(sorted[0])
        const freqs = sorted.map(hz)
        const { ratios, period, verdict } = periodicity(sorted)
        out.push(
          { k: 'py', text: `freqs = [${freqs.map(f2).join(', ')}]\ny = sum(np.sin(2*np.pi*f*t) for f in freqs)` },
          { k: 'wave', points: plot(mix(freqs, (period + 0.5) / f0, 1400), W, H),
            caption: `${h.symbol} (${h.numeral}) — ${sorted.map(label).join(' ')}` },
          { k: 'rule' },
        )
        sorted.forEach((p, j) => {
          const r = ratioTo(sorted[0], p)
          const err = temperamentError(sorted[0], p)
          out.push({
            k: 'out',
            text: `${pad(label(p), 6)}${pad(f2(hz(p)) + ' Hz', 12)}${pad(`${r.num}/${r.den}`, 8)}` +
              (j === 0 ? 'root' : `${err >= 0 ? '+' : ''}${err}¢ from just`),
          })
        })
        out.push(
          { k: 'out', text: `repeats every ${period} periods of ${label(sorted[0])} — ${verdict}` },
          { k: 'out', dim: true, text: `ratios are the nearest simple ones (${ratios.join(' ')});` },
          { k: 'out', dim: true, text: 'the cents column is how far the piano actually sits from them.' },
        )
        if (h.note) out.push({ k: 'rule' }, { k: 'out', dim: true, text: h.note })
        break
      }

      case 'beats': {
        const a = parsePitch(args[0] ?? '')
        const b = parsePitch(args[1] ?? '')
        if (!a || !b) { out.push({ k: 'out', text: 'beats: needs two notes. e.g. beats F#3 G3' }); break }
        const r = beats(a, b)
        out.push(
          { k: 'py', text: `abs(hz("${args[0]}") - hz("${args[1]}"))` },
          { k: 'out', text: `${f2(r.hz)} Hz — ${r.heard}` },
          { k: 'wave', points: plot(mix([hz(a), hz(b)], Math.min(0.08, 2.5 / Math.max(1, r.hz)), 1600), W, H),
            caption: `${label(a)} + ${label(b)}, summed` },
        )
        break
      }

      case 'why': {
        const last = HARMONY[HARMONY.length - 1]
        const sorted = soundingAt(last.atBeat).sort((a, b) => midi(a) - midi(b))
        const { ratios, period } = periodicity(sorted)
        out.push(
          { k: 'out', text: `The phrase ends on ${last.symbol}: ${sorted.map(label).join(' ')}.` },
          { k: 'out', text: `Against ${label(sorted[0])} those are ${ratios.join(', ')} — small whole numbers.` },
          { k: 'out', text: `Sum sines at small whole-number ratios and the sum is periodic:` },
          { k: 'out', text: `this one comes back round every ${period} periods of ${label(sorted[0])}.` },
          { k: 'rule' },
          { k: 'out', text: 'One repeating shape is one thing with a pitch. That is the whole of it.' },
          { k: 'out', text: 'Stretch the ratios and the repeat period runs away; the same notes' },
          { k: 'out', text: 'become roughness. Try `chord 4` — the diminished seventh — against this.' },
          { k: 'rule' },
          { k: 'out', dim: true, text: PROGRESSION.sentence },
        )
        break
      }

      case 'clear':
        setLog(banner)
        return

      default:
        out.push({ k: 'out', text: `${verb}: no such command. Try \`help\`.` })
    }

    setLog((l) => [...l, ...out])
  }

  return (
    <div className="term" aria-label="An interactive terminal explaining the acoustics">
      <div className="term-bar">
        <span className="term-name">python3 · der_wanderer.py</span>
        <span className="term-hint">why it sounds the way it does</span>
      </div>

      <div className="term-scroll" ref={scroll} data-keeps-scroll>
        {log.map((b, i) => {
          if (b.k === 'rule') return <hr key={i} className="term-rule" />
          if (b.k === 'in') return <p key={i} className="term-in"><span>&gt;&gt;&gt;</span>{b.text}</p>
          if (b.k === 'py') return <pre key={i} className="term-py">{b.text}</pre>
          if (b.k === 'wave') {
            return (
              <figure key={i} className="term-wave">
                <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} aria-hidden="true">
                  <line x1="0" y1={H / 2} x2={W} y2={H / 2} stroke="var(--rule)" strokeWidth="1" />
                  <polyline points={b.points} fill="none" stroke="var(--accent)"
                    strokeWidth="1.4" strokeLinejoin="round" />
                </svg>
                <figcaption>{b.caption}</figcaption>
              </figure>
            )
          }
          return <p key={i} className={b.dim ? 'term-out is-dim' : 'term-out'}>{b.text}</p>
        })}
      </div>

      <div className="term-chips">
        {COMMANDS.map((c) => (
          <button key={c} type="button" disabled={!live}
            /* preventScroll: focusing the prompt otherwise scrolls the whole
               page to bring it into view, which drags you out of the hall. */
            onClick={() => { run(c); input.current?.focus({ preventScroll: true }) }}>{c}</button>
        ))}
      </div>

      <form className="term-prompt" onSubmit={(e) => { e.preventDefault(); run(line); setLine('') }}>
        <span aria-hidden="true">&gt;&gt;&gt;</span>
        <input
          ref={input}
          value={line}
          onChange={(e) => setLine(e.target.value)}
          placeholder="chord 7"
          aria-label="Terminal input"
          spellCheck={false}
          autoComplete="off"
          disabled={!live}
        />
      </form>
    </div>
  )
}
