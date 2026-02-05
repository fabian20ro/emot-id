import type { CrisisTier } from '../models/distress'

export function CrisisBanner({ tier, crisisT }: { tier: CrisisTier; crisisT: Record<string, string> }) {
  function getMessageKey(tier: CrisisTier): string {
    switch (tier) {
      case 'tier3': return 'tier3'
      case 'tier2': return 'tier2'
      case 'tier1': return 'tier1'
      default: return 'tier1'
    }
  }

  const messageKey = getMessageKey(tier)
  const message = crisisT[messageKey] ?? crisisT.tier2 ?? 'Support is available.'

  return (
    <div className="mb-4 p-3 rounded-xl bg-amber-900/30 border border-amber-700/50">
      <p className="text-sm text-amber-200 mb-2">{message}</p>
      <p className="text-xs text-amber-300/80">
        {crisisT.roLine ?? 'Romania: 116 123 (free, 24/7)'}
      </p>
      <a
        href="https://findahelpline.com"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center min-h-[48px] mt-2 px-4 py-2 rounded-lg bg-amber-700/30 text-base font-semibold text-amber-200 hover:bg-amber-700/50 transition-colors"
      >
        {crisisT.intLine ?? 'International: findahelpline.com'}
      </a>
      <p className="text-xs text-amber-400/60 mt-2">
        {crisisT.disclaimer ?? 'If you are in immediate danger, please call emergency services.'}
      </p>

      {/* Grounding technique — auto-expanded for tier 2/3 (distressed users may not click a toggle) */}
      {(tier === 'tier2' || tier === 'tier3') && (
        <details className="mt-2" open>
          <summary className="text-xs text-amber-300/70 cursor-pointer hover:text-amber-300 transition-colors select-none">
            {crisisT.groundingTitle ?? 'A quick grounding technique (5-4-3-2-1)'}
          </summary>
          <p className="text-xs text-amber-200/70 mt-1 leading-relaxed">
            {crisisT.groundingBody ?? 'Name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste.'}
          </p>
        </details>
      )}
    </div>
  )
}
