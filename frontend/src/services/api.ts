import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000',
});

interface ProblemDetails {
  detail?: string;
  errors?: Record<string, string[]>;
}

export function parseProblemDetail(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as ProblemDetails | undefined;
    if (data?.detail) return data.detail;
    if (data?.errors) return Object.values(data.errors).flat().join('\n');
  }
  return 'An unexpected error occurred.';
}

export default api;
