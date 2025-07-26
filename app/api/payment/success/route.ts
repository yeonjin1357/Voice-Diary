import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const paymentKey = searchParams.get('paymentKey')
  const orderId = searchParams.get('orderId')
  const amount = searchParams.get('amount')

  if (!paymentKey || !orderId || !amount) {
    return NextResponse.redirect(new URL('/payment/fail?error=missing_params', request.url))
  }

  try {
    const supabase = await createServerSupabaseClient()
    
    // 사용자 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    // 토스페이먼츠 결제 승인 API 호출
    const secretKey = process.env.TOSS_SECRET_KEY
    if (!secretKey) {
      throw new Error('토스페이먼츠 시크릿 키가 설정되지 않았습니다')
    }

    const confirmResponse = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(secretKey + ':').toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paymentKey,
        orderId,
        amount: parseInt(amount),
      }),
    })

    if (!confirmResponse.ok) {
      const error = await confirmResponse.json()
      console.error('결제 승인 실패:', error)
      throw new Error(error.message || '결제 승인에 실패했습니다')
    }

    const paymentData = await confirmResponse.json()

    // 주문 ID에서 결제 정보 파싱
    const [, userId, , billingCycle] = orderId.split('_')
    const isYearly = billingCycle === 'yearly'

    // 구독 정보 업데이트
    const now = new Date()
    const subscriptionEndDate = new Date(now)
    subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + (isYearly ? 12 : 1))

    // 트랜잭션으로 처리
    const { error: updateError } = await supabase.rpc('update_subscription', {
      p_user_id: user.id,
      p_subscription_tier: 'premium',
      p_subscription_end_date: subscriptionEndDate.toISOString(),
      p_payment_id: paymentData.paymentKey,
      p_amount: parseInt(amount),
      p_billing_cycle: billingCycle,
    })

    if (updateError) {
      console.error('구독 정보 업데이트 실패:', updateError)
      throw updateError
    }

    // 결제 내역 업데이트
    const { error: paymentError } = await supabase
      .from('payment_history')
      .update({
        status: 'succeeded',
        stripe_payment_intent_id: paymentData.paymentKey,
        metadata: {
          ...paymentData,
          billing_cycle: billingCycle,
        }
      })
      .eq('user_id', user.id)
      .eq('metadata->>order_id', orderId)

    if (paymentError) {
      console.error('결제 내역 업데이트 실패:', paymentError)
    }

    // 성공 페이지로 리다이렉트
    return NextResponse.redirect(new URL('/payment/complete?success=true', request.url))
  } catch (error) {
    console.error('결제 처리 오류:', error)
    return NextResponse.redirect(
      new URL(`/payment/fail?error=${encodeURIComponent('결제 처리 중 오류가 발생했습니다')}`, request.url)
    )
  }
}