'use client'

import { DiaryEntryWithRelations, Emotion } from '@/types'
import { Calendar, Hash, Image as ImageIcon } from 'lucide-react'
import { cn, formatDate, getDayOfWeek } from '@/lib/utils'
import Image from 'next/image'
import { EMOTION_COLORS } from '@/lib/constants/emotions'

interface DiaryCardProps {
  diary: DiaryEntryWithRelations
  onClick?: () => void
}


export function DiaryCard({ diary, onClick }: DiaryCardProps) {

  // 상위 2개 감정만 표시
  const topEmotions = diary.emotions
    .sort((a: Emotion, b: Emotion) => b.score - a.score)
    .slice(0, 2)

  // 이미지가 있는 경우와 없는 경우 다른 레이아웃 사용
  if (diary.images && diary.images.length > 0) {
    return (
      <div
        className="bg-white rounded-2xl overflow-hidden cursor-pointer transition-all hover:shadow-md active:scale-[0.98] border border-gray-100 flex h-32"
        onClick={onClick}
      >
        {/* 왼쪽: 텍스트 콘텐츠 */}
        <div className="flex-1 p-4 flex flex-col justify-between">
          <div>
            {/* 날짜 */}
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
              <Calendar className="h-4 w-4" />
              <span className="font-medium">{formatDate(diary.date)}</span>
              <span className="text-gray-400">({getDayOfWeek(diary.date)})</span>
            </div>
            
            {/* 요약 (한 줄만) */}
            <p className="text-sm text-gray-700 line-clamp-1 font-medium mb-2">
              {diary.summary}
            </p>
          </div>

          {/* 감정 표시 */}
          <div className="flex gap-1.5">
            {topEmotions.map((emotion: Emotion) => (
              <span
                key={emotion.type}
                className={cn(
                  'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border',
                  EMOTION_COLORS[emotion.type]
                )}
              >
                {emotion.type}
              </span>
            ))}
          </div>
        </div>

        {/* 오른쪽: 이미지 */}
        <div className="relative w-32 bg-gray-100">
          <Image
            src={diary.images[0]}
            alt="일기 이미지"
            fill
            className="object-cover"
            sizes="128px"
          />
          {diary.images.length > 1 && (
            <div className="absolute bottom-1 right-1 flex items-center gap-0.5 rounded-full bg-black/60 px-1.5 py-0.5 text-xs text-white">
              <ImageIcon className="h-3 w-3" />
              <span>{diary.images.length}</span>
            </div>
          )}
        </div>
      </div>
    )
  }

  // 이미지가 없는 경우 기존 레이아웃
  return (
    <div
      className="bg-white rounded-2xl p-4 cursor-pointer transition-all hover:shadow-md active:scale-[0.98] border border-gray-100"
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Calendar className="h-4 w-4" />
          <span className="font-medium">{formatDate(diary.date)}</span>
          <span className="text-gray-400">({getDayOfWeek(diary.date)})</span>
        </div>
      </div>
      <div className="space-y-3">
        {/* 감정 표시 */}
        <div className="flex gap-2">
          {topEmotions.map((emotion: Emotion) => (
            <span
              key={emotion.type}
              className={cn(
                'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border',
                EMOTION_COLORS[emotion.type]
              )}
            >
              {emotion.type} {emotion.score}%
            </span>
          ))}
        </div>

        {/* 요약 */}
        <p className="text-sm text-gray-700 line-clamp-2 leading-relaxed">
          {diary.summary}
        </p>

        {/* 키워드 */}
        {diary.keywords && diary.keywords.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <Hash className="h-3 w-3 text-gray-400" />
            {diary.keywords.slice(0, 3).map(({ keyword }: { keyword: string }) => (
              <span
                key={keyword}
                className="text-xs text-gray-500"
              >
                {keyword}
              </span>
            ))}
            {diary.keywords && diary.keywords.length > 3 && (
              <span className="text-xs text-gray-400">
                +{diary.keywords.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}