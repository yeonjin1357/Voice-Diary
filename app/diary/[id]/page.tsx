'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { MobileLayout } from '@/components/layout/mobile-layout'
import { DiaryEntry } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Calendar, Hash, Trash2, Play, Pause } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DiaryDetailPageProps {
  params: Promise<{ id: string }>
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

export default function DiaryDetailPage({ params }: DiaryDetailPageProps) {
  const router = useRouter()
  const [diary, setDiary] = useState<DiaryEntry | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null)
  const [diaryId, setDiaryId] = useState<string | null>(null)

  useEffect(() => {
    params.then(p => {
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

  const formatDate = (date: Date) => {
    const d = new Date(date)
    return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`
  }

  const getDayOfWeek = (date: Date) => {
    const days = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일']
    return days[new Date(date).getDay()]
  }

  const header = (
    <div className="flex items-center justify-between px-4 py-3">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => router.back()}
        className="h-8 w-8"
      >
        <ArrowLeft className="h-4 w-4" />
      </Button>
      
      <h1 className="text-lg font-semibold">일기 상세</h1>
      
      <Button
        variant="ghost"
        size="icon"
        onClick={handleDelete}
        disabled={isDeleting}
        className="h-8 w-8 text-red-500 hover:text-red-600"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )

  if (loading) {
    return (
      <MobileLayout header={header}>
        <div className="flex items-center justify-center h-64">
          <p className="text-neutral-500">일기를 불러오는 중...</p>
        </div>
      </MobileLayout>
    )
  }

  if (error || !diary) {
    return (
      <MobileLayout header={header}>
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <p className="text-red-500">{error || '일기를 찾을 수 없습니다.'}</p>
          <Button onClick={() => router.push('/diary')}>
            목록으로 돌아가기
          </Button>
        </div>
      </MobileLayout>
    )
  }

  return (
    <MobileLayout header={header}>
      <div className="px-4 py-4 space-y-4">
        {/* 날짜 정보 */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-sm text-neutral-500">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(diary.date)}</span>
              <span>({getDayOfWeek(diary.date)})</span>
            </div>
          </CardContent>
        </Card>

        {/* 감정 분석 */}
        <Card>
          <CardContent className="pt-6">
            <h2 className="font-semibold mb-3">오늘의 감정</h2>
            <div className="space-y-3">
              {diary.emotions.map((emotion) => (
                <div key={emotion.type} className="flex items-center justify-between">
                  <Badge
                    variant="secondary"
                    className={cn('text-xs font-medium', emotionColors[emotion.type])}
                  >
                    {emotion.type}
                  </Badge>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-neutral-200 rounded-full h-2">
                      <div
                        className={cn('h-2 rounded-full', emotion.type === '기쁨' ? 'bg-amber-400' :
                          emotion.type === '슬픔' ? 'bg-blue-400' :
                          emotion.type === '불안' ? 'bg-red-400' :
                          emotion.type === '분노' ? 'bg-orange-400' :
                          emotion.type === '평온' ? 'bg-green-400' :
                          emotion.type === '기대' ? 'bg-purple-400' :
                          'bg-yellow-400'
                        )}
                        style={{ width: `${emotion.score}%` }}
                      />
                    </div>
                    <span className="text-sm text-neutral-600 w-10 text-right">
                      {emotion.score}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 요약 */}
        <Card>
          <CardContent className="pt-6">
            <h2 className="font-semibold mb-3">요약</h2>
            <p className="text-sm text-neutral-700 dark:text-neutral-300">
              {diary.summary}
            </p>
          </CardContent>
        </Card>

        {/* 음성 재생 */}
        {diary.audioUrl && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">음성 녹음</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleAudioPlayback}
                  className="gap-2"
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
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 일기 내용 */}
        <Card>
          <CardContent className="pt-6">
            <h2 className="font-semibold mb-3">일기 내용</h2>
            <p className="text-sm text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap">
              {diary.transcript}
            </p>
          </CardContent>
        </Card>

        {/* 키워드 */}
        {diary.keywords.length > 0 && (
          <Card>
            <CardContent className="pt-6">
              <h2 className="font-semibold mb-3">키워드</h2>
              <div className="flex items-center gap-2 flex-wrap">
                {diary.keywords.map((keyword) => (
                  <div
                    key={keyword}
                    className="flex items-center gap-1 px-3 py-1 bg-neutral-100 dark:bg-neutral-800 rounded-full"
                  >
                    <Hash className="h-3 w-3 text-neutral-400" />
                    <span className="text-sm">{keyword}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MobileLayout>
  )
}