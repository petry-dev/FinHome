import { CategoryPurpose } from '../categories/types'
import { TransactionType } from './types'

/**
 * Returns true if a person of the given age is allowed to have Income transactions.
 * Rule: persons under 18 can only register Expense transactions.
 */
export function canPersonHaveIncome(age: number): boolean {
  return age >= 18
}

/**
 * Returns true if the given transaction type is compatible with the category purpose.
 *
 * Rules:
 *   - Expense-only category (0) → only Expense type (0)
 *   - Income-only category  (1) → only Income type  (1)
 *   - Both category         (2) → any type
 */
export function isCompatibleWithCategory(
  transactionType: TransactionType,
  categoryPurpose: CategoryPurpose,
): boolean {
  if (categoryPurpose === CategoryPurpose.Both) return true
  return transactionType === (categoryPurpose as unknown as TransactionType)
}
