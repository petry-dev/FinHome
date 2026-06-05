import apiClient from './client'
import type { Person } from '@/domain/people/types'

export interface PagedResult<T> {
  items: T[]
  totalCount: number
  page: number
  pageSize: number
}

export async function fetchPeople(pageSize = 100): Promise<PagedResult<Person>> {
  const res = await apiClient.get<PagedResult<Person>>(`/api/people?pageSize=${pageSize}`)
  return res.data
}

export async function createPerson(payload: Omit<Person, 'id'>): Promise<Person> {
  const res = await apiClient.post<Person>('/api/people', payload)
  return res.data
}

export async function updatePerson(id: number, payload: Omit<Person, 'id'>): Promise<void> {
  await apiClient.put(`/api/people/${id}`, payload)
}

export async function deletePerson(id: number): Promise<void> {
  await apiClient.delete(`/api/people/${id}`)
}
