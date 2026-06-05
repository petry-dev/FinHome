'use client'

import { useState, useEffect, useCallback } from 'react'
import { fetchCategories, createCategory, updateCategory, deleteCategory } from '@/infrastructure/api/categories'
import { parseProblemDetail } from '@/infrastructure/api/client'
import { toast } from '@/hooks/useToast'
import type { Category } from '@/domain/categories/types'

export type { Category }

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await fetchCategories()
      setCategories(data.items)
    } catch (err) {
      setError(parseProblemDetail(err))
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function create(payload: Omit<Category, 'id'>): Promise<boolean> {
    try {
      await createCategory(payload)
      toast({ tone: 'success', title: 'Categoria criada', message: payload.name })
      await load()
      return true
    } catch (err) {
      toast({ tone: 'error', title: 'Erro ao criar', message: parseProblemDetail(err) })
      return false
    }
  }

  async function update(id: number, payload: Omit<Category, 'id'>): Promise<boolean> {
    try {
      await updateCategory(id, payload)
      toast({ tone: 'success', title: 'Categoria atualizada', message: payload.name })
      await load()
      return true
    } catch (err) {
      toast({ tone: 'error', title: 'Erro ao atualizar', message: parseProblemDetail(err) })
      return false
    }
  }

  async function remove(id: number, name?: string): Promise<boolean> {
    try {
      await deleteCategory(id)
      toast({ tone: 'info', title: 'Categoria excluída', message: name })
      setCategories(prev => prev.filter(c => c.id !== id))
      return true
    } catch (err) {
      toast({ tone: 'error', title: 'Erro ao excluir', message: parseProblemDetail(err) })
      return false
    }
  }

  return { categories, isLoading, error, load, create, update, remove }
}
