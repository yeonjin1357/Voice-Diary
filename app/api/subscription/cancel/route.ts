import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function POST() {
  try {
    const supabase = await createServerSupabaseClient()
    
    // 사용자 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })
    }

    // 현재 구독 정보 조회
    const { data: subscription, error: subError } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    if (subError || !subscription) {
      return NextResponse.json({ error: '활성 구독을 찾을 수 없습니다' }, { status: 404 })
    }

    // 구독 취소 처리 (기간 만료 시 취소)
    const { error: updateSubError } = await supabase
      .from('user_subscriptions')
      .update({
        status: 'canceled',
        cancel_at: subscription.current_period_end,
        canceled_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', subscription.id)

    if (updateSubError) throw updateSubError

    // user_profiles 업데이트 (만료일까지는 프리미엄 유지)
    const { error: updateProfileError } = await supabase
      .from('user_profiles')
      .update({
        subscription_status: 'canceled',
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    if (updateProfileError) throw updateProfileError

    return NextResponse.json({ 
      success: true,
      message: '구독이 취소되었습니다. 현재 결제 기간이 끝날 때까지 프리미엄 기능을 사용할 수 있습니다.',
      cancelAt: subscription.current_period_end
    })
  } catch (error) {
    console.error('구독 취소 오류:', error)
    return NextResponse.json(
      { error: '구독 취소 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}