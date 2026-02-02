import type { CrisisTier } from '../models/distress'

export function CrisisBanner({ tier, crisisT }: { tier: CrisisTier; crisisT: Record<string, string> }) {
  const messageKey = tier === 'tier3' ? 'tier3' : tier === 'tier2' ? 'tier2' : 'tier1'
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
        className="text-xs text-amber-300 hover:text-amber-200 underline"
      >
        {crisisT.intLine ?? 'International: findahelpline.com'}
      </a>
      <p className="text-xs text-amber-400/60 mt-1">
        {crisisT.disclaimer ?? 'If you are in immediate danger, please call emergency services.'}
      </p>

      {/* Micro-grounding technique for tier 2/3 */}
      {(tier === 'tier2' || tier === 'tier3') && (
        <details className="mt-2">
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
