import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { randomUUID } from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    
    // 사용자 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: '인증되지 않은 사용자입니다' },
        { status: 401 }
      )
    }

    // FormData에서 파일 가져오기
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: '파일이 제공되지 않았습니다' },
        { status: 400 }
      )
    }

    // 파일 크기 체크 (5MB 제한)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: '파일 크기는 5MB 이하여야 합니다' },
        { status: 400 }
      )
    }

    // 파일 타입 체크
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: '이미지 파일만 업로드할 수 있습니다' },
        { status: 400 }
      )
    }

    // 파일명 생성
    const fileExt = file.name.split('.').pop()
    const fileName = `${randomUUID()}.${fileExt}`
    const filePath = `${user.id}/diary-images/${fileName}`

    // ArrayBuffer로 변환
    const buffer = await file.arrayBuffer()
    
    // Supabase Storage에 업로드
    const { error: uploadError } = await supabase.storage
      .from('diary-images')
      .upload(filePath, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json(
        { error: '이미지 업로드에 실패했습니다' },
        { status: 500 }
      )
    }

    // 공개 URL 생성
    const { data: { publicUrl } } = supabase.storage
      .from('diary-images')
      .getPublicUrl(filePath)

    return NextResponse.json({ 
      url: publicUrl,
      path: filePath 
    })

  } catch (error) {
    console.error('Image upload error:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}