import { NextRequest, NextResponse } from 'next/server'
import {
  openai,
  WHISPER_MODEL,
  MAX_AUDIO_SIZE,
  SUPPORTED_AUDIO_FORMATS,
} from '@/lib/openai/client'
import { ApiError, handleApiError } from '@/lib/api-utils'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    // 사용자 인증 확인
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      throw new ApiError('인증이 필요합니다.', 401)
    }

    const formData = await request.formData()
    const audioFile = formData.get('audio') as File

    if (!audioFile) {
      throw new ApiError('오디오 파일이 제공되지 않았습니다.', 400)
    }

    if (audioFile.size > MAX_AUDIO_SIZE) {
      throw new ApiError(`파일 크기가 ${MAX_AUDIO_SIZE / 1024 / 1024}MB를 초과합니다.`, 400)
    }

    const fileExtension = audioFile.name.split('.').pop()?.toLowerCase()
    if (!fileExtension || !SUPPORTED_AUDIO_FORMATS.includes(fileExtension)) {
      throw new ApiError(`지원되지 않는 파일 형식입니다. 지원 형식: ${SUPPORTED_AUDIO_FORMATS.join(', ')}`, 400)
    }

    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: WHISPER_MODEL,
      language: 'ko',
      response_format: 'text',
      prompt: '한국어로 말하고 있습니다. 일기를 작성하기 위해 오늘 있었던 일과 감정에 대해 이야기하고 있습니다.',
      temperature: 0.2 // 더 정확한 변환을 위해 낮은 temperature
    })

    return NextResponse.json({
      transcript: transcription,
      success: true,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
