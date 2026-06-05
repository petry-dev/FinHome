/** CategoryPurpose enum matching the backend:
 * 0 = Expense (Despesa) — only Expense transactions allowed
 * 1 = Income  (Receita) — only Income transactions allowed
 * 2 = Both    (Ambas)   — any transaction type allowed
 */
export enum CategoryPurpose {
  Expense = 0,
  Income = 1,
  Both = 2,
}

export interface Category {
  id: number
  name: string
  purpose: CategoryPurpose
}
