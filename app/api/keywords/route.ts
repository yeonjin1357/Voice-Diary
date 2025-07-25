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

    // 기간 내 일기 항목들 가져오기
    const { data: diaryEntries, error: diaryError } = await supabase
      .from('diary_entries')
      .select('id')
      .eq('user_id', user.id)
      .gte('date', startDate)
      .lte('date', endDate)

    if (diaryError) throw diaryError

    if (!diaryEntries || diaryEntries.length === 0) {
      return NextResponse.json({
        keywords: []
      })
    }

    const diaryIds = diaryEntries.map((entry: { id: string }) => entry.id)

    // 키워드 데이터 가져오기
    const { data: keywords, error: keywordsError } = await supabase
      .from('keywords')
      .select('keyword')
      .in('diary_entry_id', diaryIds)

    if (keywordsError) throw keywordsError

    // 키워드 빈도 계산
    const keywordCount: { [key: string]: number } = {}
    
    keywords?.forEach(({ keyword }: { keyword: string }) => {
      if (!keywordCount[keyword]) {
        keywordCount[keyword] = 0
      }
      keywordCount[keyword]++
    })

    // 빈도순으로 정렬하여 상위 20개만 반환
    const sortedKeywords = Object.entries(keywordCount)
      .map(([word, count]) => ({ word, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20)

    return NextResponse.json({
      keywords: sortedKeywords
    })

  } catch (error) {
    console.error('Error fetching keyword data:', error)
    return NextResponse.json(
      { error: '키워드 데이터를 가져오는데 실패했습니다.' },
      { status: 500 }
    )
  }
}