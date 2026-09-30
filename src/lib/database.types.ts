export type MethodKey =
  | 'relaxamento'
  | 'equilibrio'
  | 'vigor'
  | 'foco'
  | 'energia'
  | 'descontracao'
  | 'diafragmatica'
  | 'alivio'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          display_name: string | null
          created_at: string
        }
        Insert: {
          id: string
          display_name?: string | null
          created_at?: string
        }
        Update: {
          display_name?: string | null
        }
        Relationships: []
      }
      sessions: {
        Row: {
          id: string
          user_id: string
          method_key: MethodKey
          method_label: string
          planned_duration_seconds: number
          actual_duration_seconds: number
          started_at: string
          ended_at: string | null
          completed: boolean
          soundscape_id: string | null
        }
        Insert: {
          id?: string
          user_id: string
          method_key: MethodKey
          method_label: string
          planned_duration_seconds: number
          actual_duration_seconds: number
          started_at: string
          ended_at?: string | null
          completed: boolean
          soundscape_id?: string | null
        }
        Update: Partial<Database['public']['Tables']['sessions']['Insert']>
        Relationships: []
      }
      soundscapes: {
        Row: {
          id: string
          user_id: string
          title: string
          youtube_video_id: string
          category: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          youtube_video_id: string
          category?: string | null
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['soundscapes']['Insert']>
        Relationships: []
      }
      user_method_settings: {
        Row: {
          user_id: string
          method_key: MethodKey
          custom_duration_seconds: number | null
          favorite: boolean
        }
        Insert: {
          user_id: string
          method_key: MethodKey
          custom_duration_seconds?: number | null
          favorite?: boolean
        }
        Update: Partial<Database['public']['Tables']['user_method_settings']['Insert']>
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
