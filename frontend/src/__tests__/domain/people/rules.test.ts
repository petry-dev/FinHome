import { describe, it, expect } from 'vitest'
import { isMinor } from '@/domain/people/rules'

describe('isMinor', () => {
  it('returns true for age < 18', () => {
    expect(isMinor(17)).toBe(true)
    expect(isMinor(1)).toBe(true)
    expect(isMinor(0)).toBe(true)
  })

  it('returns false for age >= 18', () => {
    expect(isMinor(18)).toBe(false)
    expect(isMinor(19)).toBe(false)
    expect(isMinor(65)).toBe(false)
  })

  it('edge case: age exactly 18 is NOT minor', () => {
    expect(isMinor(18)).toBe(false)
  })
})
