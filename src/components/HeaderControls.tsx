import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleHalfStroke, faMoon, faSun, faVolumeHigh, faVolumeXmark } from '@fortawesome/free-solid-svg-icons'
import { useTheme, type ThemeMode } from '../lib/theme'
import { setSoundEnabled, useSoundEnabled } from '../lib/sound'

const THEME_META: Record<ThemeMode, { icon: typeof faSun; label: string }> = {
  auto: { icon: faCircleHalfStroke, label: 'Tema automático (segue o horário)' },
  light: { icon: faSun, label: 'Tema claro (dia)' },
  dark: { icon: faMoon, label: 'Tema escuro (noite)' },
}

const iconButton =
  'flex h-10 w-10 items-center justify-center rounded-full bg-card text-fg border border-card-border shadow backdrop-blur-md transition-colors hover:bg-btn-secondary-hover'

export function ThemeToggle() {
  const { mode, cycleMode } = useTheme()
  const meta = THEME_META[mode]
  return (
    <button type="button" onClick={cycleMode} className={iconButton} aria-label={meta.label} title={meta.label}>
      <FontAwesomeIcon icon={meta.icon} />
      {mode === 'auto' && <span className="sr-only">Automático</span>}
    </button>
  )
}

export function SoundToggle() {
  const enabled = useSoundEnabled()
  const label = enabled ? 'Desativar sons' : 'Ativar sons'
  return (
    <button type="button" onClick={() => setSoundEnabled(!enabled)} className={iconButton} aria-label={label} title={label}>
      <FontAwesomeIcon icon={enabled ? faVolumeHigh : faVolumeXmark} />
    </button>
  )
}

export function HeaderControls() {
  return (
    <div className="flex items-center gap-2">
      <SoundToggle />
      <ThemeToggle />
    </div>
  )
}
