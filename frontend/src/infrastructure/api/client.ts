import axios from 'axios'

// Dev/tests: NEXT_PUBLIC_API_URL=http://localhost:5000 → absolute URL, MSW can intercept.
// Docker (no NEXT_PUBLIC_API_URL set at build time): falls back to '/api' → Next.js rewrites
// proxy the request to API_URL on the server side (see next.config.ts).
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? '/api',
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
