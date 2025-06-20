import { SuggestionInsert } from '@/lib/types/database'

export interface GrammarAnalysis {
  suggestions: Array<{
    type: 'grammar' | 'spelling' | 'style'
    text_range: { start: number; end: number }
    original_text: string
    suggestion: string
    explanation: string
  }>
}

interface GrammarSuggestion {
  type: 'grammar' | 'spelling' | 'style'
  text_range: { start: number; end: number }
  original_text: string
  suggestion: string
  explanation: string
}

export interface PersonaAnalysisResponse {
  success: boolean
  data: {
    personaOutput: string
    outputType: 'tweet' | 'insight' | 'challenge' | 'encouragement'
    reasoning: string
  }
  error?: string
}

export class AIService {
  async analyzeGrammar(text: string, documentId: string): Promise<GrammarAnalysis> {
    const requestId = Math.random().toString(36).substr(2, 9)
    console.log(`[AI-Grammar-${requestId}] Starting grammar analysis for document ${documentId}`)
    console.log(`[AI-Grammar-${requestId}] Text length: ${text.length} characters`)
    
    try {
      const startTime = Date.now()
      const response = await fetch('/api/ai/grammar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, documentId }),
      })

      const duration = Date.now() - startTime
      console.log(`[AI-Grammar-${requestId}] API call completed in ${duration}ms`)

      if (!response.ok) {
        console.error(`[AI-Grammar-${requestId}] API request failed: ${response.status} ${response.statusText}`)
        throw new Error(`API request failed: ${response.statusText}`)
      }

      const result = await response.json()
      console.log(`[AI-Grammar-${requestId}] Received ${result.suggestions?.length || 0} suggestions`)
      
      if (result.suggestions?.length > 0) {
        console.log(`[AI-Grammar-${requestId}] Suggestions:`, result.suggestions.map((s: GrammarSuggestion) => ({
          type: s.type,
          original: s.original_text,
          suggestion: s.suggestion,
          range: s.text_range
        })))
        
        // Check for duplicates
        const originalTexts = result.suggestions.map((s: GrammarSuggestion) => s.original_text)
        const duplicates = originalTexts.filter((text: string, index: number) => originalTexts.indexOf(text) !== index)
        if (duplicates.length > 0) {
          console.warn(`[AI-Grammar-${requestId}] WARNING: Duplicate suggestions detected for:`, [...new Set(duplicates)])
        }
      }

      return result
    } catch (error) {
      console.error(`[AI-Grammar-${requestId}] Error analyzing grammar:`, error)
      return { suggestions: [] }
    }
  }

  async analyzePersonaInsights(content: string, personaType: string, documentId: string): Promise<PersonaAnalysisResponse | null> {
    const requestId = Math.random().toString(36).substr(2, 9)
    console.log(`[AI-Persona-${requestId}] Starting persona analysis for document ${documentId}`)
    console.log(`[AI-Persona-${requestId}] Persona: ${personaType}, Content length: ${content.length}`)
    
    try {
      const startTime = Date.now()
      const response = await fetch('/api/ai/persona', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content, personaType, documentId }),
      })

      const duration = Date.now() - startTime
      console.log(`[AI-Persona-${requestId}] API call completed in ${duration}ms`)

      if (!response.ok) {
        console.error(`[AI-Persona-${requestId}] API request failed: ${response.status} ${response.statusText}`)
        throw new Error(`API request failed: ${response.statusText}`)
      }

      const result = await response.json()
      console.log(`[AI-Persona-${requestId}] Persona analysis result:`, result.success ? 'Success' : 'Failed')

      return result
    } catch (error) {
      console.error(`[AI-Persona-${requestId}] Error analyzing persona insights:`, error)
      return null
    }
  }

  // Convert AI analysis to database format
  convertToSuggestions(
    analysis: GrammarAnalysis, 
    documentId: string
  ): SuggestionInsert[] {
    const suggestions = analysis.suggestions.map(suggestion => ({
      document_id: documentId,
      type: suggestion.type,
      text_range: suggestion.text_range,
      original_text: suggestion.original_text,
      suggestion: suggestion.suggestion,
      explanation: suggestion.explanation,
      status: 'pending' as const
    }))
    
    console.log(`[AI-Convert] Converting ${analysis.suggestions.length} suggestions for document ${documentId}`)
    
    // Check for duplicates in the conversion process
    const originalTexts = suggestions.map(s => s.original_text)
    const duplicates = originalTexts.filter((text, index) => originalTexts.indexOf(text) !== index)
    if (duplicates.length > 0) {
      console.warn(`[AI-Convert] WARNING: Duplicate suggestions in conversion for:`, [...new Set(duplicates)])
    }
    
    return suggestions
  }
} 