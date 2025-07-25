'use client'

import { MobileLayout } from '@/components/layout/mobile-layout'
import { PWAInstallPrompt } from '@/components/PWAInstallPrompt'
import { MicrophonePermission } from '@/components/ui/microphone-permission'
import { Mic, Calendar, Brain, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User as SupabaseUser } from '@supabase/supabase-js'

export default function Home() {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    
    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])
  const today = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  })

  return (
    <MobileLayout>
      <MicrophonePermission />
      <div className="px-4 py-6 space-y-5 bg-gray-50 min-h-screen">
        {/* 인사말 섹션 */}
        <section className="text-center py-6">
          <h1 className="text-xl font-medium text-gray-900">
            {user ? `안녕하세요, ${user.user_metadata?.name || user.email?.split('@')[0] || ''}님` : '안녕하세요'}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {today}
          </p>
          <p className="mt-3 text-base text-gray-700">
            오늘의 이야기를 들려주세요
          </p>
        </section>

        {/* 빠른 녹음 버튼 */}
        <Link href="/record" className="block">
          <div className="p-6 bg-gray-900 text-white rounded-2xl shadow-sm hover:shadow-md transform transition-all active:scale-[0.98]">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-medium">오늘의 일기 녹음하기</h2>
                <p className="text-sm text-gray-300 mt-1">
                  음성으로 편하게 기록해보세요
                </p>
              </div>
              <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center">
                <Mic className="w-6 h-6" />
              </div>
            </div>
          </div>
        </Link>

        {/* 기능 카드들 */}
        <section className="grid grid-cols-2 gap-3">
          <Link href="/diary">
            <div className="p-5 bg-white rounded-2xl border border-gray-100 hover:shadow-md transition-all active:scale-[0.98]">
              <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center mb-3">
                <Calendar className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="font-medium text-sm text-gray-900">지난 일기</h3>
              <p className="text-xs text-gray-500 mt-1">기록된 일기 보기</p>
            </div>
          </Link>

          <Link href="/insights">
            <div className="p-5 bg-white rounded-2xl border border-gray-100 hover:shadow-md transition-all active:scale-[0.98]">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mb-3">
                <Brain className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-medium text-sm text-gray-900">감정 분석</h3>
              <p className="text-xs text-gray-500 mt-1">AI 인사이트</p>
            </div>
          </Link>
        </section>

        {/* 최근 감정 트렌드 미리보기 */}
        <div className="p-5 bg-white rounded-2xl border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-sm text-gray-900">이번 주 감정 변화</h3>
            <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-gray-600" />
            </div>
          </div>
          <div className="h-24 bg-gray-50 rounded-xl flex items-center justify-center">
            <p className="text-sm text-gray-500">아직 기록된 일기가 없어요</p>
          </div>
        </div>
      </div>
      
      <PWAInstallPrompt />
    </MobileLayout>
  )
}