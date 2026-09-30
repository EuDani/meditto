import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

export type ThemeMode = 'auto' | 'light' | 'dark'
export type ResolvedTheme = 'light' | 'dark'

const STORAGE_KEY = 'medito:theme'
const THEME_COLORS: Record<ResolvedTheme, string> = { light: '#6fbdf0', dark: '#0b1a2e' }

/** Dia (06h–17h59) = claro, noite = escuro, segundo o relógio do dispositivo. */
export function themeForNow(): ResolvedTheme {
  const hour = new Date().getHours()
  return hour >= 6 && hour < 18 ? 'light' : 'dark'
}

function readStoredMode(): ThemeMode {
  try {
    const value = localStorage.getItem(STORAGE_KEY)
    if (value === 'light' || value === 'dark' || value === 'auto') return value
  } catch {
    // storage indisponível
  }
  return 'auto'
}

interface ThemeContextValue {
  mode: ThemeMode
  resolved: ResolvedTheme
  setMode: (mode: ThemeMode) => void
  cycleMode: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

const NEXT_MODE: Record<ThemeMode, ThemeMode> = { auto: 'light', light: 'dark', dark: 'auto' }

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(readStoredMode)
  const [autoTheme, setAutoTheme] = useState<ResolvedTheme>(themeForNow)

  // No modo automático, reavalia o horário periodicamente e ao voltar para a aba.
  useEffect(() => {
    const update = () => setAutoTheme(themeForNow())
    const interval = setInterval(update, 30_000)
    document.addEventListener('visibilitychange', update)
    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', update)
    }
  }, [])

  const resolved: ResolvedTheme = mode === 'auto' ? autoTheme : mode

  useEffect(() => {
    document.documentElement.dataset.theme = resolved
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLORS[resolved])
  }, [resolved])

  const value = useMemo<ThemeContextValue>(() => {
    const setMode = (next: ThemeMode) => {
      setModeState(next)
      try {
        localStorage.setItem(STORAGE_KEY, next)
      } catch {
        // storage indisponível
      }
    }
    return { mode, resolved, setMode, cycleMode: () => setMode(NEXT_MODE[mode]) }
  }, [mode, resolved])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme deve ser usado dentro de <ThemeProvider>')
  return ctx
}
