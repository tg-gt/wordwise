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

    const { text, documentId } = await request.json()
    
    if (!text || !documentId) {
      return NextResponse.json({ error: 'Text and documentId are required' }, { status: 400 })
    }

    // Verify user owns the document
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('user_id')
      .eq('id', documentId)
      .single()

    if (docError || !document || document.user_id !== user.id) {
      return NextResponse.json({ error: 'Document not found or unauthorized' }, { status: 404 })
    }

    // Process with AI
    const aiService = new AIServerService()
    const analysis = await aiService.analyzeGrammar(text)

    return NextResponse.json(analysis)

  } catch (error) {
    console.error('Error in grammar API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 