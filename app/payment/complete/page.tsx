'use client'

import { useEffect, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { MobileLayout } from '@/components/layout/mobile-layout'
import { Card } from '@/components/ui/card'

function PaymentCompleteContent() {
  const router = useRouter()

  // 결제 서비스 준비 중이므로 바로 홈으로 리다이렉트
  useEffect(() => {
    router.push('/')
  }, [router])

  return null
}

function LoadingFallback() {
  return (
    <MobileLayout
      header={
        <div className="px-4 py-3">
          <h1 className="w-full text-center text-lg font-semibold">
            결제 처리 중...
          </h1>
        </div>
      }
    >
      <div className="flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center px-4">
        <Card className="w-full max-w-md p-8 text-center">
          <div className="animate-pulse space-y-4">
            <div className="mx-auto h-20 w-20 rounded-full bg-gray-200"></div>
            <div className="mx-auto h-8 w-3/4 rounded bg-gray-200"></div>
            <div className="h-4 w-full rounded bg-gray-200"></div>
            <div className="h-10 w-full rounded bg-gray-200"></div>
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
