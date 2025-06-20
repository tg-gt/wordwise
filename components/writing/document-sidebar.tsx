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
    const diffTime = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    
    // Handle negative time differences (server time slightly ahead of client)
    if (diffDays <= 0) {
      return `Today ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    } else if (diffDays === 1) {
      return 'Yesterday'
    } else if (diffDays < 7) {
      return `${diffDays} days ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  return (
    <div className="w-80 bg-muted/30 border-r flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-sm">Documents</h2>
          <Button 
            size="sm" 
            onClick={handleCreateNew}
            className="h-8 px-3"
          >
            <Plus className="w-4 h-4 mr-1" />
            New
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          {documents.length} document{documents.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Documents List */}
      <div className="flex-1 overflow-auto">
        {isLoadingDocuments ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            <span className="text-sm text-muted-foreground">Loading documents...</span>
          </div>
        ) : documents.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No documents yet</p>
            <p className="text-xs mt-1">Create your first document to get started</p>
          </div>
        ) : (
          <div className="p-2 space-y-2">
            {documents.map((doc) => (
              <Card 
                key={doc.id}
                className={`p-3 cursor-pointer transition-colors hover:bg-accent ${
                  currentDocument?.id === doc.id ? 'bg-accent border-primary' : ''
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