import { Suspense } from 'react'
import DiaryPageContent from './diary-page-content'

export default function DiaryPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center">
      <p className="text-neutral-500">로딩 중...</p>
    </div>}>
      <DiaryPageContent />
    </Suspense>
  )
}