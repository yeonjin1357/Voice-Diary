import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { DiaryEntry, Emotion } from '@/types';

// GET: 일기 목록 조회
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    
    // 사용자 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    // URL 파라미터에서 월/년 추출
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year');
    const month = searchParams.get('month');
    
    let query = supabase
      .from('diary_entries')
      .select(`
        *,
        emotions (
          type,
          score
        ),
        keywords (
          keyword
        )
      `)
      .eq('user_id', user.id)
      .order('date', { ascending: false });

    // 월별 필터링
    if (year && month) {
      const startDate = `${year}-${month.padStart(2, '0')}-01`;
      const endDate = new Date(parseInt(year), parseInt(month), 0).toISOString().split('T')[0];
      query = query.gte('date', startDate).lte('date', endDate);
    }

    const { data, error } = await query;

    if (error) throw error;

    // 데이터 형식 변환
    const diaryEntries: DiaryEntry[] = data.map(entry => ({
      id: entry.id,
      userId: entry.user_id,
      date: new Date(entry.date),
      audioUrl: entry.audio_url,
      transcript: entry.transcript,
      summary: entry.summary,
      emotions: entry.emotions.map((e: { type: '기쁨' | '슬픔' | '불안' | '분노' | '평온' | '기대' | '놀람'; score: number }) => ({
        type: e.type,
        score: e.score,
      })),
      keywords: entry.keywords.map((k: { keyword: string }) => k.keyword),
      createdAt: new Date(entry.created_at),
      updatedAt: new Date(entry.updated_at),
    }));

    return NextResponse.json({ diaries: diaryEntries });
  } catch (error) {
    console.error('일기 목록 조회 오류:', error);
    return NextResponse.json(
      { error: '일기 목록을 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// POST: 새 일기 생성
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    
    // 사용자 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('인증 오류:', authError);
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const body = await request.json();
    const { date, audioUrl, transcript, summary, emotions, keywords } = body;

    // 필수 필드 검증
    if (!date || !transcript || !summary) {
      return NextResponse.json(
        { error: '필수 정보가 누락되었습니다.' },
        { status: 400 }
      );
    }

    // 트랜잭션으로 일기 저장
    const { data: diary, error: diaryError } = await supabase
      .from('diary_entries')
      .insert({
        user_id: user.id,
        date,
        audio_url: audioUrl,
        transcript,
        summary,
      })
      .select()
      .single();

    if (diaryError) {
      console.error('일기 저장 실패:', diaryError);
      throw diaryError;
    }

    // 감정 데이터 저장
    if (emotions && emotions.length > 0) {
      const emotionData = emotions.map((emotion: Emotion) => ({
        diary_entry_id: diary.id,
        type: emotion.type,
        score: emotion.score,
      }));

      const { error: emotionError } = await supabase
        .from('emotions')
        .insert(emotionData);

      if (emotionError) {
        console.error('감정 데이터 저장 실패:', emotionError);
        throw emotionError;
      }
    }

    // 키워드 데이터 저장
    if (keywords && keywords.length > 0) {
      const keywordData = keywords.map((keyword: string) => ({
        diary_entry_id: diary.id,
        keyword,
      }));

      const { error: keywordError } = await supabase
        .from('keywords')
        .insert(keywordData);

      if (keywordError) {
        console.error('키워드 데이터 저장 실패:', keywordError);
        throw keywordError;
      }
    }

    return NextResponse.json({
      success: true,
      diaryId: diary.id,
    });
  } catch (error) {
    console.error('일기 생성 오류:', error);
    return NextResponse.json(
      { error: '일기 저장 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}