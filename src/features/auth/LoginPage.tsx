import { useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCloud, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons'
import { SkyBackground } from '../../components/SkyBackground'
import { HeaderControls } from '../../components/HeaderControls'
import { GlassCard, Button, TextField } from '../../components/ui'
import { sfx } from '../../lib/sound'
import { useAuth } from './AuthProvider'

export function LoginPage() {
  const { session, isConfigured, signInWithPassword, signUp } = useAuth()
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (session) return <Navigate to="/" replace />

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setInfo(null)
    setSubmitting(true)
    try {
      if (mode === 'signin') {
        const { error: err } = await signInWithPassword(email, password)
        if (err) setError(err)
        else sfx.success()
      } else {
        const { error: err } = await signUp(email, password, displayName)
        if (err) setError(err)
        else {
          sfx.add()
          setInfo('Conta criada! Verifique seu e-mail para confirmar o cadastro.')
        }
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <SkyBackground>
      <div className="flex justify-end px-4 pt-4">
        <HeaderControls />
      </div>
      <div className="flex flex-1 flex-col items-center justify-center px-4 pb-10">
        <div className="mb-8 text-center">
          <FontAwesomeIcon icon={faCloud} className="mb-2 text-5xl text-brand-600" />
          <h1 className="text-4xl font-semibold text-fg">Medito</h1>
          <p className="mt-2 font-medium text-fg-muted">Respire. Foque. Volte para o céu.</p>
        </div>

        <GlassCard className="w-full max-w-sm">
          {!isConfigured && (
            <p className="mb-4 flex gap-2 rounded-xl bg-warn-bg p-3 text-sm text-warn-fg">
              <FontAwesomeIcon icon={faTriangleExclamation} className="mt-0.5" />
              <span>
                O Supabase ainda não foi configurado. Preencha o <code className="font-semibold">.env.local</code> com a
                URL e a chave do projeto.
              </span>
            </p>
          )}

          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            {mode === 'signup' && (
              <TextField
                label="Nome"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
              />
            )}
            <TextField
              label="E-mail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <TextField
              label="Senha"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
            />

            {error && <p className="text-sm font-medium text-danger">{error}</p>}
            {info && <p className="text-sm font-medium text-success">{info}</p>}

            <Button type="submit" disabled={!isConfigured || submitting}>
              {submitting ? 'Aguarde…' : mode === 'signin' ? 'Entrar' : 'Criar conta'}
            </Button>
          </form>

          <button
            type="button"
            className="mt-4 w-full text-center text-sm font-medium text-fg underline underline-offset-2"
            onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
          >
            {mode === 'signin' ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Entrar'}
          </button>
        </GlassCard>
      </div>
    </SkyBackground>
  )
}
