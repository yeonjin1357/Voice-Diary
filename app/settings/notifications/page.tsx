'use client'

import { useState, useEffect } from 'react'
import { MobileLayout } from '@/components/layout/mobile-layout'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import {
  ChevronLeft,
  Bell,
  Calendar,
  FileText,
  Moon,
  Clock,
  ChevronRight,
  Info,
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
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

interface NotificationItem {
  id: string
  iconName: string
  title: string
  description: string
  enabled: boolean
  hasSettings?: boolean
  settings?: NotificationSettings
}

interface NotificationSettings {
  frequency?: 'daily' | 'weekly' | 'custom'
  time?: string
  days?: string[]
}

export default function NotificationSettingsPage() {
  const router = useRouter()
  const [showReminderSettings, setShowReminderSettings] = useState(false)
  const [showQuietHoursSettings, setShowQuietHoursSettings] = useState(false)

  // 아이콘 매핑
  const iconMap: Record<string, LucideIcon> = {
    Bell,
    FileText,
    Calendar,
    Moon,
  }

  const getDefaultNotifications = (): NotificationItem[] => {
    return [
      {
        id: 'reminder',
        iconName: 'Bell',
        title: '일기 작성 리마인더',
        description: '잊지 않고 일기를 작성할 수 있도록 알려드려요',
        enabled: true,
        hasSettings: true,
        settings: {
          frequency: 'daily',
          time: '21:00',
        },
      },
      {
        id: 'weekly-report',
        iconName: 'FileText',
        title: '주간 감정 리포트',
        description: '매주 일요일 한 주간의 감정 변화를 정리해드려요',
        enabled: true,
        hasSettings: false,
      },
      {
        id: 'monthly-summary',
        iconName: 'Calendar',
        title: '월간 요약',
        description: '매달 마지막 날 한 달 동안의 일기를 요약해드려요',
        enabled: false,
        hasSettings: false,
      },
      {
        id: 'quiet-hours',
        iconName: 'Moon',
        title: '방해 금지 시간',
        description: '설정한 시간에는 알림을 보내지 않아요',
        enabled: true,
        hasSettings: true,
        settings: {
          time: '23:00-07:00',
        },
      },
    ]
  }

  const [notifications, setNotifications] = useState<NotificationItem[]>(
    getDefaultNotifications(),
  )

  const [reminderFrequency, setReminderFrequency] = useState('daily')
  const [reminderTime, setReminderTime] = useState('21:00')
  const [selectedDays, setSelectedDays] = useState<string[]>([
    '월',
    '화',
    '수',
    '목',
    '금',
  ])
  const [quietStartTime, setQuietStartTime] = useState('23:00')
  const [quietEndTime, setQuietEndTime] = useState('07:00')

  // 클라이언트 사이드에서만 실행
  useEffect(() => {
    const saved = localStorage.getItem('notificationSettings')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setNotifications(parsed)

        // 리마인더 설정 복원
        const reminder = parsed.find(
          (n: NotificationItem) => n.id === 'reminder',
        )
        if (reminder?.settings) {
          setReminderFrequency(reminder.settings.frequency || 'daily')
          setReminderTime(reminder.settings.time || '21:00')
          if (reminder.settings.days) {
            setSelectedDays(reminder.settings.days)
          }
        }

        // 방해 금지 시간 설정 복원
        const quietHours = parsed.find(
          (n: NotificationItem) => n.id === 'quiet-hours',
        )
        if (quietHours?.settings?.time) {
          const [start, end] = quietHours.settings.time.split('-')
          setQuietStartTime(start || '23:00')
          setQuietEndTime(end || '07:00')
        }
      } catch {
        // 파싱 실패 시 기본값 유지
      }
    }
  }, [])

  // localStorage에 설정 저장
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(
        'notificationSettings',
        JSON.stringify(notifications),
      )
    }
  }, [notifications])

  const handleToggle = (id: string) => {
    setNotifications((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, enabled: !item.enabled } : item,
      ),
    )

    const notification = notifications.find((n) => n.id === id)
    if (notification) {
      toast.success(
        notification.enabled
          ? `${notification.title} 알림을 끕니다`
          : `${notification.title} 알림을 켭니다`,
      )
    }
  }

  const handleReminderSettingsSave = () => {
    setNotifications((prev) =>
      prev.map((item) =>
        item.id === 'reminder'
          ? {
              ...item,
              settings: {
                frequency: reminderFrequency as 'daily' | 'weekly' | 'custom',
                time: reminderTime,
                days: selectedDays,
              },
            }
          : item,
      ),
    )
    toast.success('리마인더 설정이 저장되었습니다')
    setShowReminderSettings(false)
  }

  const handleQuietHoursSettingsSave = () => {
    setNotifications((prev) =>
      prev.map((item) =>
        item.id === 'quiet-hours'
          ? {
              ...item,
              settings: {
                time: `${quietStartTime}-${quietEndTime}`,
              },
            }
          : item,
      ),
    )
    toast.success('방해 금지 시간이 설정되었습니다')
    setShowQuietHoursSettings(false)
  }

  const handleOpenSystemSettings = () => {
    // PWA의 경우 알림 권한 요청
    if ('Notification' in window) {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          toast.success('알림 권한이 허용되었습니다')
        } else if (permission === 'denied') {
          toast.error('알림 권한이 거부되었습니다. 기기 설정에서 변경해주세요')
        }
      })
    } else {
      toast.info('이 브라우저는 알림을 지원하지 않습니다')
    }
  }

  const header = (
    <div className="flex items-center bg-white px-4 py-3">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => router.back()}
        className="mr-3 h-9 w-9"
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>
      <h1 className="text-xl font-bold text-gray-900">알림 설정</h1>
    </div>
  )

  return (
    <MobileLayout header={header} className="bg-gray-50">
      <div className="pb-8">
        {/* 알림 권한 안내 */}
        <div className="mx-5 mt-4 mb-6 rounded-xl bg-blue-50 p-4">
          <div className="flex space-x-3">
            <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
            <div>
              <p className="font-medium text-blue-900">알림 권한이 필요해요</p>
              <p className="mt-1 text-sm text-blue-700">
                알림을 받으려면 기기 설정에서 알림 권한을 허용해주세요
              </p>
              <Button
                variant="link"
                className="mt-2 h-auto p-0 text-sm text-blue-600"
                onClick={handleOpenSystemSettings}
              >
                설정으로 이동 →
              </Button>
            </div>
          </div>
        </div>

        {/* 알림 설정 목록 */}
        <div className="bg-white">
          {notifications.map((item, index) => (
            <div
              key={item.id}
              className={`px-5 py-4 ${
                index !== notifications.length - 1
                  ? 'border-b border-gray-100'
                  : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex flex-1 items-center space-x-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                    {(() => {
                      const Icon = iconMap[item.iconName]
                      return Icon ? (
                        <Icon className="h-5 w-5 text-gray-700" />
                      ) : null
                    })()}
                  </div>
                  <div className="flex-1 pr-3">
                    <p className="text-base font-medium text-gray-900">
                      {item.title}
                    </p>
                    <p className="mt-0.5 text-sm text-gray-500">
                      {item.description}
                    </p>
                    {item.enabled && item.settings && (
                      <div className="mt-2 flex items-center space-x-2">
                        {item.id === 'reminder' && (
                          <>
                            <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                              {item.settings.frequency === 'daily'
                                ? '매일'
                                : item.settings.frequency === 'weekly'
                                  ? '주 3회'
                                  : '사용자 설정'}
                            </span>
                            <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                              {item.settings.time}
                            </span>
                          </>
                        )}
                        {item.id === 'quiet-hours' && (
                          <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                            {item.settings.time}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {item.hasSettings && item.enabled && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => {
                        if (item.id === 'reminder') {
                          setShowReminderSettings(true)
                        } else if (item.id === 'quiet-hours') {
                          setShowQuietHoursSettings(true)
                        }
                      }}
                    >
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </Button>
                  )}
                  <Switch
                    checked={item.enabled}
                    onCheckedChange={() => handleToggle(item.id)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 알림 테스트 */}
        <div className="mt-8 px-5">
          <Button
            variant="outline"
            className="h-12 w-full"
            onClick={() => {
              toast.success('테스트 알림입니다! 🔔')
            }}
          >
            <Bell className="mr-2 h-5 w-5" />
            알림 테스트하기
          </Button>
        </div>

        {/* 알림 관련 안내 */}
        <div className="mt-6 px-5">
          <div className="rounded-xl bg-gray-100 p-4">
            <h3 className="mb-2 font-medium text-gray-900">
              알림이 오지 않나요?
            </h3>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• 기기의 알림 권한이 켜져 있는지 확인해주세요</li>
              <li>• 방해 금지 모드가 꺼져 있는지 확인해주세요</li>
              <li>• 앱이 백그라운드에서 실행 중인지 확인해주세요</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 리마인더 설정 다이얼로그 */}
      <Dialog
        open={showReminderSettings}
        onOpenChange={setShowReminderSettings}
      >
        <DialogContent className="mx-4 max-w-[360px] rounded-2xl bg-white">
          <DialogHeader>
            <DialogTitle>리마인더 상세 설정</DialogTitle>
            <DialogDescription>
              언제 일기 작성을 알려드릴까요?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-3">
              <Label>알림 빈도</Label>
              <RadioGroup
                value={reminderFrequency}
                onValueChange={setReminderFrequency}
              >
                <div className="flex items-center space-x-2 rounded-lg border border-gray-200 p-3">
                  <RadioGroupItem value="daily" id="daily" />
                  <Label htmlFor="daily" className="flex-1 cursor-pointer">
                    매일
                  </Label>
                </div>
                <div className="flex items-center space-x-2 rounded-lg border border-gray-200 p-3">
                  <RadioGroupItem value="weekly" id="weekly" />
                  <Label htmlFor="weekly" className="flex-1 cursor-pointer">
                    주 3회 (월, 수, 금)
                  </Label>
                </div>
                <div className="flex items-center space-x-2 rounded-lg border border-gray-200 p-3">
                  <RadioGroupItem value="custom" id="custom" />
                  <Label htmlFor="custom" className="flex-1 cursor-pointer">
                    사용자 설정
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-3">
              <Label htmlFor="time">알림 시간</Label>
              <div className="relative">
                <Clock className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  id="time"
                  type="time"
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-10 py-3 text-base"
                />
              </div>
            </div>

            {reminderFrequency === 'custom' && (
              <div className="space-y-3">
                <Label>요일 선택</Label>
                <div className="grid grid-cols-7 gap-2">
                  {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
                    <button
                      key={day}
                      onClick={() => {
                        setSelectedDays((prev) =>
                          prev.includes(day)
                            ? prev.filter((d) => d !== day)
                            : [...prev, day],
                        )
                      }}
                      className={`h-10 rounded-lg border text-sm font-medium transition-colors ${
                        selectedDays.includes(day)
                          ? 'border-purple-500 bg-purple-50 text-purple-600'
                          : 'border-gray-200 text-gray-600'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowReminderSettings(false)}
            >
              취소
            </Button>
            <Button onClick={handleReminderSettingsSave}>저장</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 방해 금지 시간 설정 다이얼로그 */}
      <Dialog
        open={showQuietHoursSettings}
        onOpenChange={setShowQuietHoursSettings}
      >
        <DialogContent className="mx-4 max-w-[360px] rounded-2xl bg-white">
          <DialogHeader>
            <DialogTitle>방해 금지 시간 설정</DialogTitle>
            <DialogDescription>
              이 시간에는 알림을 보내지 않아요
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-3">
              <Label htmlFor="start-time">시작 시간</Label>
              <div className="relative">
                <Moon className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  id="start-time"
                  type="time"
                  value={quietStartTime}
                  onChange={(e) => setQuietStartTime(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-10 py-3 text-base"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="end-time">종료 시간</Label>
              <div className="relative">
                <Clock className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  id="end-time"
                  type="time"
                  value={quietEndTime}
                  onChange={(e) => setQuietEndTime(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-10 py-3 text-base"
                />
              </div>
            </div>

            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-sm text-gray-700">
                {quietStartTime}부터 다음날 {quietEndTime}까지 알림을 보내지
                않습니다
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowQuietHoursSettings(false)}
            >
              취소
            </Button>
            <Button onClick={handleQuietHoursSettingsSave}>저장</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MobileLayout>
  )
}
