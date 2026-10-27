import type { Playback } from '../../lib/playback'

/**
 * Play the recording.
 *
 * Hidden entirely until a file is actually sitting in public/audio — an
 * inert play button on a page like this reads as a bug, and there is
 * nothing a visitor can do about a missing take.
 */
export default function Transport({ pb }: { pb: Playback }) {
  if (!pb.available) return null

  return (
    <div className="transport">
      <button type="button" className="transport-play" onClick={pb.toggle}
        aria-label={pb.playing ? 'Pause the recording' : 'Play the recording'}>
        <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
          {pb.playing
            ? <path d="M9 5v14M15 5v14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            : <path d="M8 5.5 19 12 8 18.5Z" fill="currentColor" />}
        </svg>
        <span>{pb.playing ? 'Pause' : 'Play'}</span>
      </button>
    </div>
  )
}
