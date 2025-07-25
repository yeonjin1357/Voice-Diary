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