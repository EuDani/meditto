import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBookOpen, faPlay, faStar as faStarSolid } from '@fortawesome/free-solid-svg-icons'
import { faStar as faStarRegular } from '@fortawesome/free-regular-svg-icons'
import { AppShell } from '../../components/AppShell'
import { GlassCard, Button } from '../../components/ui'
import { BREATHING_MODULES, getModes } from '../../lib/breathing/modules'
import type { MethodKey } from '../../lib/database.types'
import { useMethodSettings, useSoundscapes, useUpsertMethodSetting } from '../../lib/queries'
import { sfx } from '../../lib/sound'

export function MethodDetailPage() {
  const { key } = useParams<{ key: string }>()
  const navigate = useNavigate()
  const module = BREATHING_MODULES[key as MethodKey]
  const modes = useMemo(() => (module ? getModes(module) : []), [module])

  const { data: settings } = useMethodSettings()
  const { data: soundscapes } = useSoundscapes()
  const upsertSetting = useUpsertMethodSetting()

  const savedSetting = settings?.find((s) => s.method_key === key)
  const isFavorite = savedSetting?.favorite ?? false

  const [modeKey, setModeKey] = useState('default')
  const activeMode = modes.find((m) => m.key === modeKey) ?? modes[0]

  // Reset the mode back to default when navigating between different methods.
  useEffect(() => {
    setModeKey('default')
  }, [module?.key])

  const [durationSeconds, setDurationSeconds] = useState(0)
  const [cycles, setCycles] = useState(4)
  const [soundscapeId, setSoundscapeId] = useState<string>('')

  // Reset duration/cycles to sensible defaults whenever the chosen mode changes,
  // since alternate modes can have their own loop shape and ranges.
  useEffect(() => {
    if (!activeMode) return
    if (activeMode.loop.kind === 'continuous-duration') {
      setDurationSeconds(
        modeKey === 'default' ? (savedSetting?.custom_duration_seconds ?? activeMode.loop.defaultSeconds) : activeMode.loop.defaultSeconds,
      )
    }
    if (activeMode.loop.kind === 'max-cycles') {
      setCycles(activeMode.loop.defaultCycles)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modeKey, module?.key])

  const phaseSummary = useMemo(() => {
    if (!activeMode) return ''
    const { in: i, hold_in, out, hold_out } = activeMode.timings
    return [`Inspire ${i}s`, hold_in > 0 && `Segure ${hold_in}s`, `Expire ${out}s`, hold_out > 0 && `Segure ${hold_out}s`]
      .filter(Boolean)
      .join(' · ')
  }, [activeMode])

  if (!module || !activeMode) {
    return (
      <AppShell>
        <p className="text-fg">Método não encontrado.</p>
      </AppShell>
    )
  }

  function handleStart() {
    sfx.start()
    navigate(`/session/${module.key}`, {
      state: {
        modeKey,
        durationSeconds: activeMode.loop.kind === 'continuous-duration' ? durationSeconds : undefined,
        cycles: activeMode.loop.kind === 'max-cycles' ? cycles : undefined,
        soundscapeId: soundscapeId || null,
      },
    })
  }

  function handleFavorite() {
    if (!isFavorite) sfx.add()
    upsertSetting.mutate({ methodKey: module.key, favorite: !isFavorite, customDurationSeconds: durationSeconds })
  }

  return (
    <AppShell>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-fg">{module.label}</h1>
          <p className="font-medium text-fg-muted">{activeMode.technique}</p>
        </div>
        <Link
          to="/guide"
          className="flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full bg-btn-secondary px-3 py-1.5 text-sm font-medium text-fg hover:bg-btn-secondary-hover"
        >
          <FontAwesomeIcon icon={faBookOpen} />
          Guia
        </Link>
      </div>

      <GlassCard className="mt-4">
        <p>{activeMode.description}</p>
        <p className="mt-2 text-sm font-medium text-fg-muted">{phaseSummary}</p>
      </GlassCard>

      {modes.length > 1 && (
        <GlassCard className="mt-4">
          <label className="flex flex-col gap-2 text-sm font-medium">
            Modo de respiração
            <select
              className="rounded-xl border border-line bg-field px-3 py-2 text-fg"
              value={modeKey}
              onChange={(e) => setModeKey(e.target.value)}
            >
              {modes.map((m) => (
                <option key={m.key} value={m.key}>
                  {m.key === 'default' ? `Padrão — ${m.label}` : m.label}
                </option>
              ))}
            </select>
          </label>
          {activeMode.hint && <p className="mt-2 text-xs text-fg-muted">{activeMode.hint}</p>}
        </GlassCard>
      )}

      {activeMode.loop.kind === 'continuous-duration' && (
        <GlassCard className="mt-4">
          <label className="flex flex-col gap-2 text-sm font-medium">
            Duração: {Math.round(durationSeconds / 60)} min
            <input
              type="range"
              className="accent-brand-600"
              min={activeMode.loop.minSeconds}
              max={activeMode.loop.maxSeconds}
              step={30}
              value={durationSeconds}
              onChange={(e) => setDurationSeconds(Number(e.target.value))}
            />
          </label>
        </GlassCard>
      )}

      {activeMode.loop.kind === 'max-cycles' && (
        <GlassCard className="mt-4">
          <label className="flex flex-col gap-2 text-sm font-medium">
            Ciclos: {cycles}
            <input
              type="range"
              className="accent-brand-600"
              min={activeMode.loop.minCycles}
              max={activeMode.loop.maxCycles}
              step={1}
              value={cycles}
              onChange={(e) => setCycles(Number(e.target.value))}
            />
          </label>
        </GlassCard>
      )}

      {activeMode.loop.kind === 'rep-count-then-pause' && (
        <GlassCard className="mt-4 text-sm">
          {activeMode.loop.reps} repetições rápidas, seguidas de {activeMode.loop.pauseSeconds}s de pausa.
        </GlassCard>
      )}

      {activeMode.loop.kind === 'burst-then-final-hold' && (
        <GlassCard className="mt-4 text-sm">
          {activeMode.loop.reps} repetições rápidas, depois 1 inspiração de {activeMode.loop.finalIn}s e retenção de{' '}
          {activeMode.loop.finalHoldIn}s.
        </GlassCard>
      )}

      <GlassCard className="mt-4">
        <label className="flex flex-col gap-2 text-sm font-medium">
          Paisagem sonora (opcional)
          <select
            className="rounded-xl border border-line bg-field px-3 py-2 text-fg"
            value={soundscapeId}
            onChange={(e) => setSoundscapeId(e.target.value)}
          >
            <option value="">Sem áudio</option>
            {soundscapes?.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </select>
        </label>
        {!soundscapes?.length && (
          <p className="mt-2 text-xs text-fg-muted">Nenhuma paisagem sonora cadastrada ainda. Adicione uma na aba Sons.</p>
        )}
      </GlassCard>

      <div className="mt-5 flex gap-3">
        <Button onClick={handleStart} className="flex-1">
          <FontAwesomeIcon icon={faPlay} />
          Iniciar sessão
        </Button>
        <Button variant="secondary" onClick={handleFavorite}>
          <FontAwesomeIcon icon={isFavorite ? faStarSolid : faStarRegular} className={isFavorite ? 'text-amber-500' : ''} />
          {isFavorite ? 'Favorito' : 'Favoritar'}
        </Button>
      </div>
    </AppShell>
  )
}
