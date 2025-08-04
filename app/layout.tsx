import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '@/styles/globals.css'
import { Providers } from '@/lib/providers'
import { Toaster } from 'sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '울림 - 마음을 담는 음성 일기',
  description: '매일의 음성 일기를 녹음하고 AI를 통해 감정 분석과 인사이트를 제공합니다',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: '울림',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    siteName: '울림',
    title: '울림 - 마음을 담는 음성 일기',
    description: '매일의 음성 일기를 녹음하고 AI를 통해 감정 분석과 인사이트를 제공합니다',
  },
  twitter: {
    card: 'summary',
    title: '울림 - 마음을 담는 음성 일기',
    description: '매일의 음성 일기를 녹음하고 AI를 통해 감정 분석과 인사이트를 제공합니다',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />
        <meta name="theme-color" content="#0a0a0a" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="울림" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.svg" />
        <link rel="icon" type="image/svg+xml" href="/icons/icon-192x192.svg" />
        <style dangerouslySetInnerHTML={{ __html: `
          /* 모든 브라우저에서 스크롤바 완전 제거 */
          html, body, *, *::before, *::after {
            scrollbar-width: none !important;
            -ms-overflow-style: none !important;
            scrollbar-color: transparent transparent !important;
          }
          
          /* Webkit 기반 브라우저 (Chrome, Safari, Edge, Whale) */
          html::-webkit-scrollbar,
          body::-webkit-scrollbar,
          *::-webkit-scrollbar,
          *::before::-webkit-scrollbar,
          *::after::-webkit-scrollbar {
            display: none !important;
            width: 0px !important;
            height: 0px !important;
            background: transparent !important;
            -webkit-appearance: none !important;
          }
          
          /* 스크롤바 구성 요소들도 숨김 */
          *::-webkit-scrollbar-track,
          *::-webkit-scrollbar-thumb,
          *::-webkit-scrollbar-corner,
          *::-webkit-scrollbar-button {
            display: none !important;
            width: 0px !important;
            height: 0px !important;
            background: transparent !important;
          }
          
          /* 루트 요소에도 적용 */
          :root {
            scrollbar-width: none !important;
            -ms-overflow-style: none !important;
          }
          
          :root::-webkit-scrollbar {
            display: none !important;
            width: 0px !important;
            height: 0px !important;
          }
          
          /* 모바일 웹뷰 및 PWA 환경 */
          @supports (-webkit-touch-callout: none) {
            html, body {
              -webkit-overflow-scrolling: touch !important;
            }
          }
          
          /* 네이버 웨일 브라우저 특별 처리 */
          @media screen and (-webkit-min-device-pixel-ratio: 0) {
            ::-webkit-scrollbar {
              width: 0px !important;
              height: 0px !important;
              display: none !important;
            }
          }
        ` }} />
      </head>
      <body className={`${inter.className} overflow-y-auto overflow-x-hidden`} style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}>
        <Providers>{children}</Providers>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  )
}