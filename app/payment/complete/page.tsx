'use client'

import { useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { MobileLayout } from '@/components/layout/mobile-layout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, Home, FileText } from 'lucide-react'
import confetti from 'canvas-confetti'

function PaymentCompleteContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const success = searchParams.get('success') === 'true'
  const error = searchParams.get('error')

  useEffect(() => {
    if (success) {
      // 성공 시 축하 애니메이션
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      })
    }
  }, [success])

  const header = (
    <div className="px-4 py-3">
      <h1 className="text-lg font-semibold text-center w-full">
        {success ? '결제 완료' : '결제 실패'}
      </h1>
    </div>
  )

  return (
    <MobileLayout header={header}>
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] px-4">
        <Card className="w-full max-w-md p-8 text-center space-y-6">
          {success ? (
            <>
              <CheckCircle className="h-20 w-20 text-green-500 mx-auto" />
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">프리미엄 시작!</h2>
                <p className="text-gray-600">
                  Voice Diary 프리미엄 회원이 되신 것을 환영합니다
                </p>
              </div>
              
              <div className="bg-purple-50 rounded-lg p-4 space-y-2">
                <h3 className="font-semibold text-purple-900">이제 사용 가능한 기능</h3>
                <ul className="text-sm text-purple-700 space-y-1">
                  <li>✓ 최대 10분 음성 녹음</li>
                  <li>✓ 무제한 일기 작성</li>
                  <li>✓ 고급 감정 분석 인사이트</li>
                  <li>✓ 일기 내보내기 및 백업</li>
                </ul>
              </div>
            </>
          ) : (
            <>
              <XCircle className="h-20 w-20 text-red-500 mx-auto" />
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">결제 실패</h2>
                <p className="text-gray-600">
                  {error || '결제 처리 중 문제가 발생했습니다'}
                </p>
              </div>
              
              <p className="text-sm text-gray-500">
                문제가 계속되면 고객센터로 문의해주세요
              </p>
            </>
          )}

          <div className="flex flex-col gap-3">
            <Button
              onClick={() => router.push('/')}
              className="w-full"
              variant={success ? 'default' : 'outline'}
            >
              <Home className="mr-2 h-4 w-4" />
              홈으로 가기
            </Button>
            
            {success && (
              <Button
                onClick={() => router.push('/record')}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
              >
                <FileText className="mr-2 h-4 w-4" />
                일기 작성하기
              </Button>
            )}
            
            {!success && (
              <Button
                onClick={() => router.push('/subscription')}
                className="w-full"
              >
                다시 시도하기
              </Button>
            )}
          </div>
        </Card>
      </div>
    </MobileLayout>
  )
}

function LoadingFallback() {
  return (
    <MobileLayout header={
      <div className="px-4 py-3">
        <h1 className="text-lg font-semibold text-center w-full">
          결제 처리 중...
        </h1>
      </div>
    }>
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] px-4">
        <Card className="w-full max-w-md p-8 text-center">
          <div className="animate-pulse space-y-4">
            <div className="h-20 w-20 bg-gray-200 rounded-full mx-auto"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-10 bg-gray-200 rounded w-full"></div>
          </div>
        </Card>
      </div>
    </MobileLayout>
  )
}

export default function PaymentCompletePage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <PaymentCompleteContent />
    </Suspense>
  )
}