'use client'

import { useEffect, useState } from 'react'
import { MobileLayout } from '@/components/layout/mobile-layout'
import { Button } from '@/components/ui/button'
import {
  User,
  Calendar,
  FileText,
  Settings,
  LogOut,
  ChevronRight,
  Bell,
  Shield,
  HelpCircle,
  MessageCircle,
  UserX,
  LucideIcon,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from '@/components/ui/dialog'

interface MenuItem {
  icon: LucideIcon
  title: string
  subtitle: string
  onClick: () => void
  showArrow: boolean
  disabled?: boolean
}

interface MenuSection {
  title: string
  items: MenuItem[]
}

export default function ProfilePage() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<{
    id: string
    email?: string
    user_metadata?: {
      full_name?: string
      avatar_url?: string
      name?: string
      [key: string]: unknown
    }
  } | null>(null)
  const [diaryCount, setDiaryCount] = useState(0)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const fetchUserData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }
      setUser(user)

      // 전체 일기 개수 가져오기
      const { count } = await supabase
        .from('diary_entries')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

      setDiaryCount(count || 0)
    }

    fetchUserData()
  }, [router, supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
    toast.success('로그아웃되었습니다')
  }

  const handleDeleteAccount = async () => {
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

      toast.success(result.message || '회원 탈퇴가 완료되었습니다')
      router.push('/auth/login')
    } catch (error) {
      // Delete account error: error
      toast.error(
        error instanceof Error
          ? error.message
          : '회원 탈퇴 중 오류가 발생했습니다',
      )
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  const header = (
    <div className="flex items-center justify-between bg-white px-5 py-4">
      <h1 className="text-xl font-bold text-gray-900">마이페이지</h1>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => router.push('/settings')}
        className="text-gray-600"
      >
        <Settings className="h-5 w-5" />
      </Button>
    </div>
  )

  const menuSections: MenuSection[] = [
    {
      title: '내 활동',
      items: [
        {
          icon: FileText,
          title: '내 일기',
          subtitle: `${diaryCount}개의 일기를 작성했어요`,
          onClick: () => router.push('/diary'),
          showArrow: true,
        },
        {
          icon: Calendar,
          title: '일기 캘린더',
          subtitle: '날짜별로 일기 보기',
          onClick: () => router.push('/diary?view=calendar'),
          showArrow: true,
        },
      ],
    },
    {
      title: '알림 및 보안',
      items: [
        {
          icon: Bell,
          title: '알림 설정',
          subtitle: '일기 리마인더, 주간 리포트',
          onClick: () => router.push('/settings/notifications'),
          showArrow: true,
          disabled: true,
        },
        {
          icon: Shield,
          title: '개인정보 및 보안',
          subtitle: '비밀번호, 백업 설정',
          onClick: () => router.push('/settings/privacy'),
          showArrow: true,
          disabled: true,
        },
      ],
    },
    {
      title: '고객 지원',
      items: [
        {
          icon: HelpCircle,
          title: '도움말',
          subtitle: '자주 묻는 질문',
          onClick: () => router.push('/help'),
          showArrow: true,
          disabled: true,
        },
        {
          icon: MessageCircle,
          title: '문의하기',
          subtitle: '1:1 문의, 피드백 보내기',
          onClick: () => router.push('/contact'),
          showArrow: true,
        },
      ],
    },
  ]

  return (
    <MobileLayout header={header} className="bg-gray-50">
      <div className="pb-8">
        {/* 사용자 정보 섹션 */}
        <div className="mb-2 bg-white px-5 py-6">
          <div className="flex items-center space-x-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-100 to-pink-100">
              {user?.user_metadata?.avatar_url ? (
                <div
                  style={{
                    backgroundImage: `url(${user.user_metadata.avatar_url})`,
                  }}
                  className="h-full w-full rounded-full bg-cover bg-center"
                />
              ) : (
                <User className="h-8 w-8 text-purple-600" />
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-900">
                {user?.user_metadata?.full_name || user?.user_metadata?.name}
              </h2>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* 메뉴 섹션들 */}
        {menuSections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="mb-2">
            <div className="px-5 py-2">
              <h3 className="text-xs font-medium text-gray-500">
                {section.title}
              </h3>
            </div>
            <div className="bg-white">
              {section.items.map((item, itemIndex) => (
                <button
                  key={itemIndex}
                  className={`flex w-full items-center justify-between px-5 py-4 ${
                    item.disabled
                      ? 'opacity-50'
                      : 'hover:bg-gray-50 active:bg-gray-100'
                  } transition-colors ${
                    itemIndex !== section.items.length - 1
                      ? 'border-b border-gray-100'
                      : ''
                  }`}
                  onClick={item.disabled ? undefined : item.onClick}
                  disabled={item.disabled}
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                      <item.icon className="h-5 w-5 text-gray-700" />
                    </div>
                    <div className="text-left">
                      <div className="flex items-center gap-2">
                        <p className="text-[15px] font-medium text-gray-900">
                          {item.title}
                        </p>
                      </div>
                      <p className="text-[13px] text-gray-500">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>
                  {item.showArrow && !item.disabled && (
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* 로그아웃 버튼 */}
        <div className="mt-6 space-y-3 px-5">
          <Button
            variant="ghost"
            className="w-full text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            로그아웃
          </Button>

          <Button
            variant="ghost"
            className="w-full text-red-600 hover:bg-red-50 hover:text-red-700"
            onClick={() => setShowDeleteDialog(true)}
          >
            <UserX className="mr-2 h-4 w-4" />
            회원 탈퇴
          </Button>
        </div>

        {/* 버전 정보 */}
        <div className="py-6 text-center text-xs text-gray-400">
          Voice Diary v1.0.0
        </div>
      </div>

      {/* 회원 탈퇴 확인 다이얼로그 */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="mx-4 max-w-[360px] overflow-hidden rounded-2xl border-0 bg-white p-0 shadow-xl">
          <div className="bg-gradient-to-r from-red-500 to-pink-500 p-6 text-white">
            <div className="flex items-center space-x-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                <UserX className="h-6 w-6 text-white" />
              </div>
              <DialogTitle className="text-xl font-semibold text-white">
                정말 탈퇴하시겠습니까?
              </DialogTitle>
            </div>
          </div>

          <div className="p-6">
            <DialogDescription className="text-sm text-gray-600">
              탈퇴하면 모든 데이터가 삭제되며 복구할 수 없습니다.
            </DialogDescription>

            <div className="mt-4 space-y-4">
              <div className="rounded-xl bg-red-50 p-4">
                <div className="mb-2 font-medium text-red-900">
                  회원 탈퇴 시 삭제되는 데이터:
                </div>
                <ul className="space-y-2 text-red-700">
                  <li className="flex items-center">
                    <div className="mr-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-red-400" />
                    모든 일기 기록
                  </li>
                  <li className="flex items-center">
                    <div className="mr-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-red-400" />
                    감정 분석 데이터
                  </li>
                  <li className="flex items-center">
                    <div className="mr-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-red-400" />
                    저장된 음성 파일
                  </li>
                  <li className="flex items-center">
                    <div className="mr-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-red-400" />
                    개인 정보
                  </li>
                </ul>
              </div>

              <div className="flex items-start space-x-2 rounded-xl bg-gray-50 p-4">
                <Shield className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" />
                <div className="text-sm">
                  <div className="font-semibold text-red-600">
                    이 작업은 되돌릴 수 없습니다.
                  </div>
                  <div className="mt-1 text-gray-600">
                    탈퇴 후에는 모든 데이터를 복구할 수 없으니 신중하게
                    결정해주세요.
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="border-t border-gray-100 bg-gray-50 px-6 py-4">
            <div className="flex w-full flex-col-reverse gap-3 sm:flex-row">
              <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(false)}
                disabled={isDeleting}
                className="w-full border-gray-300 bg-white font-medium text-gray-700 hover:bg-gray-50 sm:w-auto"
              >
                취소
              </Button>
              <Button
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="w-full bg-gradient-to-r from-red-500 to-pink-500 font-medium text-white shadow-md hover:from-red-600 hover:to-pink-600 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                {isDeleting ? (
                  <div className="flex items-center space-x-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>처리 중...</span>
                  </div>
                ) : (
                  '회원 탈퇴'
                )}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MobileLayout>
  )
}
