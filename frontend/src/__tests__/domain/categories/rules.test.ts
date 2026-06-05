import { describe, it, expect } from 'vitest'
import { isPurposeCompatible } from '@/domain/categories/rules'
import { CategoryPurpose } from '@/domain/categories/types'

describe('isPurposeCompatible', () => {
  it('Expense-only category accepts type Expense (0)', () => {
    expect(isPurposeCompatible(0, CategoryPurpose.Expense)).toBe(true)
  })

  it('Expense-only category rejects type Income (1)', () => {
    expect(isPurposeCompatible(1, CategoryPurpose.Expense)).toBe(false)
  })

  it('Income-only category accepts type Income (1)', () => {
    expect(isPurposeCompatible(1, CategoryPurpose.Income)).toBe(true)
  })

  it('Income-only category rejects type Expense (0)', () => {
    expect(isPurposeCompatible(0, CategoryPurpose.Income)).toBe(false)
  })

  it('Both category accepts type Expense (0)', () => {
    expect(isPurposeCompatible(0, CategoryPurpose.Both)).toBe(true)
  })

  it('Both category accepts type Income (1)', () => {
    expect(isPurposeCompatible(1, CategoryPurpose.Both)).toBe(true)
  })
})
