import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRight, faFire, faRightFromBracket, faStopwatch } from '@fortawesome/free-solid-svg-icons'
import { AppShell } from '../../components/AppShell'
import { GlassCard, Button } from '../../components/ui'
import { useAuth } from '../auth/AuthProvider'
import { useSessions } from '../../lib/queries'
import { BREATHING_MODULES_LIST } from '../../lib/breathing/modules'
import { METHOD_ICONS } from '../../lib/breathing/icons'

function greeting() {
  const hour = new Date().getHours()
  if (hour < 5) return 'Boa madrugada'
  if (hour < 12) return 'Bom dia'
  if (hour < 18) return 'Boa tarde'
  return 'Boa noite'
}

function computeStreak(startedAtDates: string[]): number {
  const days = new Set(startedAtDates.map((d) => new Date(d).toDateString()))
  let streak = 0
  const cursor = new Date()
  while (days.has(cursor.toDateString())) {
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

export function HomePage() {
  const { user, signOut } = useAuth()
  const { data: sessions } = useSessions()

  const completedSessions = sessions?.filter((s) => s.completed) ?? []
  const streak = computeStreak(completedSessions.map((s) => s.started_at))
  const totalMinutes = Math.round(completedSessions.reduce((sum, s) => sum + s.actual_duration_seconds, 0) / 60)
  const recent = sessions?.slice(0, 3) ?? []

  return (
    <AppShell>
      <header className="mb-6 flex items-start justify-between">
        <div>
          <p className="font-medium text-fg-muted">{greeting()},</p>
          <h1 className="text-2xl font-semibold text-fg">
            {(user?.user_metadata?.display_name as string) || user?.email?.split('@')[0] || 'meditador'}
          </h1>
        </div>
        <button
          onClick={() => signOut()}
          className="flex items-center gap-2 rounded-full bg-btn-secondary px-3 py-1.5 text-sm font-medium text-fg hover:bg-btn-secondary-hover"
        >
          <FontAwesomeIcon icon={faRightFromBracket} />
          Sair
        </button>
      </header>

      <div className="mb-6 grid grid-cols-2 gap-3">
        <GlassCard className="text-center">
          <FontAwesomeIcon icon={faFire} className="mb-1 text-orange-600" />
          <p className="text-3xl font-semibold">{streak}</p>
          <p className="text-xs font-medium text-fg-muted">dias seguidos</p>
        </GlassCard>
        <GlassCard className="text-center">
          <FontAwesomeIcon icon={faStopwatch} className="mb-1 text-brand-600" />
          <p className="text-3xl font-semibold">{totalMinutes}</p>
          <p className="text-xs font-medium text-fg-muted">minutos totais</p>
        </GlassCard>
      </div>

      <GlassCard className="mb-6">
        <h2 className="mb-3 text-lg font-semibold">Comece agora</h2>
        <div className="flex flex-wrap gap-2">
          {BREATHING_MODULES_LIST.slice(0, 3).map((m) => (
            <Link key={m.key} to={`/methods/${m.key}`}>
              <Button variant="secondary">
                <FontAwesomeIcon icon={METHOD_ICONS[m.key]} />
                {m.label}
              </Button>
            </Link>
          ))}
        </div>
        <Link to="/methods" className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-brand-700 underline-offset-2 hover:underline dark:text-brand-300">
          Ver todos os métodos
          <FontAwesomeIcon icon={faArrowRight} />
        </Link>
      </GlassCard>

      <GlassCard>
        <h2 className="mb-3 text-lg font-semibold">Sessões recentes</h2>
        {recent.length === 0 && <p className="text-sm text-fg-muted">Você ainda não fez nenhuma sessão.</p>}
        <ul className="flex flex-col gap-2">
          {recent.map((s) => (
            <li key={s.id} className="flex items-center justify-between text-sm">
              <span className="font-medium">{s.method_label}</span>
              <span className="text-fg-muted">
                {new Date(s.started_at).toLocaleDateString('pt-BR')} ·{' '}
                {new Date(s.started_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </li>
          ))}
        </ul>
      </GlassCard>
    </AppShell>
  )
}
