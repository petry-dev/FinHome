import axios from 'axios'

// Tests (vitest.config.ts injects NEXT_PUBLIC_API_URL): absolute URL so MSW can intercept.
// Dev / Docker / prod (NEXT_PUBLIC_API_URL not set at build): relative /api/proxy → Next.js
// API route (src/app/api/proxy/[...path]/route.ts) forwards to API_URL at request time.
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? '/api/proxy',
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
