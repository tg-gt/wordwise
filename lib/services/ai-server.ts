// Server-side AI service for API routes
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface GrammarAnalysis {
  suggestions: Array<{
    type: 'grammar' | 'spelling' | 'style'
    text_range: { start: number; end: number }
    original_text: string
    suggestion: string
    explanation: string
  }>
}

// Helper function to extract JSON from markdown-wrapped response
function extractJsonFromResponse(content: string): string {
  // Remove markdown code blocks if present
  const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/)
  if (jsonMatch) {
    return jsonMatch[1]
  }
  
  // If no markdown blocks, assume it's already clean JSON
  return content.trim()
}

export class AIServerService {
  async analyzeGrammar(text: string, contextWindow = 500): Promise<GrammarAnalysis> {
    try {
      // For real-time pipeline, analyze only recent text for performance
      const analysisText = text.slice(-contextWindow)
      const offset = Math.max(0, text.length - contextWindow)

      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are a writing assistant focused on grammar, spelling, and style improvements. 

Analyze the provided text and identify issues that need correction. For each issue, provide:
1. The exact text that needs correction
2. The suggested replacement 
3. A brief explanation of why the change is needed
4. The character positions (start and end) where the issue occurs

Focus on:
- Grammar errors (subject-verb agreement, tense consistency, etc.)
- Spelling mistakes
- Style improvements (wordiness, clarity, flow)

Respond ONLY with valid JSON in this exact format (no markdown formatting):
{
  "suggestions": [
    {
      "type": "grammar|spelling|style",
      "start": number,
      "end": number,
      "original_text": "exact text to replace",
      "suggestion": "corrected text",
      "explanation": "brief explanation"
    }
  ]
}

Only suggest changes that significantly improve the writing. Be conservative - don't over-correct.
If no issues are found, return: {"suggestions": []}`
          },
          {
            role: 'user',
            content: `Please analyze this text for grammar, spelling, and style issues:\n\n"${analysisText}"`
          }
        ],
        temperature: 0.3,
        max_tokens: 1000,
      })

      const content = response.choices[0]?.message?.content
      if (!content) {
        throw new Error('No response from OpenAI')
      }

      // Extract JSON from potentially markdown-wrapped response
      const cleanJson = extractJsonFromResponse(content)
      
      const parsed = JSON.parse(cleanJson) as {
        suggestions: Array<{
          type: 'grammar' | 'spelling' | 'style'
          start: number
          end: number
          original_text: string
          suggestion: string
          explanation: string
        }>
      }

      // Adjust positions to account for context window offset and validate them
      const adjustedSuggestions = parsed.suggestions
        .map(suggestion => {
          const adjustedStart = suggestion.start + offset
          const adjustedEnd = suggestion.end + offset
          
          // Validate the text range against the actual text
          let actualStart = adjustedStart
          let actualEnd = adjustedEnd
          
          // Check if the positions are valid
          if (adjustedStart >= 0 && adjustedEnd <= text.length) {
            const textAtRange = text.slice(adjustedStart, adjustedEnd)
            
            // If the text doesn't match, try to find the correct positions
            if (textAtRange !== suggestion.original_text) {
              // Try to find the text in the vicinity
              const searchRadius = 5
              let found = false
              
              for (let startOffset = -searchRadius; startOffset <= searchRadius && !found; startOffset++) {
                for (let endOffset = -searchRadius; endOffset <= searchRadius && !found; endOffset++) {
                  const testStart = Math.max(0, adjustedStart + startOffset)
                  const testEnd = Math.min(text.length, adjustedEnd + endOffset)
                  
                  if (testStart < testEnd) {
                    const testText = text.slice(testStart, testEnd)
                    if (testText === suggestion.original_text) {
                      actualStart = testStart
                      actualEnd = testEnd
                      found = true
                    }
                  }
                }
              }
              
              // If we still can't find it, try a broader search
              if (!found) {
                const index = text.indexOf(suggestion.original_text)
                if (index !== -1) {
                  actualStart = index
                  actualEnd = index + suggestion.original_text.length
                  found = true
                }
              }
              
              // If we still can't find it, skip this suggestion
              if (!found) {
                console.warn('Could not find correct positions for suggestion:', {
                  original: suggestion.original_text,
                  aiPositions: { start: adjustedStart, end: adjustedEnd },
                  textAtAiPositions: textAtRange,
                  fullText: text
                })
                return null
              }
            }
          } else {
            // Positions are out of bounds, try to find the text
            const index = text.indexOf(suggestion.original_text)
            if (index !== -1) {
              actualStart = index
              actualEnd = index + suggestion.original_text.length
            } else {
              console.warn('Suggestion positions out of bounds and text not found:', {
                original: suggestion.original_text,
                positions: { start: adjustedStart, end: adjustedEnd },
                textLength: text.length
              })
              return null
            }
          }
          
          return {
            ...suggestion,
            text_range: {
              start: actualStart,
              end: actualEnd
            }
          }
        })
        .filter((suggestion): suggestion is NonNullable<typeof suggestion> => suggestion !== null) // Remove null suggestions

      return { suggestions: adjustedSuggestions }

    } catch (error) {
      console.error('Error analyzing grammar:', error)
      return { suggestions: [] }
    }
  }

  async analyzePersonaInsights(text: string): Promise<string[]> {
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are a writing coach analyzing personal journal entries for insights and encouragement.

Analyze the provided text and provide 2-3 brief, supportive insights that:
1. Acknowledge patterns or themes in the writing
2. Offer gentle encouragement or validation
3. Suggest areas for deeper reflection

Keep insights concise (1-2 sentences each) and supportive in tone. Focus on the writer's growth, self-awareness, and creative expression.

Respond as a JSON array of strings:
["insight 1", "insight 2", "insight 3"]`
          },
          {
            role: 'user',
            content: `Please analyze this journal entry and provide supportive insights:\n\n"${text}"`
          }
        ],
        temperature: 0.7,
        max_tokens: 300,
      })

      const content = response.choices[0]?.message?.content
      if (!content) {
        throw new Error('No response from OpenAI')
      }

      return JSON.parse(content) as string[]

    } catch (error) {
      console.error('Error analyzing persona insights:', error)
      return []
    }
  }
} 