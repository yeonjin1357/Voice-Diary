import { PWAInstallPrompt } from '@/components/PWAInstallPrompt'

export default function Home() {
  return (
    <>
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <h1 className="text-4xl font-bold">Welcome to Voice Diary</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          음성으로 당신의 일상을 기록하세요
        </p>
      </main>
      <PWAInstallPrompt />
    </>
  )
}