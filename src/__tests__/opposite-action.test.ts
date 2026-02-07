import { describe, it, expect } from 'vitest'
import { getOppositeAction } from '../data/opposite-action'

describe('getOppositeAction', () => {
  it('returns a suggestion for shame', () => {
    const result = getOppositeAction(['shame'], 'en')
    expect(result).toContain('approach')
  })

  it('returns a suggestion for fear', () => {
    const result = getOppositeAction(['anxiety', 'worried'], 'en')
    expect(result).toContain('Approach')
  })

  it('returns a suggestion in Romanian', () => {
    const result = getOppositeAction(['anger'], 'ro')
    expect(result).toBeTruthy()
    expect(result).toContain('declansator')
  })

  it('returns null for unknown emotions', () => {
    const result = getOppositeAction(['joy', 'happiness', 'love'], 'en')
    expect(result).toBeNull()
  })

  it('uses the clarified guilt guidance (no repeat-harm wording)', () => {
    const result = getOppositeAction(['guilt'], 'en')
    expect(result).toContain('fits the facts')
    expect(result).not.toContain('do what triggered the guilt again')
  })

  it('matches first applicable pattern', () => {
    const result = getOppositeAction(['shame', 'anger'], 'en')
    expect(result).toContain('approach')
  })
})
