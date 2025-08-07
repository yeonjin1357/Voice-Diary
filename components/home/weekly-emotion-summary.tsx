'use client'

import { useEffect, useState } from 'react'
import { TrendingUp, Loader2 } from 'lucide-react'

interface EmotionData {
  type: string
  score: number
  color: string
}

interface WeeklyEmotionData {
  summary: EmotionData[]
  daily: Array<{
    date: string
    emotions: Record<string, number>
  }>
  totalEntries: number
}

export function WeeklyEmotionSummary() {
  const [data, setData] = useState<WeeklyEmotionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchWeeklyEmotions()
  }, [])

  const fetchWeeklyEmotions = async () => {
    try {
      setLoading(true)
      setError(null)

      // 이번 주 시작일과 종료일 계산
      const today = new Date()
      const dayOfWeek = today.getDay()
      const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1) // 월요일 시작
      
      const startDate = new Date(today.setDate(diff))
      startDate.setHours(0, 0, 0, 0)
      
      const endDate = new Date()
      endDate.setHours(23, 59, 59, 999)

      const params = new URLSearchParams({
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0]
      })

      const response = await fetch(`/api/emotions?${params}`)
      
      if (!response.ok) {
        if (response.status === 401) {
          // 인증되지 않은 경우 조용히 처리
          setData(null)
          return
        }
        throw new Error('감정 데이터를 불러오는데 실패했습니다')
      }

      const result = await response.json()
      setData(result)
    } catch (err) {
      console.error('Error fetching weekly emotions:', err)
      setError(err instanceof Error ? err.message : '오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-900">
            이번 주 감정 변화
          </h3>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-50">
            <Loader2 className="h-4 w-4 animate-spin text-gray-600" />
          </div>
        </div>
        <div className="flex h-24 items-center justify-center rounded-xl bg-gray-50">
          <p className="text-sm text-gray-500">데이터를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-900">
            이번 주 감정 변화
          </h3>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50">
            <TrendingUp className="h-4 w-4 text-red-600" />
          </div>
        </div>
        <div className="flex h-24 items-center justify-center rounded-xl bg-red-50">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      </div>
    )
  }

  if (!data || data.totalEntries === 0) {
    return (
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
    )
  }

  // 상위 3개 감정 표시
  const topEmotions = data.summary.slice(0, 3)

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-900">
          이번 주 감정 변화
        </h3>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-50">
          <TrendingUp className="h-4 w-4 text-gray-600" />
        </div>
      </div>
      
      <div className="space-y-3">
        {topEmotions.map((emotion, index) => (
          <div key={emotion.type} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div 
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: emotion.color }}
              />
              <span className="text-sm text-gray-700">{emotion.type}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-24 overflow-hidden rounded-full bg-gray-100">
                <div 
                  className="h-full transition-all duration-500"
                  style={{ 
                    width: `${emotion.score}%`,
                    backgroundColor: emotion.color
                  }}
                />
              </div>
              <span className="text-xs text-gray-500">{emotion.score}%</span>
            </div>
          </div>
        ))}
        
        <div className="mt-3 flex items-center justify-between border-t pt-3">
          <p className="text-xs text-gray-500">
            이번 주 {data.totalEntries}개의 일기
          </p>
          <a 
            href="/insights" 
            className="text-xs font-medium text-gray-900 hover:text-gray-700"
          >
            자세히 보기 →
          </a>
        </div>
      </div>
    </div>
  )
}