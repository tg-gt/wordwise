import { create } from 'zustand'
import { Document, Suggestion } from '@/lib/types/database'
import { DocumentService } from '@/lib/services/documents'
import { SuggestionService } from '@/lib/services/suggestions'
import { AIService } from '@/lib/services/ai'

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
  
  // Suggestion actions
  requestGrammarSuggestions: () => Promise<void>
  requestPersonaSuggestions: () => Promise<void>
  acceptSuggestion: (suggestionId: string) => Promise<void>
  rejectSuggestion: (suggestionId: string) => Promise<void>
  
  // UI actions
  toggleSidebar: () => void
  toggleDocumentSidebar: () => void
  
  // Cleanup
  cleanup: () => void
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
    set({ content })
    
    // Clear existing timers
    if (state.grammarTimer) clearTimeout(state.grammarTimer)
    if (state.personaTimer) clearTimeout(state.personaTimer)
    
    // Set up grammar pipeline (500ms debounce)
    const grammarTimer = setTimeout(() => {
      state.requestGrammarSuggestions()
    }, 500)
    
    // Set up persona pipeline (3s idle period)
    const personaTimer = setTimeout(() => {
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
    const doc = await state.documentService.getDocument(id)
    
    if (doc) {
      set({ 
        currentDocument: doc, 
        content: doc.content 
      })
      
      // Load existing suggestions
      const suggestions = await state.suggestionService.getDocumentSuggestions(id)
      set({ suggestions })
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
  
  requestGrammarSuggestions: async () => {
    const state = get()
    if (!state.currentDocument || state.isAnalyzing || !state.content.trim()) return
    
    set({ isAnalyzing: true })
    
    try {
      // Use AI service to analyze grammar
      const analysis = await state.aiService.analyzeGrammar(state.content, state.currentDocument.id)
      
      if (analysis.suggestions.length > 0) {
        // Convert to database format and save
        const suggestionInserts = state.aiService.convertToSuggestions(
          analysis, 
          state.currentDocument.id
        )
        
        // Create suggestions in database
        const newSuggestions = await state.suggestionService.bulkCreateSuggestions(suggestionInserts)
        
        // Add to current suggestions
        if (newSuggestions.length > 0) {
          set((state) => ({
            suggestions: [...state.suggestions, ...newSuggestions]
          }))
        }
      }
      
    } catch (error) {
      console.error('Error requesting grammar suggestions:', error)
    } finally {
      set({ isAnalyzing: false })
    }
  },
  
  requestPersonaSuggestions: async () => {
    const state = get()
    if (!state.currentDocument || state.isAnalyzing || !state.content.trim()) return
    
    set({ isAnalyzing: true })
    
    try {
      // Use AI service for persona insights (Phase 2 feature)
      const insights = await state.aiService.analyzePersonaInsights()
      
      // For now, just log the insights - this will be expanded in Phase 2
      if (insights.length > 0) {
        console.log('Persona insights:', insights)
      }
      
    } catch (error) {
      console.error('Error requesting persona suggestions:', error)
    } finally {
      set({ isAnalyzing: false })
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