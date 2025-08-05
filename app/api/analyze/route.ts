import { NextRequest, NextResponse } from 'next/server'
import { openai, GPT_MODEL } from '@/lib/openai/client'
import { AnalysisResult, Emotion } from '@/types'
import { ApiError, handleApiError } from '@/lib/api-utils'

const CORRECTION_PROMPT = `당신은 한국어 음성 인식 텍스트 교정 전문가입니다. 음성 인식으로 변환된 텍스트의 오류를 수정해주세요.

주의사항:
1. 발음 문제로 인한 오인식 수정
   - 비슷한 발음의 단어로 잘못 인식된 경우
   - 불명확한 발음이 이상한 단어로 변환된 경우
2. 고유명사(지명, 브랜드명, 상호명 등)의 오류를 특히 주의깊게 수정
3. 문맥상 어색한 단어를 자연스럽게 교정
4. 띄어쓰기와 문장부호 교정
5. 반복되는 단어나 더듬거림(어..., 그..., 음... 등) 제거
6. 원문의 의미와 감정은 그대로 유지
7. 구어체는 그대로 유지 (친근한 말투 유지)

예시:
- "오늘 날씨가 정말 덥더라구" → "오늘 날씨가 정말 덥더라고"
- "공동역에서 친구를 만났어" → "공덕역에서 친구를 만났어"
- "어... 그... 오늘 회사에서" → "오늘 회사에서"
- "밥을먹고커피를마셨어" → "밥을 먹고 커피를 마셨어"

수정된 텍스트만 반환해주세요.`

const ANALYSIS_PROMPT = `당신은 감정 분석 전문가입니다. 주어진 텍스트를 분석하여 다음 정보를 추출해주세요:

1. 감정 분석: 텍스트에서 느껴지는 감정을 파악하고 각 감정의 강도를 0-100으로 평가
   - 감정 종류: 기쁨, 슬픔, 불안, 분노, 평온, 기대, 놀람
   - 여러 감정이 동시에 존재할 수 있음

2. 키워드: 텍스트의 핵심 주제나 중요한 단어 5개 이내로 추출

3. 요약: 텍스트를 2-3문장으로 간단히 요약

JSON 형식으로 응답해주세요:
{
  "emotions": [
    {"type": "기쁨", "score": 85},
    {"type": "평온", "score": 60}
  ],
  "keywords": ["가족", "여행", "행복"],
  "summary": "가족과 함께한 여행에서 느낀 행복과 평온함을 표현한 일기입니다."
}`

export async function POST(request: NextRequest) {
  try {
    const { transcript } = await request.json()

    if (!transcript || typeof transcript !== 'string') {
      throw new ApiError('분석할 텍스트가 제공되지 않았습니다.', 400)
    }

    // 1단계: 텍스트 보정
    const correctionCompletion = await openai.chat.completions.create({
      model: GPT_MODEL,
      messages: [
        {
          role: 'system',
          content: CORRECTION_PROMPT,
        },
        {
          role: 'user',
          content: transcript,
        },
      ],
      temperature: 0.3, // 보정은 정확도가 중요하므로 낮은 temperature
      max_tokens: 1000,
    })

    const correctedText =
      correctionCompletion.choices[0]?.message?.content?.trim()
    if (!correctedText) {
      throw new Error('텍스트 보정 결과를 받지 못했습니다.')
    }

    // 2단계: 보정된 텍스트로 감정 분석
    const completion = await openai.chat.completions.create({
      model: GPT_MODEL,
      messages: [
        {
          role: 'system',
          content: ANALYSIS_PROMPT,
        },
        {
          role: 'user',
          content: correctedText,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 500,
    })

    const analysisText = completion.choices[0]?.message?.content
    if (!analysisText) {
      throw new Error('분석 결과를 받지 못했습니다.')
    }

    const analysis: AnalysisResult = JSON.parse(analysisText)

    // 감정 타입 검증
    const validEmotionTypes = [
      '기쁨',
      '슬픔',
      '불안',
      '분노',
      '평온',
      '기대',
      '놀람',
    ]
    analysis.emotions = analysis.emotions.filter(
      (emotion: Emotion) =>
        validEmotionTypes.includes(emotion.type) &&
        emotion.score >= 0 &&
        emotion.score <= 100,
    )

    // 감정 점수 기준으로 정렬
    analysis.emotions.sort((a, b) => b.score - a.score)

    return NextResponse.json({
      success: true,
      analysis,
      correctedTranscript: correctedText, // 보정된 텍스트 반환
    })
  } catch (error) {
    return handleApiError(error)
  }
}
