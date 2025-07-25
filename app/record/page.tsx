'use client'

import { useState, useEffect } from 'react'
import { MobileLayout } from '@/components/layout/mobile-layout'
import { useRecorder } from '@/hooks/useRecorder'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Mic, Square, Pause, Play, Send, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

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
  const supabase = createClient()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
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

  const handleStopRecording = async () => {
    const blob = await stopRecording()
    if (blob) {
      setAudioBlob(blob)
      toast.success('녹음이 완료되었습니다! 저장 버튼을 눌러 일기를 작성하세요.')
    }
  }

  const handleReRecord = () => {
    setAudioBlob(null)
    resetRecording()
  }

  const handleSave = async () => {
    if (!audioBlob) return
    
    setIsProcessing(true)
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
      
      const { transcript } = await transcriptResponse.json()
      
      // 2. GPT-4로 감정 분석
      const analysisResponse = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transcript }),
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

  return (
    <MobileLayout header={header}>
      <div className="flex flex-col h-[calc(100vh-8rem)] px-4 py-6">
        {/* 녹음 상태 표시 */}
        <div className="flex-1 flex flex-col items-center justify-center space-y-8">
          {/* 오디오 레벨 시각화 */}
          <div className="relative">
            <div className={cn(
              "w-32 h-32 rounded-full flex items-center justify-center transition-all",
              isRecording && !isPaused 
                ? "bg-red-100 dark:bg-red-900/20" 
                : "bg-neutral-100 dark:bg-neutral-800"
            )}>
              {isRecording ? (
                <div 
                  className="absolute inset-0 rounded-full bg-red-500/20 animate-pulse"
                  style={{
                    transform: `scale(${1 + audioLevel * 0.5})`,
                    transition: 'transform 0.1s ease-out'
                  }}
                />
              ) : null}
              <Mic className={cn(
                "w-12 h-12 relative z-10",
                isRecording ? "text-red-500" : "text-neutral-400"
              )} />
            </div>
          </div>

          {/* 녹음 시간 */}
          <div className="text-center">
            <p className="text-3xl font-mono font-medium">
              {formatTime(recordingTime)}
            </p>
            <p className="text-sm text-neutral-500 mt-1">
              {isRecording 
                ? (isPaused ? "일시정지됨" : "녹음 중...")
                : (audioBlob ? "녹음 완료" : "녹음 시작을 눌러주세요")
              }
            </p>
          </div>

          {/* 컨트롤 버튼 */}
          <div className="flex items-center gap-4">
            {!isRecording && !audioBlob && (
              <Button
                size="lg"
                onClick={handleStartRecording}
                className="rounded-full w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg transform transition-all hover:scale-105"
              >
                <Mic className="w-6 h-6" />
              </Button>
            )}

            {isRecording && (
              <>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={isPaused ? resumeRecording : pauseRecording}
                  className="rounded-full w-14 h-14"
                >
                  {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
                </Button>
                
                <Button
                  size="lg"
                  onClick={handleStopRecording}
                  className="rounded-full w-16 h-16 bg-neutral-900 hover:bg-neutral-800 text-white"
                >
                  <Square className="w-6 h-6" />
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
                    className="rounded-full w-14 h-14"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </Button>
                  <p className="text-xs text-neutral-500">재녹음</p>
                </div>
                
                <div className="flex flex-col items-center gap-2">
                  <Button
                    size="lg"
                    onClick={handleSave}
                    disabled={isProcessing}
                    className="rounded-full w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg transform transition-all hover:scale-105"
                  >
                    <Send className="w-6 h-6" />
                  </Button>
                  <p className="text-xs text-neutral-500">
                    {isProcessing ? '처리 중...' : '저장하기'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 팁 카드 */}
        <Card className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800">
          <p className="text-sm text-purple-700 dark:text-purple-300">
            💭 편안한 마음으로 오늘 있었던 일과 느낀 감정을 자유롭게 이야기해주세요
          </p>
        </Card>
      </div>
    </MobileLayout>
  )
}