import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from './supabase'
import { useAuth } from '../features/auth/AuthProvider'
import type { Database, MethodKey } from './database.types'

type SessionRow = Database['public']['Tables']['sessions']['Row']
type SoundscapeRow = Database['public']['Tables']['soundscapes']['Row']
type MethodSettingRow = Database['public']['Tables']['user_method_settings']['Row']

export function useSessions() {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['sessions', user?.id],
    enabled: Boolean(supabase && user),
    queryFn: async (): Promise<SessionRow[]> => {
      const { data, error } = await supabase!
        .from('sessions')
        .select('*')
        .eq('user_id', user!.id)
        .order('started_at', { ascending: false })
      if (error) throw error
      return data
    },
  })
}

export function useCreateSession() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: {
      methodKey: MethodKey
      methodLabel: string
      plannedDurationSeconds: number
      actualDurationSeconds: number
      startedAt: string
      endedAt: string
      completed: boolean
      soundscapeId?: string | null
    }) => {
      if (!supabase || !user) throw new Error('Supabase não está configurado ou usuário não autenticado.')
      const { error } = await supabase.from('sessions').insert({
        user_id: user.id,
        method_key: input.methodKey,
        method_label: input.methodLabel,
        planned_duration_seconds: Math.round(input.plannedDurationSeconds),
        actual_duration_seconds: Math.round(input.actualDurationSeconds),
        started_at: input.startedAt,
        ended_at: input.endedAt,
        completed: input.completed,
        soundscape_id: input.soundscapeId ?? null,
      })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions', user?.id] })
    },
  })
}

export function useSoundscapes() {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['soundscapes', user?.id],
    enabled: Boolean(supabase && user),
    queryFn: async (): Promise<SoundscapeRow[]> => {
      const { data, error } = await supabase!
        .from('soundscapes')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: true })
      if (error) throw error
      return data
    },
  })
}

export function useAddSoundscape() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: { title: string; youtubeVideoId: string; category?: string | null }) => {
      if (!supabase || !user) throw new Error('Supabase não está configurado ou usuário não autenticado.')
      const { error } = await supabase.from('soundscapes').insert({
        user_id: user.id,
        title: input.title,
        youtube_video_id: input.youtubeVideoId,
        category: input.category ?? null,
      })
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['soundscapes', user?.id] }),
  })
}

export function useDeleteSoundscape() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      if (!supabase) throw new Error('Supabase não está configurado.')
      const { error } = await supabase.from('soundscapes').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['soundscapes', user?.id] }),
  })
}

export function useMethodSettings() {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['method-settings', user?.id],
    enabled: Boolean(supabase && user),
    queryFn: async (): Promise<MethodSettingRow[]> => {
      const { data, error } = await supabase!.from('user_method_settings').select('*').eq('user_id', user!.id)
      if (error) throw error
      return data
    },
  })
}

export function useUpsertMethodSetting() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: { methodKey: MethodKey; customDurationSeconds?: number | null; favorite?: boolean }) => {
      if (!supabase || !user) throw new Error('Supabase não está configurado ou usuário não autenticado.')
      const { error } = await supabase
        .from('user_method_settings')
        .upsert(
          {
            user_id: user.id,
            method_key: input.methodKey,
            custom_duration_seconds: input.customDurationSeconds ?? null,
            favorite: input.favorite ?? false,
          },
          { onConflict: 'user_id,method_key' },
        )
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['method-settings', user?.id] }),
  })
}
