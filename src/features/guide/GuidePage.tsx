import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRight, faCircleInfo, faListCheck, faLightbulb } from '@fortawesome/free-solid-svg-icons'
import { AppShell } from '../../components/AppShell'
import { GlassCard } from '../../components/ui'
import { BREATHING_MODULES_LIST } from '../../lib/breathing/modules'
import { METHOD_ICONS } from '../../lib/breathing/icons'
import { METHOD_GUIDES } from '../../lib/breathing/guide'
import type { MethodKey } from '../../lib/database.types'

export function GuidePage() {
  const [openKey, setOpenKey] = useState<MethodKey | null>(BREATHING_MODULES_LIST[0]?.key ?? null)

  return (
    <AppShell>
      <h1 className="mb-1 text-2xl font-semibold text-fg">Guia de respiração</h1>
      <p className="mb-4 text-sm text-fg-muted">Quando escolher cada método e como praticá-lo com segurança.</p>

      <div className="flex flex-col gap-3">
        {BREATHING_MODULES_LIST.map((m) => {
          const guide = METHOD_GUIDES[m.key]
          const open = openKey === m.key
          return (
            <GlassCard key={m.key} className="!p-0 overflow-hidden">
              <button
                type="button"
                onClick={() => setOpenKey(open ? null : m.key)}
                className="flex w-full items-center justify-between gap-3 p-5 text-left"
                aria-expanded={open}
              >
                <div className="flex items-center gap-3">
                  <span
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white"
                    style={{ background: `linear-gradient(135deg, ${m.accentFrom}, ${m.accentTo})` }}
                  >
                    <FontAwesomeIcon icon={METHOD_ICONS[m.key]} />
                  </span>
                  <div>
                    <h2 className="text-lg font-semibold">{m.label}</h2>
                    <p className="text-sm font-medium text-fg-muted">{m.technique}</p>
                  </div>
                </div>
                <FontAwesomeIcon icon={faArrowRight} className={`shrink-0 transition-transform ${open ? 'rotate-90' : ''}`} />
              </button>

              {open && (
                <div className="flex flex-col gap-4 border-t border-line px-5 pb-5 pt-4">
                  <p>{m.description}</p>

                  <section>
                    <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-fg">
                      <FontAwesomeIcon icon={faCircleInfo} className="text-brand-600" />
                      Quando usar
                    </h3>
                    <ul className="flex flex-col gap-1.5 pl-1 text-sm">
                      {guide.when.map((item) => (
                        <li key={item} className="flex gap-2">
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-600" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </section>

                  <section>
                    <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-fg">
                      <FontAwesomeIcon icon={faListCheck} className="text-brand-600" />
                      Como praticar
                    </h3>
                    <ol className="flex flex-col gap-1.5 pl-1 text-sm">
                      {guide.how.map((item, i) => (
                        <li key={item} className="flex gap-2">
                          <span className="font-semibold text-fg-muted">{i + 1}.</span>
                          {item}
                        </li>
                      ))}
                    </ol>
                  </section>

                  <section className="rounded-2xl bg-chip p-3">
                    <h3 className="mb-1 flex items-center gap-2 text-sm font-semibold text-fg">
                      <FontAwesomeIcon icon={faLightbulb} className="text-amber-500" />
                      Dica
                    </h3>
                    <p className="text-sm">{guide.tip}</p>
                  </section>

                  <Link
                    to={`/methods/${m.key}`}
                    className="inline-flex items-center gap-2 self-start text-sm font-semibold text-brand-700 underline-offset-2 hover:underline dark:text-brand-300"
                  >
                    Praticar {m.label}
                    <FontAwesomeIcon icon={faArrowRight} />
                  </Link>
                </div>
              )}
            </GlassCard>
          )
        })}
      </div>
    </AppShell>
  )
}
