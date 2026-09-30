import { useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { sfx } from './lib/sound'
import { AuthProvider } from './features/auth/AuthProvider'
import { RequireAuth } from './features/auth/RequireAuth'
import { LoginPage } from './features/auth/LoginPage'
import { HomePage } from './features/home/HomePage'
import { MethodsPage } from './features/methods/MethodsPage'
import { MethodDetailPage } from './features/methods/MethodDetailPage'
import { GuidePage } from './features/guide/GuidePage'
import { FocusScreen } from './features/session/FocusScreen'
import { HistoryPage } from './features/history/HistoryPage'
import { SoundscapesPage } from './features/soundscapes/SoundscapesPage'

export default function App() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = (event.target as Element | null)?.closest('button, a, [role="button"]')
      if (!target || target.hasAttribute('disabled')) return
      sfx.click()
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <RequireAuth>
                <HomePage />
              </RequireAuth>
            }
          />
          <Route
            path="/methods"
            element={
              <RequireAuth>
                <MethodsPage />
              </RequireAuth>
            }
          />
          <Route
            path="/methods/:key"
            element={
              <RequireAuth>
                <MethodDetailPage />
              </RequireAuth>
            }
          />
          <Route
            path="/session/:key"
            element={
              <RequireAuth>
                <FocusScreen />
              </RequireAuth>
            }
          />
          <Route
            path="/guide"
            element={
              <RequireAuth>
                <GuidePage />
              </RequireAuth>
            }
          />
          <Route
            path="/history"
            element={
              <RequireAuth>
                <HistoryPage />
              </RequireAuth>
            }
          />
          <Route
            path="/soundscapes"
            element={
              <RequireAuth>
                <SoundscapesPage />
              </RequireAuth>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
