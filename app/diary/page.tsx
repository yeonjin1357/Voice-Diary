'use client'

import { useEffect, useState } from 'react'
import { MobileLayout } from '@/components/layout/mobile-layout'
import { DiaryCard } from '@/components/diary/diary-card'
import { Calendar } from '@/components/diary/calendar'
import { useDiary } from '@/hooks/useDiary'
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, List } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'

type ViewMode = 'list' | 'calendar'

export default function DiaryPage() {
  const router = useRouter()
  const { diaries, loading, error, fetchDiaries } = useDiary()
  
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth() + 1

  useEffect(() => {
    fetchDiaries(year, month)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, month])

  const handlePreviousMonth = () => {
    setCurrentDate(new Date(year, month - 2, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month, 1))
  }

  const handleDiaryClick = (diaryId: string) => {
    router.push(`/diary/${diaryId}`)
  }

  const handleNewDiary = () => {
    router.push('/record')
  }

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
    // 선택한 날짜의 일기 찾기
    const diary = diaries.find(d => 
      format(new Date(d.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    )
    if (diary) {
      handleDiaryClick(diary.id)
    }
  }

  const formatMonthYear = (date: Date) => {
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월`
  }

  // 일기가 있는 날짜들 추출
  const diaryDates = diaries.map(diary => new Date(diary.date))

  const header = (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-4 py-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={handlePreviousMonth}
          className="h-8 w-8"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <h1 className="text-lg font-semibold">
          {formatMonthYear(currentDate)}
        </h1>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={handleNextMonth}
          className="h-8 w-8"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* 뷰 모드 전환 버튼 */}
      <div className="flex gap-2 px-4">
        <Button
          variant={viewMode === 'list' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setViewMode('list')}
          className="flex-1"
        >
          <List className="h-4 w-4 mr-2" />
          목록
        </Button>
        <Button
          variant={viewMode === 'calendar' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setViewMode('calendar')}
          className="flex-1"
        >
          <CalendarIcon className="h-4 w-4 mr-2" />
          캘린더
        </Button>
      </div>
    </div>
  )

  return (
    <MobileLayout header={header}>
      <div className="px-4 py-4">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-neutral-500">일기를 불러오는 중...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <p className="text-red-500">{error}</p>
            <Button
              variant="outline"
              onClick={() => fetchDiaries(year, month)}
            >
              다시 시도
            </Button>
          </div>
        ) : diaries.length === 0 && viewMode === 'list' ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <p className="text-neutral-500">
              이번 달에 작성한 일기가 없습니다
            </p>
            <Button onClick={handleNewDiary}>
              <Plus className="w-4 h-4 mr-2" />
              첫 일기 작성하기
            </Button>
          </div>
        ) : viewMode === 'calendar' ? (
          <Calendar
            selectedDate={selectedDate}
            onDateSelect={handleDateSelect}
            diaryDates={diaryDates}
            className="mt-2"
          />
        ) : (
          <div className="space-y-3">
            {diaries.map((diary) => (
              <DiaryCard
                key={diary.id}
                diary={diary}
                onClick={() => handleDiaryClick(diary.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* 플로팅 액션 버튼 */}
      {diaries.length > 0 && (
        <Button
          onClick={handleNewDiary}
          className="fixed bottom-20 right-4 h-14 w-14 rounded-full shadow-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transform transition-all hover:scale-110"
        >
          <Plus className="h-6 w-6" />
        </Button>
      )}
    </MobileLayout>
  )
}