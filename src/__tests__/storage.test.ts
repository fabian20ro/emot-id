import { describe, it, expect, vi, beforeEach } from 'vitest'
import { storage } from '../data/storage'

describe('storage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('get', () => {
    it('returns value from localStorage', () => {
      const getItemSpy = vi.spyOn(window.localStorage, 'getItem').mockReturnValue('test-value')
      const result = storage.get('model')
      expect(result).toBe('test-value')
      expect(getItemSpy).toHaveBeenCalledWith('emot-id-model')
    })

    it('returns null when localStorage returns null', () => {
      vi.spyOn(window.localStorage, 'getItem').mockReturnValue(null)
      const result = storage.get('model')
      expect(result).toBe(null)
    })

    it('returns null and catches error when localStorage.getItem throws', () => {
      vi.spyOn(window.localStorage, 'getItem').mockImplementation(() => {
        throw new Error('Storage disabled')
      })
      const result = storage.get('model')
      expect(result).toBe(null)
    })
  })

  describe('set', () => {
    it('sets value in localStorage', () => {
      const setItemSpy = vi.spyOn(window.localStorage, 'setItem')
      storage.set('model', 'new-model')
      expect(setItemSpy).toHaveBeenCalledWith('emot-id-model', 'new-model')
    })

    it('catches error when localStorage.setItem throws', () => {
      vi.spyOn(window.localStorage, 'setItem').mockImplementation(() => {
        throw new Error('Quota exceeded')
      })
      expect(() => storage.set('model', 'new-model')).not.toThrow()
    })
  })

  describe('isHintDismissed', () => {
    it('returns true if hint is set to "true"', () => {
      vi.spyOn(window.localStorage, 'getItem').mockReturnValue('true')
      const result = storage.isHintDismissed('test-model')
      expect(result).toBe(true)
      expect(window.localStorage.getItem).toHaveBeenCalledWith('emot-id-hint-test-model')
    })

    it('returns false if hint is not "true"', () => {
      vi.spyOn(window.localStorage, 'getItem').mockReturnValue('false')
      expect(storage.isHintDismissed('test-model')).toBe(false)
    })

    it('returns false and catches error when localStorage.getItem throws', () => {
      vi.spyOn(window.localStorage, 'getItem').mockImplementation(() => {
        throw new Error('Storage disabled')
      })
      const result = storage.isHintDismissed('test-model')
      expect(result).toBe(false)
    })
  })

  describe('dismissHint', () => {
    it('sets hint to "true" in localStorage', () => {
      const setItemSpy = vi.spyOn(window.localStorage, 'setItem')
      storage.dismissHint('test-model')
      expect(setItemSpy).toHaveBeenCalledWith('emot-id-hint-test-model', 'true')
    })

    it('catches error when localStorage.setItem throws', () => {
      vi.spyOn(window.localStorage, 'setItem').mockImplementation(() => {
        throw new Error('Quota exceeded')
      })
      expect(() => storage.dismissHint('test-model')).not.toThrow()
    })
  })
})
