import { useEffect, useRef } from 'react'

/**
 * A film hosted somewhere that can stream it.
 *
 * The two performance videos were self-hosted and could not be: GitHub
 * Pages serves one fixed file at one quality, so a seventeen-minute recital
 * meant either 284MB at 480p or a 32MB file whose audio was 16kHz. Hosted,
 * they stream adaptively and cost the repository nothing.
 *
 * The price is this player instead of the site's own transport. That is a
 * real loss and it is the right trade: a reader gets quality, fullscreen,
 * captions and a seek bar that works on a phone, and the one thing the
 * custom bar did that mattered — jumping to a movement — is kept, because
 * the IFrame API can seek.
 *
 * `youtube-nocookie.com` and `enablejsapi` are both deliberate: the first
 * so a visitor who only reads the page is not handed a tracking cookie by
 * it, the second so the programme list can still drive the film.
 */

/* The API script is global and must be added exactly once, however many
   films end up on a page. */
let apiReady: Promise<void> | null = null
function loadApi(): Promise<void> {
  if (apiReady) return apiReady
  apiReady = new Promise((resolve) => {
    const w = window as unknown as Record<string, unknown>
    if (w.YT && (w.YT as { Player?: unknown }).Player) { resolve(); return }
    w.onYouTubeIframeAPIReady = () => resolve()
    const s = document.createElement('script')
    s.src = 'https://www.youtube.com/iframe_api'
    document.head.appendChild(s)
  })
  return apiReady
}

type Player = {
  seekTo: (s: number, allowSeekAhead: boolean) => void
  playVideo: () => void
  pauseVideo: () => void
  getCurrentTime: () => number
  destroy: () => void
}

export type Seekable = { seek: (t: number) => void }

export default function Youtube({
  id, label, handle, onTime,
}: {
  id: string
  label: string
  /** Handed in when something outside needs to seek this — the programme
   *  list, which jumps to a movement. */
  handle?: React.MutableRefObject<Seekable | null>
  /**
   * Where it has got to, a couple of times a second.
   *
   * A hosted player fires no timeupdate, so the only way the programme list
   * can keep marking the movement actually sounding is to ask. Polled
   * rather than subscribed, and only while it is playing — a poll that runs
   * against a paused film is a timer burning for nothing.
   */
  onTime?: (t: number) => void
}) {
  const host = useRef<HTMLDivElement>(null)
  const player = useRef<Player | null>(null)
  const tick = useRef(0)

  useEffect(() => {
    let dead = false
    void loadApi().then(() => {
      if (dead || !host.current) return
      const YT = (window as unknown as { YT: { Player: new (el: Element, o: unknown) => Player } }).YT
      player.current = new YT.Player(host.current, {
        videoId: id,
        /* The API builds its iframe against youtube.com unless told
           otherwise, so the no-cookie domain has to be asked for here and
           not merely hoped for — checked by reading the iframe's src back,
           which is how the first version was caught claiming it. */
        host: 'https://www.youtube-nocookie.com',
        playerVars: { rel: 0, modestbranding: 1, playsinline: 1 },
        events: {
          onStateChange: (e: { data: number }) => {
            /* 1 is PLAYING. The API's own enum is not worth importing for
               one number. */
            window.clearInterval(tick.current)
            if (e.data === 1 && onTime) {
              tick.current = window.setInterval(() => {
                const t = player.current?.getCurrentTime()
                if (typeof t === 'number') onTime(t)
              }, 400)
            }
          },
          onReady: () => {
            if (handle) {
              handle.current = {
                seek: (t: number) => {
                  player.current?.seekTo(t, true)
                  player.current?.playVideo()
                },
              }
            }
          },
        },
      })
    })
    return () => {
      dead = true
      window.clearInterval(tick.current)
      if (handle) handle.current = null
      player.current?.destroy()
      player.current = null
    }
    /* onTime is a fresh closure on every render of the parent; depending on
       it would tear the player down and rebuild it several times a second. */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, handle])

  return (
    <div className="reel-frame">
      <div ref={host} className="reel-yt" title={label} />
    </div>
  )
}
