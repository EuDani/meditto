import { useState, type FormEvent } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMusic, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons'
import { AppShell } from '../../components/AppShell'
import { GlassCard, Button, TextField } from '../../components/ui'
import { useAddSoundscape, useDeleteSoundscape, useSoundscapes } from '../../lib/queries'
import { sfx } from '../../lib/sound'
import { extractYoutubeVideoId } from './youtube'

export function SoundscapesPage() {
  const { data: soundscapes, isLoading } = useSoundscapes()
  const addSoundscape = useAddSoundscape()
  const deleteSoundscape = useDeleteSoundscape()

  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    const videoId = extractYoutubeVideoId(url)
    if (!videoId) {
      setError('Não consegui identificar o vídeo. Cole um link válido do YouTube.')
      return
    }
    try {
      await addSoundscape.mutateAsync({ title: title || 'Paisagem sonora', youtubeVideoId: videoId })
      sfx.add()
      setTitle('')
      setUrl('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar.')
    }
  }

  return (
    <AppShell>
      <h1 className="mb-2 text-2xl font-semibold text-fg">Paisagens sonoras</h1>
      <p className="mb-4 text-sm text-fg-muted">
        Cole o link de um vídeo do YouTube (chuva, floresta, ondas do mar, etc.) para usá-lo como áudio de fundo
        durante suas sessões.
      </p>

      <GlassCard className="mb-6">
        <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
          <TextField label="Nome" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Chuva na floresta" />
          <TextField
            label="Link do YouTube"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            required
          />
          {error && <p className="text-sm font-medium text-danger">{error}</p>}
          <Button type="submit" disabled={addSoundscape.isPending}>
            <FontAwesomeIcon icon={faPlus} />
            {addSoundscape.isPending ? 'Adicionando…' : 'Adicionar paisagem sonora'}
          </Button>
        </form>
      </GlassCard>

      {isLoading && <p className="text-fg-muted">Carregando…</p>}
      {!isLoading && !soundscapes?.length && <p className="text-fg-muted">Nenhuma paisagem sonora cadastrada ainda.</p>}

      <div className="flex flex-col gap-2">
        {soundscapes?.map((s) => (
          <GlassCard key={s.id} className="flex items-center justify-between !py-3">
            <span className="flex items-center gap-3 font-medium">
              <FontAwesomeIcon icon={faMusic} className="text-brand-600" />
              {s.title}
            </span>
            <button
              onClick={() => {
                sfx.remove()
                deleteSoundscape.mutate(s.id)
              }}
              className="flex items-center gap-2 rounded-full bg-btn-secondary px-3 py-1.5 text-sm font-medium text-danger hover:bg-btn-secondary-hover"
              aria-label={`Remover ${s.title}`}
            >
              <FontAwesomeIcon icon={faTrash} />
              Remover
            </button>
          </GlassCard>
        ))}
      </div>
    </AppShell>
  )
}
