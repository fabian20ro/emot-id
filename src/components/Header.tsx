import { MenuButton } from './MenuButton'
import { ModelBar } from './ModelBar'

interface HeaderProps {
  menuOpen: boolean
  onMenuToggle: () => void
  modelId: string
  onModelChange: (id: string) => void
}

export function Header({ menuOpen, onMenuToggle, modelId, onModelChange }: HeaderProps) {
  return (
    <header className="z-[var(--z-header)] bg-gray-800/80 backdrop-blur-sm border-b border-gray-700 px-2 py-1 pt-[max(0.25rem,env(safe-area-inset-top))] flex items-center gap-1">
      <MenuButton
        isOpen={menuOpen}
        onClick={onMenuToggle}
      />
      <ModelBar modelId={modelId} onModelChange={onModelChange} inline />
    </header>
  )
}
