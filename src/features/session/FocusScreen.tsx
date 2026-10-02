import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCalendarDays,
  faHouse,
  faLightbulb,
  faMusic,
  faPause,
  faPlay,
  faQuoteLeft,
  faSeedling,
  faTrophy,
  faVolumeLow,
  faVolumeXmark,
  faXmark,
} from '@fortawesome/free-solid-svg-icons'
import { SkyBackground } from '../../components/SkyBackground'
import { HeaderControls } from '../../components/HeaderControls'
import { Button, GlassCard } from '../../components/ui'
import { BREATHING_MODULES, getModes } from '../../lib/breathing/modules'
import type { MethodKey } from '../../lib/database.types'
import { useBreathingSession } from '../../lib/breathing/engine'
import { sfx } from '../../lib/sound'
import { useWakeLock } from '../../lib/wakeLock'
import { MOTIVATIONAL_MESSAGES, REFLECTIONS, pickRandom } from '../../lib/reflections'
import { BreathingVisual } from './BreathingVisual'
import { useCreateSession, useSoundscapes } from '../../lib/queries'
import { useYoutubeAudioPlayer, YoutubeAudioMount } from '../soundscapes/YoutubeAudioPlayer'

interface SessionRouteState {
  modeKey?: string
  durationSeconds?: number
  cycles?: number
  soundscapeId?: string | null
}

export function FocusScreen() {
  const { key } = useParams<{ key: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const baseModule = BREATHING_MODULES[key as MethodKey]
  const routeState = (location.state as SessionRouteState) ?? {}

  const activeMode = baseModule ? getModes(baseModule).find((m) => m.key === routeState.modeKey) ?? getModes(baseModule)[0] : null
  // The engine/visual only read timings, loop, accent colors, key and phase labels — merge in the chosen mode's pattern.
  const module = baseModule && activeMode ? { ...baseModule, technique: activeMode.technique, description: activeMode.description, timings: activeMode.timings, loop: activeMode.loop } : baseModule

  const { data: soundscapes } = useSoundscapes()
  const soundscape = soundscapes?.find((s) => s.id === routeState.soundscapeId)
  const audioPlayer = useYoutubeAudioPlayer(soundscape?.youtube_video_id ?? null, 'session-audio-mount')

  const createSession = useCreateSession()
  const startedAtRef = useRef<string | null>(null)
  const lastCueStepRef = useRef(-1)
  const [outcome, setOutcome] = useState<{ completed: boolean; elapsedSeconds: number; sets: number } | null>(null)
  const [countdown, setCountdown] = useState(3)
  const [closing] = useState(() => ({ message: pickRandom(MOTIVATIONAL_MESSAGES), reflection: pickRandom(REFLECTIONS) }))

  // Mantém a tela acesa durante toda a sessão (útil no celular).
  useWakeLock(!outcome)

  const session = useBreathingSession(module, {
    durationSeconds: routeState.durationSeconds,
    cycles: routeState.cycles,
    onFinish: ({ completed, elapsedSeconds }) => {
      if (startedAtRef.current) {
        createSession.mutate({
          methodKey: module.key,
          methodLabel: activeMode && activeMode.key !== 'default' ? `${module.label} — ${activeMode.label}` : module.label,
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
      setOutcome({
        completed,
        elapsedSeconds,
        sets: Math.min(session.cycleNumber, session.totalCycles ?? session.cycleNumber),
      })
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
    if (step.phase === 'in') {
      if (step.duration >= 1) sfx.switchCue('in')
      sfx.inhale(step.duration)
    } else if (step.phase === 'out') {
      if (step.duration >= 1) sfx.switchCue('out')
      sfx.exhale(step.duration)
    } else if (step.phase === 'rest') sfx.rest()
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
    const minutes = Math.floor(outcome.elapsedSeconds / 60)
    const seconds = Math.round(outcome.elapsedSeconds % 60)
    const duration = minutes > 0 ? `${minutes} min${seconds ? ` ${seconds}s` : ''}` : `${seconds}s`

    return (
      <SkyBackground>
        <div className="flex flex-1 items-center justify-center px-5 py-8">
          <GlassCard className="flex w-full max-w-md flex-col items-center gap-4 text-center">
            <span
              className={`flex h-20 w-20 items-center justify-center rounded-full text-4xl text-white ${
                outcome.completed ? 'bg-amber-500' : 'bg-brand-600'
              }`}
            >
              <FontAwesomeIcon icon={outcome.completed ? faTrophy : faSeedling} />
            </span>
            <div>
              <h1 className="text-3xl font-semibold">{outcome.completed ? 'Parabéns!' : 'Sessão encerrada'}</h1>
              <p className="mt-1 font-medium text-fg-muted">
                {outcome.completed ? 'Você completou sua meditação.' : 'Cada respiração conta, mesmo as que ficaram pelo caminho.'}
              </p>
            </div>

            <div className="grid w-full grid-cols-2 gap-3">
              <div className="rounded-2xl bg-chip p-3">
                <p className="text-xl font-semibold">{duration}</p>
                <p className="text-xs font-medium text-fg-muted">de prática</p>
              </div>
              <div className="rounded-2xl bg-chip p-3">
                <p className="text-xl font-semibold">{outcome.sets}</p>
                <p className="text-xs font-medium text-fg-muted">{outcome.sets === 1 ? 'set' : 'sets'}</p>
              </div>
            </div>
            <p className="text-sm font-medium text-fg-muted">
              {module.label} · {module.technique}
            </p>

            <div className="w-full rounded-2xl bg-chip p-4 text-left">
              <FontAwesomeIcon icon={faQuoteLeft} className="mb-2 text-brand-600" />
              <p>{closing.message}</p>
            </div>

            <div className="w-full rounded-2xl border border-line p-4 text-left">
              <h2 className="mb-1 flex items-center gap-2 text-sm font-semibold">
                <FontAwesomeIcon icon={faLightbulb} className="text-amber-500" />
                Para refletir
              </h2>
              <p className="text-sm">{closing.reflection}</p>
              <p className="mt-2 text-xs text-fg-muted">Leve um instante para responder a si mesmo, sem pressa.</p>
            </div>

            <div className="mt-1 flex w-full flex-col gap-2 sm:flex-row">
              <Button onClick={() => navigate('/')} className="flex-1">
                <FontAwesomeIcon icon={faHouse} />
                Voltar para o início
              </Button>
              <Button variant="secondary" onClick={() => navigate('/history')} className="flex-1">
                <FontAwesomeIcon icon={faCalendarDays} />
                Ver histórico
              </Button>
            </div>
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
              isFinal={session.currentStep?.isFinal}
              isPaused={session.status === 'paused'}
            />
          )}
        </div>

        {countdown <= 0 && session.totalCycles !== null && (
          <div className="mb-2 flex flex-col items-center text-fg">
            <p className="text-sm font-semibold">
              Set {Math.min(session.cycleNumber, session.totalCycles)} de {session.totalCycles}
            </p>
            <p className="text-xs text-fg-muted">
              {Math.max(session.totalCycles - session.cycleNumber, 0)} sets restantes
            </p>
          </div>
        )}

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
