'use client'

import { useState } from 'react'
import { MobileLayout } from '@/components/layout/mobile-layout'
import { Button } from '@/components/ui/button'
import {
  ChevronLeft,
  Lock,
  Download,
  Trash2,
  AlertCircle,
  LucideIcon,
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface SettingItem {
  id: string
  icon: LucideIcon
  title: string
  description: string
  type: 'toggle' | 'action' | 'info'
  value?: boolean
  action?: () => void
  badge?: string
}

interface SettingSection {
  title: string
  items: SettingItem[]
}

export default function PrivacySettingsPage() {
  const router = useRouter()
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')


  const handleExportData = async () => {
    setIsExporting(true)
    try {
      // 실제로는 API 호출하여 데이터 내보내기
      await new Promise((resolve) => setTimeout(resolve, 2000))
      toast.success('데이터 내보내기가 완료되었습니다')
      setShowExportDialog(false)
    } catch (error) {
      toast.error('데이터 내보내기에 실패했습니다')
    } finally {
      setIsExporting(false)
    }
  }

  const handlePasswordChange = async () => {
    // 유효성 검사
    if (newPassword !== confirmPassword) {
      toast.error('새 비밀번호가 일치하지 않습니다')
      return
    }
    
    if (newPassword.length < 6) {
      toast.error('비밀번호는 최소 6자 이상이어야 합니다')
      return
    }

    setIsChangingPassword(true)
    try {
      // 실제로는 API 호출하여 비밀번호 변경
      await new Promise((resolve) => setTimeout(resolve, 1500))
      toast.success('비밀번호가 변경되었습니다')
      setShowPasswordDialog(false)
      // 폼 초기화
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (error) {
      toast.error('비밀번호 변경에 실패했습니다')
    } finally {
      setIsChangingPassword(false)
    }
  }

  const settingSections: SettingSection[] = [
    {
      title: '보안 설정',
      items: [
        {
          id: 'password',
          icon: Lock,
          title: '비밀번호 변경',
          description: '계정 비밀번호를 변경합니다',
          type: 'action',
          action: () => setShowPasswordDialog(true),
        },
        {
          id: 'export',
          icon: Download,
          title: '내 데이터 내보내기',
          description: '모든 일기와 분석 데이터를 다운로드',
          type: 'action',
          action: () => setShowExportDialog(true),
        },
        {
          id: 'delete-data',
          icon: Trash2,
          title: '모든 데이터 삭제',
          description: '일기, 음성 파일, 분석 데이터 영구 삭제',
          type: 'action',
          action: () => router.push('/settings/privacy/delete-data'),
        },
      ],
    },
  ]

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
      <h1 className="text-xl font-bold text-gray-900">개인정보 및 보안</h1>
    </div>
  )

  return (
    <MobileLayout header={header} className="bg-gray-50">
      <div className="pb-8">
        {/* 설정 섹션들 */}
        {settingSections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="mb-6">
            <div className="mb-3 px-5">
              <h2 className="text-sm font-medium text-gray-700">
                {section.title}
              </h2>
            </div>
            <div className="bg-white">
              {section.items.map((item, itemIndex) => (
                <div
                  key={item.id}
                  className={`px-5 py-4 ${
                    itemIndex !== section.items.length - 1
                      ? 'border-b border-gray-100'
                      : ''
                  }`}
                >
                  <button
                    onClick={item.action}
                    className="flex w-full items-center justify-between text-left transition-colors active:bg-gray-50"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                        <item.icon className="h-5 w-5 text-gray-700" />
                      </div>
                      <div className="flex-1">
                        <p className="text-base font-medium text-gray-900">
                          {item.title}
                        </p>
                        <p className="mt-0.5 text-sm text-gray-500">
                          {item.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {item.badge && (
                        <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                          {item.badge}
                        </span>
                      )}
                      <ChevronLeft className="h-5 w-5 rotate-180 text-gray-400" />
                    </div>
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* 보안 팁 */}
        <div className="mx-5 mt-8 rounded-xl bg-blue-50 p-4">
          <div className="flex space-x-3">
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
            <div>
              <p className="font-medium text-blue-900">보안 팁</p>
              <p className="mt-1 text-sm text-blue-700">
                강력한 비밀번호를 사용하고, 정기적으로 변경하여 계정을 안전하게
                보호하세요.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 비밀번호 변경 다이얼로그 */}
      <Dialog open={showPasswordDialog} onOpenChange={(open) => {
        setShowPasswordDialog(open)
        if (!open) {
          // 다이얼로그 닫을 때 폼 초기화
          setCurrentPassword('')
          setNewPassword('')
          setConfirmPassword('')
        }
      }}>
        <DialogContent className="mx-4 max-w-[360px] rounded-2xl bg-white">
          <DialogHeader>
            <DialogTitle>비밀번호 변경</DialogTitle>
            <DialogDescription>
              새로운 비밀번호를 입력해주세요
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">현재 비밀번호</Label>
              <Input
                id="current-password"
                type="password"
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">새 비밀번호</Label>
              <Input
                id="new-password"
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <p className="text-xs text-gray-500">최소 6자 이상 입력해주세요</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">새 비밀번호 확인</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowPasswordDialog(false)}
              disabled={isChangingPassword}
            >
              취소
            </Button>
            <Button
              onClick={handlePasswordChange}
              disabled={isChangingPassword || !currentPassword || !newPassword || !confirmPassword}
            >
              {isChangingPassword ? (
                <div className="flex items-center space-x-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>변경 중...</span>
                </div>
              ) : (
                '변경하기'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 데이터 내보내기 다이얼로그 */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="mx-4 max-w-[360px] rounded-2xl bg-white">
          <DialogHeader>
            <DialogTitle>데이터 내보내기</DialogTitle>
            <DialogDescription>
              모든 데이터를 다운로드합니다
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-sm font-medium text-gray-900">
                내보낼 데이터:
              </p>
              <ul className="mt-2 space-y-1 text-sm text-gray-600">
                <li>• 모든 일기 내용</li>
                <li>• 감정 분석 결과</li>
                <li>• 음성 녹음 파일</li>
                <li>• 계정 정보</li>
              </ul>
            </div>
            <p className="text-sm text-gray-600">
              ZIP 파일로 압축되어 다운로드됩니다. 파일 크기에 따라 시간이 걸릴
              수 있습니다.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowExportDialog(false)}
              disabled={isExporting}
            >
              취소
            </Button>
            <Button onClick={handleExportData} disabled={isExporting}>
              {isExporting ? (
                <div className="flex items-center space-x-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>내보내는 중...</span>
                </div>
              ) : (
                '내보내기'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MobileLayout>
  )
}