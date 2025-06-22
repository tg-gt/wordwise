'use client'

import { PersonaType } from '@/lib/stores/writing-store'
import { Button } from '@/components/ui/button'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'
import { ChevronDown } from 'lucide-react'

interface PersonaSelectorProps {
  activePersona: PersonaType
  onPersonaChange: (persona: PersonaType) => void
}

const PERSONA_INFO = {
  // Twitter Personas
  twitter_naval: { name: 'Naval', emoji: '🧠', category: 'Twitter' },
  twitter_pg: { name: 'Paul Graham', emoji: '💡', category: 'Twitter' },
  twitter_elon: { name: 'Elon', emoji: '🚀', category: 'Twitter' },
  twitter_sam: { name: 'Sam Altman', emoji: '🤖', category: 'Twitter' },
  twitter_solbrah: { name: 'SolBrah', emoji: '💪', category: 'Twitter' },
  twitter_austen: { name: 'Austen', emoji: '🎓', category: 'Twitter' },
  
  // Archetypal Personas
  anima: { name: 'Anima', emoji: '🌙', category: 'Archetypal' },
  animus: { name: 'Animus', emoji: '⚡', category: 'Archetypal' }
}

export function PersonaSelector({ activePersona, onPersonaChange }: PersonaSelectorProps) {
  const activeInfo = PERSONA_INFO[activePersona]
  
  const twitterPersonas = Object.entries(PERSONA_INFO).filter(
    ([, info]) => info.category === 'Twitter'
  )
  
  const archetypePersonas = Object.entries(PERSONA_INFO).filter(
    ([, info]) => info.category === 'Archetypal'
  )

  const getButtonStyle = () => {
    if (activePersona === 'anima') {
      return 'border-pink-300 bg-pink-50 text-pink-700 hover:bg-pink-100 dark:border-pink-800 dark:bg-pink-950/30 dark:text-pink-300 dark:hover:bg-pink-950/50'
    }
    if (activePersona === 'animus') {
      return 'border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-300 dark:hover:bg-blue-950/50'
    }
    return ''
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className={`h-8 transition-elegant ${getButtonStyle()}`}>
          <span className="mr-1">{activeInfo.emoji}</span>
          {activeInfo.name}
          <ChevronDown className="w-3 h-3 ml-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <div className="px-2 py-1 text-xs font-medium text-muted-foreground">
          Tweet Extractors
        </div>
        {twitterPersonas.map(([key, info]) => (
          <DropdownMenuItem
            key={key}
            onClick={() => onPersonaChange(key as PersonaType)}
            className="flex items-center"
          >
            <span className="mr-2">{info.emoji}</span>
            {info.name}
            {key === activePersona && <span className="ml-auto text-xs">✓</span>}
          </DropdownMenuItem>
        ))}
        
        <DropdownMenuSeparator />
        
        <div className="px-2 py-1 text-xs font-medium text-muted-foreground">
          Inner Guidance
        </div>
        {archetypePersonas.map(([key, info]) => {
          const isAnima = key === 'anima'
          const isAnimus = key === 'animus'
          const isActive = key === activePersona
          
          return (
            <DropdownMenuItem
              key={key}
              onClick={() => onPersonaChange(key as PersonaType)}
              className={`flex items-center transition-elegant ${
                isAnima 
                  ? 'hover:bg-pink-50 dark:hover:bg-pink-950/20' 
                  : isAnimus 
                    ? 'hover:bg-blue-50 dark:hover:bg-blue-950/20' 
                    : ''
              } ${
                isActive && isAnima 
                  ? 'bg-pink-50 text-pink-700 dark:bg-pink-950/30 dark:text-pink-300' 
                  : isActive && isAnimus 
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300' 
                    : ''
              }`}
            >
              <span className="mr-2">{info.emoji}</span>
              {info.name}
              {isActive && <span className="ml-auto text-xs">✓</span>}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 