import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from './AuthProvider'

export function RequireAuth({ children }: { children: ReactNode }) {
  const { session, loading, isConfigured } = useAuth()

  if (isConfigured && loading) {
    return <div className="flex min-h-dvh items-center justify-center text-fg-muted">Carregando…</div>
  }

  if (!session) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
