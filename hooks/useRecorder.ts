'use client'

import { useState, useRef, useCallback } from 'react'

interface UseRecorderReturn {
  isRecording: boolean
  isPaused: boolean
  recordingTime: number
  startRecording: () => Promise<void>
  stopRecording: () => Promise<Blob | null>
  pauseRecording: () => void
  resumeRecording: () => void
  resetRecording: () => void
  audioLevel: number
}

export function useRecorder(): UseRecorderReturn {
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioLevel, setAudioLevel] = useState(0)
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const animationFrameRef = useRef<number | null>(null)
  const startTimeRef = useRef<number | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const updateAudioLevel = useCallback(() => {
    if (!analyserRef.current) return

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)
    analyserRef.current.getByteFrequencyData(dataArray)
    
    const average = dataArray.reduce((a, b) => a + b) / dataArray.length
    setAudioLevel(average / 255)

    if (isRecording && !isPaused) {
      animationFrameRef.current = requestAnimationFrame(updateAudioLevel)
    }
  }, [isRecording, isPaused])

  const startTimer = useCallback(() => {
    // Starting timer...
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current)
    }
    
    startTimeRef.current = Date.now()
    setRecordingTime(0)
    
    timerIntervalRef.current = setInterval(() => {
      if (!startTimeRef.current) return
      
      const elapsed = Date.now() - startTimeRef.current
      const seconds = Math.floor(elapsed / 1000)
      // Timer update: seconds
      setRecordingTime(seconds)
    }, 100)
  }, [])
  
  const stopTimer = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current)
      timerIntervalRef.current = null
    }
  }, [])

  const startRecording = async () => {
    try {
      // 브라우저 지원 확인
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('이 브라우저는 음성 녹음을 지원하지 않습니다.')
      }

      // MediaRecorder 지원 확인
      if (!window.MediaRecorder) {
        throw new Error('이 브라우저는 MediaRecorder를 지원하지 않습니다.')
      }

      // 마이크 권한 요청 (더 명확한 에러 처리)
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000, // Whisper 최적 샘플링 레이트
          channelCount: 1, // 모노 녹음 (파일 크기 최적화)
          sampleSize: 16
        } 
      }).catch((err) => {
        // getUserMedia error: err
        if (err.name === 'NotAllowedError') {
          throw new Error('마이크 사용 권한이 거부되었습니다. 브라우저 설정에서 마이크 권한을 허용해주세요.')
        } else if (err.name === 'NotFoundError') {
          throw new Error('마이크가 연결되어 있지 않습니다.')
        } else if (err.name === 'NotReadableError') {
          throw new Error('마이크를 사용할 수 없습니다. 다른 앱에서 사용 중일 수 있습니다.')
        } else if (err.name === 'SecurityError') {
          throw new Error('보안상의 이유로 마이크를 사용할 수 없습니다. HTTPS 연결이 필요합니다.')
        }
        throw new Error('마이크 접근에 실패했습니다: ' + err.message)
      })
      
      // Audio context for visualization (모바일 호환성을 위한 처리)
      const AudioContextClass = window.AudioContext || window.webkitAudioContext
      if (!AudioContextClass) {
        throw new Error('AudioContext is not supported in this browser')
      }
      audioContextRef.current = new AudioContextClass()
      
      // iOS에서 AudioContext 활성화
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume()
      }
      
      const source = audioContextRef.current.createMediaStreamSource(stream)
      analyserRef.current = audioContextRef.current.createAnalyser()
      analyserRef.current.fftSize = 256
      source.connect(analyserRef.current)
      
      // MediaRecorder setup - 더 넓은 브라우저 지원을 위한 MIME 타입 체크
      let mimeType = 'audio/webm'
      let audioBitsPerSecond = 128000 // 128kbps for better quality
      
      const possibleTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/ogg;codecs=opus',
        'audio/mp4',
        'audio/mpeg'
      ]
      
      for (const type of possibleTypes) {
        if (MediaRecorder.isTypeSupported(type)) {
          mimeType = type
          break
        }
      }
      
      // Using MIME type: mimeType
      
      mediaRecorderRef.current = new MediaRecorder(stream, { 
        mimeType,
        audioBitsPerSecond 
      })
      chunksRef.current = []
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }
      
      mediaRecorderRef.current.onerror = (event) => {
        // MediaRecorder error: event
      }
      
      mediaRecorderRef.current.start(1000) // Collect data every 1000ms for better metadata
      setIsRecording(true)
      setIsPaused(false)
      
      // Recording started, calling startTimer...
      startTimer()
      updateAudioLevel()
    } catch (error) {
      throw error
    }
  }

  const stopRecording = async (): Promise<Blob | null> => {
    return new Promise((resolve) => {
      if (!mediaRecorderRef.current) {
        resolve(null)
        return
      }

      mediaRecorderRef.current.onstop = () => {
        const mimeType = mediaRecorderRef.current?.mimeType || 'audio/webm'
        const blob = new Blob(chunksRef.current, { type: mimeType })
        
        // Cleanup
        mediaRecorderRef.current?.stream.getTracks().forEach(track => track.stop())
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current)
        }
        audioContextRef.current?.close()
        
        stopTimer()
        setIsRecording(false)
        setIsPaused(false)
        // recordingTime은 유지하여 총 녹음 시간을 보여줌
        setAudioLevel(0)
        startTimeRef.current = null
        
        resolve(blob)
      }

      mediaRecorderRef.current.stop()
    })
  }

  const pauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause()
      setIsPaused(true)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      // 타이머 일시정지
      stopTimer()
      // 일시정지 시점의 경과 시간 저장
      if (startTimeRef.current) {
        const elapsed = Date.now() - startTimeRef.current
        startTimeRef.current = elapsed // 재개 시 이어서 계산할 수 있도록 저장
      }
    }
  }

  const resumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume()
      setIsPaused(false)
      // 타이머 재개 (이전에 저장한 경과 시간부터 시작)
      if (startTimeRef.current) {
        const previousElapsed = startTimeRef.current
        startTimeRef.current = Date.now() - previousElapsed
        
        timerIntervalRef.current = setInterval(() => {
          if (!startTimeRef.current) return
          
          const elapsed = Date.now() - startTimeRef.current
          const seconds = Math.floor(elapsed / 1000)
          setRecordingTime(seconds)
        }, 100)
      }
      updateAudioLevel()
    }
  }

  const resetRecording = () => {
    setRecordingTime(0)
  }

  return {
    isRecording,
    isPaused,
    recordingTime,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    resetRecording,
    audioLevel,
  }
}