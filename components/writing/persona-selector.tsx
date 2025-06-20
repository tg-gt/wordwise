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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8">
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
        {archetypePersonas.map(([key, info]) => (
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
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 