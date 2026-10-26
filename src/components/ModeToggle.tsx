import { useMode } from '../lib/mode'

export default function ModeToggle() {
  const { mode, toggle } = useMode()
  const next = mode === 'musician' ? 'engineer' : 'musician'
  return (
    <button
      onClick={toggle}
      aria-label={`Switch to ${next} mode`}
      title={`Switch to ${next} mode`}
      style={{
        font: 'inherit',
        fontFamily: mode === 'engineer' ? 'var(--font-mono)' : 'var(--font-body)',
        fontSize: 'var(--step--1)',
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        padding: '5px 13px',
        borderRadius: 999,
        cursor: 'pointer',
        color: 'var(--accent-deep)',
        background: 'var(--accent-wash)',
        border: '1px solid transparent',
        transition: 'background var(--dur) var(--ease), color var(--dur) var(--ease)',
      }}
    >
      {mode} mode
    </button>
  )
}
