'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Mic, Shield } from 'lucide-react'

export function MicrophonePermission() {
  const [permission, setPermission] = useState<PermissionState>('prompt')
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    // 권한 상태 확인
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'microphone' as PermissionName })
        .then((result) => {
          setPermission(result.state)
          setShowBanner(result.state === 'prompt')
          
          result.addEventListener('change', () => {
            setPermission(result.state)
            setShowBanner(result.state === 'prompt')
          })
        })
        .catch(() => {
          // iOS 등에서는 permissions API를 지원하지 않을 수 있음
          setShowBanner(true)
        })
    }
  }, [])

  const requestPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      // 권한 획득 성공 - 스트림 정리
      stream.getTracks().forEach(track => track.stop())
      setShowBanner(false)
    } catch (error) {
      console.error('마이크 권한 요청 실패:', error)
    }
  }

  if (!showBanner) return null

  return (
    <Card className="mx-4 mt-4 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 dark:border-purple-800 dark:from-purple-900/20 dark:to-pink-900/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Shield className="h-5 w-5 text-purple-600" />
          마이크 권한 필요
        </CardTitle>
        <CardDescription>
          음성 일기를 녹음하려면 마이크 권한이 필요합니다
        </CardDescription>
      </CardHeader>
      <CardContent className="flex gap-2">
        <Button
          onClick={requestPermission}
          size="sm"
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          <Mic className="mr-2 h-4 w-4" />
          권한 허용하기
        </Button>
        <Button
          onClick={() => setShowBanner(false)}
          size="sm"
          variant="ghost"
        >
          나중에
        </Button>
      </CardContent>
    </Card>
  )
}