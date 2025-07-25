'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { DiaryEntry } from '@/types'

export function useDiary() {
  const [diaries, setDiaries] = useState<DiaryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const fetchDiaries = async (year?: number, month?: number) => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (year) params.append('year', year.toString())
      if (month) params.append('month', month.toString())

      const response = await fetch(`/api/diary?${params}`)
      if (!response.ok) throw new Error('일기를 불러오는데 실패했습니다.')

      const { diaries } = await response.json()
      setDiaries(diaries)
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const createDiary = async (data: {
    date: string
    audioUrl?: string
    transcript: string
    summary: string
    emotions: Array<{ type: string; score: number }>
    keywords: string[]
  }) => {
    try {
      const response = await fetch('/api/diary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error('일기 저장에 실패했습니다.')

      const result = await response.json()
      return result.diaryId
    } catch (err) {
      throw err instanceof Error ? err : new Error('일기 저장 중 오류가 발생했습니다.')
    }
  }

  const deleteDiary = async (id: string) => {
    try {
      const response = await fetch(`/api/diary/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('일기 삭제에 실패했습니다.')

      // 로컬 상태 업데이트
      setDiaries(prev => prev.filter(diary => diary.id !== id))
    } catch (err) {
      throw err instanceof Error ? err : new Error('일기 삭제 중 오류가 발생했습니다.')
    }
  }

  return {
    diaries,
    loading,
    error,
    fetchDiaries,
    createDiary,
    deleteDiary,
  }
}