import { createClient } from '@/lib/supabase/client'
import { Document, DocumentInsert, DocumentUpdate } from '@/lib/types/database'

export class DocumentService {
  private supabase = createClient()

  async createDocument(doc: DocumentInsert): Promise<Document | null> {
    const { data, error } = await this.supabase
      .from('documents')
      .insert(doc)
      .select()
      .single()

    if (error) {
      console.error('Error creating document:', error)
      return null
    }

    return data
  }

  async getDocument(id: string): Promise<Document | null> {
    const { data, error } = await this.supabase
      .from('documents')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching document:', error)
      return null
    }

    return data
  }

  async updateDocument(id: string, updates: DocumentUpdate): Promise<Document | null> {
    const { data, error } = await this.supabase
      .from('documents')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating document:', error)
      return null
    }

    return data
  }

  async deleteDocument(id: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('documents')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting document:', error)
      return false
    }

    return true
  }

  async getUserDocuments(userId: string, limit = 50): Promise<Document[]> {
    const { data, error } = await this.supabase
      .from('documents')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching user documents:', error)
      return []
    }

    return data || []
  }

  async searchDocuments(userId: string, query: string): Promise<Document[]> {
    const { data, error } = await this.supabase
      .from('documents')
      .select('*')
      .eq('user_id', userId)
      .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('Error searching documents:', error)
      return []
    }

    return data || []
  }
} 