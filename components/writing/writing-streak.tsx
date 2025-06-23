'use client'

import { Badge } from '@/components/ui/badge'
import { Flame, Trophy, Calendar, Zap } from 'lucide-react'

interface WritingStreakProps {
  currentStreak: number
  longestStreak: number
  isLoading?: boolean
}

export function WritingStreak({ currentStreak, longestStreak, isLoading }: WritingStreakProps) {
  if (isLoading) {
    return (
      <Badge variant="outline" className="flex items-center gap-2 animate-pulse">
        <Flame className="w-4 h-4" />
        <span>Loading...</span>
      </Badge>
    )
  }

  // Determine streak status and icon
  const getStreakBadge = () => {
    if (currentStreak === 0) {
      return {
        icon: Calendar,
        variant: "outline" as const,
        text: "Start your streak!",
        className: "bg-gray-50 text-gray-700 dark:bg-gray-950/30 dark:text-gray-300"
      }
    }

    if (currentStreak >= 30) {
      return {
        icon: Trophy,
        variant: "default" as const,
        text: `🏆 ${currentStreak} day streak!`,
        className: "bg-gradient-to-r from-yellow-400/80 to-orange-400/80 text-white shadow-md animate-pulse"
      }
    }

    if (currentStreak >= 7) {
      return {
        icon: Zap,
        variant: "default" as const,
        text: `⚡ ${currentStreak} days strong!`,
        className: "bg-gradient-to-r from-purple-400/80 to-pink-400/80 text-white shadow-md"
      }
    }

    return {
      icon: Flame,
      variant: "default" as const,
      text: `🔥 ${currentStreak} day${currentStreak === 1 ? '' : 's'}`,
      className: "bg-gradient-to-r from-orange-400/80 to-red-400/80 text-white shadow-md"
    }
  }

  const streakBadge = getStreakBadge()
  const Icon = streakBadge.icon

  return (
    <div className="flex items-center gap-2">
      <Badge 
        variant={streakBadge.variant} 
        className={`flex items-center gap-2 transition-all duration-300 hover:scale-105 ${streakBadge.className}`}
      >
        <Icon className="w-4 h-4" />
        <span className="font-medium">{streakBadge.text}</span>
      </Badge>
      
      {longestStreak > currentStreak && longestStreak > 1 && (
        <Badge 
          variant="secondary" 
          className="text-xs bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300"
        >
          Best: {longestStreak}
        </Badge>
      )}
    </div>
  )
} 