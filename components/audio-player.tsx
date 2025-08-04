'use client'

import { useState, useRef, useEffect } from 'react'
import { Play, Pause, Download } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AudioPlayerProps {
  audioUrl: string
  fileName?: string
  initialDuration?: number
}

export function AudioPlayer({ audioUrl, fileName = 'recording.webm', initialDuration }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(initialDuration || 0)
  const [isLoading, setIsLoading] = useState(false)
  const [isAudioReady, setIsAudioReady] = useState(!!initialDuration)
  const audioRef = useRef<HTMLAudioElement>(null)
  const progressBarRef = useRef<HTMLDivElement>(null)

  // WebM duration을 구하기 위한 헬퍼 함수
  const getDurationFromSeek = async (audio: HTMLAudioElement): Promise<number> => {
    return new Promise((resolve) => {
      const originalTime = audio.currentTime
      
      const handleSeeked = () => {
        const duration = audio.currentTime
        audio.currentTime = originalTime
        audio.removeEventListener('seeked', handleSeeked)
        resolve(duration)
      }
      
      audio.addEventListener('seeked', handleSeeked)
      audio.currentTime = Number.MAX_SAFE_INTEGER
    })
  }

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    let checkDurationInterval: NodeJS.Timeout | null = null
    let seekAttempted = false

    const setAudioData = async () => {
      // Audio duration: audio.duration, readyState: audio.readyState, initialDuration: initialDuration
      
      // initialDuration이 있으면 그것을 우선 사용
      if (initialDuration && initialDuration > 0) {
        setDuration(initialDuration)
        setIsAudioReady(true)
        if (checkDurationInterval) {
          clearInterval(checkDurationInterval)
          checkDurationInterval = null
        }
      } else if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration) && audio.duration > 0) {
        setDuration(audio.duration)
        setIsAudioReady(true)
        if (checkDurationInterval) {
          clearInterval(checkDurationInterval)
          checkDurationInterval = null
        }
      } else if (!seekAttempted && audio.readyState >= 2 && !initialDuration) {
        // duration이 없으면 seek 방법 시도
        seekAttempted = true
        try {
          const seekDuration = await getDurationFromSeek(audio)
          if (seekDuration > 0) {
            setDuration(seekDuration)
            setIsAudioReady(true)
          }
        } catch {
        }
      }
      setCurrentTime(audio.currentTime)
    }

    const setAudioTime = () => {
      setCurrentTime(audio.currentTime)
      // 재생 중에도 duration 체크
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration) && audio.duration > 0 && duration === 0) {
        setDuration(audio.duration)
        setIsAudioReady(true)
      }
    }
    
    const handleEnded = () => {
      setIsPlaying(false)
      // 끝날 때 duration 확정
      if (audio.currentTime > 0 && duration === 0) {
        setDuration(audio.currentTime)
        setIsAudioReady(true)
      }
    }

    const handleCanPlay = () => {
      // Can play event fired
      setAudioData()
    }

    // 여러 이벤트에서 duration 체크
    audio.addEventListener('loadedmetadata', setAudioData)
    audio.addEventListener('loadeddata', setAudioData)
    audio.addEventListener('durationchange', setAudioData)
    audio.addEventListener('canplay', handleCanPlay)
    audio.addEventListener('canplaythrough', handleCanPlay)
    audio.addEventListener('timeupdate', setAudioTime)
    audio.addEventListener('ended', handleEnded)

    // WebM 파일의 경우 duration을 얻기 위한 폴백
    checkDurationInterval = setInterval(() => {
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration) && audio.duration > 0) {
        setDuration(audio.duration)
        setIsAudioReady(true)
        if (checkDurationInterval) {
          clearInterval(checkDurationInterval)
        }
      }
    }, 100)

    // 초기 로드 시도
    audio.load()

    // 10초 후에도 duration이 없으면 포기
    setTimeout(() => {
      if (checkDurationInterval) {
        clearInterval(checkDurationInterval)
      }
    }, 10000)

    return () => {
      if (checkDurationInterval) {
        clearInterval(checkDurationInterval)
      }
      audio.removeEventListener('loadedmetadata', setAudioData)
      audio.removeEventListener('loadeddata', setAudioData)
      audio.removeEventListener('durationchange', setAudioData)
      audio.removeEventListener('canplay', handleCanPlay)
      audio.removeEventListener('canplaythrough', handleCanPlay)
      audio.removeEventListener('timeupdate', setAudioTime)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [audioUrl, duration, initialDuration])

  const togglePlayPause = async () => {
    const audio = audioRef.current
    if (!audio) return

    setIsLoading(true)
    try {
      if (isPlaying) {
        audio.pause()
        setIsPlaying(false)
      } else {
        // 재생 시작할 때 duration 한번 더 체크
        if (!duration && audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
          setDuration(audio.duration)
          setIsAudioReady(true)
        }
        await audio.play()
        setIsPlaying(true)
      }
    } catch {
    } finally {
      setIsLoading(false)
    }
  }

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current
    const progressBar = progressBarRef.current
    if (!audio || !progressBar) return

    const rect = progressBar.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percentage = x / rect.width
    const newTime = percentage * duration
    
    audio.currentTime = newTime
    setCurrentTime(newTime)
  }

  const handleDownload = async () => {
    try {
      const response = await fetch(audioUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch {
    }
  }

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00'
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div className="w-full">
      <audio ref={audioRef} src={audioUrl} preload="auto" />
      
      <div className="rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 p-5 shadow-sm">
        {/* 재생 컨트롤 영역 */}
        <div className="mb-4 flex items-center justify-between">
          <button
            onClick={togglePlayPause}
            disabled={isLoading}
            className={cn(
              'flex h-12 w-12 items-center justify-center rounded-full transition-all',
              'bg-white shadow-md hover:shadow-lg active:scale-95',
              isLoading && 'opacity-50'
            )}
          >
            {isPlaying ? (
              <Pause className="h-5 w-5 text-purple-600" />
            ) : (
              <Play className="h-5 w-5 text-purple-600 ml-0.5" />
            )}
          </button>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-purple-700">
              {formatTime(currentTime)}
            </span>
            <span className="text-sm text-purple-500">/</span>
            <span className="text-sm text-purple-600">
              {duration > 0 ? formatTime(duration) : '--:--'}
            </span>
          </div>

          <button
            onClick={handleDownload}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/70 transition-all hover:bg-white hover:shadow-md active:scale-95"
          >
            <Download className="h-4 w-4 text-purple-600" />
          </button>
        </div>

        {/* 진행바 */}
        <div 
          ref={progressBarRef}
          onClick={handleProgressClick}
          className={cn(
            "relative h-2 rounded-full bg-white/50 overflow-hidden",
            isAudioReady ? "cursor-pointer" : "cursor-not-allowed opacity-50"
          )}
        >
          <div 
            className="absolute left-0 top-0 h-full bg-gradient-to-r from-purple-400 to-pink-400 transition-all duration-100"
            style={{ width: `${progressPercentage}%` }}
          />
          {isAudioReady && (
            <div 
              className="absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-white shadow-md transition-all duration-100"
              style={{ left: `calc(${progressPercentage}% - 8px)` }}
            />
          )}
        </div>

        {/* 웨이브폼 애니메이션 (재생 중일 때) */}
        {isPlaying && (
          <div className="mt-4 flex items-center justify-center gap-1">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="w-1 rounded-full bg-gradient-to-t from-purple-400 to-pink-400 opacity-70 animate-pulse"
                style={{
                  height: `${Math.random() * 24 + 8}px`,
                  animationDelay: `${i * 0.1}s`
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}