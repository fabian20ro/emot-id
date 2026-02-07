import { storage } from './storage'

const ONE_DAY_MS = 24 * 60 * 60 * 1000
const REMINDER_TAG = 'emot-id-daily-check-in'

export type ReminderEnableResult = 'enabled' | 'disabled' | 'denied' | 'unsupported'

export function isReminderSupported(): boolean {
  return typeof window !== 'undefined' && typeof globalThis.Notification !== 'undefined'
}

export function getReminderPermission(): NotificationPermission | 'unsupported' {
  if (!isReminderSupported()) return 'unsupported'
  return Notification.permission
}

export function isDailyReminderEnabled(): boolean {
  return storage.get('dailyReminderEnabled') === 'true'
}

function setDailyReminderEnabled(enabled: boolean): void {
  storage.set('dailyReminderEnabled', String(enabled))
}

export async function updateDailyReminder(enabled: boolean): Promise<ReminderEnableResult> {
  if (!enabled) {
    setDailyReminderEnabled(false)
    return 'disabled'
  }

  if (!isReminderSupported()) {
    setDailyReminderEnabled(false)
    return 'unsupported'
  }

  const currentPermission = Notification.permission
  if (currentPermission === 'granted') {
    setDailyReminderEnabled(true)
    return 'enabled'
  }
  if (currentPermission === 'denied') {
    setDailyReminderEnabled(false)
    return 'denied'
  }

  const permission = await Notification.requestPermission()
  if (permission !== 'granted') {
    setDailyReminderEnabled(false)
    return 'denied'
  }

  setDailyReminderEnabled(true)
  return 'enabled'
}

async function showNotification(title: string, body: string): Promise<void> {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready
      await registration.showNotification(title, { body, tag: REMINDER_TAG })
      return
    } catch {
      // Fall back to window notifications.
    }
  }

  // eslint-disable-next-line no-new
  new Notification(title, { body, tag: REMINDER_TAG })
}

export async function maybeSendDailyReminder(payload: { title: string; body: string }): Promise<boolean> {
  if (!isDailyReminderEnabled()) return false
  if (!isReminderSupported()) return false
  if (Notification.permission !== 'granted') return false

  const now = Date.now()
  const lastSentRaw = storage.get('dailyReminderLastSentAt')
  const lastSent = lastSentRaw ? Number(lastSentRaw) : 0
  if (Number.isFinite(lastSent) && now - lastSent < ONE_DAY_MS) return false

  try {
    await showNotification(payload.title, payload.body)
    storage.set('dailyReminderLastSentAt', String(now))
    return true
  } catch {
    return false
  }
}
