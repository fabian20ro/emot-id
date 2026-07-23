import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Session } from '../data/types'

const idb = vi.hoisted(() => ({
  values: vi.fn(),
}))

vi.mock('idb-keyval', () => ({
  createStore: vi.fn(() => ({})),
  set: vi.fn(),
  del: vi.fn(),
  keys: vi.fn(),
  values: idb.values,
}))

import { exportSessionsJSON } from '../data/session-repo'

describe('session JSON export', () => {
  beforeEach(() => idb.values.mockReset())

  it('preserves the optional selected need', async () => {
    const session: Session = {
      id: 'session-1',
      timestamp: 1,
      modelId: 'wheel',
      selections: [],
      results: [],
      crisisTier: 'none',
      selectedNeed: 'quiet and rest',
    }
    idb.values.mockResolvedValue([session])

    const exported = JSON.parse(await exportSessionsJSON()) as Session[]

    expect(exported).toHaveLength(1)
    expect(exported[0].selectedNeed).toBe('quiet and rest')
  })
})
