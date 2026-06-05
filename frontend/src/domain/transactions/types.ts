/** TransactionType enum:
 * 0 = Expense (Despesa)
 * 1 = Income  (Receita)
 */
export enum TransactionType {
  Expense = 0,
  Income = 1,
}

export interface Transaction {
  id: number
  description: string
  amount: number
  type: TransactionType
  date: string
  personId: number
  categoryId: number
  personName: string
  categoryName: string
}
