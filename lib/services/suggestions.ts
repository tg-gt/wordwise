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
    console.log(`[DB-Suggestions] Updating suggestion ${id} status to ${status}`)
    
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
      console.error(`[DB-Suggestions] Error updating suggestion ${id} status:`, error)
      return null
    }

    console.log(`[DB-Suggestions] Successfully updated suggestion ${id} to ${status}`)
    return data
  }

  async getPendingSuggestions(documentId: string): Promise<Suggestion[]> {
    console.log(`[DB-Suggestions] Fetching pending suggestions for document ${documentId}`)
    
    const { data, error } = await this.supabase
      .from('suggestions')
      .select('*')
      .eq('document_id', documentId)
      .eq('status', 'pending')
      .order('created_at', { ascending: true })

    if (error) {
      console.error('[DB-Suggestions] Error fetching pending suggestions:', error)
      return []
    }

    console.log(`[DB-Suggestions] Found ${data?.length || 0} pending suggestions for document ${documentId}`)
    if (data && data.length > 0) {
      console.log(`[DB-Suggestions] Pending suggestion texts:`, data.map(s => s.original_text))
    }

    return data || []
  }

  async bulkCreateSuggestions(suggestions: SuggestionInsert[]): Promise<Suggestion[]> {
    console.log(`[DB-Suggestions] Creating ${suggestions.length} suggestions in bulk`)
    console.log(`[DB-Suggestions] Document IDs:`, [...new Set(suggestions.map(s => s.document_id))])
    console.log(`[DB-Suggestions] Original texts:`, suggestions.map(s => s.original_text))
    
    // Check for duplicates in the input
    const originalTexts = suggestions.map(s => s.original_text)
    const duplicates = originalTexts.filter((text, index) => originalTexts.indexOf(text) !== index)
    if (duplicates.length > 0) {
      console.warn(`[DB-Suggestions] WARNING: Duplicate suggestions being created for:`, [...new Set(duplicates)])
    }
    
    const { data, error } = await this.supabase
      .from('suggestions')
      .insert(suggestions)
      .select()

    if (error) {
      console.error('[DB-Suggestions] Error creating bulk suggestions:', error)
      return []
    }

    console.log(`[DB-Suggestions] Successfully created ${data?.length || 0} suggestions`)
    return data || []
  }
} 