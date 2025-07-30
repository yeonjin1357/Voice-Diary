'use client'

import { useState } from 'react'
import { MobileLayout } from '@/components/layout/mobile-layout'
import { Button } from '@/components/ui/button'
import {
  ChevronLeft,
  AlertTriangle,
  Trash2,
  Shield,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { createClient } from '@/lib/supabase/client'

export default function DeleteDataPage() {
  const router = useRouter()
  const supabase = createClient()
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteType, setDeleteType] = useState<'diary' | 'all' | null>(null)

  const handleDeleteDiaryData = async () => {
    setIsDeleting(true)
    try {
      // 현재 사용자 정보 가져오기
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('인증되지 않은 사용자입니다')

      // 일기 데이터 삭제 (emotions와 keywords는 CASCADE로 자동 삭제)
      const { error } = await supabase
        .from('diary_entries')
        .delete()
        .eq('user_id', user.id)

      if (error) throw error

      // Storage에서 음성 파일 삭제
      const { data: files } = await supabase.storage
        .from('voice-recordings')
        .list(user.id)

      if (files && files.length > 0) {
        const filePaths = files.map(file => `${user.id}/${file.name}`)
        await supabase.storage
          .from('voice-recordings')
          .remove(filePaths)
      }

      toast.success('모든 일기 데이터가 삭제되었습니다')
      router.push('/profile')
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : '데이터 삭제에 실패했습니다'
      )
    } finally {
      setIsDeleting(false)
      setShowConfirmDialog(false)
    }
  }

  const handleDeleteAllData = async () => {
    setIsDeleting(true)
    try {
      const response = await fetch('/api/user/delete', {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || '회원 탈퇴에 실패했습니다')
      }

      const result = await response.json()
      toast.success(result.message || '모든 데이터가 삭제되었습니다')
      router.push('/auth/login')
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : '데이터 삭제에 실패했습니다'
      )
    } finally {
      setIsDeleting(false)
      setShowConfirmDialog(false)
    }
  }

  const header = (
    <div className="flex items-center bg-white px-5 py-4">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => router.back()}
        className="mr-3 h-9 w-9"
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>
      <h1 className="text-xl font-bold text-gray-900">데이터 삭제</h1>
    </div>
  )

  return (
    <MobileLayout header={header} className="bg-gray-50">
      <div className="p-5">
        {/* 경고 메시지 */}
        <div className="mb-6 rounded-xl bg-red-50 p-4">
          <div className="flex space-x-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
            <div>
              <p className="font-semibold text-red-900">주의사항</p>
              <p className="mt-1 text-sm text-red-700">
                삭제된 데이터는 복구할 수 없습니다. 삭제 전 데이터 내보내기를
                권장합니다.
              </p>
            </div>
          </div>
        </div>

        {/* 삭제 옵션 */}
        <div className="space-y-4">
          <div className="rounded-xl bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center space-x-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
                <Trash2 className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  일기 데이터만 삭제
                </h3>
                <p className="text-sm text-gray-500">
                  계정은 유지하고 일기만 삭제
                </p>
              </div>
            </div>
            <p className="mb-4 text-sm text-gray-600">
              모든 일기, 감정 분석 데이터, 음성 파일이 삭제됩니다. 계정은
              유지되므로 다시 로그인하여 사용할 수 있습니다.
            </p>
            <Button
              variant="outline"
              className="w-full border-orange-300 text-orange-600 hover:bg-orange-50"
              onClick={() => {
                setDeleteType('diary')
                setShowConfirmDialog(true)
              }}
            >
              일기 데이터 삭제
            </Button>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center space-x-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <Shield className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  모든 데이터 삭제 (회원 탈퇴)
                </h3>
                <p className="text-sm text-gray-500">
                  계정과 모든 데이터 영구 삭제
                </p>
              </div>
            </div>
            <p className="mb-4 text-sm text-gray-600">
              계정이 완전히 삭제되며 모든 데이터가 영구적으로 제거됩니다. 이
              작업은 되돌릴 수 없습니다.
            </p>
            <Button
              variant="destructive"
              className="w-full"
              onClick={() => {
                setDeleteType('all')
                setShowConfirmDialog(true)
              }}
            >
              모든 데이터 삭제
            </Button>
          </div>
        </div>
      </div>

      {/* 확인 다이얼로그 */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="mx-4 max-w-[360px] rounded-2xl bg-white">
          <DialogHeader>
            <DialogTitle className="text-red-600">
              정말 삭제하시겠습니까?
            </DialogTitle>
            <DialogDescription>
              {deleteType === 'diary'
                ? '모든 일기와 관련 데이터가 영구적으로 삭제됩니다.'
                : '계정과 모든 데이터가 영구적으로 삭제됩니다.'}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="rounded-lg bg-red-50 p-4">
              <p className="text-sm font-medium text-red-900">
                삭제될 항목:
              </p>
              <ul className="mt-2 space-y-1 text-sm text-red-700">
                <li>• 모든 일기 내용</li>
                <li>• 감정 분석 결과</li>
                <li>• 음성 녹음 파일</li>
                {deleteType === 'all' && <li>• 계정 정보</li>}
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              disabled={isDeleting}
            >
              취소
            </Button>
            <Button
              variant="destructive"
              onClick={
                deleteType === 'diary'
                  ? handleDeleteDiaryData
                  : handleDeleteAllData
              }
              disabled={isDeleting}
            >
              {isDeleting ? (
                <div className="flex items-center space-x-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>삭제 중...</span>
                </div>
              ) : (
                '삭제하기'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MobileLayout>
  )
}