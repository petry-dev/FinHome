import { http, HttpResponse } from 'msw'
import { MOCK_PEOPLE, MOCK_CATEGORIES, MOCK_TRANSACTIONS, MOCK_REPORT } from './data'

const BASE = 'http://localhost:5000'

export const handlers = [
  // People
  http.get(`${BASE}/api/people`, () => {
    return HttpResponse.json({ items: MOCK_PEOPLE, totalCount: MOCK_PEOPLE.length, page: 1, pageSize: 100 })
  }),
  http.post(`${BASE}/api/people`, async ({ request }) => {
    const body = await request.json() as Record<string, unknown>
    return HttpResponse.json({ id: 99, ...body }, { status: 201 })
  }),
  http.put(`${BASE}/api/people/:id`, () => {
    return new HttpResponse(null, { status: 204 })
  }),
  http.delete(`${BASE}/api/people/:id`, () => {
    return new HttpResponse(null, { status: 204 })
  }),

  // Categories
  http.get(`${BASE}/api/categories`, () => {
    return HttpResponse.json({ items: MOCK_CATEGORIES, totalCount: MOCK_CATEGORIES.length, page: 1, pageSize: 100 })
  }),
  http.post(`${BASE}/api/categories`, async ({ request }) => {
    const body = await request.json() as Record<string, unknown>
    return HttpResponse.json({ id: 99, ...body }, { status: 201 })
  }),
  http.put(`${BASE}/api/categories/:id`, () => {
    return new HttpResponse(null, { status: 204 })
  }),
  http.delete(`${BASE}/api/categories/:id`, () => {
    return new HttpResponse(null, { status: 204 })
  }),

  // Transactions
  http.get(`${BASE}/api/transactions`, () => {
    return HttpResponse.json({ items: MOCK_TRANSACTIONS, totalCount: MOCK_TRANSACTIONS.length, page: 1, pageSize: 100 })
  }),
  http.post(`${BASE}/api/transactions`, async ({ request }) => {
    const body = await request.json() as Record<string, unknown>
    return HttpResponse.json({ id: 99, ...body }, { status: 201 })
  }),
  http.put(`${BASE}/api/transactions/:id`, () => {
    return new HttpResponse(null, { status: 204 })
  }),
  http.delete(`${BASE}/api/transactions/:id`, () => {
    return new HttpResponse(null, { status: 204 })
  }),

  // Reports
  http.get(`${BASE}/api/reports/by-person`, () => {
    return HttpResponse.json(MOCK_REPORT)
  }),
]
