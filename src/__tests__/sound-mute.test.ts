import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSound } from '../hooks/useSound'

describe('useSound mute toggle', () => {
  it('defaults to unmuted', () => {
    const { result } = renderHook(() => useSound())
    expect(result.current.muted).toBe(false)
  })

  it('can toggle muted state via setMuted', () => {
    const { result } = renderHook(() => useSound())

    act(() => {
      result.current.setMuted(true)
    })
    expect(result.current.muted).toBe(true)

    act(() => {
      result.current.setMuted(false)
    })
    expect(result.current.muted).toBe(false)
  })

  it('attempts to persist muted state to localStorage', () => {
    const spy = vi.spyOn(window.localStorage, 'setItem')
    const { result } = renderHook(() => useSound())

    act(() => {
      result.current.setMuted(true)
    })

    expect(spy).toHaveBeenCalledWith('emot-id-sound-muted', 'true')
    spy.mockRestore()
  })

  it('returns playSound function that respects muted', () => {
    const { result } = renderHook(() => useSound())

    // Should not throw when muted
    act(() => {
      result.current.setMuted(true)
    })
    expect(() => result.current.playSound('select')).not.toThrow()
    expect(() => result.current.playSound('deselect')).not.toThrow()
  })
})
