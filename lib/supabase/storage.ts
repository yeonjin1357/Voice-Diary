import { createClient } from './client'

export async function uploadAudioFile(userId: string, file: Blob, date: string): Promise<string | null> {
  const supabase = createClient()
  
  // 파일명 생성: userId/date-timestamp.webm
  const timestamp = Date.now()
  const fileName = `${userId}/${date}-${timestamp}.webm`
  
  // Storage에 파일 업로드
  const { data, error } = await supabase.storage
    .from('voice-recordings')
    .upload(fileName, file, {
      contentType: 'audio/webm',
      upsert: false
    })
  
  if (error) {
    console.error('Audio upload error:', error)
    return null
  }
  
  // 공개 URL 가져오기
  const { data: { publicUrl } } = supabase.storage
    .from('voice-recordings')
    .getPublicUrl(fileName)
  
  return publicUrl
}

export async function deleteAudioFile(audioUrl: string): Promise<boolean> {
  const supabase = createClient()
  
  // URL에서 파일 경로 추출
  const url = new URL(audioUrl)
  const pathParts = url.pathname.split('/voice-recordings/')
  if (pathParts.length !== 2) return false
  
  const filePath = pathParts[1]
  
  const { error } = await supabase.storage
    .from('voice-recordings')
    .remove([filePath])
  
  if (error) {
    console.error('Audio delete error:', error)
    return false
  }
  
  return true
}