import { describe, it, expect } from 'vitest'
import { canPersonHaveIncome, isCompatibleWithCategory } from '@/domain/transactions/rules'
import { CategoryPurpose } from '@/domain/categories/types'
import { TransactionType } from '@/domain/transactions/types'

describe('canPersonHaveIncome', () => {
  it('returns false for age 17', () => {
    expect(canPersonHaveIncome(17)).toBe(false)
  })

  it('returns true for age 18', () => {
    expect(canPersonHaveIncome(18)).toBe(true)
  })

  it('returns true for adults', () => {
    expect(canPersonHaveIncome(30)).toBe(true)
    expect(canPersonHaveIncome(65)).toBe(true)
  })
})

describe('isCompatibleWithCategory', () => {
  it('Expense/Expense-only → compatible', () => {
    expect(isCompatibleWithCategory(TransactionType.Expense, CategoryPurpose.Expense)).toBe(true)
  })

  it('Income/Income-only → compatible', () => {
    expect(isCompatibleWithCategory(TransactionType.Income, CategoryPurpose.Income)).toBe(true)
  })

  it('Expense/Both → compatible', () => {
    expect(isCompatibleWithCategory(TransactionType.Expense, CategoryPurpose.Both)).toBe(true)
  })

  it('Income/Both → compatible', () => {
    expect(isCompatibleWithCategory(TransactionType.Income, CategoryPurpose.Both)).toBe(true)
  })

  it('Income/Expense-only → incompatible', () => {
    expect(isCompatibleWithCategory(TransactionType.Income, CategoryPurpose.Expense)).toBe(false)
  })

  it('Expense/Income-only → incompatible', () => {
    expect(isCompatibleWithCategory(TransactionType.Expense, CategoryPurpose.Income)).toBe(false)
  })
})
