'use client'

import { DiaryEntryWithRelations, Emotion } from '@/types'
import { Calendar, Hash } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DiaryCardProps {
  diary: DiaryEntryWithRelations
  onClick?: () => void
}

const emotionColors = {
  기쁨: 'bg-amber-50 text-amber-700 border-amber-200',
  슬픔: 'bg-blue-50 text-blue-700 border-blue-200',
  불안: 'bg-red-50 text-red-700 border-red-200',
  분노: 'bg-orange-50 text-orange-700 border-orange-200',
  평온: 'bg-green-50 text-green-700 border-green-200',
  기대: 'bg-purple-50 text-purple-700 border-purple-200',
  놀람: 'bg-yellow-50 text-yellow-700 border-yellow-200',
}

export function DiaryCard({ diary, onClick }: DiaryCardProps) {
  const formatDate = (date: Date) => {
    const d = new Date(date)
    return `${d.getMonth() + 1}월 ${d.getDate()}일`
  }

  const getDayOfWeek = (date: Date) => {
    const days = ['일', '월', '화', '수', '목', '금', '토']
    return days[new Date(date).getDay()]
  }

  // 상위 2개 감정만 표시
  const topEmotions = diary.emotions
    .sort((a: Emotion, b: Emotion) => b.score - a.score)
    .slice(0, 2)

  return (
    <div
      className="bg-white rounded-2xl p-4 cursor-pointer transition-all hover:shadow-md active:scale-[0.98] border border-gray-100"
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Calendar className="h-4 w-4" />
          <span className="font-medium">{formatDate(new Date(diary.date))}</span>
          <span className="text-gray-400">({getDayOfWeek(new Date(diary.date))})</span>
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
                emotionColors[emotion.type]
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