'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, addMonths, subMonths } from 'date-fns'
import { ko } from 'date-fns/locale'

interface CalendarProps {
  selectedDate: Date | null
  onDateSelect: (date: Date) => void
  diaryDates: Date[] // 일기가 있는 날짜들
  className?: string
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

export function Calendar({ selectedDate, onDateSelect, diaryDates, className }: CalendarProps) {
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

  return (
    <div className={cn('bg-white rounded-lg border p-4', className)}>
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={handlePrevMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="이전 달"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        
        <h2 className="text-lg font-semibold">
          {format(currentMonth, 'yyyy년 M월', { locale: ko })}
        </h2>
        
        <button
          onClick={handleNextMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="다음 달"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {WEEKDAYS.map((day, index) => (
          <div
            key={day}
            className={cn(
              'text-center text-xs font-medium py-2',
              index === 0 ? 'text-red-500' : '',
              index === 6 ? 'text-blue-500' : ''
            )}
          >
            {day}
          </div>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div className="grid grid-cols-7 gap-1">
        {/* 빈 칸 (이전 달 날짜) */}
        {prefixDays.map((_, index) => (
          <div key={`empty-${index}`} className="aspect-square" />
        ))}
        
        {/* 현재 달 날짜 */}
        {monthDays.map((date) => {
          const isSelected = selectedDate && isSameDay(date, selectedDate)
          const isToday = isSameDay(date, new Date())
          const isDiaryDate = hasDiary(date)
          const dayOfWeek = getDay(date)

          return (
            <button
              key={date.toISOString()}
              onClick={() => onDateSelect(date)}
              className={cn(
                'aspect-square rounded-lg relative flex items-center justify-center text-sm font-medium transition-all',
                'hover:bg-gray-100',
                isSelected && 'bg-primary text-white hover:bg-primary-dark',
                isToday && !isSelected && 'bg-gray-100',
                isDiaryDate && !isSelected && 'font-bold',
                dayOfWeek === 0 && 'text-red-500',
                dayOfWeek === 6 && 'text-blue-500'
              )}
            >
              <span>{format(date, 'd')}</span>
              {isDiaryDate && (
                <span className={cn(
                  'absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full',
                  isSelected ? 'bg-white' : 'bg-primary'
                )} />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}