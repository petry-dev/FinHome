import apiClient from './client'
import type { Transaction } from '@/domain/transactions/types'
import type { PagedResult } from './people'

export async function fetchTransactions(pageSize = 100): Promise<PagedResult<Transaction>> {
  const res = await apiClient.get<PagedResult<Transaction>>(`/api/transactions?pageSize=${pageSize}`)
  return res.data
}

export async function createTransaction(payload: Omit<Transaction, 'id' | 'personName' | 'categoryName'>): Promise<Transaction> {
  const res = await apiClient.post<Transaction>('/api/transactions', payload)
  return res.data
}

export async function updateTransaction(
  id: number,
  payload: Omit<Transaction, 'id' | 'personName' | 'categoryName'>,
): Promise<void> {
  await apiClient.put(`/api/transactions/${id}`, payload)
}

export async function deleteTransaction(id: number): Promise<void> {
  await apiClient.delete(`/api/transactions/${id}`)
}
