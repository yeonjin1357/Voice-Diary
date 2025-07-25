import { NextRequest, NextResponse } from 'next/server';
import { openai, GPT_MODEL } from '@/lib/openai/client';
import { AnalysisResult, Emotion } from '@/types';

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
}`;

export async function POST(request: NextRequest) {
  try {
    const { transcript } = await request.json();

    if (!transcript || typeof transcript !== 'string') {
      return NextResponse.json(
        { error: '분석할 텍스트가 제공되지 않았습니다.' },
        { status: 400 }
      );
    }

    const completion = await openai.chat.completions.create({
      model: GPT_MODEL,
      messages: [
        {
          role: 'system',
          content: ANALYSIS_PROMPT,
        },
        {
          role: 'user',
          content: transcript,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 500,
    });

    const analysisText = completion.choices[0]?.message?.content;
    if (!analysisText) {
      throw new Error('분석 결과를 받지 못했습니다.');
    }

    const analysis: AnalysisResult = JSON.parse(analysisText);

    // 감정 타입 검증
    const validEmotionTypes = ['기쁨', '슬픔', '불안', '분노', '평온', '기대', '놀람'];
    analysis.emotions = analysis.emotions.filter((emotion: Emotion) => 
      validEmotionTypes.includes(emotion.type) && 
      emotion.score >= 0 && 
      emotion.score <= 100
    );

    // 감정 점수 기준으로 정렬
    analysis.emotions.sort((a, b) => b.score - a.score);

    return NextResponse.json({
      success: true,
      analysis,
    });
  } catch (error) {
    console.error('감정 분석 API 오류:', error);
    return NextResponse.json(
      { error: '감정 분석 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}