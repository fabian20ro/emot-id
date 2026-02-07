const PREFIX = 'emot-id-'

const KEYS = {
  model: `${PREFIX}model`,
  language: `${PREFIX}language`,
  soundMuted: `${PREFIX}sound-muted`,
  onboarded: `${PREFIX}onboarded`,
  saveSessions: `${PREFIX}save-sessions`,
  dimensionalAxisHintSeen: `${PREFIX}dimensional-axis-hint-seen`,
  dailyReminderEnabled: `${PREFIX}daily-reminder-enabled`,
  dailyReminderLastSentAt: `${PREFIX}daily-reminder-last-sent-at`,
  simpleLanguage: `${PREFIX}simple-language`,
} as const

type StorageKey = keyof typeof KEYS

function getStorage(): Storage | null {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage
  }
  if (typeof localStorage !== 'undefined') {
    return localStorage
  }
  return null
}

function get(key: StorageKey): string | null {
  try {
    return getStorage()?.getItem(KEYS[key]) ?? null
  } catch {
    return null
  }
}

function set(key: StorageKey, value: string): void {
  try {
    getStorage()?.setItem(KEYS[key], value)
  } catch {
    // localStorage unavailable in private browsing
  }
}

function isHintDismissed(modelId: string): boolean {
  try {
    return getStorage()?.getItem(`${PREFIX}hint-${modelId}`) === 'true'
  } catch {
    return false
  }
}

function dismissHint(modelId: string): void {
  try {
    getStorage()?.setItem(`${PREFIX}hint-${modelId}`, 'true')
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
