import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import { maybeSendDailyReminder, updateDailyReminder } from '../data/reminders'
import { storage } from '../data/storage'

const originalNotification = globalThis.Notification

function mockNotification(permission: NotificationPermission, requestResult: NotificationPermission = permission) {
  const constructorSpy = vi.fn()
  const mock = Object.assign(constructorSpy, {
    permission,
    requestPermission: vi.fn().mockResolvedValue(requestResult),
  })
  vi.stubGlobal('Notification', mock)
  return { constructorSpy, mock }
}

describe('reminders', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  afterEach(() => {
    if (originalNotification) {
      vi.stubGlobal('Notification', originalNotification)
    } else {
      vi.unstubAllGlobals()
    }
  })

  it('returns unsupported when Notification API is unavailable', async () => {
    vi.stubGlobal('Notification', undefined)
    const setSpy = vi.spyOn(storage, 'set').mockImplementation(() => {})

    const result = await updateDailyReminder(true)

    expect(result).toBe('unsupported')
    expect(setSpy).toHaveBeenCalledWith('dailyReminderEnabled', 'false')
  })

  it('enables reminders immediately when notification permission is granted', async () => {
    mockNotification('granted')
    const setSpy = vi.spyOn(storage, 'set').mockImplementation(() => {})

    const result = await updateDailyReminder(true)

    expect(result).toBe('enabled')
    expect(setSpy).toHaveBeenCalledWith('dailyReminderEnabled', 'true')
  })

  it('returns denied when permission prompt is rejected', async () => {
    mockNotification('default', 'denied')
    const setSpy = vi.spyOn(storage, 'set').mockImplementation(() => {})

    const result = await updateDailyReminder(true)

    expect(result).toBe('denied')
    expect(setSpy).toHaveBeenCalledWith('dailyReminderEnabled', 'false')
  })

  it('disables reminders without requesting permissions when toggled off', async () => {
    const { mock } = mockNotification('granted')
    const setSpy = vi.spyOn(storage, 'set').mockImplementation(() => {})

    const result = await updateDailyReminder(false)

    expect(result).toBe('disabled')
    expect(mock.requestPermission).not.toHaveBeenCalled()
    expect(setSpy).toHaveBeenCalledWith('dailyReminderEnabled', 'false')
  })

  it('sends at most one reminder per 24h cadence', async () => {
    const { constructorSpy } = mockNotification('granted')
    const setSpy = vi.spyOn(storage, 'set').mockImplementation(() => {})
    vi.spyOn(storage, 'get').mockImplementation((key) => {
      if (key === 'dailyReminderEnabled') return 'true'
      if (key === 'dailyReminderLastSentAt') return null
      return null
    })

    const first = await maybeSendDailyReminder({
      title: 'Check in',
      body: 'Take a breath',
    })
    vi.spyOn(storage, 'get').mockImplementation((key) => {
      if (key === 'dailyReminderEnabled') return 'true'
      if (key === 'dailyReminderLastSentAt') return String(Date.now())
      return null
    })
    const second = await maybeSendDailyReminder({
      title: 'Check in',
      body: 'Take a breath',
    })

    expect(first).toBe(true)
    expect(second).toBe(false)
    expect(constructorSpy).toHaveBeenCalledTimes(1)
    expect(setSpy).toHaveBeenCalledWith('dailyReminderLastSentAt', expect.any(String))
  })
})
