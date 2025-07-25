'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { MobileLayout } from '@/components/layout/mobile-layout'
import { DiaryEntry } from '@/types'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import {
  ArrowLeft,
  Calendar,
  Hash,
  Trash2,
  Play,
  Pause,
  Edit,
  X,
  Plus,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface DiaryDetailPageProps {
  params: Promise<{ id: string }>
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

const emotionGradients = {
  기쁨: 'from-amber-400 to-amber-500',
  슬픔: 'from-blue-400 to-blue-500',
  불안: 'from-red-400 to-red-500',
  분노: 'from-orange-400 to-orange-500',
  평온: 'from-green-400 to-green-500',
  기대: 'from-purple-400 to-purple-500',
  놀람: 'from-yellow-400 to-yellow-500',
}

export default function DiaryDetailPage({ params }: DiaryDetailPageProps) {
  const router = useRouter()
  const [diary, setDiary] = useState<DiaryEntry | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null)
  const [diaryId, setDiaryId] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editedSummary, setEditedSummary] = useState('')
  const [editedTranscript, setEditedTranscript] = useState('')
  const [editedKeywords, setEditedKeywords] = useState<string[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [newKeyword, setNewKeyword] = useState('')

  useEffect(() => {
    params.then((p) => {
      setDiaryId(p.id)
    })
  }, [params])

  useEffect(() => {
    if (diaryId) {
      fetchDiary()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [diaryId])

  const fetchDiary = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/diary/${diaryId}`)

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('일기를 찾을 수 없습니다.')
        }
        throw new Error('일기를 불러오는데 실패했습니다.')
      }

      const { diary } = await response.json()
      setDiary(diary)
      setEditedSummary(diary.summary)
      setEditedTranscript(diary.transcript)
      setEditedKeywords(diary.keywords)
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('정말로 이 일기를 삭제하시겠습니까?')) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/diary/${diaryId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('일기 삭제에 실패했습니다.')
      }

      router.push('/diary')
    } catch (err) {
      alert(err instanceof Error ? err.message : '삭제 중 오류가 발생했습니다.')
    } finally {
      setIsDeleting(false)
    }
  }

  const toggleAudioPlayback = () => {
    if (!diary?.audioUrl) return

    if (isPlaying && audio) {
      audio.pause()
      setIsPlaying(false)
    } else {
      const newAudio = new Audio(diary.audioUrl)
      newAudio.onended = () => setIsPlaying(false)
      newAudio.play()
      setAudio(newAudio)
      setIsPlaying(true)
    }
  }

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    if (diary) {
      setEditedSummary(diary.summary)
      setEditedTranscript(diary.transcript)
      setEditedKeywords(diary.keywords)
    }
  }

  const handleSaveEdit = async () => {
    if (!diary || !diaryId) return

    setIsSaving(true)
    try {
      const response = await fetch(`/api/diary/${diaryId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          summary: editedSummary,
          transcript: editedTranscript,
          keywords: editedKeywords,
        }),
      })

      if (!response.ok) {
        throw new Error('일기 수정에 실패했습니다.')
      }

      const { diary: updatedDiary } = await response.json()
      setDiary(updatedDiary)
      setIsEditing(false)
    } catch (err) {
      alert(err instanceof Error ? err.message : '수정 중 오류가 발생했습니다.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleKeywordAdd = (keyword: string) => {
    if (keyword.trim() && !editedKeywords.includes(keyword.trim())) {
      setEditedKeywords([...editedKeywords, keyword.trim()])
    }
  }

  const handleKeywordRemove = (keyword: string) => {
    setEditedKeywords(editedKeywords.filter((k) => k !== keyword))
  }

  const formatDate = (date: Date) => {
    const d = new Date(date)
    return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`
  }

  const getDayOfWeek = (date: Date) => {
    const days = [
      '일요일',
      '월요일',
      '화요일',
      '수요일',
      '목요일',
      '금요일',
      '토요일',
    ]
    return days[new Date(date).getDay()]
  }

  const header = (
    <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100">
      <button
        onClick={() => router.back()}
        className="p-2 -m-2 hover:bg-gray-50 rounded-full transition-all active:scale-95"
      >
        <ArrowLeft className="h-5 w-5 text-gray-600" />
      </button>

      <h1 className="text-lg font-medium text-gray-900">일기 상세</h1>

      <div className="flex gap-1">
        {!isEditing && (
          <button
            onClick={handleEdit}
            className="p-2 -m-2 hover:bg-gray-50 rounded-full transition-all active:scale-95"
          >
            <Edit className="h-5 w-5 text-gray-600" />
          </button>
        )}
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="p-2 -m-2 hover:bg-red-50 rounded-full transition-all active:scale-95 text-red-500 hover:text-red-600"
        >
          <Trash2 className="h-5 w-5" />
        </button>
      </div>
    </div>
  )

  if (loading) {
    return (
      <MobileLayout header={header}>
        <div className="flex h-64 items-center justify-center">
          <p className="text-neutral-500">일기를 불러오는 중...</p>
        </div>
      </MobileLayout>
    )
  }

  if (error || !diary) {
    return (
      <MobileLayout header={header}>
        <div className="flex h-64 flex-col items-center justify-center space-y-4">
          <p className="text-red-500">{error || '일기를 찾을 수 없습니다.'}</p>
          <button 
            onClick={() => router.push('/diary')}
            className="px-4 py-2 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 transition-all active:scale-[0.98]"
          >
            목록으로 돌아가기
          </button>
        </div>
      </MobileLayout>
    )
  }

  return (
    <MobileLayout header={header}>
      <div className="space-y-4 px-4 py-4 bg-gray-50 min-h-screen">
        {/* 날짜 정보 */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
              <Calendar className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{formatDate(diary.date)}</p>
              <p className="text-xs text-gray-500">{getDayOfWeek(diary.date)}</p>
            </div>
          </div>
        </div>

        {/* 감정 분석 */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <h2 className="mb-4 font-medium text-gray-900">오늘의 감정</h2>
          <div className="space-y-3">
            {diary.emotions.map((emotion) => (
              <div
                key={emotion.type}
                className="flex items-center justify-between"
              >
                <span className={cn(
                  'inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium border',
                  emotionColors[emotion.type]
                )}>
                  {emotion.type}
                </span>
                <div className="flex items-center gap-3">
                  <div className="h-2 w-32 rounded-full bg-gray-100">
                    <div
                      className={cn(
                        'h-2 rounded-full bg-gradient-to-r',
                        emotionGradients[emotion.type]
                      )}
                      style={{ width: `${emotion.score}%` }}
                    />
                  </div>
                  <span className="w-10 text-right text-sm font-medium text-gray-700">
                    {emotion.score}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 요약 */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <h2 className="mb-3 font-medium text-gray-900">요약</h2>
          {isEditing ? (
            <Textarea
              value={editedSummary}
              onChange={(e) => setEditedSummary(e.target.value)}
              className="min-h-[80px] text-sm border-gray-200 focus:border-gray-400 focus:ring-1 focus:ring-gray-400"
              placeholder="요약을 입력하세요"
            />
          ) : (
            <p className="text-sm text-gray-700 leading-relaxed">
              {diary.summary}
            </p>
          )}
        </div>

        {/* 음성 재생 */}
        {diary.audioUrl && (
          <div className="bg-white rounded-2xl p-5 border border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="font-medium text-gray-900">음성 녹음</h2>
              <button
                onClick={toggleAudioPlayback}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all active:scale-95",
                  isPlaying 
                    ? "bg-gray-900 text-white hover:bg-gray-800" 
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                )}
              >
                {isPlaying ? (
                  <>
                    <Pause className="h-4 w-4" />
                    일시정지
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    재생
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* 일기 내용 */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <h2 className="mb-3 font-medium text-gray-900">일기 내용</h2>
          {isEditing ? (
            <Textarea
              value={editedTranscript}
              onChange={(e) => setEditedTranscript(e.target.value)}
              className="min-h-[200px] text-sm border-gray-200 focus:border-gray-400 focus:ring-1 focus:ring-gray-400"
              placeholder="일기 내용을 입력하세요"
            />
          ) : (
            <p className="text-sm whitespace-pre-wrap text-gray-700 leading-relaxed">
              {diary.transcript}
            </p>
          )}
        </div>

        {/* 키워드 */}
        {(diary.keywords.length > 0 || isEditing) && (
          <div className="bg-white rounded-2xl p-5 border border-gray-100">
            <h2 className="mb-3 font-medium text-gray-900">키워드</h2>
            {isEditing ? (
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  {editedKeywords.map((keyword) => (
                    <div
                      key={keyword}
                      className="flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-sm"
                    >
                      <Hash className="h-3 w-3 text-gray-500" />
                      <span className="text-gray-700">{keyword}</span>
                      <button
                        onClick={() => handleKeywordRemove(keyword)}
                        className="ml-1 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleKeywordAdd(newKeyword)
                        setNewKeyword('')
                      }
                    }}
                    placeholder="새 키워드 추가"
                    className="flex-1 border-gray-200 focus:border-gray-400 focus:ring-1 focus:ring-gray-400"
                  />
                  <button
                    onClick={() => {
                      handleKeywordAdd(newKeyword)
                      setNewKeyword('')
                    }}
                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all active:scale-95"
                  >
                    <Plus className="h-4 w-4 text-gray-600" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                {diary.keywords.map((keyword) => (
                  <div
                    key={keyword}
                    className="flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5"
                  >
                    <Hash className="h-3 w-3 text-gray-500" />
                    <span className="text-sm text-gray-700">{keyword}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 편집 모드 버튼 */}
      {isEditing && (
        <div className="sticky right-0 bottom-0 left-0 flex gap-3 border-t bg-white p-4 shadow-lg">
          <button
            onClick={handleCancelEdit}
            className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-all active:scale-[0.98] disabled:opacity-50"
            disabled={isSaving}
          >
            취소
          </button>
          <button
            onClick={handleSaveEdit}
            className="flex-1 py-3 px-4 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 transition-all active:scale-[0.98] disabled:opacity-50"
            disabled={isSaving}
          >
            {isSaving ? '저장 중...' : '저장'}
          </button>
        </div>
      )}
    </MobileLayout>
  )
}
