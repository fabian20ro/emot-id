import { getCanonicalEmotion } from './index'

describe('getCanonicalEmotion', () => {
  it('should return the correct emotion for a valid id', () => {
    const emotion = getCanonicalEmotion('serene')
    expect(emotion).toBeDefined()
    expect(emotion?.id).toBe('serene')
  })

  it('should return undefined for an invalid id', () => {
    const emotion = getCanonicalEmotion('non-existent')
    expect(emotion).toBeUndefined()
  })

  it('should handle complex emotions', () => {
    const emotion = getCanonicalEmotion('nostalgia')
    expect(emotion?.id).toBe('nostalgia')
  })
})
