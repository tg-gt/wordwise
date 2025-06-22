'use client'

import { useEffect, useRef } from 'react'
import { useWritingStore } from '@/lib/stores/writing-store'
import { DocumentSidebar } from './document-sidebar'
import { PersonaSelector } from './persona-selector'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { 
  PanelRight, 
  PanelLeft,
  Save, 
  Loader2, 
  Check, 
  X, 
  Clock,
  FileText
} from 'lucide-react'

interface WritingEditorProps {
  userId: string
}

export function WritingEditor({ userId }: WritingEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  
  const {
    currentDocument,
    content,
    isSaving,
    lastSaved,
    suggestions,
    isAnalyzing,
    sidebarVisible,
    documentSidebarVisible,
    activePersona,
    personaOutput,
    isAnalyzingPersona,
    updateContent,
    saveDocument,
    acceptSuggestion,
    rejectSuggestion,
    setActivePersona,
    ratePersonaOutput,
    toggleSidebar,
    toggleDocumentSidebar,
    cleanup
  } = useWritingStore()

  const wordCount = content.split(/\s+/).filter(word => word.length > 0).length
  const charCount = content.length
  const MAX_CHARS = 10000
  const WARNING_THRESHOLD = 9000

  // Initialize with new document on mount if no documents exist
  useEffect(() => {
    // Don't auto-create document - let DocumentSidebar handle loading existing documents
    return () => cleanup()
  }, [cleanup])

  // Auto-focus textarea when document changes
  useEffect(() => {
    if (textareaRef.current && currentDocument) {
      textareaRef.current.focus()
    }
  }, [currentDocument])

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value
    // Enforce character limit
    if (newContent.length <= MAX_CHARS) {
      updateContent(newContent)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // ESC to hide suggestions
    if (e.key === 'Escape') {
      if (sidebarVisible) {
        toggleSidebar()
      }
    }
    
    // Ctrl/Cmd + S to save
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault()
      saveDocument()
    }
  }

  return (
    <div className="h-full flex writing-surface">
      {/* Document Sidebar */}
      {documentSidebarVisible && (
        <div className="animate-slide-in">
          <DocumentSidebar userId={userId} />
        </div>
      )}

      {/* Main Editor */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="border-b bg-white/50 dark:bg-background/50 backdrop-blur-sm p-4 flex items-center justify-between shadow-subtle">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={toggleDocumentSidebar}
                className="h-8 w-8 p-0"
              >
                <PanelLeft className="w-4 h-4" />
              </Button>
              
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                <span className="font-medium">
                  {currentDocument?.title || 'Select a document'}
                </span>
              </div>
            </div>
            
            {/* Save Status */}
            {currentDocument && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : lastSaved ? (
                  <>
                    <Clock className="w-4 h-4" />
                    <span>Saved {lastSaved.toLocaleTimeString()}</span>
                  </>
                ) : null}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Word Count */}
            {currentDocument && (
              <Badge variant="secondary" className="shadow-subtle bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300">
                {wordCount} words
              </Badge>
            )}
            
            {/* Character Count */}
            {currentDocument && (
              <Badge 
                variant={charCount >= MAX_CHARS ? "destructive" : charCount >= WARNING_THRESHOLD ? "secondary" : "outline"}
                className={`shadow-subtle ${
                  charCount >= MAX_CHARS 
                    ? "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-300" 
                    : charCount >= WARNING_THRESHOLD 
                      ? "bg-yellow-50 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-300" 
                      : "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-300"
                }`}
              >
                {charCount}/{MAX_CHARS}
              </Badge>
            )}
            
            {/* Analysis Status */}
            {isAnalyzing && (
              <Badge variant="outline" className="flex items-center gap-1 shadow-subtle bg-purple-50 text-purple-700 dark:bg-purple-950/30 dark:text-purple-300 animate-pulse">
                <Loader2 className="w-3 h-3 animate-spin" />
                Analyzing
              </Badge>
            )}
            
            {/* Phase 2: Persona Selector */}
            {currentDocument && (
              <PersonaSelector 
                activePersona={activePersona}
                onPersonaChange={setActivePersona}
              />
            )}
            
            {/* Manual Save */}
            {currentDocument && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={saveDocument}
                disabled={isSaving}
              >
                <Save className="w-4 h-4 mr-1" />
                Save
              </Button>
            )}
            
            {/* Toggle Suggestions Sidebar */}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={toggleSidebar}
            >
              <PanelRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Writing Area */}
        <div className="flex-1 p-8 bg-gradient-to-b from-transparent to-purple-50/10 dark:to-purple-950/10">
          {currentDocument ? (
            <div className="max-w-4xl mx-auto h-full">
              <textarea
                ref={textareaRef}
                value={content}
                onChange={handleContentChange}
                onKeyDown={handleKeyDown}
                placeholder="Start writing... Let your thoughts flow freely."
                className="w-full h-full resize-none border-none outline-none text-lg leading-relaxed bg-transparent placeholder:text-writing-light/70 text-writing focus:outline-none selection:bg-purple-200 dark:selection:bg-purple-900 transition-elegant"
                spellCheck={false}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-center text-writing-light animate-fade-in">
              <div className="max-w-md">
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full blur-lg opacity-20"></div>
                  <FileText className="w-20 h-20 mx-auto relative text-purple-400 dark:text-purple-500" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-writing">No document selected</h3>
                <p className="text-writing-light leading-relaxed">
                  {documentSidebarVisible 
                    ? "Select a document from the sidebar or create a new one to start writing" 
                    : "Open the document sidebar to get started with your writing journey"
                  }
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Suggestions Sidebar */}
      {sidebarVisible && (
        <div className="w-80 border-l writing-sidebar flex flex-col shadow-elegant animate-slide-in">
          <div className="p-4 border-b bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full animate-pulse"></div>
              <h3 className="font-semibold text-sm text-writing">AI Insights</h3>
            </div>
            <p className="text-xs text-writing-light">
              Persona insights & writing suggestions
            </p>
          </div>
          
          <div className="flex-1 overflow-auto space-y-4">
            {!currentDocument ? (
              <div className="text-center text-muted-foreground text-sm py-8 px-4">
                Select a document to see insights
              </div>
            ) : (
              <>
                {/* Phase 2: Persona Insights Section */}
                <div className="p-4 border-b">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-sm">🤖 Persona Insights</h4>
                    <div className="text-xs text-muted-foreground">
                      {activePersona.replace('twitter_', '').replace('_', ' ').toUpperCase()}
                    </div>
                  </div>
                  
                  {isAnalyzingPersona ? (
                    <div className="flex items-center justify-center py-4 text-sm text-muted-foreground">
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Analyzing with {activePersona.replace('twitter_', '').replace('_', ' ')}...
                    </div>
                  ) : personaOutput ? (
                    <Card className="p-4 shadow-subtle bg-gradient-to-br from-white to-purple-50/30 dark:from-card dark:to-purple-950/10 border-purple-200/50 dark:border-purple-800/30 animate-fade-in">
                      <div className="space-y-3">
                        <div className="text-sm leading-relaxed text-writing">
                          {personaOutput.output_content}
                        </div>
                        {personaOutput.reasoning && (
                          <div className="text-xs text-writing-light border-l-2 border-purple-300 dark:border-purple-700 pl-3 bg-purple-50/30 dark:bg-purple-950/20 py-2 rounded-r">
                            {personaOutput.reasoning}
                          </div>
                        )}
                        <div className="flex gap-2 pt-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => ratePersonaOutput(1)}
                            className="flex-1 hover:bg-green-50 hover:border-green-300 dark:hover:bg-green-950/20 transition-elegant"
                          >
                            👍
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => ratePersonaOutput(-1)}
                            className="flex-1 hover:bg-red-50 hover:border-red-300 dark:hover:bg-red-950/20 transition-elegant"
                          >
                            👎
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ) : (
                    <div className="text-center text-muted-foreground text-sm py-4">
                      Keep writing to get persona insights...
                    </div>
                  )}
                </div>

                {/* Grammar Suggestions Section */}
                <div className="p-4">
                  <h4 className="font-medium text-sm mb-3">✏️ Writing Suggestions</h4>
                  {suggestions.length === 0 ? (
                    <div className="text-center text-muted-foreground text-sm py-8">
                      {isAnalyzing ? (
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Analyzing your writing...
                        </div>
                      ) : (
                        "No suggestions yet. Keep writing!"
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {suggestions.map((suggestion) => (
                <Card key={suggestion.id} className="p-4 shadow-subtle bg-gradient-to-br from-white to-blue-50/30 dark:from-card dark:to-blue-950/10 border-blue-200/50 dark:border-blue-800/30 animate-fade-in">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge 
                        variant={
                          suggestion.type === 'grammar' ? 'destructive' :
                          suggestion.type === 'spelling' ? 'default' : 'secondary'
                        }
                        className="text-xs shadow-subtle"
                      >
                        {suggestion.type}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="text-sm">
                        <span className="text-writing-light font-medium">Original: </span>
                        <span className="bg-red-100 dark:bg-red-900/30 px-2 py-1 rounded text-writing">
                          {suggestion.original_text}
                        </span>
                      </div>
                      <div className="text-sm">
                        <span className="text-writing-light font-medium">Suggestion: </span>
                        <span className="bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded text-writing">
                          {suggestion.suggestion}
                        </span>
                      </div>
                    </div>
                    
                    {suggestion.explanation && (
                      <div className="text-xs text-writing-light border-l-2 border-blue-300 dark:border-blue-700 pl-3 bg-blue-50/30 dark:bg-blue-950/20 py-2 rounded-r">
                        {suggestion.explanation}
                      </div>
                    )}
                    
                    <div className="flex gap-2 pt-2">
                      <Button 
                        size="sm" 
                        onClick={() => acceptSuggestion(suggestion.id)}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white transition-elegant"
                      >
                        <Check className="w-3 h-3 mr-1" />
                        Accept
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => rejectSuggestion(suggestion.id)}
                        className="flex-1 hover:bg-red-50 hover:border-red-300 dark:hover:bg-red-950/20 transition-elegant"
                      >
                        <X className="w-3 h-3 mr-1" />
                        Reject
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    )}
  </div>
  )
} 