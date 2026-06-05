import { NextRequest, NextResponse } from 'next/server'

const API_URL = process.env.API_URL ?? 'http://localhost:5000'

async function proxy(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
): Promise<NextResponse> {
  const { path } = await params
  const targetUrl = `${API_URL}/${path.join('/')}${request.nextUrl.search}`

  const headers = new Headers()
  const contentType = request.headers.get('content-type')
  if (contentType) headers.set('content-type', contentType)
  const authorization = request.headers.get('authorization')
  if (authorization) headers.set('authorization', authorization)

  const hasBody = request.method !== 'GET' && request.method !== 'HEAD'
  const body = hasBody ? await request.text() : undefined

  const upstream = await fetch(targetUrl, { method: request.method, headers, body })

  const responseBody = await upstream.text()
  return new NextResponse(responseBody, {
    status: upstream.status,
    headers: { 'content-type': upstream.headers.get('content-type') ?? 'application/json' },
  })
}

export const GET    = proxy
export const POST   = proxy
export const PUT    = proxy
export const DELETE = proxy
export const PATCH  = proxy
