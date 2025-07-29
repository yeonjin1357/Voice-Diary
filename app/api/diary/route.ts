import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { DiaryEntryWithRelations, Emotion } from '@/types';
import { ApiError, handleApiError } from '@/lib/api-utils';

// GET: 일기 목록 조회
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    
    // 사용자 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new ApiError('인증이 필요합니다.', 401);
    }

    // URL 파라미터에서 검색 조건 추출
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year');
    const month = searchParams.get('month');
    const keyword = searchParams.get('keyword');
    const emotion = searchParams.get('emotion');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
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

    // 키워드 검색
    if (keyword) {
      query = query.or(`transcript.ilike.%${keyword}%,summary.ilike.%${keyword}%`);
    }

    // 감정 필터링
    if (emotion) {
      // 서브쿼리로 특정 감정을 가진 일기 ID들을 먼저 찾음
      const { data: emotionEntries } = await supabase
        .from('emotions')
        .select('diary_entry_id')
        .eq('type', emotion);
      
      if (emotionEntries && emotionEntries.length > 0) {
        const diaryIds = emotionEntries.map(e => e.diary_entry_id);
        query = query.in('id', diaryIds);
      } else {
        // 해당 감정을 가진 일기가 없으면 빈 결과 반환
        return NextResponse.json({ diaries: [] });
      }
    }

    // 날짜 범위 필터링
    if (startDate && endDate) {
      query = query.gte('date', startDate).lte('date', endDate);
    } else if (startDate) {
      query = query.gte('date', startDate);
    } else if (endDate) {
      query = query.lte('date', endDate);
    } else if (year && month) {
      // 기존 월별 필터링
      const monthStartDate = `${year}-${month.padStart(2, '0')}-01`;
      const monthEndDate = new Date(parseInt(year), parseInt(month), 0).toISOString().split('T')[0];
      query = query.gte('date', monthStartDate).lte('date', monthEndDate);
    }

    const { data, error } = await query;

    if (error) throw error;

    // 데이터 형식 변환
    const diaryEntries: DiaryEntryWithRelations[] = data.map(entry => ({
      id: entry.id,
      userId: entry.user_id,
      date: entry.date,
      audioUrl: entry.audio_url,
      transcript: entry.transcript,
      summary: entry.summary,
      emotions: entry.emotions.map((e: { type: '기쁨' | '슬픔' | '불안' | '분노' | '평온' | '기대' | '놀람'; score: number }) => ({
        type: e.type,
        score: e.score,
      })),
      keywords: entry.keywords.map((k: { keyword: string }) => k.keyword),
      createdAt: entry.created_at,
      updatedAt: entry.updated_at,
    }));

    return NextResponse.json({ diaries: diaryEntries });
  } catch (error) {
    return handleApiError(error);
  }
}

// POST: 새 일기 생성
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    
    // 사용자 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new ApiError('인증이 필요합니다.', 401);
    }

    const body = await request.json();
    const { date, audioUrl, transcript, summary, emotions, keywords } = body;

    // 필수 필드 검증
    if (!date || !transcript || !summary) {
      throw new ApiError('필수 정보가 누락되었습니다.', 400);
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
        throw keywordError;
      }
    }

    return NextResponse.json({
      success: true,
      diaryId: diary.id,
    });
  } catch (error) {
    return handleApiError(error);
  }
}