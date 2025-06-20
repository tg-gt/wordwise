'use client'

import { useEffect, useRef } from 'react'
import { useWritingStore } from '@/lib/stores/writing-store'
import { DocumentSidebar } from './document-sidebar'
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
    updateContent,
    saveDocument,
    createNewDocument,
    acceptSuggestion,
    rejectSuggestion,
    toggleSidebar,
    toggleDocumentSidebar,
    cleanup
  } = useWritingStore()

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
    updateContent(e.target.value)
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

  const wordCount = content.split(/\s+/).filter(word => word.length > 0).length

  return (
    <div className="h-screen flex bg-background">
      {/* Document Sidebar */}
      {documentSidebarVisible && (
        <DocumentSidebar userId={userId} />
      )}

      {/* Main Editor */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="border-b p-4 flex items-center justify-between">
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
              <Badge variant="secondary">
                {wordCount} words
              </Badge>
            )}
            
            {/* Analysis Status */}
            {isAnalyzing && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" />
                Analyzing
              </Badge>
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
        <div className="flex-1 p-6">
          {currentDocument ? (
            <textarea
              ref={textareaRef}
              value={content}
              onChange={handleContentChange}
              onKeyDown={handleKeyDown}
              placeholder="Start writing... Let your thoughts flow freely."
              className="w-full h-full resize-none border-none outline-none text-lg leading-relaxed bg-transparent placeholder:text-muted-foreground/50"
              spellCheck={false}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-center text-muted-foreground">
              <div>
                <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">No document selected</h3>
                <p className="text-sm">
                  {documentSidebarVisible 
                    ? "Select a document from the sidebar or create a new one" 
                    : "Open the document sidebar to get started"
                  }
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Suggestions Sidebar */}
      {sidebarVisible && (
        <div className="w-80 border-l bg-muted/30 flex flex-col">
          <div className="p-4 border-b">
            <h3 className="font-semibold text-sm">Writing Suggestions</h3>
            <p className="text-xs text-muted-foreground mt-1">
              {suggestions.length} pending suggestions
            </p>
          </div>
          
          <div className="flex-1 overflow-auto p-4 space-y-4">
            {!currentDocument ? (
              <div className="text-center text-muted-foreground text-sm py-8">
                Select a document to see suggestions
              </div>
            ) : suggestions.length === 0 ? (
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
              suggestions.map((suggestion) => (
                <Card key={suggestion.id} className="p-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge 
                        variant={
                          suggestion.type === 'grammar' ? 'destructive' :
                          suggestion.type === 'spelling' ? 'default' : 'secondary'
                        }
                        className="text-xs"
                      >
                        {suggestion.type}
                      </Badge>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="text-sm">
                        <span className="text-muted-foreground">Original: </span>
                        <span className="bg-red-100 dark:bg-red-900/30 px-1 rounded">
                          {suggestion.original_text}
                        </span>
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">Suggestion: </span>
                        <span className="bg-green-100 dark:bg-green-900/30 px-1 rounded">
                          {suggestion.suggestion}
                        </span>
                      </div>
                    </div>
                    
                    {suggestion.explanation && (
                      <div className="text-xs text-muted-foreground border-l-2 border-muted pl-2">
                        {suggestion.explanation}
                      </div>
                    )}
                    
                    <div className="flex gap-2 pt-2">
                      <Button 
                        size="sm" 
                        onClick={() => acceptSuggestion(suggestion.id)}
                        className="flex-1"
                      >
                        <Check className="w-3 h-3 mr-1" />
                        Accept
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => rejectSuggestion(suggestion.id)}
                        className="flex-1"
                      >
                        <X className="w-3 h-3 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
} 