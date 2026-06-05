import { CategoryPurpose } from './types'

/**
 * Returns true if a transaction of the given type is compatible with the category purpose.
 *
 * Rules:
 *   - Expense-only category (0) → only accepts type Expense (0)
 *   - Income-only category  (1) → only accepts type Income  (1)
 *   - Both category         (2) → accepts any type
 */
export function isPurposeCompatible(transactionType: number, categoryPurpose: CategoryPurpose): boolean {
  if (categoryPurpose === CategoryPurpose.Both) return true
  return transactionType === categoryPurpose
}
