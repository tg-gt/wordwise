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

  async analyzePersonaInsights(): Promise<string[]> {
    try {
      // This will be implemented in Phase 2 with persona API route
      console.log('Persona insights analysis (Phase 2 feature)')
      return []
    } catch (error) {
      console.error('Error analyzing persona insights:', error)
      return []
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