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

  async getUserDocuments(userId: string): Promise<Document[]> {
    const { data, error } = await this.supabase
      .from('documents')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('Error fetching user documents:', error)
      throw error
    }

    return data || []
  }

  async calculateWritingStreak(userId: string): Promise<{ currentStreak: number; longestStreak: number }> {
    const { data, error } = await this.supabase
      .from('documents')
      .select('created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching documents for streak:', error)
      return { currentStreak: 0, longestStreak: 0 }
    }

    if (!data || data.length === 0) {
      return { currentStreak: 0, longestStreak: 0 }
    }

    // Group documents by date (ignoring time)
    const documentsByDate = new Map<string, number>()
    
    data.forEach(doc => {
      const date = new Date(doc.created_at).toDateString()
      documentsByDate.set(date, (documentsByDate.get(date) || 0) + 1)
    })

    // Convert to sorted array of dates
    const uniqueDates = Array.from(documentsByDate.keys())
      .map(dateStr => new Date(dateStr))
      .sort((a, b) => b.getTime() - a.getTime()) // Most recent first

    if (uniqueDates.length === 0) {
      return { currentStreak: 0, longestStreak: 0 }
    }

    // Calculate current streak (consecutive days from today backwards)
    let currentStreak = 0
    let longestStreak = 0
    let tempStreak = 0
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    // Check if user wrote today or yesterday (grace period)
    const mostRecentDate = new Date(uniqueDates[0])
    mostRecentDate.setHours(0, 0, 0, 0)
    
    const daysDiff = Math.floor((today.getTime() - mostRecentDate.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysDiff <= 1) { // Today or yesterday
      // Calculate current streak
      let expectedDate = new Date(mostRecentDate)
      
      for (const docDate of uniqueDates) {
        const docDay = new Date(docDate)
        docDay.setHours(0, 0, 0, 0)
        
        if (docDay.getTime() === expectedDate.getTime()) {
          currentStreak++
          expectedDate.setDate(expectedDate.getDate() - 1)
        } else {
          break
        }
      }
    }

    // Calculate longest streak in history
    for (let i = 0; i < uniqueDates.length; i++) {
      tempStreak = 1
      
      for (let j = i + 1; j < uniqueDates.length; j++) {
        const currentDate = new Date(uniqueDates[j - 1])
        const nextDate = new Date(uniqueDates[j])
        
        // Check if dates are consecutive
        const diffTime = currentDate.getTime() - nextDate.getTime()
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
        
        if (diffDays === 1) {
          tempStreak++
        } else {
          break
        }
      }
      
      longestStreak = Math.max(longestStreak, tempStreak)
    }

    return { currentStreak, longestStreak }
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