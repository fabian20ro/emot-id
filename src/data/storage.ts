const PREFIX = 'emot-id-'

const KEYS = {
  model: `${PREFIX}model`,
  language: `${PREFIX}language`,
  soundMuted: `${PREFIX}sound-muted`,
  onboarded: `${PREFIX}onboarded`,
  saveSessions: `${PREFIX}save-sessions`,
} as const

type StorageKey = keyof typeof KEYS

function get(key: StorageKey): string | null {
  try {
    return localStorage.getItem(KEYS[key])
  } catch {
    return null
  }
}

function set(key: StorageKey, value: string): void {
  try {
    localStorage.setItem(KEYS[key], value)
  } catch {
    // localStorage unavailable in private browsing
  }
}

function isHintDismissed(modelId: string): boolean {
  try {
    return localStorage.getItem(`${PREFIX}hint-${modelId}`) === 'true'
  } catch {
    return false
  }
}

function dismissHint(modelId: string): void {
  try {
    localStorage.setItem(`${PREFIX}hint-${modelId}`, 'true')
  } catch {
    // localStorage unavailable
  }
}

export const storage = {
  KEYS,
  get,
  set,
  isHintDismissed,
  dismissHint,
} as const
