import { describe, it, expect } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { server } from '@/mocks/server'
import { usePeople } from '@/application/people/usePeople'

const BASE = 'http://localhost:5000'

describe('usePeople', () => {
  it('loads people list on mount (length === 2)', async () => {
    const { result } = renderHook(() => usePeople())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.people).toHaveLength(2)
  })

  it('sets isLoading=true during load, false after', async () => {
    const { result } = renderHook(() => usePeople())

    // Initially loading
    expect(result.current.isLoading).toBe(true)

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
  })

  it('sets error string on API failure', async () => {
    server.use(
      http.get(`${BASE}/api/people`, () => HttpResponse.error()),
    )

    const { result } = renderHook(() => usePeople())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.error).toBeTruthy()
  })

  it('create() calls POST, returns true on success', async () => {
    const { result } = renderHook(() => usePeople())

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    let success: boolean | undefined
    await act(async () => {
      success = await result.current.create({ name: 'Carlos', age: 25 })
    })

    expect(success).toBe(true)
  })

  it('remove() calls DELETE, removes from list', async () => {
    const { result } = renderHook(() => usePeople())

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.people).toHaveLength(2)

    await act(async () => {
      await result.current.remove(1, 'Alice Silva')
    })

    expect(result.current.people.find(p => p.id === 1)).toBeUndefined()
  })
})
