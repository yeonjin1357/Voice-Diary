'use client'

import { useEffect, useState } from 'react'
import { MobileLayout } from '@/components/layout/mobile-layout'
import { DiaryCard } from '@/components/diary/diary-card'
import { DiaryEntry } from '@/types'
import { Calendar } from '@/components/diary/calendar'
import { useDiary } from '@/hooks/useDiary'
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  List,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { SearchFilter, SearchFilterValues } from '@/components/diary/search-filter'

type ViewMode = 'list' | 'calendar'

export default function DiaryPage() {
  const router = useRouter()
  const { diaries, loading, error, fetchDiaries } = useDiary()

  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [showDiarySelection, setShowDiarySelection] = useState(false)
  const [selectedDateDiaries, setSelectedDateDiaries] = useState<DiaryEntry[]>([])
  const [, setFilterValues] = useState<SearchFilterValues>({
    keyword: '',
    emotion: null,
    startDate: null,
    endDate: null,
  })
  const [isFiltering, setIsFiltering] = useState(false)
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth() + 1

  useEffect(() => {
    if (!isFiltering) {
      fetchDiaries(year, month)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, month, isFiltering])

  const handlePreviousMonth = () => {
    setCurrentDate(new Date(year, month - 2, 1))
    setIsFiltering(false) // 월 변경 시 필터 초기화
    setFilterValues({
      keyword: '',
      emotion: null,
      startDate: null,
      endDate: null,
    })
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month, 1))
    setIsFiltering(false) // 월 변경 시 필터 초기화
    setFilterValues({
      keyword: '',
      emotion: null,
      startDate: null,
      endDate: null,
    })
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
    const dateDiaries = diaries.filter(
      (d) =>
        format(new Date(d.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'),
    )
    
    if (dateDiaries.length === 1) {
      // 일기가 하나만 있으면 바로 이동
      handleDiaryClick(dateDiaries[0].id)
    } else if (dateDiaries.length > 1) {
      // 일기가 여러 개 있으면 선택 화면 표시
      setSelectedDateDiaries(dateDiaries)
      setShowDiarySelection(true)
    }
  }

  const handleFilterChange = async (filters: SearchFilterValues) => {
    setFilterValues(filters)
    const hasFilters = !!(filters.keyword || filters.emotion || filters.startDate || filters.endDate)
    setIsFiltering(hasFilters)
    
    if (hasFilters) {
      // 필터링된 결과 가져오기
      await fetchDiaries(year, month, filters)
    } else {
      // 필터가 없으면 현재 월의 모든 일기 표시
      await fetchDiaries(year, month)
    }
  }

  const formatMonthYear = (date: Date) => {
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월`
  }

  // 일기가 있는 날짜들 추출
  const diaryDates = diaries.map((diary) => new Date(diary.date))

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
      <div className="flex justify-center px-4">
        <div className="flex w-fit rounded-full bg-gray-100 p-1">
          <button
            onClick={() => setViewMode('list')}
            className={cn(
              'flex items-center px-4 py-1.5 rounded-full text-sm font-medium transition-all',
              viewMode === 'list'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            )}
          >
            <List className="mr-1.5 h-4 w-4" />
            목록
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={cn(
              'flex items-center px-4 py-1.5 rounded-full text-sm font-medium transition-all',
              viewMode === 'calendar'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            )}
          >
            <CalendarIcon className="mr-1.5 h-4 w-4" />
            캘린더
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <MobileLayout header={header}>
      <div className="px-4 py-4">
        {/* 검색 및 필터 컴포넌트 */}
        <SearchFilter 
          onFilterChange={handleFilterChange}
          totalCount={diaries.length}
        />
        
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <p className="text-neutral-500">일기를 불러오는 중...</p>
          </div>
        ) : error ? (
          <div className="flex h-64 flex-col items-center justify-center space-y-4">
            <p className="text-red-500">{error}</p>
            <Button variant="outline" onClick={() => fetchDiaries(year, month)}>
              다시 시도
            </Button>
          </div>
        ) : diaries.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center space-y-4">
            <p className="text-neutral-500">
              {isFiltering ? '검색 결과가 없습니다' : '이번 달에 작성한 일기가 없습니다'}
            </p>
            {!isFiltering && (
              <Button onClick={handleNewDiary}>
                <Plus className="mr-2 h-4 w-4" />첫 일기 작성하기
              </Button>
            )}
          </div>
        ) : viewMode === 'calendar' ? (
          <Calendar
            selectedDate={selectedDate}
            onDateSelect={handleDateSelect}
            diaryDates={diaryDates}
            diaries={diaries}
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
        <button
          onClick={handleNewDiary}
          className="fixed right-4 bottom-20 h-14 w-14 flex items-center justify-center rounded-full bg-gray-900 shadow-lg transition-all hover:bg-gray-800 active:scale-95"
        >
          <Plus className="h-6 w-6 text-white" />
        </button>
      )}

      {/* 일기 선택 모달 */}
      {showDiarySelection && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="text-lg font-medium text-gray-900">
                {selectedDate && format(selectedDate, 'yyyy년 M월 d일', { locale: ko })}
              </h3>
              <button
                onClick={() => {
                  setShowDiarySelection(false)
                  setSelectedDateDiaries([])
                }}
                className="p-2 -m-2 hover:bg-gray-50 rounded-full transition-all"
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>
            <div className="p-4 space-y-3 overflow-y-auto max-h-[calc(80vh-80px)]">
              {selectedDateDiaries.map((diary, index) => (
                <button
                  key={diary.id}
                  onClick={() => {
                    handleDiaryClick(diary.id)
                    setShowDiarySelection(false)
                    setSelectedDateDiaries([])
                  }}
                  className="w-full p-4 bg-gray-50 hover:bg-gray-100 rounded-xl text-left transition-all active:scale-[0.98]">
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-sm font-medium text-gray-900">
                      {index + 1}번째 일기
                    </p>
                    <div className="flex gap-1">
                      {diary.emotions?.slice(0, 2).map((emotion, idx) => {
                        const emojiMap: Record<string, string> = {
                          '기쁨': '😊',
                          '슬픔': '😢',
                          '불안': '😰',
                          '분노': '😠',
                          '평온': '😌',
                          '기대': '🤗',
                          '놀람': '😮'
                        }
                        return (
                          <span key={idx} className="text-base">
                            {emojiMap[emotion.type] || '📝'}
                          </span>
                        )
                      })}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {diary.summary}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </MobileLayout>
  )
}
