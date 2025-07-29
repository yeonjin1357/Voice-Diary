import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'

export async function DELETE() {
  try {
    const supabase = await createServerSupabaseClient()
    
    // 현재 로그인한 사용자 정보 가져오기
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: '인증되지 않은 사용자입니다' },
        { status: 401 }
      )
    }

    // 1. 사용자의 모든 일기 관련 데이터 삭제
    // (외래 키 제약으로 인해 emotions와 keywords는 자동으로 삭제됨)
    const { error: diaryError } = await supabase
      .from('diary_entries')
      .delete()
      .eq('user_id', user.id)

    if (diaryError) {
      console.error('Failed to delete diary entries:', diaryError)
      return NextResponse.json(
        { error: '일기 데이터 삭제 중 오류가 발생했습니다' },
        { status: 500 }
      )
    }

    // 2. Storage에서 사용자의 음성 파일 삭제
    try {
      const { data: files } = await supabase.storage
        .from('voice-recordings')
        .list(user.id)

      if (files && files.length > 0) {
        const filePaths = files.map(file => `${user.id}/${file.name}`)
        await supabase.storage
          .from('voice-recordings')
          .remove(filePaths)
      }
    } catch (storageError) {
      console.error('Failed to delete audio files:', storageError)
      // Storage 삭제 실패는 무시하고 계속 진행
    }

    // 3. contacts 테이블에서 문의 내역 삭제 (있는 경우)
    const { error: contactsError } = await supabase
      .from('contacts')
      .delete()
      .eq('user_id', user.id)
    
    if (contactsError) {
      console.log('Failed to delete contacts (table may not exist):', contactsError)
      // contacts 테이블이 없거나 삭제 실패해도 무시하고 계속 진행
    }

    // 4. Supabase Auth에서 사용자 계정 삭제
    try {
      // Admin 클라이언트로 사용자 삭제 시도
      const adminClient = createAdminSupabaseClient()
      const { error: deleteError } = await adminClient.auth.admin.deleteUser(user.id)

      if (deleteError) {
        throw deleteError
      }
    } catch (adminError) {
      // Service role key가 없거나 admin API 사용 불가능한 경우
      console.error('Admin delete failed:', adminError)
      
      // 대체 방법: Database Function을 사용하여 삭제
      const { error: functionError } = await supabase.rpc('delete_user', { 
        user_id: user.id 
      })
      
      if (functionError) {
        console.error('Function delete also failed:', functionError)
        // 현재 세션만 종료하고 수동 삭제 필요함을 알림
        await supabase.auth.signOut()
        
        return NextResponse.json({
          success: true,
          message: '데이터는 삭제되었으나 계정 삭제는 관리자에게 문의하세요',
          requiresManualDeletion: true
        })
      }
    }

    // 성공적으로 삭제된 경우 세션 종료
    await supabase.auth.signOut()

    return NextResponse.json({
      success: true,
      message: '회원 탈퇴가 완료되었습니다'
    })

  } catch (error) {
    console.error('Account deletion error:', error)
    return NextResponse.json(
      { error: '회원 탈퇴 처리 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}