import apiClient from './client'
import type { Category } from '@/domain/categories/types'
import type { PagedResult } from './people'

export async function fetchCategories(pageSize = 100): Promise<PagedResult<Category>> {
  const res = await apiClient.get<PagedResult<Category>>(`/api/categories?pageSize=${pageSize}`)
  return res.data
}

export async function createCategory(payload: Omit<Category, 'id'>): Promise<Category> {
  const res = await apiClient.post<Category>('/api/categories', payload)
  return res.data
}

export async function updateCategory(id: number, payload: Omit<Category, 'id'>): Promise<void> {
  await apiClient.put(`/api/categories/${id}`, payload)
}

export async function deleteCategory(id: number): Promise<void> {
  await apiClient.delete(`/api/categories/${id}`)
}
