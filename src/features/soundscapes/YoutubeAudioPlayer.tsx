import { useEffect, useRef, useState } from 'react'

declare global {
  interface Window {
    YT?: typeof YT
    onYouTubeIframeAPIReady?: () => void
  }
}

// Minimal shape of the YouTube IFrame Player API we rely on.
declare namespace YT {
  interface Player {
    playVideo(): void
    pauseVideo(): void
    stopVideo(): void
    setVolume(volume: number): void
    destroy(): void
    getPlayerState(): number
  }
  interface PlayerEvent {
    target: Player
  }
  const Player: {
    new (elementId: string, options: Record<string, unknown>): Player
  }
}

let apiPromise: Promise<void> | null = null

function loadYoutubeApi(): Promise<void> {
  if (window.YT?.Player) return Promise.resolve()
  if (apiPromise) return apiPromise

  apiPromise = new Promise((resolve) => {
    const previous = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      previous?.()
      resolve()
    }
    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    document.head.appendChild(tag)
  })
  return apiPromise
}

export interface UseYoutubeAudioPlayerResult {
  isReady: boolean
  isPlaying: boolean
  play: () => void
  pause: () => void
  toggle: () => void
  volume: number
  setVolume: (value: number) => void
}

const VOLUME_KEY = 'medito:yt-volume'

function readStoredVolume(): number {
  try {
    const stored = Number(localStorage.getItem(VOLUME_KEY))
    if (localStorage.getItem(VOLUME_KEY) !== null && stored >= 0 && stored <= 100) return stored
  } catch {
    // storage indisponível
  }
  return 70
}

/**
 * Hidden (audio-only) YouTube player. Mounts a 0x0 iframe and exposes
 * play/pause/volume controls, so soundscapes act like ambient audio tracks.
 */
export function useYoutubeAudioPlayer(videoId: string | null, containerId: string): UseYoutubeAudioPlayerResult {
  const playerRef = useRef<YT.Player | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolumeState] = useState(readStoredVolume)
  const pendingVolumeRef = useRef(volume)

  useEffect(() => {
    if (!videoId) return
    let cancelled = false

    loadYoutubeApi().then(() => {
      if (cancelled) return
      playerRef.current = new window.YT!.Player(containerId, {
        videoId,
        height: '0',
        width: '0',
        playerVars: { autoplay: 0, controls: 0, disablekb: 1, loop: 1, playlist: videoId },
        events: {
          onReady: (event: YT.PlayerEvent) => {
            event.target.setVolume(pendingVolumeRef.current)
            setIsReady(true)
          },
          onStateChange: (event: { data: number }) => {
            setIsPlaying(event.data === 1)
          },
        },
      })
    })

    return () => {
      cancelled = true
      playerRef.current?.destroy()
      playerRef.current = null
      setIsReady(false)
      setIsPlaying(false)
    }
  }, [videoId, containerId])

  return {
    isReady,
    isPlaying,
    play: () => playerRef.current?.playVideo(),
    pause: () => playerRef.current?.pauseVideo(),
    toggle: () => {
      if (isPlaying) playerRef.current?.pauseVideo()
      else playerRef.current?.playVideo()
    },
    volume,
    setVolume: (value: number) => {
      pendingVolumeRef.current = value
      setVolumeState(value)
      playerRef.current?.setVolume(value)
      try {
        localStorage.setItem(VOLUME_KEY, String(value))
      } catch {
        // storage indisponível
      }
    },
  }
}

/** Invisible mount point required by the YouTube IFrame API. */
export function YoutubeAudioMount({ containerId }: { containerId: string }) {
  return <div id={containerId} className="absolute h-0 w-0 overflow-hidden" aria-hidden="true" />
}
