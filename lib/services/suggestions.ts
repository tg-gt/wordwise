import { createClient } from '@/lib/supabase/client'
import { Suggestion, SuggestionInsert, SuggestionUpdate } from '@/lib/types/database'

export class SuggestionService {
  private supabase = createClient()

  async createSuggestion(suggestion: SuggestionInsert): Promise<Suggestion | null> {
    const { data, error } = await this.supabase
      .from('suggestions')
      .insert(suggestion)
      .select()
      .single()

    if (error) {
      console.error('Error creating suggestion:', error)
      return null
    }

    return data
  }

  async getDocumentSuggestions(documentId: string): Promise<Suggestion[]> {
    const { data, error } = await this.supabase
      .from('suggestions')
      .select('*')
      .eq('document_id', documentId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching document suggestions:', error)
      return []
    }

    return data || []
  }

  async updateSuggestionStatus(
    id: string, 
    status: 'accepted' | 'rejected', 
    userFeedback?: string
  ): Promise<Suggestion | null> {
    const updates: SuggestionUpdate = { status }
    if (userFeedback) {
      updates.user_feedback = userFeedback
    }

    const { data, error } = await this.supabase
      .from('suggestions')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating suggestion status:', error)
      return null
    }

    return data
  }

  async getPendingSuggestions(documentId: string): Promise<Suggestion[]> {
    const { data, error } = await this.supabase
      .from('suggestions')
      .select('*')
      .eq('document_id', documentId)
      .eq('status', 'pending')
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching pending suggestions:', error)
      return []
    }

    return data || []
  }

  async bulkCreateSuggestions(suggestions: SuggestionInsert[]): Promise<Suggestion[]> {
    const { data, error } = await this.supabase
      .from('suggestions')
      .insert(suggestions)
      .select()

    if (error) {
      console.error('Error creating bulk suggestions:', error)
      return []
    }

    return data || []
  }
} 