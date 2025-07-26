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
  
  // 결제 서비스 준비 중이므로 바로 홈으로 리다이렉트
  useEffect(() => {
    router.push('/')
  }, [router])
  
  return null

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