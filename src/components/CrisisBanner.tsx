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

  const styles = {
    container: `mb-4 p-3 rounded-xl border ${isTier4 ? 'bg-red-900/35 border-red-700/60' : 'bg-amber-900/30 border-amber-700/50'}`,
    message: `text-sm mb-2 ${isTier4 ? 'text-red-100' : 'text-amber-200'}`,
    subtext: `text-xs ${isTier4 ? 'text-red-200/85' : 'text-amber-300/80'}`,
    button: `flex items-center justify-center min-h-[48px] mt-2 px-4 py-2 rounded-lg text-base font-semibold transition-colors ${isTier4 ? 'bg-red-700/55 text-red-50 hover:bg-red-700/70' : 'bg-amber-700/30 text-amber-200 hover:bg-amber-700/50'}`,
    disclaimer: `text-xs mt-2 ${isTier4 ? 'text-red-200/75' : 'text-amber-400/60'}`,
    temporalNote: `text-xs mt-2 leading-relaxed ${isTier4 ? 'text-red-200/85' : 'text-amber-200/80'}`,
    summary: `text-xs text-amber-300/70 cursor-pointer hover:text-amber-300 transition-select select-none`,
    summaryBody: `text-xs text-amber-200/70 mt-1 leading-relaxed`
  };

  return (
    <div className={styles.container}>
      <p className={styles.message}>{message}</p>
      <p className={styles.subtext}>
        {crisisT.roLine ?? 'Romania: 116 123 (free, 24/7)'}
      </p>
      <a
        href="https://findahelpline.com"
        target="_blank"
        rel="noopener noreferrer"
        className={styles.button}
      >
        {crisisT.intLine ?? 'International: findahelpline.com'}
      </a>
      <p className={styles.disclaimer}>
        {crisisT.disclaimer ?? 'If you are in immediate danger, please call emergency services.'}
      </p>
      {showTemporalNote && (
        <p className={styles.temporalNote}>
          {crisisT.temporalNote ?? "We noticed this pattern appearing more often lately. That's okay — it's information, not a judgment."}
        </p>
      )}

      {(tier === 'tier2' || tier === 'tier3') && (
        <details className="mt-2" open>
          <summary className={styles.summary}>
            {crisisT.groundingTitle ?? 'A quick grounding technique (5-for-3-2-1)'}
          </summary>
          <p className={styles.summaryBody}>
            {crisisT.groundingBody ?? 'Name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste.'}
          </p>
        </details>
      )}
    </div>
  )
}