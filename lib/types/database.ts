// Database types for WordWise
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

export type UserPreferences = Database['public']['Tables']['user_preferences']['Row']
export type UserPreferencesInsert = Database['public']['Tables']['user_preferences']['Insert']
export type UserPreferencesUpdate = Database['public']['Tables']['user_preferences']['Update'] 