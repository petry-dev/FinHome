import apiClient from './client'
import type { ReportSummary } from '@/domain/reports/types'

export async function fetchReportByPerson(): Promise<ReportSummary> {
  const res = await apiClient.get<ReportSummary>('/api/reports/by-person')
  return res.data
}
