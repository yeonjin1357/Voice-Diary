'use client'

import { useState } from 'react'
import { Search, X } from 'lucide-react'

export interface SearchFilterValues {
  keyword: string
  emotion: string | null
  startDate: Date | null
  endDate: Date | null
}

interface SearchFilterProps {
  onFilterChange: (filters: SearchFilterValues) => void
  totalCount?: number
}

const EMOTIONS = [
  { value: '기쁨', label: '기쁨', color: '#fbbf24', emoji: '😊' },
  { value: '슬픔', label: '슬픔', color: '#60a5fa', emoji: '😢' },
  { value: '불안', label: '불안', color: '#f87171', emoji: '😰' },
  { value: '분노', label: '분노', color: '#fb923c', emoji: '😠' },
  { value: '평온', label: '평온', color: '#86efac', emoji: '😌' },
  { value: '기대', label: '기대', color: '#c084fc', emoji: '🤗' },
  { value: '놀람', label: '놀람', color: '#fde047', emoji: '😮' },
]

export function SearchFilter({
  onFilterChange,
  totalCount = 0,
}: SearchFilterProps) {
  const [keyword, setKeyword] = useState('')
  const [emotion, setEmotion] = useState<string | null>(null)
  const [appliedKeyword, setAppliedKeyword] = useState('')
  const [appliedEmotion, setAppliedEmotion] = useState<string | null>(null)

  const handleSearch = () => {
    setAppliedKeyword(keyword)
    setAppliedEmotion(emotion)
    onFilterChange({
      keyword,
      emotion,
      startDate: null,
      endDate: null,
    })
  }

  const handleEmotionChange = (newEmotion: string | null) => {
    setEmotion(newEmotion)
    setAppliedEmotion(newEmotion)
    onFilterChange({
      keyword: appliedKeyword,
      emotion: newEmotion,
      startDate: null,
      endDate: null,
    })
  }

  const handleReset = () => {
    setKeyword('')
    setEmotion(null)
    setAppliedKeyword('')
    setAppliedEmotion(null)
    onFilterChange({
      keyword: '',
      emotion: null,
      startDate: null,
      endDate: null,
    })
  }

  const hasActiveFilters = appliedKeyword || appliedEmotion

  return (
    <div className="mb-5 space-y-4">
      {/* 메인 검색 바 */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="flex items-center">
          <div className="flex flex-1 items-center">
            <Search className="ml-4 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="어떤 일기를 찾으시나요?"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1 border-0 bg-transparent px-3 py-2 outline-none placeholder:text-gray-400 focus:outline-none focus-visible:ring-0 focus-visible:outline-none"
              style={{ boxShadow: 'none' }}
            />
          </div>

          {/* 검색 버튼 */}
          <button
            onClick={handleSearch}
            className="h-full bg-gradient-to-r from-gray-800 to-gray-900 px-5 py-3 font-medium text-white transition-all hover:from-gray-900 hover:to-black active:scale-95"
          >
            <Search className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* 감정 필터 - 항상 표시 */}
      <div>
        <p className="mb-3 text-sm font-medium text-gray-700">감정으로 찾기</p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleEmotionChange(null)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
              !emotion
                ? 'bg-gray-900 text-white shadow-sm'
                : 'border border-gray-200 bg-white text-gray-700 hover:border-gray-300'
            }`}
          >
            전체
          </button>
          {EMOTIONS.map((e) => (
            <button
              key={e.value}
              onClick={() =>
                handleEmotionChange(e.value === emotion ? null : e.value)
              }
              className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                emotion === e.value
                  ? 'bg-gray-900 text-white shadow-sm'
                  : 'border border-gray-200 bg-white text-gray-700 hover:border-gray-300'
              }`}
            >
              <span>{e.emoji}</span>
              <span>{e.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 검색 결과 요약 - 실제로 필터가 적용된 경우에만 표시 */}
      {hasActiveFilters && (
        <div className="flex items-center justify-between px-2">
          <p className="text-sm text-gray-600">
            <span className="font-medium text-gray-900">{totalCount}개</span>의
            일기를 찾았어요
          </p>
          <button
            onClick={handleReset}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
          >
            <X className="h-3 w-3" />
            필터 초기화
          </button>
        </div>
      )}
    </div>
  )
}
