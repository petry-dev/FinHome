import axios from 'axios'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000'

const apiClient = axios.create({
  baseURL: BASE_URL,
})

interface ProblemDetails {
  detail?: string
  errors?: Record<string, string[]>
}

export function parseProblemDetail(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as ProblemDetails | undefined
    if (data?.detail) return data.detail
    if (data?.errors) return Object.values(data.errors).flat().join('\n')
  }
  return 'An unexpected error occurred.'
}

export default apiClient
