import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faStar } from '@fortawesome/free-solid-svg-icons'
import { AppShell } from '../../components/AppShell'
import { GlassCard } from '../../components/ui'
import { BREATHING_MODULES_LIST } from '../../lib/breathing/modules'
import { METHOD_ICONS } from '../../lib/breathing/icons'
import { useMethodSettings } from '../../lib/queries'

export function MethodsPage() {
  const { data: settings } = useMethodSettings()
  const favoriteKeys = new Set(settings?.filter((s) => s.favorite).map((s) => s.method_key))

  return (
    <AppShell>
      <h1 className="mb-4 text-2xl font-semibold text-fg">Métodos de meditação</h1>
      <div className="flex flex-col gap-3">
        {BREATHING_MODULES_LIST.map((m) => (
          <Link key={m.key} to={`/methods/${m.key}`}>
            <GlassCard className="transition-transform hover:scale-[1.01]">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="flex items-center gap-2 text-lg font-semibold">
                    {m.label}
                    {favoriteKeys.has(m.key) && <FontAwesomeIcon icon={faStar} className="text-amber-500" />}
                  </h2>
                  <p className="text-sm font-medium text-fg-muted">{m.technique}</p>
                </div>
                <span
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white"
                  style={{ background: `linear-gradient(135deg, ${m.accentFrom}, ${m.accentTo})` }}
                >
                  <FontAwesomeIcon icon={METHOD_ICONS[m.key]} />
                </span>
              </div>
              <p className="mt-2 text-sm">{m.description}</p>
            </GlassCard>
          </Link>
        ))}
      </div>
    </AppShell>
  )
}
