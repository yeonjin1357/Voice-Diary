import { NextResponse } from 'next/server'

export class ApiError extends Error {
  constructor(message: string, public statusCode: number = 500) {
    super(message)
    this.name = 'ApiError'
  }
}

export function handleApiError(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json(
      { error: error.message },
      { status: error.statusCode }
    )
  }

  if (error instanceof Error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }

  return NextResponse.json(
    { error: '알 수 없는 오류가 발생했습니다' },
    { status: 500 }
  )
}

export function createAuthHeaders(userId: string) {
  return {
    'x-user-id': userId,
  }
}