import { NextRequest, NextResponse } from 'next/server'
import {
  openai,
  WHISPER_MODEL,
  MAX_AUDIO_SIZE,
  SUPPORTED_AUDIO_FORMATS,
} from '@/lib/openai/client'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const audioFile = formData.get('audio') as File

    if (!audioFile) {
      return NextResponse.json(
        { error: '오디오 파일이 제공되지 않았습니다.' },
        { status: 400 },
      )
    }

    if (audioFile.size > MAX_AUDIO_SIZE) {
      return NextResponse.json(
        {
          error: `파일 크기가 ${MAX_AUDIO_SIZE / 1024 / 1024}MB를 초과합니다.`,
        },
        { status: 400 },
      )
    }

    const fileExtension = audioFile.name.split('.').pop()?.toLowerCase()
    if (!fileExtension || !SUPPORTED_AUDIO_FORMATS.includes(fileExtension)) {
      return NextResponse.json(
        {
          error: `지원되지 않는 파일 형식입니다. 지원 형식: ${SUPPORTED_AUDIO_FORMATS.join(', ')}`,
        },
        { status: 400 },
      )
    }

    try {
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
    } catch (apiError) {
      // API 에러 상세 정보 로깅
      const error = apiError as Error & { status?: number; code?: string; type?: string }
      console.error('OpenAI API 상세 오류:', {
        message: error.message,
        status: error.status,
        code: error.code,
        type: error.type,
      })

      throw apiError
    }
  } catch (error) {
    console.error('Whisper API 오류:', error)
    return NextResponse.json(
      { error: '음성 변환 중 오류가 발생했습니다.' },
      { status: 500 },
    )
  }
}
