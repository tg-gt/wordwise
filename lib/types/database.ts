// Database types for AnimusWriter
export interface Database {
  public: {
    Tables: {
      documents: {
        Row: {
          id: string
          user_id: string
          title: string | null
          content: string
          created_at: string
          updated_at: string
          word_count: number
          is_reviewed: boolean
        }
        Insert: {
          id?: string
          user_id: string
          title?: string | null
          content?: string
          created_at?: string
          updated_at?: string
          word_count?: number
          is_reviewed?: boolean
        }
        Update: {
          id?: string
          user_id?: string
          title?: string | null
          content?: string
          created_at?: string
          updated_at?: string
          word_count?: number
          is_reviewed?: boolean
        }
      }
      suggestions: {
        Row: {
          id: string
          document_id: string
          type: 'grammar' | 'spelling' | 'style'
          text_range: { start: number; end: number }
          original_text: string
          suggestion: string
          explanation: string | null
          status: 'pending' | 'accepted' | 'rejected'
          user_feedback: string | null
          created_at: string
        }
        Insert: {
          id?: string
          document_id: string
          type: 'grammar' | 'spelling' | 'style'
          text_range: { start: number; end: number }
          original_text: string
          suggestion: string
          explanation?: string | null
          status?: 'pending' | 'accepted' | 'rejected'
          user_feedback?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          document_id?: string
          type?: 'grammar' | 'spelling' | 'style'
          text_range?: { start: number; end: number }
          original_text?: string
          suggestion?: string
          explanation?: string | null
          status?: 'pending' | 'accepted' | 'rejected'
          user_feedback?: string | null
          created_at?: string
        }
      }
      personas: {
        Row: {
          id: string
          user_id: string
          type: 'twitter_naval' | 'twitter_pg' | 'twitter_elon' | 'twitter_sam' | 'twitter_solbrah' | 'twitter_austen' | 'anima' | 'animus'
          name: string
          image_url: string | null
          base_prompt: string
          customization_details: Record<string, unknown>
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'twitter_naval' | 'twitter_pg' | 'twitter_elon' | 'twitter_sam' | 'twitter_solbrah' | 'twitter_austen' | 'anima' | 'animus'
          name: string
          image_url?: string | null
          base_prompt: string
          customization_details?: Record<string, unknown>
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'twitter_naval' | 'twitter_pg' | 'twitter_elon' | 'twitter_sam' | 'twitter_solbrah' | 'twitter_austen' | 'anima' | 'animus'
          name?: string
          image_url?: string | null
          base_prompt?: string
          customization_details?: Record<string, unknown>
          is_active?: boolean
          created_at?: string
        }
      }
      persona_outputs: {
        Row: {
          id: string
          document_id: string
          persona_id: string
          output_content: string
          output_type: 'tweet' | 'insight' | 'challenge' | 'encouragement'
          reasoning: string | null
          user_rating: number | null
          created_at: string
        }
        Insert: {
          id?: string
          document_id: string
          persona_id: string
          output_content: string
          output_type: 'tweet' | 'insight' | 'challenge' | 'encouragement'
          reasoning?: string | null
          user_rating?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          document_id?: string
          persona_id?: string
          output_content?: string
          output_type?: 'tweet' | 'insight' | 'challenge' | 'encouragement'
          reasoning?: string | null
          user_rating?: number | null
          created_at?: string
        }
      }
      user_preferences: {
        Row: {
          id: string
          user_id: string
          preferred_feedback_style: 'minimal' | 'balanced' | 'detailed'
          writing_goals: string[]
          auto_save_interval: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          preferred_feedback_style?: 'minimal' | 'balanced' | 'detailed'
          writing_goals?: string[]
          auto_save_interval?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          preferred_feedback_style?: 'minimal' | 'balanced' | 'detailed'
          writing_goals?: string[]
          auto_save_interval?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

// Convenience types
export type Document = Database['public']['Tables']['documents']['Row']
export type DocumentInsert = Database['public']['Tables']['documents']['Insert']
export type DocumentUpdate = Database['public']['Tables']['documents']['Update']

export type Suggestion = Database['public']['Tables']['suggestions']['Row']
export type SuggestionInsert = Database['public']['Tables']['suggestions']['Insert']
export type SuggestionUpdate = Database['public']['Tables']['suggestions']['Update']

export type Persona = Database['public']['Tables']['personas']['Row']
export type PersonaInsert = Database['public']['Tables']['personas']['Insert']
export type PersonaUpdate = Database['public']['Tables']['personas']['Update']

export type PersonaOutput = Database['public']['Tables']['persona_outputs']['Row']
export type PersonaOutputInsert = Database['public']['Tables']['persona_outputs']['Insert']
export type PersonaOutputUpdate = Database['public']['Tables']['persona_outputs']['Update']

export type UserPreferences = Database['public']['Tables']['user_preferences']['Row']
export type UserPreferencesInsert = Database['public']['Tables']['user_preferences']['Insert']
export type UserPreferencesUpdate = Database['public']['Tables']['user_preferences']['Update'] 