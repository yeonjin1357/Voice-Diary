import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: '인증되지 않은 사용자입니다.' }, { status: 401 })
    }

    // URL 파라미터 가져오기
    const searchParams = request.nextUrl.searchParams
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    if (!startDate || !endDate) {
      return NextResponse.json({ error: '날짜 범위가 필요합니다.' }, { status: 400 })
    }

    // 기간 내 일기 항목들의 감정 데이터 가져오기
    const { data: diaryEntries, error: diaryError } = await supabase
      .from('diary_entries')
      .select('id, date')
      .eq('user_id', user.id)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true })

    if (diaryError) throw diaryError

    if (!diaryEntries || diaryEntries.length === 0) {
      return NextResponse.json({
        summary: [],
        daily: [],
        totalEntries: 0
      })
    }

    const diaryIds = diaryEntries.map((entry: { id: string }) => entry.id)

    // 감정 데이터 가져오기
    const { data: emotions, error: emotionsError } = await supabase
      .from('emotions')
      .select('*')
      .in('diary_entry_id', diaryIds)

    if (emotionsError) throw emotionsError

    // 감정 타입별 합계 계산
    const emotionSummary: { [key: string]: number } = {}
    const dailyEmotions: { [date: string]: { [emotion: string]: number } } = {}

    emotions?.forEach((emotion: { type: string; score: number; diary_entry_id: string }) => {
      // 전체 합계
      if (!emotionSummary[emotion.type]) {
        emotionSummary[emotion.type] = 0
      }
      emotionSummary[emotion.type] += emotion.score

      // 일별 데이터
      const entry = diaryEntries.find((e: { id: string; date: string }) => e.id === emotion.diary_entry_id)
      if (entry) {
        const date = entry.date
        if (!dailyEmotions[date]) {
          dailyEmotions[date] = {}
        }
        if (!dailyEmotions[date][emotion.type]) {
          dailyEmotions[date][emotion.type] = 0
        }
        dailyEmotions[date][emotion.type] = Math.max(dailyEmotions[date][emotion.type], emotion.score)
      }
    })

    // 감정 색상 매핑
    const EMOTION_COLORS = {
      '기쁨': '#fbbf24',
      '슬픔': '#60a5fa',
      '불안': '#f87171',
      '분노': '#fb923c',
      '평온': '#86efac',
      '기대': '#c084fc',
      '놀람': '#fde047',
    }

    // 요약 데이터 포맷팅
    const summary = Object.entries(emotionSummary)
      .map(([type, score]) => ({
        type,
        score: Math.round(score / diaryEntries.length), // 평균값
        color: EMOTION_COLORS[type as keyof typeof EMOTION_COLORS] || '#gray'
      }))
      .sort((a, b) => b.score - a.score)

    // 일별 데이터 포맷팅
    const daily = Object.entries(dailyEmotions)
      .map(([date, emotions]) => ({
        date,
        emotions
      }))
      .sort((a, b) => a.date.localeCompare(b.date))

    return NextResponse.json({
      summary,
      daily,
      totalEntries: diaryEntries.length
    })

  } catch (error) {
    console.error('Error fetching emotion data:', error)
    return NextResponse.json(
      { error: '감정 데이터를 가져오는데 실패했습니다.' },
      { status: 500 }
    )
  }
}