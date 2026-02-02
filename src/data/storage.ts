/**
 * Consolidated localStorage wrapper for preference keys.
 * All scattered localStorage calls route through here for consistency
 * and graceful fallback when storage is unavailable (private browsing).
 */

const PREFIX = 'emot-id-'

const KEYS = {
  model: `${PREFIX}model`,
  language: `${PREFIX}language`,
  soundMuted: `${PREFIX}sound-muted`,
  onboarded: `${PREFIX}onboarded`,
} as const

type StorageKey = keyof typeof KEYS

/** Read a string value. Returns `null` when missing or storage unavailable. */
function get(key: StorageKey): string | null {
  try {
    return localStorage.getItem(KEYS[key])
  } catch {
    return null
  }
}

/** Write a string value. Silently fails when storage unavailable. */
function set(key: StorageKey, value: string): void {
  try {
    localStorage.setItem(KEYS[key], value)
  } catch {
    // localStorage may be unavailable in private browsing
  }
}

/** Read a per-model hint dismissal flag. */
function isHintDismissed(modelId: string): boolean {
  try {
    return localStorage.getItem(`${PREFIX}hint-${modelId}`) === 'true'
  } catch {
    return false
  }
}

/** Mark a per-model hint as dismissed. */
function dismissHint(modelId: string): void {
  try {
    localStorage.setItem(`${PREFIX}hint-${modelId}`, 'true')
  } catch {
    // localStorage may be unavailable
  }
}

export const storage = {
  KEYS,
  get,
  set,
  isHintDismissed,
  dismissHint,
} as const
