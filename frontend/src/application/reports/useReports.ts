'use client'

import { useState, useEffect, useCallback } from 'react'
import { fetchReportByPerson } from '@/infrastructure/api/reports'
import { parseProblemDetail } from '@/infrastructure/api/client'
import type { ReportSummary } from '@/domain/reports/types'

export type { ReportSummary }

export function useReports() {
  const [data, setData] = useState<ReportSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await fetchReportByPerson()
      setData(result)
    } catch (err) {
      setError(parseProblemDetail(err))
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return { data, isLoading, error, load }
}
