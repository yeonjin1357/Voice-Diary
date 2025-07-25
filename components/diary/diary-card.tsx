'use client'

import { DiaryEntry } from '@/types'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Hash } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DiaryCardProps {
  diary: DiaryEntry
  onClick?: () => void
}

const emotionColors = {
  기쁨: 'bg-amber-100 text-amber-800',
  슬픔: 'bg-blue-100 text-blue-800',
  불안: 'bg-red-100 text-red-800',
  분노: 'bg-orange-100 text-orange-800',
  평온: 'bg-green-100 text-green-800',
  기대: 'bg-purple-100 text-purple-800',
  놀람: 'bg-yellow-100 text-yellow-800',
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
    .sort((a, b) => b.score - a.score)
    .slice(0, 2)

  return (
    <Card
      className="cursor-pointer transition-all hover:shadow-lg hover:border-purple-300 dark:hover:border-purple-700 transform hover:scale-[1.01]"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-neutral-500">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(diary.date)}</span>
            <span>({getDayOfWeek(diary.date)})</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* 감정 표시 */}
        <div className="flex gap-2">
          {topEmotions.map((emotion) => (
            <Badge
              key={emotion.type}
              variant="secondary"
              className={cn(
                'text-xs font-medium',
                emotionColors[emotion.type]
              )}
            >
              {emotion.type} {emotion.score}%
            </Badge>
          ))}
        </div>

        {/* 요약 */}
        <p className="text-sm text-neutral-700 dark:text-neutral-300 line-clamp-2">
          {diary.summary}
        </p>

        {/* 키워드 */}
        {diary.keywords.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <Hash className="h-3 w-3 text-neutral-400" />
            {diary.keywords.slice(0, 3).map((keyword) => (
              <span
                key={keyword}
                className="text-xs text-neutral-500"
              >
                {keyword}
              </span>
            ))}
            {diary.keywords.length > 3 && (
              <span className="text-xs text-neutral-400">
                +{diary.keywords.length - 3}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}