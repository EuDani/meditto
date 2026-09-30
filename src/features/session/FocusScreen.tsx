import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCircleCheck,
  faCirclePause,
  faHouse,
  faMusic,
  faPause,
  faPlay,
  faVolumeLow,
  faVolumeXmark,
  faXmark,
} from '@fortawesome/free-solid-svg-icons'
import { SkyBackground } from '../../components/SkyBackground'
import { HeaderControls } from '../../components/HeaderControls'
import { Button, GlassCard } from '../../components/ui'
import { BREATHING_MODULES } from '../../lib/breathing/modules'
import type { MethodKey } from '../../lib/database.types'
import { useBreathingSession } from '../../lib/breathing/engine'
import { sfx } from '../../lib/sound'
import { BreathingVisual } from './BreathingVisual'
import { useCreateSession, useSoundscapes } from '../../lib/queries'
import { useYoutubeAudioPlayer, YoutubeAudioMount } from '../soundscapes/YoutubeAudioPlayer'

interface SessionRouteState {
  durationSeconds?: number
  cycles?: number
  soundscapeId?: string | null
}

export function FocusScreen() {
  const { key } = useParams<{ key: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const module = BREATHING_MODULES[key as MethodKey]
  const routeState = (location.state as SessionRouteState) ?? {}

  const { data: soundscapes } = useSoundscapes()
  const soundscape = soundscapes?.find((s) => s.id === routeState.soundscapeId)
  const audioPlayer = useYoutubeAudioPlayer(soundscape?.youtube_video_id ?? null, 'session-audio-mount')

  const createSession = useCreateSession()
  const startedAtRef = useRef<string | null>(null)
  const lastCueStepRef = useRef(-1)
  const [outcome, setOutcome] = useState<{ completed: boolean } | null>(null)
  const [countdown, setCountdown] = useState(3)

  const session = useBreathingSession(module, {
    durationSeconds: routeState.durationSeconds,
    cycles: routeState.cycles,
    onFinish: ({ completed, elapsedSeconds }) => {
      if (startedAtRef.current) {
        createSession.mutate({
          methodKey: module.key,
          methodLabel: module.label,
          plannedDurationSeconds: session.totalSeconds,
          actualDurationSeconds: elapsedSeconds,
          startedAt: startedAtRef.current,
          endedAt: new Date().toISOString(),
          completed,
          soundscapeId: routeState.soundscapeId ?? null,
        })
      }
      audioPlayer.pause()
      if (completed) sfx.success()
      setOutcome({ completed })
    },
  })

  // Pre-session countdown, then auto-start.
  useEffect(() => {
    if (countdown <= 0) {
      startedAtRef.current = new Date().toISOString()
      session.start()
      if (soundscape) audioPlayer.play()
      return
    }
    sfx.countdown()
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countdown])

  // Audio cue at the start of every breathing phase.
  const step = session.currentStep
  useEffect(() => {
    if (session.status !== 'running' || !step) return
    if (lastCueStepRef.current === session.stepIndex) return
    lastCueStepRef.current = session.stepIndex
    if (step.phase === 'in') sfx.inhale(step.duration)
    else if (step.phase === 'out') sfx.exhale(step.duration)
    else if (step.phase === 'rest') sfx.rest()
    else sfx.hold()
  }, [session.status, session.stepIndex, step])

  if (!module) {
    return (
      <SkyBackground>
        <div className="flex flex-1 items-center justify-center text-fg">Método não encontrado.</div>
      </SkyBackground>
    )
  }

  if (outcome) {
    return (
      <SkyBackground>
        <div className="flex flex-1 items-center justify-center px-6">
          <GlassCard className="flex w-full max-w-sm flex-col items-center gap-3 text-center">
            <FontAwesomeIcon
              icon={outcome.completed ? faCircleCheck : faCirclePause}
              className={`text-5xl ${outcome.completed ? 'text-success' : 'text-fg-muted'}`}
            />
            <h1 className="text-2xl font-semibold">{outcome.completed ? 'Sessão concluída' : 'Sessão encerrada'}</h1>
            <p className="font-medium text-fg-muted">
              {module.label} · {module.technique}
            </p>
            <Button onClick={() => navigate('/')} className="mt-2">
              <FontAwesomeIcon icon={faHouse} />
              Voltar para o início
            </Button>
          </GlassCard>
        </div>
      </SkyBackground>
    )
  }

  return (
    <SkyBackground>
      <YoutubeAudioMount containerId="session-audio-mount" />
      <div className="flex flex-1 flex-col items-center justify-between px-4 py-6">
        <div className="flex w-full max-w-2xl items-center justify-between gap-2">
          <Button variant="secondary" onClick={() => session.cancel()}>
            <FontAwesomeIcon icon={faXmark} />
            Encerrar
          </Button>
          <span className="rounded-full bg-card px-4 py-1.5 text-sm font-semibold text-fg backdrop-blur-md">
            {module.label}
          </span>
          <div className="flex items-center gap-2">
            {soundscape && (
              <button
                type="button"
                onClick={audioPlayer.toggle}
                className="flex h-10 items-center gap-2 rounded-full border border-card-border bg-card px-3 text-sm font-medium text-fg backdrop-blur-md"
                aria-label={audioPlayer.isPlaying ? 'Pausar paisagem sonora' : 'Tocar paisagem sonora'}
              >
                <FontAwesomeIcon icon={audioPlayer.isPlaying ? faPause : faMusic} />
              </button>
            )}
            <HeaderControls />
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center">
          {countdown > 0 ? (
            <div className="text-center">
              <p className="font-medium text-fg-muted">Prepare-se</p>
              <p className="text-8xl font-bold text-fg">{countdown}</p>
            </div>
          ) : (
            <BreathingVisual
              module={module}
              phase={session.currentStep?.phase ?? 'in'}
              progress={session.progress}
              secondsRemaining={session.secondsRemaining}
              cycleNumber={session.cycleNumber}
              totalCycles={session.totalCycles}
              isFinal={session.currentStep?.isFinal}
              isPaused={session.status === 'paused'}
            />
          )}
        </div>

        <div className="flex min-h-12 w-full max-w-sm flex-col items-center gap-4">
          {soundscape && (
            <label className="flex w-full items-center gap-3 rounded-full border border-card-border bg-card px-4 py-2 text-fg backdrop-blur-md">
              <FontAwesomeIcon icon={audioPlayer.volume === 0 ? faVolumeXmark : faVolumeLow} className="w-4" />
              <span className="sr-only">Volume da paisagem sonora</span>
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={audioPlayer.volume}
                onChange={(e) => audioPlayer.setVolume(Number(e.target.value))}
                className="h-2 w-full accent-brand-600"
                aria-label="Volume da paisagem sonora"
              />
              <span className="w-9 text-right text-xs font-semibold tabular-nums">{audioPlayer.volume}%</span>
            </label>
          )}
          {countdown <= 0 && session.status !== 'finished' && (
            <Button
              variant="secondary"
              onClick={() => (session.status === 'paused' ? session.resume() : session.pause())}
            >
              <FontAwesomeIcon icon={session.status === 'paused' ? faPlay : faPause} />
              {session.status === 'paused' ? 'Retomar' : 'Pausar'}
            </Button>
          )}
        </div>
      </div>
    </SkyBackground>
  )
}
