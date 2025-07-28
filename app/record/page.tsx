'use client'

import { useState, useEffect, useCallback } from 'react'
import { MobileLayout } from '@/components/layout/mobile-layout'
import { useRecorder } from '@/hooks/useRecorder'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Mic, Square, Pause, Play, Send, RotateCcw, Edit3 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { FullScreenLoader } from '@/components/ui/full-screen-loader'

export default function RecordPage() {
  const router = useRouter()
  const {
    isRecording,
    isPaused,
    recordingTime,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    resetRecording,
    audioLevel,
  } = useRecorder()

  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [transcript, setTranscript] = useState<string>('')
  const [editedTranscript, setEditedTranscript] = useState<string>('')
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('')
  const supabase = createClient()

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        toast.error('로그인이 필요합니다')
        router.push('/auth/login')
      }
    }

    checkUser()
  }, [supabase.auth, router])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleStartRecording = async () => {
    try {
      // 하루 일기 개수 체크
      const today = new Date().toISOString().split('T')[0]
      const { data: todayDiaries, error } = await supabase
        .from('diary_entries')
        .select('id')
        .eq('date', today)
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)

      if (!error && todayDiaries && todayDiaries.length >= 2) {
        toast.error('하루에 최대 2개의 일기만 작성할 수 있습니다')
        return
      }

      await startRecording()
      setAudioBlob(null)
    } catch (error) {
      console.error('녹음 시작 실패:', error)
      if (error instanceof Error) {
        toast.error(error.message)
      } else {
        toast.error('마이크 사용 권한을 허용해주세요')
      }
    }
  }

  const handleStopRecording = useCallback(async () => {
    const blob = await stopRecording()
    if (blob) {
      setAudioBlob(blob)
      toast.success(
        '녹음이 완료되었습니다! 저장 버튼을 눌러 일기를 작성하세요.',
      )
    }
  }, [stopRecording])

  const handleReRecord = () => {
    setAudioBlob(null)
    resetRecording()
  }

  const handleTranscribe = async () => {
    if (!audioBlob) return

    setIsProcessing(true)
    setLoadingMessage('음성을 텍스트로 변환하고 있습니다')
    try {
      // 1. Whisper API로 음성을 텍스트로 변환
      const formData = new FormData()
      formData.append('audio', audioBlob, 'recording.webm')

      const transcriptResponse = await fetch('/api/whisper', {
        method: 'POST',
        body: formData,
      })

      if (!transcriptResponse.ok) {
        throw new Error('음성을 텍스트로 변환하는데 실패했습니다')
      }

      const { transcript: text } = await transcriptResponse.json()
      setTranscript(text)
      setEditedTranscript(text)
      setShowEditDialog(true)
    } catch (error) {
      console.error('변환 실패:', error)
      if (error instanceof Error) {
        toast.error(error.message)
      } else {
        toast.error('음성 변환 중 오류가 발생했습니다')
      }
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSaveWithTranscript = async (finalTranscript: string) => {
    setIsProcessing(true)
    setLoadingMessage('감정을 분석하고 일기를 저장하고 있습니다')
    try {

      // 2. GPT-4로 감정 분석
      const analysisResponse = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transcript: finalTranscript }),
      })

      if (!analysisResponse.ok) {
        throw new Error('감정 분석에 실패했습니다')
      }

      const { analysis } = await analysisResponse.json()

      // 3. Supabase에 저장
      const today = new Date().toISOString().split('T')[0]

      const diaryResponse = await fetch('/api/diary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: today,
          audioUrl: null, // TODO: 음성 파일 업로드 구현
          transcript,
          summary: analysis.summary,
          emotions: analysis.emotions,
          keywords: analysis.keywords,
        }),
      })

      if (!diaryResponse.ok) {
        const errorData = await diaryResponse.json()
        console.error('일기 저장 실패:', errorData)
        throw new Error(errorData.error || '일기 저장에 실패했습니다')
      }

      const { diaryId } = await diaryResponse.json()

      // 4. 일기 상세 페이지로 이동
      router.push(`/diary/${diaryId}`)
    } catch (error) {
      console.error('저장 실패:', error)
      if (error instanceof Error) {
        toast.error(error.message)
      } else {
        toast.error('일기 저장 중 오류가 발생했습니다')
      }
    } finally {
      setIsProcessing(false)
    }
  }

  const header = (
    <div className="px-4 py-3">
      <h1 className="text-lg font-semibold">음성 일기 녹음</h1>
    </div>
  )

  // 녹음 시간 제한 체크 (실시간)
  useEffect(() => {
    if (isRecording) {
      const maxSeconds = 3 * 60 // 3분
      if (recordingTime >= maxSeconds) {
        handleStopRecording()
        toast.error('최대 녹음 시간(3분)에 도달했습니다')
      }
    }
  }, [recordingTime, isRecording, handleStopRecording])

  return (
    <MobileLayout header={header}>
      <div className="flex h-[calc(100vh-8rem)] flex-col px-4 py-6">
        {/* 녹음 상태 표시 */}
        <div className="flex flex-1 flex-col items-center justify-center space-y-8">
          {/* 오디오 레벨 시각화 */}
          <div className="relative">
            <div
              className={cn(
                'flex h-32 w-32 items-center justify-center rounded-full transition-all',
                isRecording && !isPaused
                  ? 'bg-red-100 dark:bg-red-900/20'
                  : 'bg-neutral-100 dark:bg-neutral-800',
              )}
            >
              {isRecording ? (
                <div
                  className="absolute inset-0 animate-pulse rounded-full bg-red-500/20"
                  style={{
                    transform: `scale(${1 + audioLevel * 0.5})`,
                    transition: 'transform 0.1s ease-out',
                  }}
                />
              ) : null}
              <Mic
                className={cn(
                  'relative z-10 h-12 w-12',
                  isRecording ? 'text-red-500' : 'text-neutral-400',
                )}
              />
            </div>
          </div>

          {/* 녹음 시간 */}
          <div className="text-center">
            <p className="font-mono text-3xl font-medium">
              {formatTime(recordingTime)}
            </p>
            <p className="mt-1 text-sm text-neutral-500">
              {isRecording
                ? isPaused
                  ? '일시정지됨'
                  : '녹음 중...'
                : audioBlob
                  ? '녹음 완료'
                  : '녹음 시작을 눌러주세요'}
            </p>
            {/* 녹음 시간 제한 표시 */}
            <p className="mt-2 text-xs text-neutral-400">최대 3분</p>
          </div>

          {/* 컨트롤 버튼 */}
          <div className="flex items-center gap-4">
            {!isRecording && !audioBlob && (
              <Button
                size="lg"
                onClick={handleStartRecording}
                className="h-16 w-16 transform rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg transition-all hover:scale-105 hover:from-purple-600 hover:to-pink-600"
              >
                <Mic className="h-6 w-6" />
              </Button>
            )}

            {isRecording && (
              <>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={isPaused ? resumeRecording : pauseRecording}
                  className="h-14 w-14 rounded-full"
                >
                  {isPaused ? (
                    <Play className="h-5 w-5" />
                  ) : (
                    <Pause className="h-5 w-5" />
                  )}
                </Button>

                <Button
                  size="lg"
                  onClick={handleStopRecording}
                  className="h-16 w-16 rounded-full bg-neutral-900 text-white hover:bg-neutral-800"
                >
                  <Square className="h-6 w-6" />
                </Button>
              </>
            )}

            {audioBlob && !isRecording && (
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-center gap-2">
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={handleReRecord}
                    className="h-14 w-14 rounded-full"
                  >
                    <RotateCcw className="h-5 w-5" />
                  </Button>
                  <p className="text-xs text-neutral-500">재녹음</p>
                </div>

                <div className="flex flex-col items-center gap-2">
                  <Button
                    size="lg"
                    onClick={handleTranscribe}
                    disabled={isProcessing}
                    className="h-16 w-16 transform rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg transition-all hover:scale-105 hover:from-purple-600 hover:to-pink-600"
                  >
                    <Send className="h-6 w-6" />
                  </Button>
                  <p className="text-xs text-neutral-500">
                    {isProcessing ? '변환 중...' : '저장하기'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 팁 카드 */}
        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 p-4 dark:border-purple-800 dark:from-purple-900/20 dark:to-pink-900/20">
          <p className="text-sm text-purple-700 dark:text-purple-300">
            💭 편안한 마음으로 오늘 있었던 일과 느낀 감정을 자유롭게
            이야기해주세요
          </p>
        </Card>
      </div>

      {/* 텍스트 편집 다이얼로그 */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="mx-4 max-h-[90vh] max-w-[500px] overflow-y-auto rounded-2xl bg-white p-0 shadow-xl">
          <DialogHeader className="border-b border-gray-100 px-6 py-5">
            <DialogTitle className="text-xl font-semibold text-gray-900">
              음성 인식 결과
            </DialogTitle>
            <DialogDescription className="mt-1.5 text-sm text-gray-500">
              잘못 인식된 부분이 있다면 수정해주세요
            </DialogDescription>
          </DialogHeader>
          <div className="px-6 py-5">
            <div className="space-y-4">
              <div>
                <label className="mb-3 block text-sm font-medium text-gray-700">
                  변환된 텍스트
                </label>
                <Textarea
                  value={editedTranscript}
                  onChange={(e) => setEditedTranscript(e.target.value)}
                  className="min-h-[240px] resize-none rounded-xl border-gray-200 bg-gray-50 px-4 py-3 text-[15px] leading-relaxed placeholder:text-gray-400 focus:border-purple-300 focus:bg-white focus:ring-2 focus:ring-purple-100"
                  placeholder="텍스트를 입력하세요..."
                />
              </div>
              <div className="flex items-start gap-2.5 rounded-lg bg-purple-50 p-3.5">
                <Edit3 className="mt-0.5 h-4 w-4 flex-shrink-0 text-purple-600" />
                <p className="text-sm leading-relaxed text-purple-700">
                  직접 수정하여 더 정확한 일기를 작성할 수 있어요
                </p>
              </div>
            </div>
          </div>
          <DialogFooter className="border-t border-gray-100 bg-gray-50 px-6 py-4">
            <div className="flex w-full gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowEditDialog(false)
                  setTranscript('')
                  setEditedTranscript('')
                }}
                className="flex-1 rounded-xl border-gray-200 bg-white py-6 text-gray-700 hover:bg-gray-50"
              >
                다시 녹음
              </Button>
              <Button
                onClick={() => {
                  setShowEditDialog(false)
                  handleSaveWithTranscript(editedTranscript)
                }}
                disabled={!editedTranscript.trim()}
                className="flex-1 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 py-6 text-white shadow-md hover:from-purple-600 hover:to-pink-600 disabled:opacity-50"
              >
                일기 저장
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 전체 화면 로딩 */}
      {isProcessing && <FullScreenLoader message={loadingMessage} />}
    </MobileLayout>
  )
}
