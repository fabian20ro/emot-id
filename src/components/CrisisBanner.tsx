import type { CrisisTier } from '../models/distress'

export function CrisisBanner({
  tier,
  crisisT,
  showTemporalNote = false,
}: {
  tier: CrisisTier
  crisisT: Record<string, string>
  showTemporalNote?: boolean
}) {
  function getMessageKey(tier: CrisisTier): string {
    switch (tier) {
      case 'tier4': return 'tier4'
      case 'tier3': return 'tier3'
      case 'tier2': return 'tier2'
      case 'tier1': return 'tier1'
      default: return 'tier1'
    }
  }

  const messageKey = getMessageKey(tier)
  const message = crisisT[messageKey] ?? crisisT.tier2 ?? 'Support is available.'
  const isTier4 = tier === 'tier4'

  return (
    <div className={`mb-4 p-3 rounded-xl border ${isTier4 ? 'bg-red-900/35 border-red-700/60' : 'bg-amber-900/30 border-amber-700/50'}`}>
      <p className={`text-sm mb-2 ${isTier4 ? 'text-red-100' : 'text-amber-200'}`}>{message}</p>
      <p className={`text-xs ${isTier4 ? 'text-red-200/85' : 'text-amber-300/80'}`}>
        {crisisT.roLine ?? 'Romania: 116 123 (free, 24/7)'}
      </p>
      <a
        href="https://findahelpline.com"
        target="_blank"
        rel="noopener noreferrer"
        className={`flex items-center justify-center min-h-[48px] mt-2 px-4 py-2 rounded-lg text-base font-semibold transition-colors ${isTier4 ? 'bg-red-700/55 text-red-50 hover:bg-red-700/70' : 'bg-amber-700/30 text-amber-200 hover:bg-amber-700/50'}`}
      >
        {crisisT.intLine ?? 'International: findahelpline.com'}
      </a>
      <p className={`text-xs mt-2 ${isTier4 ? 'text-red-200/75' : 'text-amber-400/60'}`}>
        {crisisT.disclaimer ?? 'If you are in immediate danger, please call emergency services.'}
      </p>
      {showTemporalNote && (
        <p className={`text-xs mt-2 leading-relaxed ${isTier4 ? 'text-red-200/85' : 'text-amber-200/80'}`}>
          {crisisT.temporalNote ?? "We noticed this pattern showing up more often recently. That's okay — it's information, not a judgment."}
        </p>
      )}

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
