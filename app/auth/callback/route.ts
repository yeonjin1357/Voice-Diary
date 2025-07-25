import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = await createServerSupabaseClient()
    await supabase.auth.exchangeCodeForSession(code)
  }

  // 인증 성공 후 원래 가려던 페이지 또는 일기 목록으로 리다이렉트
  const redirectTo = requestUrl.searchParams.get('redirectedFrom') || '/diary'
  return NextResponse.redirect(new URL(redirectTo, requestUrl.origin))
}