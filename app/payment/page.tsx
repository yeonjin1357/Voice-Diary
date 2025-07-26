'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { MobileLayout } from '@/components/layout/mobile-layout'
import { TossPaymentsCheckout } from '@/components/payment/tosspayments-checkout'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

function PaymentContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const billingCycle = (searchParams.get('plan') || 'monthly') as 'monthly' | 'yearly'
  
  const [user, setUser] = useState<{
    id: string
    email: string
    name?: string
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
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
        <div className="flex items-center justify-center h-screen">
          <p className="text-gray-500">로딩 중...</p>
        </div>
      </MobileLayout>
    )
  }

  return (
    <MobileLayout header={header}>
      <div className="px-4 py-6">
        <TossPaymentsCheckout
          billingCycle={billingCycle}
          userEmail={user.email}
          userId={user.id}
          userName={user.name}
        />
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
      <div className="flex items-center justify-center h-screen">
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