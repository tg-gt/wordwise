'use client'

import { PenTool, Sparkles } from 'lucide-react'
import { LogoutButton } from '@/components/logout-button'

export function AnimusWriterBanner() {
  return (
    <div className="w-full bg-gradient-to-r from-white via-white to-purple-50/30 dark:from-background dark:via-background dark:to-purple-950/20 border-b shadow-elegant">
      <div className="w-full pl-6 pr-4 py-4">
        <div className="flex items-center justify-between gap-3">
          {/* Logo Icon */}
          <div className="flex items-center gap-4">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-blue-500 rounded-xl blur-sm opacity-0 group-hover:opacity-20 transition-elegant"></div>
              <div className="relative flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-xl shadow-subtle">
                <PenTool className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                <Sparkles className="w-3 h-3 absolute -top-0.5 -right-0.5 text-amber-500 animate-pulse" />
              </div>
            </div>
            
            {/* Brand Name */}
            <div className="flex flex-col">
              <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                AnimusWriter
              </h1>
              <p className="text-xs text-writing-light -mt-1">
                Intelligent Writing Assistant
              </p>
            </div>
          </div>

          {/* Logout Button */}
          <div className="flex items-center">
            <LogoutButton />
          </div>
        </div>
      </div>
    </div>
  )
} 