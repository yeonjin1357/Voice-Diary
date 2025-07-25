'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, addMonths, subMonths, isToday } from 'date-fns'
import { ko } from 'date-fns/locale'
import { DiaryEntry } from '@/types'

interface CalendarProps {
  selectedDate: Date | null
  onDateSelect: (date: Date) => void
  diaryDates: Date[] // 일기가 있는 날짜들
  diaries?: DiaryEntry[] // 일기 데이터 추가
  className?: string
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

export function Calendar({ selectedDate, onDateSelect, diaryDates, diaries = [], className }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // 달력의 첫 주 시작일 계산
  const startDayOfWeek = getDay(monthStart)
  const prefixDays = Array(startDayOfWeek).fill(null)

  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1))
  }

  const hasDiary = (date: Date) => {
    return diaryDates.some(diaryDate => 
      isSameDay(new Date(diaryDate), date)
    )
  }

  const getDiariesForDate = (date: Date) => {
    return diaries.filter(diary => 
      isSameDay(new Date(diary.date), date)
    )
  }

  const getEmotionEmoji = (emotion: string) => {
    const emojiMap: Record<string, string> = {
      '기쁨': '😊',
      '슬픔': '😢',
      '불안': '😰',
      '분노': '😠',
      '평온': '😌',
      '기대': '🤗',
      '놀람': '😮'
    }
    return emojiMap[emotion] || '📝'
  }

  return (
    <div className={cn('bg-white rounded-2xl shadow-sm', className)}>
      {/* 헤더 */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <button
          onClick={handlePrevMonth}
          className="p-2 -m-2 hover:bg-gray-50 rounded-full transition-all active:scale-95"
          aria-label="이전 달"
        >
          <ChevronLeft className="h-5 w-5 text-gray-600" />
        </button>
        
        <h2 className="text-lg font-medium text-gray-900">
          {format(currentMonth, 'yyyy년 M월', { locale: ko })}
        </h2>
        
        <button
          onClick={handleNextMonth}
          className="p-2 -m-2 hover:bg-gray-50 rounded-full transition-all active:scale-95"
          aria-label="다음 달"
        >
          <ChevronRight className="h-5 w-5 text-gray-600" />
        </button>
      </div>

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 px-3 pt-4 pb-2">
        {WEEKDAYS.map((day, index) => (
          <div
            key={day}
            className={cn(
              'text-center text-xs font-medium',
              index === 0 ? 'text-red-400' : '',
              index === 6 ? 'text-blue-400' : 'text-gray-500'
            )}
          >
            {day}
          </div>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div className="grid grid-cols-7 gap-0 px-3 pb-4">
        {/* 빈 칸 (이전 달 날짜) */}
        {prefixDays.map((_, index) => (
          <div key={`empty-${index}`} className="aspect-square" />
        ))}
        
        {/* 현재 달 날짜 */}
        {monthDays.map((date) => {
          const isSelected = selectedDate && isSameDay(date, selectedDate)
          const isTodayDate = isToday(date)
          const isDiaryDate = hasDiary(date)
          const dayOfWeek = getDay(date)
          const dateDiaries = getDiariesForDate(date)

          return (
            <button
              key={date.toISOString()}
              onClick={() => onDateSelect(date)}
              className={cn(
                'aspect-square relative flex flex-col items-center justify-center rounded-xl transition-all',
                'hover:bg-gray-50 active:scale-95',
                isSelected && 'bg-gray-900 hover:bg-gray-800',
                isTodayDate && !isSelected && 'bg-green-50 text-green-600 font-semibold',
                isDiaryDate && !isSelected && !isTodayDate && 'bg-gray-50'
              )}
            >
              <span className={cn(
                "text-sm font-medium mb-1",
                isSelected && 'text-white',
                dayOfWeek === 0 && !isSelected && 'text-red-400',
                dayOfWeek === 6 && !isSelected && 'text-blue-400',
                !isSelected && dayOfWeek !== 0 && dayOfWeek !== 6 && !isTodayDate && 'text-gray-700'
              )}>
                {format(date, 'd')}
              </span>
              {isDiaryDate && dateDiaries.length > 0 && (
                <div className="absolute bottom-1">
                  <div className="flex gap-0.5">
                    {dateDiaries.length === 1 ? (
                      <div className={cn(
                        "w-1 h-1 rounded-full",
                        isSelected ? 'bg-white' : 'bg-green-500'
                      )} />
                    ) : dateDiaries.length === 2 ? (
                      <>
                        <div className={cn(
                          "w-1 h-1 rounded-full",
                          isSelected ? 'bg-white' : 'bg-green-500'
                        )} />
                        <div className={cn(
                          "w-1 h-1 rounded-full",
                          isSelected ? 'bg-white' : 'bg-green-500'
                        )} />
                      </>
                    ) : (
                      <>
                        <div className={cn(
                          "w-1 h-1 rounded-full",
                          isSelected ? 'bg-white' : 'bg-green-500'
                        )} />
                        <div className={cn(
                          "w-1 h-1 rounded-full",
                          isSelected ? 'bg-white' : 'bg-green-500'
                        )} />
                        <div className={cn(
                          "w-1 h-1 rounded-full",
                          isSelected ? 'bg-white' : 'bg-green-500'
                        )} />
                      </>
                    )}
                  </div>
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}