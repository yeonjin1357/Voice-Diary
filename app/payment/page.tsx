'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { MobileLayout } from '@/components/layout/mobile-layout'
// import { TossPaymentsCheckout } from '@/components/payment/tosspayments-checkout'
// import { SimplePayment } from '@/components/payment/simple-payment'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

function PaymentContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [user, setUser] = useState<{
    id: string
    email: string
    name?: string
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        toast.error('로그인이 필요합니다')
        router.push('/auth/login')
        return
      }

      // 사용자 프로필 가져오기
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profile?.subscription_tier === 'premium') {
        toast.info('이미 프리미엄 회원입니다')
        router.push('/subscription')
        return
      }

      setUser({
        id: user.id,
        email: user.email || '',
        name: profile?.name || user.user_metadata?.name,
      })
      setLoading(false)
    }

    checkUser()
  }, [supabase, router])

  const header = (
    <div className="flex items-center px-4 py-3">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => router.back()}
        className="mr-2"
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>
      <h1 className="text-lg font-semibold">결제하기</h1>
    </div>
  )

  if (loading || !user) {
    return (
      <MobileLayout header={header}>
        <div className="flex h-screen items-center justify-center">
          <p className="text-gray-500">로딩 중...</p>
        </div>
      </MobileLayout>
    )
  }

  return (
    <MobileLayout header={header}>
      <div className="px-4 py-6">
        <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4 mb-6">
          <h2 className="text-lg font-semibold text-yellow-900 mb-2">
            결제 서비스 준비 중
          </h2>
          <p className="text-yellow-800">
            현재 결제 서비스를 준비하고 있습니다. 
            빠른 시일 내에 프리미엄 서비스를 제공할 예정이니 조금만 기다려주세요.
          </p>
        </div>
        <div className="text-center">
          <Button
            onClick={() => router.back()}
            variant="outline"
            className="mt-4"
          >
            돌아가기
          </Button>
        </div>
      </div>
    </MobileLayout>
  )
}

function LoadingFallback() {
  const router = useRouter()

  const header = (
    <div className="flex items-center px-4 py-3">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => router.back()}
        className="mr-2"
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>
      <h1 className="text-lg font-semibold">결제하기</h1>
    </div>
  )

  return (
    <MobileLayout header={header}>
      <div className="flex h-screen items-center justify-center">
        <p className="text-gray-500">로딩 중...</p>
      </div>
    </MobileLayout>
  )
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <PaymentContent />
    </Suspense>
  )
}
