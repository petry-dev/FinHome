export interface PersonReport {
  name: string
  totalIncome: number
  totalExpense: number
  balance: number
}

export interface ReportSummary {
  details: PersonReport[]
  grandTotalIncome: number
  grandTotalExpense: number
  grandBalance: number
}
