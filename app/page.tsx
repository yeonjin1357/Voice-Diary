'use client'

import { MobileLayout } from '@/components/layout/mobile-layout'
import { PWAInstallPrompt } from '@/components/PWAInstallPrompt'
import { Card } from '@/components/ui/card'
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
      <div className="px-4 py-6 space-y-6">
        {/* 인사말 섹션 */}
        <section className="text-center py-8">
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            {user ? `안녕하세요, ${user.user_metadata?.name || user.email?.split('@')[0] || ''}님!` : '안녕하세요!'} 👋
          </h1>
          <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
            {today}
          </p>
          <p className="mt-4 text-base text-neutral-700 dark:text-neutral-300">
            오늘의 이야기를 들려주세요
          </p>
        </section>

        {/* 빠른 녹음 버튼 */}
        <Link href="/record" className="block">
          <Card className="p-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 shadow-xl hover:shadow-2xl transform transition-all hover:scale-[1.02]">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">오늘의 일기 녹음하기</h2>
                <p className="text-sm text-white/90 mt-1">
                  음성으로 편하게 기록해보세요
                </p>
              </div>
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <Mic className="w-6 h-6" />
              </div>
            </div>
          </Card>
        </Link>

        {/* 기능 카드들 */}
        <section className="grid grid-cols-2 gap-4">
          <Link href="/diary">
            <Card className="p-4 hover:shadow-lg hover:border-purple-300 dark:hover:border-purple-700 transition-all transform hover:scale-[1.02]">
              <Calendar className="w-6 h-6 text-purple-500 mb-3" />
              <h3 className="font-medium text-sm">지난 일기</h3>
              <p className="text-xs text-neutral-500 mt-1">기록된 일기 보기</p>
            </Card>
          </Link>

          <Link href="/insights">
            <Card className="p-4 hover:shadow-lg hover:border-purple-300 dark:hover:border-purple-700 transition-all transform hover:scale-[1.02]">
              <Brain className="w-6 h-6 text-purple-500 mb-3" />
              <h3 className="font-medium text-sm">감정 분석</h3>
              <p className="text-xs text-neutral-500 mt-1">AI 인사이트</p>
            </Card>
          </Link>
        </section>

        {/* 최근 감정 트렌드 미리보기 */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-sm">이번 주 감정 변화</h3>
            <TrendingUp className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="h-20 bg-neutral-100 dark:bg-neutral-800 rounded-lg flex items-center justify-center">
            <p className="text-xs text-neutral-500">아직 기록된 일기가 없어요</p>
          </div>
        </Card>
      </div>
      
      <PWAInstallPrompt />
    </MobileLayout>
  )
}