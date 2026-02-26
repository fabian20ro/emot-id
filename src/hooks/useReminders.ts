import { useState, useCallback, useEffect } from 'react'
import { storage } from '../data/storage'
import {
  getReminderPermission,
  isDailyReminderEnabled,
  isReminderSupported,
  maybeSendDailyReminder,
  updateDailyReminder,
} from '../data/reminders'

export function useReminders(remindersT: Record<string, string>) {
  const [dailyReminderEnabled, setDailyReminderEnabled] = useState(() => isDailyReminderEnabled())

  const handleDailyReminderChange = useCallback(async (enabled: boolean) => {
    const result = await updateDailyReminder(enabled)
    if (result === 'enabled') {
      storage.set('dailyReminderLastSentAt', String(Date.now()))
      setDailyReminderEnabled(true)
      return
    }

    setDailyReminderEnabled(false)
    if (result === 'denied') {
      window.alert(remindersT.permissionDenied ?? 'Notifications are blocked. You can enable them from browser settings.')
    }
    if (result === 'unsupported') {
      window.alert(remindersT.unsupported ?? 'Notifications are not supported on this device.')
    }
  }, [remindersT])

  useEffect(() => {
    if (!dailyReminderEnabled) return

    const maybeNotify = () => {
      if (document.visibilityState === 'visible') return
      maybeSendDailyReminder({
        title: remindersT.notificationTitle ?? 'Time for a quick emotional check-in',
        body: remindersT.notificationBody ?? 'Take 30 seconds to notice what you feel.',
      }).catch(() => { /* best-effort notification */ })
    }

    maybeNotify()
    const intervalId = window.setInterval(maybeNotify, 60 * 1000)
    document.addEventListener('visibilitychange', maybeNotify)
    return () => {
      window.clearInterval(intervalId)
      document.removeEventListener('visibilitychange', maybeNotify)
    }
  }, [dailyReminderEnabled, remindersT])

  const reminderPermission = getReminderPermission()
  const reminderSupported = isReminderSupported()

  return {
    dailyReminderEnabled,
    reminderPermission,
    reminderSupported,
    handleDailyReminderChange,
  }
}
