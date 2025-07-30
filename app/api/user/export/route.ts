import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import JSZip from 'jszip'

export async function GET() {
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

    // ZIP 파일 생성
    const zip = new JSZip()

    // 1. 사용자 정보
    const userInfo = {
      id: user.id,
      email: user.email,
      created_at: user.created_at,
      metadata: user.user_metadata
    }
    zip.file('user_info.json', JSON.stringify(userInfo, null, 2))

    // 2. 일기 데이터 가져오기
    const { data: diaryEntries, error: diaryError } = await supabase
      .from('diary_entries')
      .select(`
        *,
        emotions (*),
        keywords (*)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (diaryError) {
      throw new Error('일기 데이터를 가져오는데 실패했습니다')
    }

    if (diaryEntries && diaryEntries.length > 0) {
      zip.file('diary_entries.json', JSON.stringify(diaryEntries, null, 2))

      // 3. 음성 파일 다운로드 (있는 경우)
      const audioFolder = zip.folder('audio_files')
      
      for (const entry of diaryEntries) {
        if (entry.audio_url) {
          try {
            // URL에서 파일 경로 추출
            const urlParts = entry.audio_url.split('/')
            const fileName = urlParts[urlParts.length - 1]
            const filePath = `${user.id}/${fileName}`

            // 파일 다운로드
            const { data: fileData, error: downloadError } = await supabase.storage
              .from('voice-recordings')
              .download(filePath)

            if (!downloadError && fileData) {
              // ArrayBuffer로 변환
              const arrayBuffer = await fileData.arrayBuffer()
              audioFolder?.file(fileName, arrayBuffer)
            }
          } catch (error) {
            console.error('Audio file download error:', error)
            // 개별 파일 다운로드 실패는 무시하고 계속
          }
        }
      }
    }

    // 4. 통계 데이터 생성
    const stats = {
      total_entries: diaryEntries?.length || 0,
      date_range: {
        first_entry: diaryEntries?.[diaryEntries.length - 1]?.created_at,
        last_entry: diaryEntries?.[0]?.created_at
      },
      exported_at: new Date().toISOString()
    }
    zip.file('statistics.json', JSON.stringify(stats, null, 2))

    // ZIP 파일 생성
    const zipBlob = await zip.generateAsync({ type: 'blob' })
    
    // 파일명 생성 (voice_diary_export_YYYYMMDD.zip)
    const date = new Date()
    const fileName = `voice_diary_export_${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}.zip`

    // Response 생성
    return new NextResponse(zipBlob, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${fileName}"`
      }
    })

  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json(
      { error: '데이터 내보내기 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}