/**
 * Returns true if the person is a minor (age < 18).
 * Minors can only have Expense transactions (type === 0).
 */
export function isMinor(age: number): boolean {
  return age < 18
}
