import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { AIServerService } from '@/lib/services/ai-server'

export async function POST(request: NextRequest) {
  try {
    // Verify user authentication
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { content, personaType, documentId } = await request.json()
    
    if (!content || !personaType || !documentId) {
      return NextResponse.json({ 
        error: 'Content, personaType, and documentId are required' 
      }, { status: 400 })
    }

    // Verify user owns the document
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('user_id')
      .eq('id', documentId)
      .single()

    if (docError || !document || document.user_id !== user.id) {
      return NextResponse.json({ 
        error: 'Document not found or unauthorized' 
      }, { status: 404 })
    }

    // Validate persona type
    const validPersonaTypes = [
      'twitter_naval', 'twitter_pg', 'twitter_elon', 
      'twitter_sam', 'twitter_solbrah', 'twitter_austen', 'anima', 'animus'
    ]
    
    if (!validPersonaTypes.includes(personaType)) {
      return NextResponse.json({ 
        error: 'Invalid persona type' 
      }, { status: 400 })
    }

    // Process with AI
    const aiService = new AIServerService()
    const analysis = await aiService.analyzePersonaInsights(content, personaType)

    if (!analysis) {
      return NextResponse.json({ 
        error: 'Failed to generate persona analysis' 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: {
        personaOutput: analysis.output_content,
        outputType: analysis.output_type,
        reasoning: analysis.reasoning
      }
    })

  } catch (error) {
    console.error('Error in persona API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 