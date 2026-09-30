import type { MethodKey } from '../database.types'

export type Phase = 'in' | 'hold_in' | 'out' | 'hold_out'

export interface PhaseTimings {
  in: number
  hold_in: number
  out: number
  hold_out: number
}

export type LoopShape =
  | { kind: 'continuous-duration'; minSeconds: number; maxSeconds: number; defaultSeconds: number }
  | { kind: 'rep-count-then-pause'; reps: number; pauseSeconds: number }
  | { kind: 'burst-then-final-hold'; reps: number; finalIn: number; finalHoldIn: number }
  | { kind: 'max-cycles'; minCycles: number; maxCycles: number; defaultCycles: number }

export interface BreathingModule {
  key: MethodKey
  label: string
  technique: string
  description: string
  timings: PhaseTimings
  loop: LoopShape
  accentFrom: string
  accentTo: string
  phaseLabels: Record<Phase, string>
}

export const PHASE_LABELS_PT: Record<Phase, string> = {
  in: 'Inspire',
  hold_in: 'Segure',
  out: 'Expire',
  hold_out: 'Segure',
}

export const BREATHING_MODULES: Record<MethodKey, BreathingModule> = {
  relaxamento: {
    key: 'relaxamento',
    label: 'Relaxamento',
    technique: 'Exalação Prolongada',
    description:
      'A expiração dura o dobro da inspiração, acalmando o sistema nervoso. Ideal antes de dormir.',
    timings: { in: 4, hold_in: 0, out: 8, hold_out: 0 },
    loop: { kind: 'continuous-duration', minSeconds: 60, maxSeconds: 600, defaultSeconds: 240 },
    accentFrom: '#6d5bd0',
    accentTo: '#2f2f6b',
    phaseLabels: PHASE_LABELS_PT,
  },
  equilibrio: {
    key: 'equilibrio',
    label: 'Equilíbrio',
    technique: 'Respiração Coerente',
    description: 'Inspiração e expiração com a mesma duração, criando coerência cardíaca.',
    timings: { in: 5, hold_in: 0, out: 5, hold_out: 0 },
    loop: { kind: 'continuous-duration', minSeconds: 60, maxSeconds: 600, defaultSeconds: 240 },
    accentFrom: '#2b9fd8',
    accentTo: '#1e63b3',
    phaseLabels: PHASE_LABELS_PT,
  },
  vigor: {
    key: 'vigor',
    label: 'Vigor',
    technique: 'Bhastrika (Fole)',
    description: 'Respiração rápida e profunda para energizar o corpo. Encha e esvazie totalmente os pulmões.',
    timings: { in: 1.5, hold_in: 0, out: 1.5, hold_out: 0 },
    loop: { kind: 'rep-count-then-pause', reps: 18, pauseSeconds: 15 },
    accentFrom: '#e5484d',
    accentTo: '#c2410c',
    phaseLabels: PHASE_LABELS_PT,
  },
  foco: {
    key: 'foco',
    label: 'Foco',
    technique: 'Box Breathing',
    description: 'Quatro fases iguais de 4 segundos, usada por atletas e militares para concentração.',
    timings: { in: 4, hold_in: 4, out: 4, hold_out: 4 },
    loop: { kind: 'continuous-duration', minSeconds: 60, maxSeconds: 600, defaultSeconds: 240 },
    accentFrom: '#2b82db',
    accentTo: '#1a3f6e',
    phaseLabels: PHASE_LABELS_PT,
  },
  energia: {
    key: 'energia',
    label: 'Energia',
    technique: 'Kapalabhati',
    description: 'Expirações curtas e forçadas; a inspiração acontece sozinha, como reflexo passivo.',
    timings: { in: 0.5, hold_in: 0, out: 0.5, hold_out: 0 },
    loop: { kind: 'burst-then-final-hold', reps: 30, finalIn: 4, finalHoldIn: 15 },
    accentFrom: '#f08a24',
    accentTo: '#c2361f',
    phaseLabels: PHASE_LABELS_PT,
  },
  descontracao: {
    key: 'descontracao',
    label: 'Descontração',
    technique: 'Método 4-7-8',
    description: 'Inspire em 4s, segure por 7s, expire em 8s. Poucos ciclos, feitos com calma.',
    timings: { in: 4, hold_in: 7, out: 8, hold_out: 0 },
    loop: { kind: 'max-cycles', minCycles: 4, maxCycles: 8, defaultCycles: 4 },
    accentFrom: '#4c6fd6',
    accentTo: '#2f2f6b',
    phaseLabels: PHASE_LABELS_PT,
  },
}

export const BREATHING_MODULES_LIST = Object.values(BREATHING_MODULES)

export function getPhaseLabel(module: BreathingModule, phase: Phase | 'rest'): string {
  if (phase === 'rest') return 'Pausa de recuperação'
  return module.phaseLabels[phase]
}
