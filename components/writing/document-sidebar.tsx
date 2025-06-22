'use client'

import { useState, useEffect } from 'react'
import { useWritingStore } from '@/lib/stores/writing-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Check, 
  X, 
  FileText,
  Loader2,
  Clock
} from 'lucide-react'
import { Document } from '@/lib/types/database'

interface DocumentSidebarProps {
  userId: string
}

export function DocumentSidebar({ userId }: DocumentSidebarProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')

  const {
    documents,
    currentDocument,
    isLoadingDocuments,
    loadUserDocuments,
    createNewDocument,
    loadDocument,
    deleteDocument,
    updateDocumentTitle
  } = useWritingStore()

  // Load documents on mount
  useEffect(() => {
    loadUserDocuments(userId)
  }, [loadUserDocuments, userId])

  const handleSelectDocument = (doc: Document) => {
    loadDocument(doc.id)
  }

  const handleCreateNew = () => {
    createNewDocument(userId)
  }

  const handleDeleteDocument = async (id: string) => {
    if (confirm('Are you sure you want to delete this document? This action cannot be undone.')) {
      await deleteDocument(id)
    }
  }

  const handleStartEditing = (doc: Document) => {
    setEditingId(doc.id)
    setEditTitle(doc.title || '')
  }

  const handleSaveTitle = async () => {
    if (editingId && editTitle.trim()) {
      await updateDocumentTitle(editingId, editTitle.trim())
      setEditingId(null)
      setEditTitle('')
    }
  }

  const handleCancelEditing = () => {
    setEditingId(null)
    setEditTitle('')
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    
    // Reset time to start of day for both dates to compare calendar days
    const docDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    
    const diffTime = todayDate.getTime() - docDate.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    
    // Handle negative time differences (server time slightly ahead of client)
    if (diffDays <= 0) {
      return `Today ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    } else if (diffDays === 1) {
      return `Yesterday ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    } else if (diffDays < 7) {
      return `${diffDays} days ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  return (
    <div className="w-80 writing-sidebar border-r flex flex-col h-full shadow-elegant">
      {/* Header */}
      <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
            <h2 className="font-semibold text-sm text-writing">Documents</h2>
          </div>
          <Button 
            size="sm" 
            onClick={handleCreateNew}
            className="h-8 px-3 writing-accent hover:scale-105 transition-elegant shadow-subtle"
          >
            <Plus className="w-4 h-4 mr-1" />
            New
          </Button>
        </div>
        <p className="text-xs text-writing-light">
          {documents.length} document{documents.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Documents List */}
      <div className="flex-1 overflow-auto">
        {isLoadingDocuments ? (
          <div className="flex items-center justify-center py-12 animate-fade-in">
            <div className="text-center">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-3 text-purple-500" />
              <span className="text-sm text-writing-light">Loading documents...</span>
            </div>
          </div>
        ) : documents.length === 0 ? (
          <div className="p-6 text-center text-writing-light animate-fade-in">
            <div className="relative mb-4">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full blur-lg opacity-20"></div>
              <FileText className="w-12 h-12 mx-auto relative text-blue-400 dark:text-blue-500" />
            </div>
            <p className="text-sm font-medium text-writing mb-1">No documents yet</p>
            <p className="text-xs leading-relaxed">Create your first document to start your writing journey</p>
          </div>
        ) : (
          <div className="p-3 space-y-3">
            {documents.map((doc) => (
              <Card 
                key={doc.id}
                className={`p-4 cursor-pointer transition-elegant hover:shadow-subtle ${
                  currentDocument?.id === doc.id 
                    ? 'writing-accent-light border-purple-300 dark:border-purple-700 shadow-subtle' 
                    : 'hover:bg-white/50 dark:hover:bg-background/50'
                }`}
                onClick={() => !editingId && handleSelectDocument(doc)}
              >
                {/* Title */}
                <div className="flex items-center justify-between mb-2">
                  {editingId === doc.id ? (
                    <div className="flex items-center gap-2 flex-1">
                      <Input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="h-7 text-sm"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveTitle()
                          if (e.key === 'Escape') handleCancelEditing()
                        }}
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                      />
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-7 w-7 p-0"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleSaveTitle()
                        }}
                      >
                        <Check className="w-3 h-3" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-7 w-7 p-0"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleCancelEditing()
                        }}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-sm font-medium truncate">
                          {doc.title || 'Untitled'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 ml-2">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-6 w-6 p-0 opacity-60 hover:opacity-100"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleStartEditing(doc)
                          }}
                        >
                          <Edit2 className="w-3 h-3" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-6 w-6 p-0 opacity-60 hover:opacity-100 hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteDocument(doc.id)
                          }}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>

                {/* Meta info */}
                {editingId !== doc.id && (
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{formatDate(doc.updated_at)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>{doc.word_count || 0} words</span>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 