import { toast } from 'sonner'

export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export const handleError = (error: unknown, fallbackMessage = '오류가 발생했습니다'): void => {
  console.error('Error:', error)
  
  if (error instanceof AppError) {
    toast.error(error.message)
  } else if (error instanceof Error) {
    toast.error(error.message || fallbackMessage)
  } else {
    toast.error(fallbackMessage)
  }
}

export const handleApiError = (error: unknown, fallbackMessage = 'API 요청 중 오류가 발생했습니다'): void => {
  console.error('API Error:', error)
  
  if (error instanceof Response) {
    const statusCode = error.status
    const statusText = error.statusText
    
    switch (statusCode) {
      case 400:
        toast.error('잘못된 요청입니다')
        break
      case 401:
        toast.error('인증이 필요합니다')
        break
      case 403:
        toast.error('권한이 없습니다')
        break
      case 404:
        toast.error('요청한 리소스를 찾을 수 없습니다')
        break
      case 429:
        toast.error('너무 많은 요청을 보냈습니다. 잠시 후 다시 시도해주세요')
        break
      case 500:
        toast.error('서버 오류가 발생했습니다')
        break
      default:
        toast.error(`${statusText || fallbackMessage} (${statusCode})`)
    }
  } else {
    handleError(error, fallbackMessage)
  }
}

export const createErrorResponse = (message: string, statusCode = 500) => {
  return new Response(
    JSON.stringify({ error: message }),
    {
      status: statusCode,
      headers: { 'Content-Type': 'application/json' },
    }
  )
}