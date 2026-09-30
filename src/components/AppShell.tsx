import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBookOpen, faCalendarDays, faCloud, faHeadphones, faHouse, faWind } from '@fortawesome/free-solid-svg-icons'
import { SkyBackground } from './SkyBackground'
import { HeaderControls } from './HeaderControls'

const NAV_ITEMS = [
  { to: '/', label: 'Início', icon: faHouse },
  { to: '/methods', label: 'Métodos', icon: faWind },
  { to: '/guide', label: 'Guia', icon: faBookOpen },
  { to: '/history', label: 'Histórico', icon: faCalendarDays },
  { to: '/soundscapes', label: 'Sons', icon: faHeadphones },
]

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <SkyBackground>
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 pb-28 pt-4 sm:px-6">
        <div className="mb-5 flex items-center justify-between">
          <span className="flex items-center gap-2 text-lg font-semibold text-fg">
            <FontAwesomeIcon icon={faCloud} className="text-brand-600" />
            Medito
          </span>
          <HeaderControls />
        </div>
        {children}
      </div>
      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-card-border bg-nav backdrop-blur-md">
        <div className="mx-auto flex max-w-2xl justify-around py-2">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex min-w-16 flex-col items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-medium transition-colors ${
                  isActive ? 'bg-chip text-brand-700 dark:text-brand-300' : 'text-fg-muted'
                }`
              }
            >
              <FontAwesomeIcon icon={item.icon} className="text-lg" />
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </SkyBackground>
  )
}
