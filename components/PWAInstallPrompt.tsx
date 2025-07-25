'use client'

import { useState } from 'react'
import { usePWAInstall } from '@/hooks/usePWAInstall'
import { X } from 'lucide-react'

export const PWAInstallPrompt = () => {
  const { isInstallable, install } = usePWAInstall()
  const [isDismissed, setIsDismissed] = useState(false)

  if (!isInstallable || isDismissed) {
    return null
  }

  const handleInstall = async () => {
    const success = await install()
    if (success) {
      setIsDismissed(true)
    }
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 rounded-lg bg-card p-4 shadow-lg md:left-auto md:max-w-sm">
      <button
        onClick={() => setIsDismissed(true)}
        className="absolute right-2 top-2 rounded-full p-1 hover:bg-accent"
        aria-label="닫기"
      >
        <X className="h-4 w-4" />
      </button>
      
      <div className="pr-8">
        <h3 className="mb-2 font-semibold">울림 앱 설치</h3>
        <p className="mb-4 text-sm text-muted-foreground">
          홈 화면에 추가하여 언제든지 음성 일기를 작성하세요
        </p>
        
        <div className="flex gap-2">
          <button
            onClick={handleInstall}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            설치하기
          </button>
          <button
            onClick={() => setIsDismissed(true)}
            className="rounded-md px-4 py-2 text-sm font-medium hover:bg-accent"
          >
            나중에
          </button>
        </div>
      </div>
    </div>
  )
}