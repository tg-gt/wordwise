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
    try {
      const response = await fetch('/api/ai/grammar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, documentId }),
      })

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error analyzing grammar:', error)
      return { suggestions: [] }
    }
  }

  async analyzePersonaInsights(content: string, personaType: string, documentId: string): Promise<PersonaAnalysisResponse | null> {
    try {
      const response = await fetch('/api/ai/persona', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content, personaType, documentId }),
      })

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error analyzing persona insights:', error)
      return null
    }
  }

  // Convert AI analysis to database format
  convertToSuggestions(
    analysis: GrammarAnalysis, 
    documentId: string
  ): SuggestionInsert[] {
    return analysis.suggestions.map(suggestion => ({
      document_id: documentId,
      type: suggestion.type,
      text_range: suggestion.text_range,
      original_text: suggestion.original_text,
      suggestion: suggestion.suggestion,
      explanation: suggestion.explanation,
      status: 'pending' as const
    }))
  }
} 