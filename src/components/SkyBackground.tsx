import { useMemo, type ReactNode } from 'react'
import { useTheme } from '../lib/theme'

function Cloud({ top, scale, opacity, animationClass, delay }: { top: string; scale: number; opacity: number; animationClass: string; delay: string }) {
  return (
    <svg
      viewBox="0 0 200 80"
      className={`absolute ${animationClass} pointer-events-none`}
      style={{ top, left: 0, width: 200 * scale, opacity, animationDelay: delay }}
      aria-hidden="true"
    >
      <g fill="var(--cloud)">
        <ellipse cx="60" cy="50" rx="50" ry="26" />
        <ellipse cx="110" cy="38" rx="42" ry="30" />
        <ellipse cx="150" cy="52" rx="36" ry="22" />
        <ellipse cx="30" cy="58" rx="30" ry="18" />
      </g>
    </svg>
  )
}

export function SkyBackground({ children }: { children?: ReactNode }) {
  const { resolved } = useTheme()

  return (
    <div
      className="relative min-h-dvh w-full overflow-hidden"
      style={{ background: 'linear-gradient(180deg, var(--sky-top), var(--sky-bottom))' }}
    >
      {resolved === 'dark' && <Stars />}
      {resolved === 'light' && <Sun />}
      <div style={{ opacity: 'var(--cloud-opacity)' }} className="pointer-events-none absolute inset-0">
        <Cloud top="8%" scale={0.9} opacity={0.9} animationClass="animate-drift-slow" delay="0s" />
        <Cloud top="22%" scale={1.3} opacity={0.75} animationClass="animate-drift-medium" delay="-8s" />
        <Cloud top="38%" scale={0.7} opacity={0.65} animationClass="animate-drift-fast" delay="-3s" />
        <Cloud top="55%" scale={1.1} opacity={0.55} animationClass="animate-drift-slow" delay="-20s" />
      </div>
      <div className="relative z-10 flex min-h-dvh flex-col">{children}</div>
    </div>
  )
}

function Sun() {
  return (
    <div
      className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full"
      style={{ background: 'radial-gradient(circle, rgba(255,244,190,0.95), rgba(255,244,190,0) 70%)' }}
      aria-hidden="true"
    />
  )
}

function Stars() {
  const stars = useMemo(
    () =>
      Array.from({ length: 40 }, (_, i) => ({
        id: i,
        top: `${Math.random() * 70}%`,
        left: `${Math.random() * 100}%`,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.6 + 0.3,
      })),
    [],
  )
  return (
    <div className="pointer-events-none absolute inset-0">
      {stars.map((star) => (
        <span
          key={star.id}
          className="absolute rounded-full bg-white"
          style={{ top: star.top, left: star.left, width: star.size, height: star.size, opacity: star.opacity }}
        />
      ))}
    </div>
  )
}
