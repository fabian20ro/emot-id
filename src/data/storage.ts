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
  allowExternalAI: `${PREFIX}allow-external-ai`,
  theme: `${PREFIX}theme`,
} as const

type StorageKey = keyof typeof KEYS

export interface PreferenceSnapshot {
  model: string | null
  language: 'ro' | 'en'
  soundMuted: boolean
  saveSessions: boolean
  dimensionalAxisHintSeen: boolean
  dailyReminderEnabled: boolean
  dailyReminderLastSentAt: number | null
  simpleLanguage: boolean
  allowExternalAI: boolean
  theme: 'light' | 'dark'
  dismissedHints: string[]
}

const PREFERENCE_KEYS: StorageKey[] = [
  'model',
  'language',
  'soundMuted',
  'saveSessions',
  'dimensionalAxisHintSeen',
  'dailyReminderEnabled',
  'dailyReminderLastSentAt',
  'simpleLanguage',
  'allowExternalAI',
  'theme',
]

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

function getPreferenceSnapshot(): PreferenceSnapshot {
  const reminderTimestamp = Number(get('dailyReminderLastSentAt'))
  const local = getStorage()
  const dismissedHints: string[] = []
  if (local) {
    try {
      for (let index = 0; index < local.length; index++) {
        const key = local.key(index)
        if (key?.startsWith(`${PREFIX}hint-`) && local.getItem(key) === 'true') {
          dismissedHints.push(key.slice(`${PREFIX}hint-`.length))
        }
      }
    } catch {
      // localStorage unavailable
    }
  }
  return {
    model: get('model'),
    language: get('language') === 'ro' ? 'ro' : 'en',
    soundMuted: get('soundMuted') === 'true',
    saveSessions: get('saveSessions') !== 'false',
    dimensionalAxisHintSeen: get('dimensionalAxisHintSeen') === 'true',
    dailyReminderEnabled: get('dailyReminderEnabled') === 'true',
    dailyReminderLastSentAt: Number.isFinite(reminderTimestamp) && reminderTimestamp > 0 ? reminderTimestamp : null,
    simpleLanguage: get('simpleLanguage') === 'true',
    allowExternalAI: get('allowExternalAI') !== 'false',
    theme: get('theme') === 'dark' ? 'dark' : 'light',
    dismissedHints: dismissedHints.sort(),
  }
}

function resetPreferences(): void {
  const local = getStorage()
  if (!local) return
  const keysToRemove: string[] = PREFERENCE_KEYS.map((key) => KEYS[key])
  try {
    for (let index = 0; index < local.length; index++) {
      const key = local.key(index)
      if (key?.startsWith(`${PREFIX}hint-`)) keysToRemove.push(key)
    }
  } catch {
    // localStorage unavailable
  }
  for (const key of keysToRemove) {
    try {
      local.removeItem(key)
    } catch {
      // localStorage unavailable
    }
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
  getPreferenceSnapshot,
  resetPreferences,
  isHintDismissed,
  dismissHint,
} as const
