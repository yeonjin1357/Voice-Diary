'use client'

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState } from 'react'
import { loadPaymentWidget } from '@tosspayments/payment-widget-sdk'
import { SUBSCRIPTION_PRICES, formatPrice } from '@/lib/constants/subscription'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Crown, Check } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { nanoid } from 'nanoid'

interface TossPaymentsCheckoutProps {
  billingCycle: 'monthly' | 'yearly'
  userEmail: string
  userId: string
  userName?: string
}

export function TossPaymentsCheckout({
  billingCycle,
  userEmail,
  userId,
  userName = '구매자',
}: TossPaymentsCheckoutProps) {
  const [paymentWidget, setPaymentWidget] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [customerKey] = useState(() => `USER_${userId}`)
  const supabase = createClient()

  // 결제 금액 설정
  const price = SUBSCRIPTION_PRICES.premium[billingCycle]
  const orderName = `Voice Diary 프리미엄 구독 (${billingCycle === 'monthly' ? '월간' : '연간'})`
  const orderId = `ORDER_${nanoid()}`

  useEffect(() => {
    const loadWidget = async () => {
      try {
        const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY
        if (!clientKey) {
          throw new Error('토스페이먼츠 클라이언트 키가 설정되지 않았습니다')
        }

        const widget = await loadPaymentWidget(clientKey, customerKey)
        setPaymentWidget(widget)

        // 결제 UI 렌더링
        widget.renderPaymentMethods('#payment-widget', price)
        widget.renderAgreement('#agreement-widget')

        setIsLoading(false)
      } catch (error) {
        console.error('결제 위젯 로드 실패:', error)
        toast.error('결제 시스템 초기화에 실패했습니다')
        setIsLoading(false)
      }
    }

    loadWidget()
  }, [customerKey, price])

  const handlePayment = async () => {
    if (!paymentWidget) {
      toast.error('결제 위젯이 로드되지 않았습니다')
      return
    }

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

      // 토스페이먼츠 결제 요청
      await paymentWidget.requestPayment({
        orderId,
        orderName,
        customerName: userName,
        customerEmail: userEmail,
        successUrl: `${window.location.origin}/api/payment/success`,
        failUrl: `${window.location.origin}/api/payment/fail`,
      })
    } catch (error) {
      console.error('결제 요청 실패:', error)
      toast.error('결제 처리 중 오류가 발생했습니다')
    }
  }

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-40 rounded bg-gray-200"></div>
          <div className="h-10 rounded bg-gray-200"></div>
        </div>
      </Card>
    )
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

      {/* 결제 수단 선택 */}
      <Card className="p-6">
        <h3 className="mb-4 font-semibold text-gray-900">결제 수단 선택</h3>
        <div id="payment-widget" />
      </Card>

      {/* 이용약관 */}
      <div id="agreement-widget" />

      {/* 결제 버튼 */}
      <Button
        onClick={handlePayment}
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700"
        size="lg"
      >
        {isLoading ? '준비 중...' : `₩${formatPrice(price)} 결제하기`}
      </Button>

      {/* 안내 문구 */}
      <div className="space-y-1 text-center text-xs text-gray-500">
        <p>• 언제든지 구독을 취소할 수 있습니다</p>
        <p>• 결제는 토스페이먼츠를 통해 안전하게 처리됩니다</p>
      </div>
    </div>
  )
}
