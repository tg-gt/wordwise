import { create } from 'zustand'
import { Document, Suggestion, PersonaOutput } from '@/lib/types/database'
import { DocumentService } from '@/lib/services/documents'
import { SuggestionService } from '@/lib/services/suggestions'
import { AIService } from '@/lib/services/ai'

// Persona types
export type PersonaType = 'twitter_naval' | 'twitter_pg' | 'twitter_elon' | 'twitter_sam' | 'twitter_solbrah' | 'twitter_austen' | 'anima' | 'animus'

interface WritingState {
  // Current document state
  currentDocument: Document | null
  content: string
  isSaving: boolean
  lastSaved: Date | null
  
  // Documents list state
  documents: Document[]
  isLoadingDocuments: boolean
  
  // Suggestion pipeline state
  suggestions: Suggestion[]
  isAnalyzing: boolean
  grammarTimer: NodeJS.Timeout | null
  personaTimer: NodeJS.Timeout | null
  
  // Phase 2: Persona system
  activePersona: PersonaType
  personaOutput: PersonaOutput | null
  isAnalyzingPersona: boolean
  
  // Writing streak state
  writingStreak: { currentStreak: number; longestStreak: number }
  isLoadingStreak: boolean
  
  // UI state
  sidebarVisible: boolean
  documentSidebarVisible: boolean
  
  // Services
  documentService: DocumentService
  suggestionService: SuggestionService
  aiService: AIService
  
  // Actions
  setCurrentDocument: (doc: Document | null) => void
  updateContent: (content: string) => void
  saveDocument: () => Promise<void>
  loadDocument: (id: string) => Promise<void>
  createNewDocument: (userId: string) => Promise<void>
  
  // Document list actions
  loadUserDocuments: (userId: string) => Promise<void>
  deleteDocument: (id: string) => Promise<void>
  updateDocumentTitle: (id: string, title: string) => Promise<void>
  
  // Writing streak actions
  loadWritingStreak: (userId: string) => Promise<void>
  
  // Suggestion actions
  requestGrammarSuggestions: () => Promise<void>
  requestPersonaSuggestions: () => Promise<void>
  acceptSuggestion: (suggestionId: string) => Promise<void>
  rejectSuggestion: (suggestionId: string) => Promise<void>
  
  // Phase 2: Persona actions
  setActivePersona: (persona: PersonaType) => void
  ratePersonaOutput: (rating: number) => Promise<void>
  
  // UI actions
  toggleSidebar: () => void
  toggleDocumentSidebar: () => void
  
  // Cleanup
  cleanup: () => void
}

// Utility function to deduplicate suggestions
const deduplicateSuggestions = (suggestions: Suggestion[]): Suggestion[] => {
  const seen = new Set<string>()
  const deduplicated = suggestions.filter(suggestion => {
    // Create a unique key based on original text and text range
    const key = `${suggestion.original_text}-${suggestion.text_range.start}-${suggestion.text_range.end}`
    if (seen.has(key)) {
      console.warn(`[Store-Dedup] Removing duplicate suggestion: "${suggestion.original_text}" at ${suggestion.text_range.start}-${suggestion.text_range.end}`)
      return false
    }
    seen.add(key)
    return true
  })
  
  if (deduplicated.length !== suggestions.length) {
    console.log(`[Store-Dedup] Deduplicated ${suggestions.length} → ${deduplicated.length} suggestions`)
  }
  
  return deduplicated
}

export const useWritingStore = create<WritingState>((set, get) => ({
  // Initial state
  currentDocument: null,
  content: '',
  isSaving: false,
  lastSaved: null,
  documents: [],
  isLoadingDocuments: false,
  suggestions: [],
  isAnalyzing: false,
  grammarTimer: null,
  personaTimer: null,
  
  // Phase 2: Persona initial state
  activePersona: 'twitter_naval', // Default to Naval's persona
  personaOutput: null,
  isAnalyzingPersona: false,
  
  // Writing streak initial state
  writingStreak: { currentStreak: 0, longestStreak: 0 },
  isLoadingStreak: false,
  
  sidebarVisible: true,
  documentSidebarVisible: true,
  
  // Services
  documentService: new DocumentService(),
  suggestionService: new SuggestionService(),
  aiService: new AIService(),
  
  // Actions
  setCurrentDocument: (doc) => {
    set({ 
      currentDocument: doc, 
      content: doc?.content || '',
      suggestions: [] // Clear suggestions when switching documents
    })
  },
  
  updateContent: (content) => {
    const state = get()
    console.log(`[Store-Content] Content updated, length: ${content.length} (was: ${state.content.length})`)
    console.log(`[Store-Content] Current suggestions count: ${state.suggestions.length}`)
    
    set({ content })
    
    // Clear existing suggestions when user starts typing and mark them as rejected in database
    if (state.suggestions.length > 0) {
      console.log(`[Store-Content] Clearing ${state.suggestions.length} existing suggestions`)
      
      // Mark all current pending suggestions as rejected since text has changed
      const pendingSuggestions = state.suggestions.filter(s => s.status === 'pending')
      console.log(`[Store-Content] Marking ${pendingSuggestions.length} pending suggestions as rejected`)
      
      const rejectionPromises = pendingSuggestions
        .map(s => state.suggestionService.updateSuggestionStatus(s.id, 'rejected'))
      
      Promise.all(rejectionPromises)
        .then(() => console.log(`[Store-Content] Successfully rejected ${pendingSuggestions.length} suggestions`))
        .catch(error => console.error('[Store-Content] Error rejecting old suggestions:', error))
      
      set({ suggestions: [] })
    }
    
    // Clear existing timers
    if (state.grammarTimer) {
      console.log(`[Store-Content] Clearing existing grammar timer`)
      clearTimeout(state.grammarTimer)
    }
    if (state.personaTimer) {
      console.log(`[Store-Content] Clearing existing persona timer`)
      clearTimeout(state.personaTimer)
    }
    
    // Set up grammar pipeline (500ms debounce)
    console.log(`[Store-Content] Setting up grammar timer (500ms delay)`)
    const grammarTimer = setTimeout(() => {
      console.log(`[Store-Content] Grammar timer triggered, requesting suggestions`)
      state.requestGrammarSuggestions()
    }, 500)
    
    // Set up persona pipeline (3s idle period)
    console.log(`[Store-Content] Setting up persona timer (3s delay)`)
    const personaTimer = setTimeout(() => {
      console.log(`[Store-Content] Persona timer triggered, requesting insights`)
      state.requestPersonaSuggestions()
    }, 3000)
    
    set({ grammarTimer, personaTimer })
  },
  
  saveDocument: async () => {
    const state = get()
    if (!state.currentDocument || state.isSaving) return
    
    set({ isSaving: true })
    
    try {
      const updated = await state.documentService.updateDocument(
        state.currentDocument.id,
        { 
          content: state.content,
          word_count: state.content.split(/\s+/).filter(word => word.length > 0).length
        }
      )
      
      if (updated) {
        set({ 
          currentDocument: updated, 
          lastSaved: new Date(),
          isSaving: false 
        })
        
        // Update the document in the documents list and re-sort by updated_at
        const updatedDocuments = state.documents
          .map(doc => doc.id === updated.id ? updated : doc)
          .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
        set({ documents: updatedDocuments })
      }
    } catch (error) {
      console.error('Error saving document:', error)
      set({ isSaving: false })
    }
  },
  
  loadDocument: async (id) => {
    const state = get()
    console.log(`[Store-LoadDoc] Loading document ${id}`)
    
    const doc = await state.documentService.getDocument(id)
    
    if (doc) {
      console.log(`[Store-LoadDoc] Document loaded: "${doc.title}", content length: ${doc.content.length}`)
      
      set({ 
        currentDocument: doc, 
        content: doc.content 
      })
      
      // Only load pending suggestions that are still valid for the current text
      console.log(`[Store-LoadDoc] Loading pending suggestions for document ${id}`)
      const allPendingSuggestions = await state.suggestionService.getPendingSuggestions(id)
      console.log(`[Store-LoadDoc] Found ${allPendingSuggestions.length} pending suggestions in database`)
      
      // Filter suggestions to only include those that are still valid for the current text
      const validSuggestions = allPendingSuggestions.filter(suggestion => {
        const { start, end } = suggestion.text_range
        // Check if the suggestion's text range is still valid and matches the expected text
        if (start < 0 || end > doc.content.length || start >= end) {
          console.log(`[Store-LoadDoc] Invalid range for suggestion "${suggestion.original_text}": ${start}-${end} (content length: ${doc.content.length})`)
          return false
        }
        
        const currentText = doc.content.slice(start, end)
        const isValid = currentText === suggestion.original_text
        if (!isValid) {
          console.log(`[Store-LoadDoc] Text mismatch for suggestion: expected "${suggestion.original_text}", found "${currentText}"`)
        }
        return isValid
      })
      
      console.log(`[Store-LoadDoc] ${validSuggestions.length} suggestions are still valid`)
      
      // If we filtered out invalid suggestions, mark them as rejected in the database
      const invalidSuggestions = allPendingSuggestions.filter(s => !validSuggestions.includes(s))
      if (invalidSuggestions.length > 0) {
        console.log(`[Store-LoadDoc] Marking ${invalidSuggestions.length} invalid suggestions as rejected`)
        const rejectionPromises = invalidSuggestions.map(s => 
          state.suggestionService.updateSuggestionStatus(s.id, 'rejected')
        )
        await Promise.all(rejectionPromises)
        console.log(`[Store-LoadDoc] Successfully rejected ${invalidSuggestions.length} invalid suggestions`)
      }
      
      // Deduplicate valid suggestions
      const deduplicatedSuggestions = deduplicateSuggestions(validSuggestions)
      
      set({ suggestions: deduplicatedSuggestions })
      console.log(`[Store-LoadDoc] Document loaded with ${deduplicatedSuggestions.length} deduplicated suggestions`)
    } else {
      console.error(`[Store-LoadDoc] Failed to load document ${id}`)
    }
  },
  
  createNewDocument: async (userId) => {
    const state = get()
    const doc = await state.documentService.createDocument({
      user_id: userId,
      title: `Writing Session - ${new Date().toLocaleDateString()}`,
      content: ''
    })
    
    if (doc) {
      set({ 
        currentDocument: doc, 
        content: '',
        suggestions: [],
        lastSaved: new Date()
      })
      
      // Add to documents list and ensure proper sorting
      set((state) => ({
        documents: [doc, ...state.documents]
          .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      }))
      
      // Refresh writing streak since we created a new document
      setTimeout(() => {
        state.loadWritingStreak(userId)
      }, 100)
    }
  },
  
  // Document list actions
  loadUserDocuments: async (userId) => {
    const state = get()
    set({ isLoadingDocuments: true })
    
    try {
      const documents = await state.documentService.getUserDocuments(userId)
      set({ documents, isLoadingDocuments: false })
    } catch (error) {
      console.error('Error loading user documents:', error)
      set({ isLoadingDocuments: false })
    }
  },
  
  deleteDocument: async (id) => {
    const state = get()
    const success = await state.documentService.deleteDocument(id)
    
    if (success) {
      // Remove from documents list
      const updatedDocuments = state.documents.filter(doc => doc.id !== id)
      set({ documents: updatedDocuments })
      
      // If this was the current document, clear it
      if (state.currentDocument?.id === id) {
        set({ 
          currentDocument: null, 
          content: '', 
          suggestions: [] 
        })
      }
    }
  },
  
  updateDocumentTitle: async (id, title) => {
    const state = get()
    const updated = await state.documentService.updateDocument(id, { title })
    
    if (updated) {
      // Update in documents list and re-sort by updated_at
      const updatedDocuments = state.documents
        .map(doc => doc.id === id ? updated : doc)
        .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      set({ documents: updatedDocuments })
      
      // Update current document if it's the same
      if (state.currentDocument?.id === id) {
        set({ currentDocument: updated })
      }
    }
  },
  
  // Writing streak actions
  loadWritingStreak: async (userId) => {
    const state = get()
    set({ isLoadingStreak: true })
    
    try {
      const streakData = await state.documentService.calculateWritingStreak(userId)
      set({ writingStreak: streakData, isLoadingStreak: false })
    } catch (error) {
      console.error('Error loading writing streak:', error)
      set({ isLoadingStreak: false })
    }
  },
  
  requestGrammarSuggestions: async () => {
    const state = get()
    if (!state.currentDocument || state.isAnalyzing || !state.content.trim()) return
    
    const requestId = Math.random().toString(36).substr(2, 9)
    console.log(`[Store-Grammar-${requestId}] Starting grammar request for document ${state.currentDocument.id}`)
    console.log(`[Store-Grammar-${requestId}] Current content length: ${state.content.length}`)
    console.log(`[Store-Grammar-${requestId}] Current suggestions count: ${state.suggestions.length}`)
    
    set({ isAnalyzing: true })
    
    try {
      // Use AI service to analyze grammar
      console.log(`[Store-Grammar-${requestId}] Calling AI service...`)
      const analysis = await state.aiService.analyzeGrammar(state.content, state.currentDocument.id)
      
      console.log(`[Store-Grammar-${requestId}] AI service returned ${analysis.suggestions.length} suggestions`)
      
      if (analysis.suggestions.length > 0) {
        // Convert to database format and save
        const suggestionInserts = state.aiService.convertToSuggestions(
          analysis, 
          state.currentDocument.id
        )
        
        console.log(`[Store-Grammar-${requestId}] Creating ${suggestionInserts.length} suggestions in database`)
        
        // Create suggestions in database
        const newSuggestions = await state.suggestionService.bulkCreateSuggestions(suggestionInserts)
        
        console.log(`[Store-Grammar-${requestId}] Database created ${newSuggestions.length} suggestions`)
        
        // Add to current suggestions
        if (newSuggestions.length > 0) {
          console.log(`[Store-Grammar-${requestId}] Adding suggestions to store. Current count: ${state.suggestions.length}`)
          
          set((state) => {
            const combinedSuggestions = [...state.suggestions, ...newSuggestions]
            const deduplicatedSuggestions = deduplicateSuggestions(combinedSuggestions)
            console.log(`[Store-Grammar-${requestId}] Final suggestions count after deduplication: ${deduplicatedSuggestions.length}`)
            
            return { suggestions: deduplicatedSuggestions }
          })
        }
      } else {
        console.log(`[Store-Grammar-${requestId}] No suggestions to add`)
      }
      
    } catch (error) {
      console.error(`[Store-Grammar-${requestId}] Error requesting grammar suggestions:`, error)
    } finally {
      console.log(`[Store-Grammar-${requestId}] Grammar analysis completed`)
      set({ isAnalyzing: false })
    }
  },
  
  requestPersonaSuggestions: async () => {
    const state = get()
    if (!state.currentDocument || state.isAnalyzingPersona || !state.content.trim()) return
    
    set({ isAnalyzingPersona: true })
    
    try {
      // Phase 2: Use AI service for persona insights with active persona
      const personaAnalysis = await state.aiService.analyzePersonaInsights(
        state.content, 
        state.activePersona, 
        state.currentDocument.id
      )
      
      if (personaAnalysis && personaAnalysis.success) {
        // Create a mock PersonaOutput for UI display
        const mockOutput: PersonaOutput = {
          id: 'temp-' + Date.now(),
          document_id: state.currentDocument.id,
          persona_id: 'temp-persona-id',
          output_content: personaAnalysis.data.personaOutput,
          output_type: personaAnalysis.data.outputType,
          reasoning: personaAnalysis.data.reasoning,
          user_rating: null,
          created_at: new Date().toISOString()
        }
        
        set({ personaOutput: mockOutput })
      }
      
    } catch (error) {
      console.error('Error requesting persona suggestions:', error)
    } finally {
      set({ isAnalyzingPersona: false })
    }
  },
  
  acceptSuggestion: async (suggestionId) => {
    const state = get()
    const suggestion = state.suggestions.find(s => s.id === suggestionId)
    
    if (!suggestion) return
    
    // Apply the suggestion to the content
    const newContent = 
      state.content.slice(0, suggestion.text_range.start) +
      suggestion.suggestion +
      state.content.slice(suggestion.text_range.end)
    
    set({ content: newContent })
    
    // Update accepted suggestion status
    await state.suggestionService.updateSuggestionStatus(suggestionId, 'accepted')
    
    // Clear ALL suggestions - they're all invalid now due to text changes
    const allSuggestionIds = state.suggestions.map(s => s.id)
    const rejectionPromises = allSuggestionIds
      .filter(id => id !== suggestionId)
      .map(id => state.suggestionService.updateSuggestionStatus(id, 'rejected'))
    
    await Promise.all(rejectionPromises)
    
    // Clear suggestions from UI
    set({ suggestions: [] })
    
    // Auto-save after accepting suggestion
    setTimeout(() => state.saveDocument(), 500)
    
    // Trigger re-analysis after a delay
    setTimeout(() => state.requestGrammarSuggestions(), 1000)
  },
  
  rejectSuggestion: async (suggestionId) => {
    const state = get()
    
    // Update suggestion status
    await state.suggestionService.updateSuggestionStatus(suggestionId, 'rejected')
    
    // Remove from suggestions list
    const updatedSuggestions = state.suggestions.filter(s => s.id !== suggestionId)
    set({ suggestions: updatedSuggestions })
  },

  toggleSidebar: () => {
    set((state) => ({ sidebarVisible: !state.sidebarVisible }))
  },
  
  toggleDocumentSidebar: () => {
    set((state) => ({ documentSidebarVisible: !state.documentSidebarVisible }))
  },
  
  // Phase 2: Persona actions
  setActivePersona: (persona: PersonaType) => {
    const state = get()
    set({ activePersona: persona, personaOutput: null })
    
    // Trigger persona insight generation immediately if we have content to analyze
    if (state.currentDocument && !state.isAnalyzingPersona && state.content.trim()) {
      state.requestPersonaSuggestions()
    }
  },
  
  ratePersonaOutput: async (rating: number) => {
    const state = get()
    if (!state.personaOutput) return
    
    // Update the rating in the current persona output
    set((state) => ({
      personaOutput: state.personaOutput ? {
        ...state.personaOutput,
        user_rating: rating
      } : null
    }))
    
    // TODO: In full implementation, save rating to database
  },
  
  cleanup: () => {
    const state = get()
    if (state.grammarTimer) clearTimeout(state.grammarTimer)
    if (state.personaTimer) clearTimeout(state.personaTimer)
    set({ grammarTimer: null, personaTimer: null })
  }
}))

// Auto-save functionality
setInterval(() => {
  const state = useWritingStore.getState()
  if (state.currentDocument && state.content !== state.currentDocument.content) {
    state.saveDocument()
  }
}, 10000) // Auto-save every 10 seconds 