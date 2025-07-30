import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

// GET: 특정 일기 조회
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  try {
    const supabase = await createServerSupabaseClient();
    
    // 사용자 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const { data, error } = await supabase
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
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: '일기를 찾을 수 없습니다.' }, { status: 404 });
      }
      throw error;
    }

    // 데이터 형식 변환
    const diaryEntry = {
      id: data.id,
      userId: data.user_id,
      date: new Date(data.date),
      audioUrl: data.audio_url,
      transcript: data.transcript,
      summary: data.summary,
      emotions: data.emotions.map((e: { type: '기쁨' | '슬픔' | '불안' | '분노' | '평온' | '기대' | '놀람'; score: number }) => ({
        type: e.type,
        score: e.score,
      })),
      keywords: data.keywords.map((k: { keyword: string }) => k.keyword),
      images: data.images || [],
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };

    return NextResponse.json({ diary: diaryEntry });
  } catch (error) {
    console.error('일기 조회 오류:', error);
    return NextResponse.json(
      { error: '일기를 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// PATCH: 일기 수정
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  try {
    const supabase = await createServerSupabaseClient();
    
    // 사용자 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const body = await request.json();
    const { summary, transcript, keywords, images, emotions } = body;

    // 일기 소유권 확인
    const { data: existingDiary, error: checkError } = await supabase
      .from('diary_entries')
      .select('id')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single();

    if (checkError || !existingDiary) {
      return NextResponse.json({ error: '일기를 찾을 수 없습니다.' }, { status: 404 });
    }

    // 일기 본문 업데이트
    const { error: updateError } = await supabase
      .from('diary_entries')
      .update({
        summary,
        transcript,
        images: images || [],
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id);

    if (updateError) {
      throw updateError;
    }

    // 키워드 업데이트 (기존 삭제 후 새로 추가)
    if (keywords && Array.isArray(keywords)) {
      // 기존 키워드 삭제
      await supabase
        .from('keywords')
        .delete()
        .eq('diary_entry_id', params.id);

      // 새 키워드 추가
      if (keywords.length > 0) {
        const keywordData = keywords.map((keyword: string) => ({
          diary_entry_id: params.id,
          keyword,
        }));

        await supabase
          .from('keywords')
          .insert(keywordData);
      }
    }

    // 감정 업데이트 (기존 삭제 후 새로 추가)
    if (emotions && Array.isArray(emotions)) {
      // 기존 감정 삭제
      await supabase
        .from('emotions')
        .delete()
        .eq('diary_entry_id', params.id);

      // 새 감정 추가
      if (emotions.length > 0) {
        const emotionData = emotions.map((emotion: { type: string; score: number }) => ({
          diary_entry_id: params.id,
          type: emotion.type,
          score: emotion.score,
        }));

        await supabase
          .from('emotions')
          .insert(emotionData);
      }
    }

    // 업데이트된 일기 다시 조회
    const { data: updatedDiary, error: fetchError } = await supabase
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
      .eq('id', params.id)
      .single();

    if (fetchError || !updatedDiary) {
      throw fetchError || new Error('업데이트된 일기를 불러올 수 없습니다.');
    }

    const diaryEntry = {
      id: updatedDiary.id,
      userId: updatedDiary.user_id,
      date: new Date(updatedDiary.date),
      audioUrl: updatedDiary.audio_url,
      transcript: updatedDiary.transcript,
      summary: updatedDiary.summary,
      emotions: updatedDiary.emotions.map((e: { type: '기쁨' | '슬픔' | '불안' | '분노' | '평온' | '기대' | '놀람'; score: number }) => ({
        type: e.type,
        score: e.score,
      })),
      keywords: updatedDiary.keywords.map((k: { keyword: string }) => k.keyword),
      images: updatedDiary.images || [],
      createdAt: new Date(updatedDiary.created_at),
      updatedAt: new Date(updatedDiary.updated_at),
    };

    return NextResponse.json({ diary: diaryEntry });
  } catch (error) {
    console.error('일기 수정 오류:', error);
    return NextResponse.json(
      { error: '일기 수정 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// DELETE: 일기 삭제
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  try {
    const supabase = await createServerSupabaseClient();
    
    // 사용자 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    // 일기 삭제 (cascade로 emotions, keywords도 자동 삭제됨)
    const { error } = await supabase
      .from('diary_entries')
      .delete()
      .eq('id', params.id)
      .eq('user_id', user.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('일기 삭제 오류:', error);
    return NextResponse.json(
      { error: '일기 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}