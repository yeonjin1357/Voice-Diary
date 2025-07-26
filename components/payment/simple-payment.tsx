'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Crown, Check } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { nanoid } from 'nanoid'
import { SUBSCRIPTION_PRICES, formatPrice } from '@/lib/constants/subscription'

interface SimplePaymentProps {
  billingCycle: 'monthly' | 'yearly'
  userEmail: string
  userId: string
  userName?: string
}

export function SimplePayment({
  billingCycle,
  userEmail,
  userId,
  userName = '구매자',
}: SimplePaymentProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const supabase = createClient()
  
  const price = SUBSCRIPTION_PRICES.premium[billingCycle]
  const orderName = `Voice Diary 프리미엄 구독 (${billingCycle === 'monthly' ? '월간' : '연간'})`
  const orderId = `ORDER_${nanoid()}`

  const handlePayment = async () => {
    setIsProcessing(true)
    
    try {
      // 주문 정보를 먼저 DB에 저장
      const { error: orderError } = await supabase
        .from('payment_history')
        .insert({
          user_id: userId,
          amount: price,
          currency: 'krw',
          status: 'pending',
          description: orderName,
          payment_method: 'tosspayments',
          metadata: {
            billing_cycle: billingCycle,
            order_id: orderId,
          },
        })

      if (orderError) throw orderError

      // TossPayments 테스트 결제 페이지로 이동
      const params = new URLSearchParams({
        amount: price.toString(),
        orderId,
        orderName,
        customerName: userName,
        customerEmail: userEmail,
        successUrl: `${window.location.origin}/api/payment/success`,
        failUrl: `${window.location.origin}/api/payment/fail`,
      })

      // 테스트 환경 URL로 직접 이동
      window.location.href = `https://pay.tosspayments.com/cert/test_ck_vZnjEJeQVxRMD1NORwQY8PmOoBN0?${params.toString()}`
      
    } catch (error) {
      console.error('결제 요청 실패:', error)
      toast.error('결제 처리 중 오류가 발생했습니다')
      setIsProcessing(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* 상품 정보 */}
      <Card className="p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500">
            <Crown className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">프리미엄 구독</h3>
            <p className="text-sm text-gray-500">
              {billingCycle === 'monthly' ? '월간 결제' : '연간 결제'}
            </p>
          </div>
        </div>

        <div className="mb-6 space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <Check className="h-4 w-4 text-green-500" />
            <span>녹음 시간 10분으로 확대</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <Check className="h-4 w-4 text-green-500" />
            <span>무제한 일기 작성</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <Check className="h-4 w-4 text-green-500" />
            <span>일기 PDF 내보내기</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <Check className="h-4 w-4 text-green-500" />
            <span>고급 감정 인사이트</span>
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">결제 금액</span>
            <span className="text-2xl font-bold text-gray-900">
              ₩{formatPrice(price)}
            </span>
          </div>
          {billingCycle === 'yearly' && (
            <p className="mt-1 text-right text-sm text-gray-500">
              월 ₩{formatPrice(Math.round(price / 12))}에 해당
            </p>
          )}
        </div>
      </Card>

      {/* 테스트 결제 안내 */}
      <Card className="bg-blue-50 p-4">
        <h4 className="mb-2 font-semibold text-blue-900">테스트 결제 안내</h4>
        <div className="space-y-1 text-sm text-blue-700">
          <p>• 테스트 카드번호: 4242-4242-4242-4242</p>
          <p>• 유효기간: 미래 날짜 아무거나</p>
          <p>• CVC: 아무 숫자 3자리</p>
          <p>• 비밀번호: 아무 숫자 2자리</p>
        </div>
      </Card>

      {/* 결제 버튼 */}
      <Button
        onClick={handlePayment}
        disabled={isProcessing}
        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 disabled:opacity-50"
        size="lg"
      >
        {isProcessing ? '처리 중...' : `₩${formatPrice(price)} 결제하기`}
      </Button>

      {/* 안내 문구 */}
      <div className="space-y-1 text-center text-xs text-gray-500">
        <p>• 언제든지 구독을 취소할 수 있습니다</p>
        <p>• 결제는 토스페이먼츠를 통해 안전하게 처리됩니다</p>
      </div>
    </div>
  )
}