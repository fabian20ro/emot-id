import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useModelSelection } from '../hooks/useModelSelection'
import { storage } from '../data/storage'
import { defaultModelId } from '../models/registry'

vi.mock('../data/storage', () => ({
  storage: {
    get: vi.fn(),
    set: vi.fn(),
  },
}))

describe('useModelSelection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('initializes with defaultModelId when storage is empty', () => {
    vi.mocked(storage.get).mockReturnValue(null)

    const { result } = renderHook(() => useModelSelection())

    expect(result.current.modelId).toBe(defaultModelId)
    expect(storage.get).toHaveBeenCalledWith('model')
    // useEffect runs on mount to sync the state back to storage
    expect(storage.set).toHaveBeenCalledWith('model', defaultModelId)
  })

  it('initializes with a valid stored model id', () => {
    // 'wheel' is a valid model ID based on MODEL_IDS
    vi.mocked(storage.get).mockReturnValue('wheel')

    const { result } = renderHook(() => useModelSelection())

    expect(result.current.modelId).toBe('wheel')
    expect(storage.get).toHaveBeenCalledWith('model')
    expect(storage.set).toHaveBeenCalledWith('model', 'wheel')
  })

  it('falls back to defaultModelId if stored value is invalid', () => {
    vi.mocked(storage.get).mockReturnValue('invalid-model-id')

    const { result } = renderHook(() => useModelSelection())

    expect(result.current.modelId).toBe(defaultModelId)
    expect(storage.get).toHaveBeenCalledWith('model')
    expect(storage.set).toHaveBeenCalledWith('model', defaultModelId)
  })

  it('updates modelId and syncs to storage when switchModel is called', () => {
    vi.mocked(storage.get).mockReturnValue(null)

    const { result } = renderHook(() => useModelSelection())

    // Initial sync
    expect(storage.set).toHaveBeenCalledWith('model', defaultModelId)
    vi.mocked(storage.set).mockClear()

    act(() => {
      result.current.switchModel('plutchik')
    })

    expect(result.current.modelId).toBe('plutchik')
    // Should sync new state to storage
    expect(storage.set).toHaveBeenCalledWith('model', 'plutchik')
  })
})
