'use client'

import { useState, useEffect, useCallback } from 'react'
import { fetchPeople, createPerson, updatePerson, deletePerson } from '@/infrastructure/api/people'
import { parseProblemDetail } from '@/infrastructure/api/client'
import { toast } from '@/hooks/useToast'
import type { Person } from '@/domain/people/types'

export type { Person }

export function usePeople() {
  const [people, setPeople] = useState<Person[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await fetchPeople()
      setPeople(data.items)
    } catch (err) {
      setError(parseProblemDetail(err))
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function create(payload: Omit<Person, 'id'>): Promise<boolean> {
    try {
      await createPerson(payload)
      toast({ tone: 'success', title: 'Pessoa adicionada', message: payload.name })
      await load()
      return true
    } catch (err) {
      toast({ tone: 'error', title: 'Erro ao adicionar', message: parseProblemDetail(err) })
      return false
    }
  }

  async function update(id: number, payload: Omit<Person, 'id'>): Promise<boolean> {
    try {
      await updatePerson(id, payload)
      toast({ tone: 'success', title: 'Pessoa atualizada', message: payload.name })
      await load()
      return true
    } catch (err) {
      toast({ tone: 'error', title: 'Erro ao atualizar', message: parseProblemDetail(err) })
      return false
    }
  }

  async function remove(id: number, name?: string): Promise<boolean> {
    try {
      await deletePerson(id)
      toast({ tone: 'info', title: 'Pessoa excluída', message: name })
      setPeople(prev => prev.filter(p => p.id !== id))
      return true
    } catch (err) {
      toast({ tone: 'error', title: 'Erro ao excluir', message: parseProblemDetail(err) })
      return false
    }
  }

  return { people, isLoading, error, load, create, update, remove }
}
