'use client'

import { MobileLayout } from '@/components/layout/mobile-layout'
import { PWAInstallPrompt } from '@/components/PWAInstallPrompt'
import { MicrophonePermission } from '@/components/ui/microphone-permission'
import { Mic, Calendar, Brain, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'

export default function Home() {
  const { user } = useAuth({ showError: false, requireAuth: false })
  const today = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  })

  return (
    <MobileLayout>
      <MicrophonePermission />
      <div className="space-y-5 bg-gray-50 px-4 py-6">
        {/* 인사말 섹션 */}
        <section className="py-6 text-center">
          <h1 className="text-xl font-medium text-gray-900">
            {user
              ? `안녕하세요, ${user.user_metadata?.name || user.email?.split('@')[0] || ''}님`
              : '안녕하세요'}
          </h1>
          <p className="mt-1 text-sm text-gray-500">{today}</p>
          <p className="mt-3 text-base text-gray-700">
            오늘의 이야기를 들려주세요
          </p>
        </section>

        {/* 빠른 녹음 버튼 */}
        <Link href="/record" className="block">
          <div className="transform rounded-2xl bg-gray-900 p-6 text-white shadow-sm transition-all hover:shadow-md active:scale-[0.98]">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-medium">오늘의 일기 녹음하기</h2>
                <p className="mt-1 text-sm text-gray-300">
                  음성으로 편하게 기록해보세요
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-800">
                <Mic className="h-6 w-6" />
              </div>
            </div>
          </div>
        </Link>

        {/* 기능 카드들 */}
        <section className="grid grid-cols-2 gap-3">
          <Link href="/diary">
            <div className="rounded-2xl border border-gray-100 bg-white p-5 transition-all hover:shadow-md active:scale-[0.98]">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-green-50">
                <Calendar className="h-5 w-5 text-green-600" />
              </div>
              <h3 className="text-sm font-medium text-gray-900">지난 일기</h3>
              <p className="mt-1 text-xs text-gray-500">기록된 일기 보기</p>
            </div>
          </Link>

          <Link href="/insights">
            <div className="rounded-2xl border border-gray-100 bg-white p-5 transition-all hover:shadow-md active:scale-[0.98]">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                <Brain className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="text-sm font-medium text-gray-900">감정 분석</h3>
              <p className="mt-1 text-xs text-gray-500">AI 인사이트</p>
            </div>
          </Link>
        </section>

        {/* 최근 감정 트렌드 미리보기 */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-900">
              이번 주 감정 변화
            </h3>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-50">
              <TrendingUp className="h-4 w-4 text-gray-600" />
            </div>
          </div>
          <div className="flex h-24 items-center justify-center rounded-xl bg-gray-50">
            <p className="text-sm text-gray-500">아직 기록된 일기가 없어요</p>
          </div>
        </div>
      </div>

      <PWAInstallPrompt />
    </MobileLayout>
  )
}
