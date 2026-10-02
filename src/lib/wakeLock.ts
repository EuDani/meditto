import { useEffect } from 'react'

interface WakeLockSentinelLike {
  release: () => Promise<void>
}

/** Mantém a tela do dispositivo acesa enquanto `active` for verdadeiro (Screen Wake Lock API). */
export function useWakeLock(active: boolean) {
  useEffect(() => {
    if (!active || !('wakeLock' in navigator)) return

    let sentinel: WakeLockSentinelLike | null = null
    let cancelled = false

    const request = async () => {
      try {
        const lock = await (
          navigator as unknown as { wakeLock: { request: (type: 'screen') => Promise<WakeLockSentinelLike> } }
        ).wakeLock.request('screen')
        if (cancelled) void lock.release()
        else sentinel = lock
      } catch {
        // Negado (bateria baixa, aba em segundo plano): a sessão segue normalmente.
      }
    }

    // O navegador libera o lock ao esconder a aba; reativa ao voltar.
    const onVisibility = () => {
      if (document.visibilityState === 'visible') void request()
    }

    void request()
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      cancelled = true
      document.removeEventListener('visibilitychange', onVisibility)
      void sentinel?.release()
    }
  }, [active])
}
