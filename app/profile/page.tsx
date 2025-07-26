'use client'

import { useEffect, useState } from 'react'
import { MobileLayout } from '@/components/layout/mobile-layout'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  User,
  Crown,
  Calendar,
  FileText,
  Settings,
  LogOut,
  ChevronRight,
  Sparkles,
  BarChart3,
  Bell,
  Shield,
  HelpCircle,
  MessageCircle,
  LucideIcon,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { useSubscription } from '@/hooks/useSubscription'
import { format } from 'date-fns'

interface MenuItem {
  icon: LucideIcon
  title: string
  subtitle: string
  onClick: () => void
  showArrow: boolean
  disabled?: boolean
  badge?: {
    text: string
    color: string
  }
}

interface MenuSection {
  title: string
  items: MenuItem[]
}

export default function ProfilePage() {
  const router = useRouter()
  const supabase = createClient()
  const { userProfile, getUsageInfo } = useSubscription()
  const [user, setUser] = useState<{
    id: string
    email?: string
    user_metadata?: {
      full_name?: string
      avatar_url?: string
      [key: string]: unknown
    }
  } | null>(null)
  const [usage, setUsage] = useState<{
    diary_count: number
    total_recording_minutes: number
  } | null>(null)
  const [diaryCount, setDiaryCount] = useState(0)

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

  useEffect(() => {
    const fetchUsageData = async () => {
      const usageInfo = await getUsageInfo()
      setUsage(usageInfo)
    }
    
    if (userProfile) {
      fetchUsageData()
    }
  }, [userProfile, getUsageInfo])


  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
    toast.success('로그아웃되었습니다')
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
      title: '구독 및 결제',
      items: [
        {
          icon: Crown,
          title: '구독 관리',
          subtitle:
            userProfile?.subscriptionTier === 'premium'
              ? '프리미엄 이용 중'
              : '무료 플랜 이용 중',
          badge:
            userProfile?.subscriptionTier === 'premium'
              ? {
                  text: 'Premium',
                  color:
                    'bg-gradient-to-r from-purple-500 to-pink-500 text-white',
                }
              : undefined,
          onClick: () => router.push('/subscription'),
          showArrow: true,
        },
        {
          icon: BarChart3,
          title: '이용 현황',
          subtitle: usage
            ? `이번 달: 일기 ${usage.diary_count}개, 녹음 ${usage.total_recording_minutes}분`
            : '로딩 중...',
          onClick: () => router.push('/insights'),
          showArrow: true,
        },
      ],
    },
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
          disabled: true,
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
          disabled: true,
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
            <div className="relative">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-100 to-pink-100">
                {userProfile?.avatarUrl ? (
                  <div
                    style={{ backgroundImage: `url(${userProfile.avatarUrl})` }}
                    className="h-full w-full rounded-full bg-cover bg-center"
                  />
                ) : (
                  <User className="h-8 w-8 text-purple-600" />
                )}
              </div>
              {userProfile?.subscriptionTier === 'premium' && (
                <div className="absolute -right-1 -bottom-1 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-pink-500">
                  <Crown className="h-3 w-3 text-white" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-900">
                {userProfile?.name || user?.email?.split('@')[0]}
              </h2>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>
          </div>

          {/* 프리미엄 상태 카드 */}
          {userProfile?.subscriptionTier === 'premium' &&
            userProfile?.subscriptionEndDate && (
              <div className="mt-4 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-medium text-purple-900">
                      프리미엄 멤버십
                    </span>
                  </div>
                  <span className="text-xs text-purple-700">
                    {format(
                      new Date(userProfile.subscriptionEndDate),
                      'yyyy.MM.dd',
                    )}
                    까지
                  </span>
                </div>
              </div>
            )}
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
                        {item.badge && (
                          <Badge
                            className={`px-1.5 py-0 text-[10px] ${item.badge.color}`}
                          >
                            {item.badge.text}
                          </Badge>
                        )}
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
        <div className="mt-6 px-5">
          <Button
            variant="ghost"
            className="w-full text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            로그아웃
          </Button>
        </div>

        {/* 버전 정보 */}
        <div className="py-6 text-center text-xs text-gray-400">
          Voice Diary v1.0.0
        </div>
      </div>
    </MobileLayout>
  )
}
