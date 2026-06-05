'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  fetchTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from '@/infrastructure/api/transactions'
import { parseProblemDetail } from '@/infrastructure/api/client'
import { toast } from '@/hooks/useToast'
import type { Transaction } from '@/domain/transactions/types'

export type { Transaction }

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await fetchTransactions()
      setTransactions(data.items)
    } catch (err) {
      setError(parseProblemDetail(err))
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function create(payload: Omit<Transaction, 'id' | 'personName' | 'categoryName'>): Promise<boolean> {
    try {
      await createTransaction(payload)
      toast({ tone: 'success', title: 'Transação lançada', message: payload.description })
      await load()
      return true
    } catch (err) {
      toast({ tone: 'error', title: 'Erro ao lançar', message: parseProblemDetail(err) })
      return false
    }
  }

  async function update(
    id: number,
    payload: Omit<Transaction, 'id' | 'personName' | 'categoryName'>,
  ): Promise<boolean> {
    try {
      await updateTransaction(id, payload)
      toast({ tone: 'success', title: 'Transação atualizada', message: payload.description })
      await load()
      return true
    } catch (err) {
      toast({ tone: 'error', title: 'Erro ao atualizar', message: parseProblemDetail(err) })
      return false
    }
  }

  async function remove(id: number, description?: string): Promise<boolean> {
    try {
      await deleteTransaction(id)
      toast({ tone: 'info', title: 'Transação excluída', message: description })
      setTransactions(prev => prev.filter(t => t.id !== id))
      return true
    } catch (err) {
      toast({ tone: 'error', title: 'Erro ao excluir', message: parseProblemDetail(err) })
      return false
    }
  }

  return { transactions, isLoading, error, load, create, update, remove }
}
