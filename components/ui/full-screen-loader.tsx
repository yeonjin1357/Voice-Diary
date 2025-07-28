'use client'

import { useEffect } from 'react'

interface FullScreenLoaderProps {
  message?: string
}

export function FullScreenLoader({ message = '처리 중입니다...' }: FullScreenLoaderProps) {
  // 로더가 표시될 때 body 스크롤 방지
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/95 backdrop-blur-sm">
      <div className="flex flex-col items-center space-y-4">
        {/* 로딩 애니메이션 */}
        <div className="relative h-20 w-20">
          {/* 외곽 원 */}
          <div className="absolute inset-0 animate-ping rounded-full bg-purple-400 opacity-20"></div>
          {/* 중간 원 */}
          <div className="absolute inset-2 animate-ping rounded-full bg-purple-400 opacity-40" style={{ animationDelay: '0.2s' }}></div>
          {/* 내부 원 */}
          <div className="absolute inset-4 animate-pulse rounded-full bg-gradient-to-r from-purple-500 to-pink-500"></div>
        </div>
        
        {/* 메시지 */}
        <div className="text-center">
          <p className="text-base font-medium text-gray-900">{message}</p>
          <p className="mt-1 text-sm text-gray-500">잠시만 기다려주세요</p>
        </div>
      </div>

    </div>
  )
}