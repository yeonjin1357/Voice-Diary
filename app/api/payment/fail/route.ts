import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const message = searchParams.get('message')
  const orderId = searchParams.get('orderId')

  // 실패한 결제 내역 업데이트
  if (orderId) {
    try {
      const supabase = await createServerSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        await supabase
          .from('payment_history')
          .update({
            status: 'failed',
            metadata: {
              error_code: code,
              error_message: message,
            }
          })
          .eq('user_id', user.id)
          .eq('metadata->>order_id', orderId)
      }
    } catch (error) {
      console.error('결제 실패 기록 오류:', error)
    }
  }

  // 실패 페이지로 리다이렉트
  const errorMessage = message || '결제가 취소되었습니다'
  return NextResponse.redirect(
    new URL(`/payment/complete?success=false&error=${encodeURIComponent(errorMessage)}`, request.url)
  )
}