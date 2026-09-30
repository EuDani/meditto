import { useMemo, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleCheck, faCirclePause } from '@fortawesome/free-solid-svg-icons'
import { AppShell } from '../../components/AppShell'
import { GlassCard } from '../../components/ui'
import { useSessions } from '../../lib/queries'
import { BREATHING_MODULES_LIST } from '../../lib/breathing/modules'
import type { MethodKey } from '../../lib/database.types'

function formatDuration(seconds: number) {
  const minutes = Math.round(seconds / 60)
  return minutes < 1 ? `${Math.round(seconds)}s` : `${minutes} min`
}

const chip = (active: boolean) =>
  `rounded-full px-3 py-1 text-xs font-semibold transition-colors ${active ? 'bg-chip-on text-chip-on-fg' : 'bg-chip text-fg'}`

export function HistoryPage() {
  const { data: sessions, isLoading } = useSessions()
  const [filter, setFilter] = useState<MethodKey | 'all'>('all')

  const filtered = useMemo(
    () => (sessions ?? []).filter((s) => filter === 'all' || s.method_key === filter),
    [sessions, filter],
  )

  const groups = useMemo(() => {
    const map = new Map<string, typeof filtered>()
    for (const s of filtered) {
      const dateKey = new Date(s.started_at).toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
      })
      if (!map.has(dateKey)) map.set(dateKey, [])
      map.get(dateKey)!.push(s)
    }
    return Array.from(map.entries())
  }, [filtered])

  return (
    <AppShell>
      <h1 className="mb-4 text-2xl font-semibold text-fg">Histórico</h1>

      <div className="mb-4 flex flex-wrap gap-2">
        <button onClick={() => setFilter('all')} className={chip(filter === 'all')}>
          Todos
        </button>
        {BREATHING_MODULES_LIST.map((m) => (
          <button key={m.key} onClick={() => setFilter(m.key)} className={chip(filter === m.key)}>
            {m.label}
          </button>
        ))}
      </div>

      {isLoading && <p className="text-fg-muted">Carregando…</p>}
      {!isLoading && groups.length === 0 && <p className="text-fg-muted">Nenhuma sessão registrada ainda.</p>}

      <div className="flex flex-col gap-4">
        {groups.map(([date, items]) => (
          <div key={date}>
            <h2 className="mb-2 text-sm font-semibold capitalize text-fg">{date}</h2>
            <GlassCard className="flex flex-col gap-3">
              {items.map((s) => (
                <div key={s.id} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-semibold">{s.method_label}</p>
                    <p className="text-xs text-fg-muted">
                      {new Date(s.started_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} ·{' '}
                      {formatDuration(s.actual_duration_seconds)}
                    </p>
                  </div>
                  <span className={`flex items-center gap-1.5 font-medium ${s.completed ? 'text-success' : 'text-fg-muted'}`}>
                    <FontAwesomeIcon icon={s.completed ? faCircleCheck : faCirclePause} />
                    {s.completed ? 'Concluída' : 'Interrompida'}
                  </span>
                </div>
              ))}
            </GlassCard>
          </div>
        ))}
      </div>
    </AppShell>
  )
}
