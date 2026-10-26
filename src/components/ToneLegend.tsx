import { MANDARIN, type ToneId } from '../data/tones'

const ORDER: ToneId[] = [1, 2, 3, 4, 0]

/**
 * The legend that stops the palette being private knowledge. Four hues, four
 * Mandarin tones, plus the neutral tone on warm grey so the set is complete
 * rather than looking like it lost one.
 */
export default function ToneLegend({ compact = false }: { compact?: boolean }) {
  return (
    <div
      style={{
        display: 'flex',
        gap: compact ? 'var(--space-4)' : 'var(--space-5)',
        flexWrap: 'wrap',
        alignItems: 'flex-start',
      }}
    >
      {ORDER.map((id) => {
        const t = MANDARIN[id]
        const h = 22, w = 30
        const pts = t.contour
          .map((v, j) => `${(w * j) / (t.contour.length - 1)},${h - v * h}`)
          .join(' ')
        return (
          <div key={id} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden="true" style={{ overflow: 'visible' }}>
              <polyline
                points={pts}
                fill="none"
                stroke={`var(--${t.family}-mid)`}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--step--1)',
                color: `var(--${t.family}-deep)`,
              }}
            >
              {t.mark} {t.name}
            </span>
          </div>
        )
      })}
    </div>
  )
}
