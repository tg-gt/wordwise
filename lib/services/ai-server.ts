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

export interface PersonaAnalysis {
  output_content: string
  output_type: 'tweet' | 'insight' | 'challenge' | 'encouragement'
  reasoning: string
}

// Persona prompt templates
const PERSONA_PROMPTS = {
  twitter_naval: `Analyze this writing as Naval Ravikant would. Focus on counterintuitive insights, universal truths, and wisdom about life, wealth, and happiness. Extract 1-2 potential tweets that could spark meaningful discussion. Format: Tweet text that sounds like Naval's voice - philosophical, concise, and profound.`,
  
  twitter_pg: `Analyze this writing as Paul Graham would. Focus on insights about startups, technology, and human nature. Look for patterns and contrarian truths. Extract 1-2 potential tweets about building, creating, or understanding complex systems. Format: Tweet text in PG's thoughtful, analytical style.`,
  
  twitter_elon: `Analyze this writing as Elon Musk would. Focus on bold visions, engineering solutions, and cutting through complexity. Extract 1-2 potential tweets that challenge conventional thinking or present ambitious ideas. Format: Tweet text with Elon's direct, sometimes provocative style.`,
  
  twitter_roon: `Analyze this writing as Roon would. Focus on meta-commentary, cultural observations, and witty takes on technology and society. Extract 1-2 potential tweets with intellectual humor and sharp insights. Format: Tweet text with Roon's distinctive voice - smart, funny, slightly ironic.`,
  
  twitter_sam: `Analyze this writing as Sam Altman would. Focus on insights about AI, the future, and building important things. Extract 1-2 potential tweets about progress, technology, or human potential. Format: Tweet text in Sam's optimistic yet thoughtful style.`,
  
  twitter_solbrah: `Analyze this writing as SolBrah would. Focus on contrarian health takes, masculine energy, and anti-establishment perspectives. Extract 1-2 potential tweets with bold, unapologetic opinions. Format: Tweet text with SolBrah's confident, provocative style.`,
  
  twitter_austen: `Analyze this writing as Austen Allred would. Focus on insights about education, building companies, and personal growth. Extract 1-2 potential tweets about learning, entrepreneurship, or overcoming challenges. Format: Tweet text in Austen's encouraging yet realistic style.`,
  
  anima: `Provide intuitive wisdom and emotional insight on this writing. Focus on creative encouragement, inner knowing, emotional patterns, and authentic self-expression. Be nurturing but insightful, highlighting what wants to emerge creatively and emotionally. Offer gentle guidance about following intuition and embracing the creative process.`,
  
  animus: `Analyze this writing with rational clarity and goal-oriented feedback. Focus on strategic thinking, constructive challenges, accountability for growth, and turning insights into action. Be direct but supportive, asking "is this just a skill issue?" and providing concrete steps forward. Help identify patterns that support or hinder progress.`
}

// Helper function to extract JSON from markdown-wrapped response
function extractJsonFromResponse(content: string): string {
  // First, try to extract from markdown code blocks
  const markdownMatch = content.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/)
  if (markdownMatch) {
    const candidate = markdownMatch[1].trim()
    if (isValidJson(candidate)) {
      return candidate
    }
  }
  
  // If no markdown blocks, find the first complete JSON object
  const trimmed = content.trim()
  
  // Find the start of JSON
  const jsonStart = trimmed.indexOf('{')
  if (jsonStart === -1) {
    return trimmed // No JSON found, return as-is
  }
  
  // Find the matching closing brace by counting braces
  let braceCount = 0
  let inString = false
  let escaped = false
  let jsonEnd = -1
  
  for (let i = jsonStart; i < trimmed.length; i++) {
    const char = trimmed[i]
    
    if (escaped) {
      escaped = false
      continue
    }
    
    if (char === '\\' && inString) {
      escaped = true
      continue
    }
    
    if (char === '"') {
      inString = !inString
      continue
    }
    
    if (!inString) {
      if (char === '{') {
        braceCount++
      } else if (char === '}') {
        braceCount--
        if (braceCount === 0) {
          jsonEnd = i
          break
        }
      }
    }
  }
  
  if (jsonEnd !== -1) {
    const candidate = trimmed.slice(jsonStart, jsonEnd + 1)
    if (isValidJson(candidate)) {
      return candidate
    }
  }
  
  // Fallback: return the trimmed content
  return trimmed
}

// Helper function to validate JSON
function isValidJson(str: string): boolean {
  try {
    JSON.parse(str)
    return true
  } catch {
    return false
  }
}

export class AIServerService {
  async analyzeGrammar(text: string): Promise<GrammarAnalysis> {
    try {
      // Phase 2A: Remove context window limit - analyze full document up to 10k chars
      const maxChars = 10000
      const analysisText = text.length > maxChars ? text.slice(0, maxChars) : text

      const response = await openai.chat.completions.create({
        model: 'gpt-4.1-nano', // Phase 2A: Updated to use gpt-4.1-nano for cost efficiency
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
- Style improvements (wordiness, clarity, flow) if significantly noticeable

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
        temperature: 0.1,
        max_tokens: 5000, // Increased for full document analysis
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

      // Validate positions against the actual text
      const validatedSuggestions = parsed.suggestions
        .map(suggestion => {
          const { start, end } = suggestion
          
          // Validate the text range against the actual text
          if (start >= 0 && end <= text.length && start < end) {
            const textAtRange = text.slice(start, end)
            
            // If the text matches exactly, we're good
            if (textAtRange === suggestion.original_text) {
              return {
                ...suggestion,
                text_range: { start, end }
              }
            }
            
            // If the text doesn't match, try to find the correct positions
            const searchRadius = 10
            for (let startOffset = -searchRadius; startOffset <= searchRadius; startOffset++) {
              for (let endOffset = -searchRadius; endOffset <= searchRadius; endOffset++) {
                const testStart = Math.max(0, start + startOffset)
                const testEnd = Math.min(text.length, end + endOffset)
                
                if (testStart < testEnd) {
                  const testText = text.slice(testStart, testEnd)
                  if (testText === suggestion.original_text) {
                    return {
                      ...suggestion,
                      text_range: { start: testStart, end: testEnd }
                    }
                  }
                }
              }
            }
            
            // Try a broader search for the exact text
            const index = text.indexOf(suggestion.original_text)
            if (index !== -1) {
              return {
                ...suggestion,
                text_range: { start: index, end: index + suggestion.original_text.length }
              }
            }
          }
          
          // If we can't find valid positions, skip this suggestion
          console.warn('Could not find valid positions for suggestion:', {
            original: suggestion.original_text,
            positions: { start, end },
            textLength: text.length
          })
          return null
        })
        .filter((suggestion): suggestion is NonNullable<typeof suggestion> => suggestion !== null)

      return { suggestions: validatedSuggestions }

    } catch (error) {
      console.error('Error analyzing grammar:', error)
      return { suggestions: [] }
    }
  }

  async analyzePersonaInsights(text: string, personaType: string): Promise<PersonaAnalysis | null> {
    try {
      const maxChars = 10000
      const analysisText = text.length > maxChars ? text.slice(0, maxChars) : text
      
      const prompt = PERSONA_PROMPTS[personaType as keyof typeof PERSONA_PROMPTS]
      if (!prompt) {
        throw new Error(`Unknown persona type: ${personaType}`)
      }

      // Determine if this is a Twitter persona or archetypal persona
      const isTwitterPersona = personaType.startsWith('twitter_')
      const outputType = isTwitterPersona ? 'tweet' : (personaType === 'anima' ? 'insight' : 'challenge')

      const response = await openai.chat.completions.create({
        model: 'gpt-4o', // Use higher quality model for persona analysis
        messages: [
          {
            role: 'system',
            content: `${prompt}

Respond with a JSON object in this exact format:
{
  "output_content": "your ${isTwitterPersona ? 'tweet or insight' : 'guidance/insight'}",
  "reasoning": "brief explanation of why this resonates or matters"
}

Be authentic to the persona's voice and perspective. Keep insights meaningful but concise.`
          },
          {
            role: 'user',
            content: `Please analyze this writing and provide ${isTwitterPersona ? 'tweet-worthy insights' : 'archetypal guidance'}:\n\n"${analysisText}"`
          }
        ],
        temperature: 0.85, // Higher temperature for creative persona analysis
        max_tokens: 1000,
      })

      const content = response.choices[0]?.message?.content
      if (!content) {
        throw new Error('No response from OpenAI')
      }

      const cleanJson = extractJsonFromResponse(content)
      
      // Add debug logging for JSON parsing issues
      console.log('AI Response length:', content.length)
      console.log('Extracted JSON length:', cleanJson.length)
      console.log('Extracted JSON preview:', cleanJson.substring(0, 200) + (cleanJson.length > 200 ? '...' : ''))
      
      // Validate JSON before parsing
      let parsed: { output_content: string; reasoning: string }
      try {
        parsed = JSON.parse(cleanJson)
      } catch (parseError) {
        console.error('JSON Parse Error Details:', {
          error: parseError,
          extractedJson: cleanJson,
          originalResponse: content
        })
        throw new Error(`Failed to parse AI response as JSON: ${parseError}`)
      }
      
      // Validate the parsed structure
      if (!parsed.output_content || !parsed.reasoning) {
        throw new Error('AI response missing required fields: output_content or reasoning')
      }

      return {
        output_content: parsed.output_content,
        output_type: outputType as 'tweet' | 'insight' | 'challenge' | 'encouragement',
        reasoning: parsed.reasoning
      }

    } catch (error) {
      console.error('Error analyzing persona insights:', error)
      return null
    }
  }
} 