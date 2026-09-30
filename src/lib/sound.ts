import { useSyncExternalStore } from 'react'

const STORAGE_KEY = 'medito:sound'

let ctx: AudioContext | null = null
let enabled = (() => {
  try {
    return localStorage.getItem(STORAGE_KEY) !== 'off'
  } catch {
    return true
  }
})()
const listeners = new Set<() => void>()

function getCtx(): AudioContext | null {
  if (!enabled) return null
  try {
    if (!ctx) {
      const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (!Ctor) return null
      ctx = new Ctor()
    }
    if (ctx.state === 'suspended') void ctx.resume()
    return ctx
  } catch {
    return null
  }
}

export function setSoundEnabled(value: boolean) {
  enabled = value
  try {
    localStorage.setItem(STORAGE_KEY, value ? 'on' : 'off')
  } catch {
    // storage indisponível
  }
  listeners.forEach((l) => l())
  if (value) sfx.click()
}

export function useSoundEnabled() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb)
      return () => listeners.delete(cb)
    },
    () => enabled,
  )
}

interface ToneOptions {
  freq: number
  endFreq?: number
  duration: number
  type?: OscillatorType
  gain?: number
  delay?: number
  attack?: number
}

function tone({ freq, endFreq, duration, type = 'sine', gain = 0.12, delay = 0, attack = 0.01 }: ToneOptions) {
  const c = getCtx()
  if (!c) return
  const start = c.currentTime + delay
  const osc = c.createOscillator()
  const amp = c.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, start)
  if (endFreq) osc.frequency.exponentialRampToValueAtTime(endFreq, start + duration)
  amp.gain.setValueAtTime(0.0001, start)
  amp.gain.exponentialRampToValueAtTime(gain, start + attack)
  amp.gain.exponentialRampToValueAtTime(0.0001, start + duration)
  osc.connect(amp).connect(c.destination)
  osc.start(start)
  osc.stop(start + duration + 0.05)
}

// Barramento com reverb suave (delay curto com realimentação filtrada) para os sons de respiração.
let bus: { ctx: AudioContext; dry: GainNode; wet: GainNode } | null = null
function getBus(c: AudioContext) {
  if (bus && bus.ctx === c) return bus
  const dry = c.createGain()
  dry.connect(c.destination)
  const wet = c.createGain()
  wet.gain.value = 0.3
  const delay = c.createDelay(1)
  delay.delayTime.value = 0.19
  const feedback = c.createGain()
  feedback.gain.value = 0.3
  const damp = c.createBiquadFilter()
  damp.type = 'lowpass'
  damp.frequency.value = 3200
  wet.connect(delay)
  delay.connect(damp)
  damp.connect(feedback)
  feedback.connect(delay)
  damp.connect(c.destination)
  bus = { ctx: c, dry, wet }
  return bus
}

/** Envelope suave (seno²) que sobe até `attack` (fração da duração) e desce devagar até zero. */
function swellCurve(attack: number, peak: number) {
  const n = 128
  const curve = new Float32Array(n)
  for (let i = 0; i < n; i += 1) {
    const t = i / (n - 1)
    const v =
      t < attack
        ? Math.sin(((Math.PI / 2) * t) / attack) ** 2
        : Math.cos(((Math.PI / 2) * (t - attack)) / (1 - attack)) ** 2
    curve[i] = v * peak
  }
  return curve
}

interface PadOptions {
  /** [frequência inicial, frequência final, ganho relativo] de cada nota do acorde */
  notes: Array<[number, number, number]>
  duration: number
  attack: number
  peak: number
  lowpassFrom: number
  lowpassTo: number
}

/** Pad de ondas senoidais levemente dessintonizadas, com swell lento: som quente, sem chiado. */
function pad({ notes, duration, attack, peak, lowpassFrom, lowpassTo }: PadOptions) {
  const c = getCtx()
  if (!c) return
  const out = getBus(c)
  const t0 = c.currentTime + 0.02

  const env = c.createGain()
  env.gain.value = 0
  env.gain.setValueCurveAtTime(swellCurve(attack, peak), t0, duration)
  env.connect(out.dry)
  env.connect(out.wet)

  const lp = c.createBiquadFilter()
  lp.type = 'lowpass'
  lp.Q.value = 0.3
  lp.frequency.setValueAtTime(lowpassFrom, t0)
  lp.frequency.linearRampToValueAtTime(lowpassTo, t0 + duration)
  lp.connect(env)

  for (const [from, to, weight] of notes) {
    for (const detune of [-2, 2]) {
      const osc = c.createOscillator()
      osc.type = 'sine'
      osc.detune.value = detune
      osc.frequency.setValueAtTime(from, t0)
      osc.frequency.exponentialRampToValueAtTime(to, t0 + duration)
      const g = c.createGain()
      g.gain.value = weight / 2
      osc.connect(g).connect(lp)
      osc.start(t0)
      osc.stop(t0 + duration + 0.05)
    }
  }
}

/** Nota curta e macia (fases rápidas, como Vigor e Energia). */
function softTap(freq: number, duration: number, peak: number) {
  const c = getCtx()
  if (!c) return
  const out = getBus(c)
  const t0 = c.currentTime + 0.01
  const osc = c.createOscillator()
  osc.type = 'sine'
  osc.frequency.value = freq
  const env = c.createGain()
  env.gain.value = 0
  env.gain.setValueCurveAtTime(swellCurve(0.25, peak), t0, duration)
  osc.connect(env)
  env.connect(out.dry)
  env.connect(out.wet)
  osc.start(t0)
  osc.stop(t0 + duration + 0.05)
}

/** Sino suave, de decaimento longo (retenções e pausas). */
function bell(freq: number, peak: number) {
  const c = getCtx()
  if (!c) return
  const out = getBus(c)
  const t0 = c.currentTime + 0.01
  for (const [mult, weight] of [
    [1, 1],
    [2, 0.25],
  ] as const) {
    const osc = c.createOscillator()
    osc.type = 'sine'
    osc.frequency.value = freq * mult
    const env = c.createGain()
    env.gain.setValueAtTime(0.0001, t0)
    env.gain.exponentialRampToValueAtTime(peak * weight, t0 + 0.06)
    env.gain.exponentialRampToValueAtTime(0.0001, t0 + 2)
    osc.connect(env)
    env.connect(out.dry)
    env.connect(out.wet)
    osc.start(t0)
    osc.stop(t0 + 2.1)
  }
}

export const sfx = {
  click() {
    tone({ freq: 620, endFreq: 420, duration: 0.07, type: 'triangle', gain: 0.07 })
  },
  add() {
    tone({ freq: 523.25, duration: 0.18, gain: 0.1 })
    tone({ freq: 783.99, duration: 0.28, gain: 0.1, delay: 0.09 })
  },
  remove() {
    tone({ freq: 440, endFreq: 260, duration: 0.2, type: 'triangle', gain: 0.09 })
  },
  countdown() {
    tone({ freq: 440, duration: 0.14, gain: 0.09 })
  },
  start() {
    tone({ freq: 523.25, duration: 0.3, gain: 0.1 })
    tone({ freq: 659.25, duration: 0.3, gain: 0.08, delay: 0.12 })
    tone({ freq: 783.99, duration: 0.5, gain: 0.08, delay: 0.24 })
  },
  success() {
    ;[523.25, 659.25, 783.99, 1046.5].forEach((freq, i) =>
      tone({ freq, duration: 0.7, gain: 0.09, delay: i * 0.14, attack: 0.02 }),
    )
  },
  /** Duas notas claras e consonantes (Dó–Sol) subindo um tom: a respiração enche. */
  inhale(seconds: number) {
    if (seconds < 1) return softTap(330, 0.35, 0.03)
    pad({
      notes: [
        [261.63, 293.66, 1],
        [392, 440, 0.55],
      ],
      duration: Math.min(seconds, 10),
      attack: 0.6,
      peak: 0.035,
      lowpassFrom: 700,
      lowpassTo: 1600,
    })
  },
  /** As mesmas notas descendo, com fechamento lento: a respiração esvazia. */
  exhale(seconds: number) {
    if (seconds < 1) return softTap(261.63, 0.35, 0.027)
    pad({
      notes: [
        [293.66, 261.63, 1],
        [440, 392, 0.55],
      ],
      duration: Math.min(seconds, 10),
      attack: 0.25,
      peak: 0.032,
      lowpassFrom: 1500,
      lowpassTo: 600,
    })
  },
  hold() {
    bell(392, 0.028)
  },
  rest() {
    bell(329.63, 0.032)
  },
}
