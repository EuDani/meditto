import type { BreathingModule } from '../../lib/breathing/modules'
import { getPhaseLabel } from '../../lib/breathing/modules'
import type { ExtendedPhase } from '../../lib/breathing/engine'

export interface BreathingVisualProps {
  module: BreathingModule
  phase: ExtendedPhase
  progress: number // 0..1 elapsed within the current phase
  secondsRemaining: number
  cycleNumber: number
  totalCycles: number | null
  isFinal?: boolean
  isPaused: boolean
}

// Round slider geometry: 270° arc, gap at the bottom. Angles measured clockwise from the top.
const SIZE = 300
const CENTER = SIZE / 2
const RADIUS = 122
const STROKE = 16
const START_ANGLE = -135
const SWEEP = 270

function polar(angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180
  return { x: CENTER + RADIUS * Math.sin(rad), y: CENTER - RADIUS * Math.cos(rad) }
}

const ARC_START = polar(START_ANGLE)
const ARC_END = polar(START_ANGLE + SWEEP)
const ARC_PATH = `M ${ARC_START.x} ${ARC_START.y} A ${RADIUS} ${RADIUS} 0 1 1 ${ARC_END.x} ${ARC_END.y}`

/** Lung fill level: 0 = empty, 1 = full. Inhale fills, exhale empties, holds stay put. */
function breathLevel(phase: ExtendedPhase, progress: number): number {
  switch (phase) {
    case 'in':
      return progress
    case 'hold_in':
      return 1
    case 'out':
      return 1 - progress
    default:
      return 0
  }
}

export function BreathingVisual({
  module,
  phase,
  progress,
  secondsRemaining,
  cycleNumber,
  totalCycles,
  isFinal,
  isPaused,
}: BreathingVisualProps) {
  const level = breathLevel(phase, progress)
  const label = getPhaseLabel(module, phase)
  const showBigNumber = module.key === 'descontracao' || (module.key === 'energia' && isFinal)
  const isHolding = phase === 'hold_in' || phase === 'hold_out'
  const fast = module.timings.in < 1
  const transition = isPaused ? 'none' : `${fast ? 60 : 110}ms linear`

  const knobAngle = START_ANGLE + SWEEP * level
  const blobScale = 0.72 + 0.28 * level

  return (
    <div
      className="relative flex h-72 w-72 items-center justify-center sm:h-80 sm:w-80"
      role="progressbar"
      aria-label={`${label}, ${secondsRemaining} segundos`}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(level * 100)}
    >
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="absolute inset-0 h-full w-full" aria-hidden="true">
        <defs>
          <linearGradient id="breath-ring" gradientUnits="userSpaceOnUse" x1="0" y1={SIZE} x2={SIZE} y2="0">
            <stop offset="0" stopColor={module.accentFrom} />
            <stop offset="1" stopColor={module.accentTo} />
          </linearGradient>
        </defs>

        <path d={ARC_PATH} fill="none" stroke="var(--line)" strokeWidth={STROKE} strokeLinecap="round" />
        <path
          d={ARC_PATH}
          fill="none"
          stroke="url(#breath-ring)"
          strokeWidth={STROKE}
          strokeLinecap="round"
          pathLength={100}
          strokeDasharray={100}
          strokeDashoffset={100 * (1 - level)}
          style={{ transition: `stroke-dashoffset ${transition}` }}
        />

        <g
          style={{
            transform: `rotate(${knobAngle}deg)`,
            transformOrigin: '50% 50%',
            transition: `transform ${transition}`,
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.35))',
          }}
        >
          <circle cx={CENTER} cy={CENTER - RADIUS} r={STROKE + 5} fill="#ffffff" stroke={module.accentFrom} strokeWidth={5} />
          {isHolding && (
            <circle cx={CENTER} cy={CENTER - RADIUS} r={STROKE + 5} fill="none" stroke={module.accentFrom} strokeWidth={2} opacity={0.7}>
              <animate attributeName="r" values={`${STROKE + 5};${STROKE + 16}`} dur="1.4s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.7;0" dur="1.4s" repeatCount="indefinite" />
            </circle>
          )}
        </g>
      </svg>

      <div
        className="absolute h-[58%] w-[58%] rounded-full shadow-xl"
        style={{
          background: `radial-gradient(circle at 35% 30%, ${module.accentFrom}, ${module.accentTo})`,
          transform: `scale(${blobScale})`,
          transition: `transform ${transition}`,
        }}
      />

      <div
        className="relative z-10 flex max-w-36 flex-col items-center gap-1 text-center text-white"
        style={{ textShadow: '0 1px 6px rgba(0,0,0,0.55)' }}
      >
        <span className="text-lg font-semibold tracking-wide sm:text-xl">{label}</span>
        <span className={showBigNumber ? 'text-6xl font-bold sm:text-7xl' : 'text-4xl font-semibold sm:text-5xl'}>
          {secondsRemaining}
        </span>
        {totalCycles !== null && phase !== 'rest' && (
          <span className="text-xs font-medium">
            Ciclo {Math.min(cycleNumber, totalCycles)} de {totalCycles}
          </span>
        )}
      </div>
    </div>
  )
}
