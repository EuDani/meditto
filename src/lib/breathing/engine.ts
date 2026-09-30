import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react'
import type { BreathingModule, Phase } from './modules'

export type ExtendedPhase = Phase | 'rest'

export interface PlanStep {
  phase: ExtendedPhase
  duration: number // seconds
  cycleIndex: number
  isFinal?: boolean
}

export interface BreathingPlan {
  steps: PlanStep[]
  totalCycles: number | null
  totalSeconds: number
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function nonZeroPhases(timings: BreathingModule['timings']): Array<[Phase, number]> {
  return (['in', 'hold_in', 'out', 'hold_out'] as Phase[])
    .map((phase) => [phase, timings[phase]] as [Phase, number])
    .filter(([, duration]) => duration > 0)
}

export interface BreathingSessionOptions {
  /** For continuous-duration modules (relaxamento/equilibrio/foco). */
  durationSeconds?: number
  /** For max-cycles modules (descontracao). */
  cycles?: number
}

export function buildPlan(module: BreathingModule, options: BreathingSessionOptions = {}): BreathingPlan {
  const phases = nonZeroPhases(module.timings)
  const steps: PlanStep[] = []
  const loop = module.loop

  if (loop.kind === 'continuous-duration') {
    const target = clamp(options.durationSeconds ?? loop.defaultSeconds, loop.minSeconds, loop.maxSeconds)
    let remaining = target
    let cycleIndex = 0
    while (remaining > 0.05) {
      cycleIndex += 1
      for (const [phase, duration] of phases) {
        if (remaining <= 0.05) break
        const stepDuration = Math.min(duration, remaining)
        steps.push({ phase, duration: stepDuration, cycleIndex })
        remaining -= stepDuration
      }
    }
    return { steps, totalCycles: null, totalSeconds: target }
  }

  if (loop.kind === 'rep-count-then-pause') {
    for (let i = 1; i <= loop.reps; i += 1) {
      for (const [phase, duration] of phases) {
        steps.push({ phase, duration, cycleIndex: i })
      }
    }
    steps.push({ phase: 'rest', duration: loop.pauseSeconds, cycleIndex: loop.reps + 1 })
    const totalSeconds = steps.reduce((sum, step) => sum + step.duration, 0)
    return { steps, totalCycles: loop.reps, totalSeconds }
  }

  if (loop.kind === 'burst-then-final-hold') {
    for (let i = 1; i <= loop.reps; i += 1) {
      for (const [phase, duration] of phases) {
        steps.push({ phase, duration, cycleIndex: i })
      }
    }
    const finalCycle = loop.reps + 1
    steps.push({ phase: 'in', duration: loop.finalIn, cycleIndex: finalCycle, isFinal: true })
    steps.push({ phase: 'hold_in', duration: loop.finalHoldIn, cycleIndex: finalCycle, isFinal: true })
    const totalSeconds = steps.reduce((sum, step) => sum + step.duration, 0)
    return { steps, totalCycles: finalCycle, totalSeconds }
  }

  // max-cycles
  const cycles = clamp(options.cycles ?? loop.defaultCycles, loop.minCycles, loop.maxCycles)
  for (let i = 1; i <= cycles; i += 1) {
    for (const [phase, duration] of phases) {
      steps.push({ phase, duration, cycleIndex: i })
    }
  }
  const totalSeconds = steps.reduce((sum, step) => sum + step.duration, 0)
  return { steps, totalCycles: cycles, totalSeconds }
}

export type SessionStatus = 'idle' | 'running' | 'paused' | 'finished'

interface EngineState {
  stepIndex: number
  msRemaining: number
  elapsedMs: number
  status: SessionStatus
}

export interface UseBreathingSessionResult {
  status: SessionStatus
  plan: BreathingPlan
  currentStep: PlanStep | null
  stepIndex: number
  secondsRemaining: number
  progress: number
  elapsedSeconds: number
  totalSeconds: number
  cycleNumber: number
  totalCycles: number | null
  start: () => void
  pause: () => void
  resume: () => void
  cancel: () => void
}

const RENDER_THROTTLE_MS = 90

export function useBreathingSession(
  module: BreathingModule,
  options: BreathingSessionOptions & {
    onFinish?: (info: { completed: boolean; elapsedSeconds: number }) => void
  } = {},
): UseBreathingSessionResult {
  const plan = useMemo(
    () => buildPlan(module, options),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [module, options.durationSeconds, options.cycles],
  )

  const engineRef = useRef<EngineState>({ stepIndex: 0, msRemaining: 0, elapsedMs: 0, status: 'idle' })
  const rafRef = useRef<number | null>(null)
  const lastTsRef = useRef(0)
  const lastRenderTsRef = useRef(0)
  const lastRenderedStepRef = useRef(0)
  const onFinishRef = useRef(options.onFinish)
  onFinishRef.current = options.onFinish

  const [, forceRender] = useReducer((c: number) => c + 1, 0)

  const stopRaf = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }, [])

  const loop = useCallback(
    (ts: number) => {
      const eng = engineRef.current
      if (eng.status !== 'running') return

      const delta = ts - lastTsRef.current
      lastTsRef.current = ts
      eng.msRemaining -= delta
      eng.elapsedMs += delta

      while (eng.msRemaining <= 0) {
        const overflow = -eng.msRemaining
        const nextIndex = eng.stepIndex + 1
        if (nextIndex >= plan.steps.length) {
          eng.stepIndex = plan.steps.length - 1
          eng.msRemaining = 0
          eng.status = 'finished'
          break
        }
        eng.stepIndex = nextIndex
        eng.msRemaining = plan.steps[nextIndex].duration * 1000 - overflow
      }

      const stepChanged = eng.stepIndex !== lastRenderedStepRef.current
      const throttleElapsed = ts - lastRenderTsRef.current >= RENDER_THROTTLE_MS
      if (stepChanged || throttleElapsed || eng.status === 'finished') {
        lastRenderedStepRef.current = eng.stepIndex
        lastRenderTsRef.current = ts
        forceRender()
      }

      if (eng.status === 'running') {
        rafRef.current = requestAnimationFrame(loop)
      } else if (eng.status === 'finished') {
        onFinishRef.current?.({ completed: true, elapsedSeconds: plan.totalSeconds })
      }
    },
    [plan],
  )

  const start = useCallback(() => {
    const eng = engineRef.current
    stopRaf()
    eng.stepIndex = 0
    eng.msRemaining = (plan.steps[0]?.duration ?? 0) * 1000
    eng.elapsedMs = 0
    eng.status = plan.steps.length > 0 ? 'running' : 'finished'
    lastTsRef.current = performance.now()
    lastRenderTsRef.current = lastTsRef.current
    lastRenderedStepRef.current = 0
    forceRender()
    if (eng.status === 'running') {
      rafRef.current = requestAnimationFrame(loop)
    }
  }, [plan, loop, stopRaf])

  const pause = useCallback(() => {
    if (engineRef.current.status !== 'running') return
    engineRef.current.status = 'paused'
    stopRaf()
    forceRender()
  }, [stopRaf])

  const resume = useCallback(() => {
    if (engineRef.current.status !== 'paused') return
    engineRef.current.status = 'running'
    lastTsRef.current = performance.now()
    forceRender()
    rafRef.current = requestAnimationFrame(loop)
  }, [loop])

  const cancel = useCallback(() => {
    const eng = engineRef.current
    const wasActive = eng.status === 'running' || eng.status === 'paused'
    const elapsedSeconds = eng.elapsedMs / 1000
    stopRaf()
    eng.status = 'idle'
    forceRender()
    if (wasActive) {
      onFinishRef.current?.({ completed: false, elapsedSeconds })
    }
  }, [stopRaf])

  useEffect(() => stopRaf, [stopRaf])

  const eng = engineRef.current
  const currentStep = plan.steps[eng.stepIndex] ?? null
  const stepDurationMs = (currentStep?.duration ?? 0) * 1000
  const progress = stepDurationMs > 0 ? clamp(1 - eng.msRemaining / stepDurationMs, 0, 1) : 0

  return {
    status: eng.status,
    plan,
    currentStep,
    stepIndex: eng.stepIndex,
    secondsRemaining: Math.max(0, Math.ceil(eng.msRemaining / 1000)),
    progress,
    elapsedSeconds: eng.elapsedMs / 1000,
    totalSeconds: plan.totalSeconds,
    cycleNumber: currentStep?.cycleIndex ?? 0,
    totalCycles: plan.totalCycles,
    start,
    pause,
    resume,
    cancel,
  }
}
