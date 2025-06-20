'use client'

import { PenTool, Sparkles } from 'lucide-react'
import { LogoutButton } from '@/components/logout-button'

export function AnimusWriterBanner() {
  return (
    <div className="w-full bg-white dark:bg-background border-b shadow-sm">
      <div className="w-full pl-6 pr-4 py-3">
        <div className="flex items-center justify-between gap-3">
          {/* Logo Icon */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <PenTool className="w-8 h-8 text-gray-700 dark:text-gray-300" />
              <Sparkles className="w-4 h-4 absolute -top-1 -right-1 text-yellow-500" />
            </div>
            
            {/* Brand Name */}
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AnimusWriter
            </h1>
          </div>

          {/* Logout Button */}
          <LogoutButton />
        </div>
      </div>
    </div>
  )
} 