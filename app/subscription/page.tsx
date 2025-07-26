'use client'

import { useState, useEffect } from 'react'
import { MobileLayout } from '@/components/layout/mobile-layout'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Check,
  X,
  Crown,
  ArrowLeft,
  Sparkles,
  Zap,
  Shield,
  Download,
  Palette,
  Heart,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useSubscription } from '@/hooks/useSubscription'
import { SUBSCRIPTION_PRICES, formatPrice } from '@/lib/constants/subscription'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export default function SubscriptionPage() {
  const router = useRouter()
  const { userProfile, getUsageInfo } = useSubscription()
  const [usage, setUsage] = useState<{
    diary_count: number
    total_recording_minutes: number
  } | null>(null)
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>(
    'monthly',
  )

  const fetchUsage = async () => {
    const usageInfo = await getUsageInfo()
    setUsage(usageInfo)
  }

  useEffect(() => {
    if (userProfile) {
      fetchUsage()
    }
  }, [userProfile])

  const handleSubscribe = async () => {
    router.push(`/payment?plan=${billingCycle}`)
  }

  const handleCancelSubscription = async () => {
    if (!confirm('정말로 구독을 취소하시겠습니까?')) return

    try {
      const response = await fetch('/api/subscription/cancel', {
        method: 'POST',
      })

      if (!response.ok) throw new Error('구독 취소 실패')

      toast.success('구독이 취소되었습니다')
      router.refresh()
    } catch (error) {
      console.error('구독 취소 실패:', error)
      toast.error('구독 취소 중 오류가 발생했습니다')
    }
  }

  const header = (
    <div className="flex items-center border-b border-gray-100 bg-white px-5 py-4">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => router.back()}
        className="mr-3 text-gray-600"
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>
      <h1 className="text-xl font-bold text-gray-900">구독 관리</h1>
    </div>
  )

  const price = SUBSCRIPTION_PRICES.premium[billingCycle]
  const yearlyDiscount = Math.round(
    (1 -
      SUBSCRIPTION_PRICES.premium.yearly /
        (SUBSCRIPTION_PRICES.premium.monthly * 12)) *
      100,
  )

  const premiumFeatures = [
    { icon: Sparkles, text: '녹음 시간 10분으로 확대', highlight: true },
    { icon: Heart, text: '무제한 일기 작성', highlight: true },
    { icon: Download, text: '일기 PDF 내보내기' },
    { icon: Shield, text: '자동 백업 및 복원' },
    { icon: Zap, text: '고급 감정 인사이트' },
    { icon: Palette, text: '커스텀 테마 설정' },
  ]

  return (
    <MobileLayout header={header} className="bg-gray-50">
      <div className="pb-8">
        {/* 현재 플랜 상태 */}
        {userProfile && (
          <div className="mb-3 bg-white px-5 py-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  현재 플랜
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  {userProfile.subscriptionTier === 'premium'
                    ? '프리미엄 플랜을 이용 중입니다'
                    : '무료 플랜을 이용 중입니다'}
                </p>
              </div>
              {userProfile.subscriptionTier === 'premium' ? (
                <Badge className="border-0 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                  <Crown className="mr-1 h-3 w-3" />
                  Premium
                </Badge>
              ) : (
                <Badge variant="secondary">Free</Badge>
              )}
            </div>

            {/* 사용량 표시 */}
            {usage && (
              <div className="space-y-3">
                <div>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="text-gray-600">이번 달 일기</span>
                    <span className="font-medium text-gray-900">
                      {usage.diary_count}개{' '}
                      {userProfile.subscriptionTier === 'free' && '/ 10개'}
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-200">
                    <div
                      className={cn(
                        'h-2 rounded-full transition-all',
                        userProfile.subscriptionTier === 'premium'
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                          : 'bg-gray-600',
                      )}
                      style={{
                        width:
                          userProfile.subscriptionTier === 'free'
                            ? `${Math.min((usage.diary_count / 10) * 100, 100)}%`
                            : '100%',
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="text-gray-600">총 녹음 시간</span>
                    <span className="font-medium text-gray-900">
                      {usage.total_recording_minutes}분
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 프리미엄 플랜 카드 */}
        <div className="px-5">
          <div className="mb-4 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 p-6 text-white">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="flex items-center gap-2 text-xl font-bold">
                  <Crown className="h-5 w-5" />
                  프리미엄
                </h3>
                <p className="mt-1 text-sm text-purple-100">
                  모든 기능을 무제한으로
                </p>
              </div>
              {yearlyDiscount > 0 && billingCycle === 'yearly' && (
                <Badge className="border-white/30 bg-white/20 text-white">
                  {yearlyDiscount}% 할인
                </Badge>
              )}
            </div>

            {/* 요금제 선택 */}
            <div className="mb-4 flex gap-2">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={cn(
                  'flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-all',
                  billingCycle === 'monthly'
                    ? 'bg-white text-purple-600'
                    : 'bg-white/10 text-white hover:bg-white/20',
                )}
              >
                월간 결제
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={cn(
                  'flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-all',
                  billingCycle === 'yearly'
                    ? 'bg-white text-purple-600'
                    : 'bg-white/10 text-white hover:bg-white/20',
                )}
              >
                연간 결제
              </button>
            </div>

            {/* 가격 표시 */}
            <div className="mb-4">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold">
                  ₩{formatPrice(price)}
                </span>
                <span className="text-purple-100">
                  /{billingCycle === 'monthly' ? '월' : '년'}
                </span>
              </div>
              {billingCycle === 'yearly' && (
                <p className="mt-1 text-xs text-purple-100">
                  월 ₩{formatPrice(Math.round(price / 12))}에 해당
                </p>
              )}
            </div>

            {userProfile?.subscriptionTier === 'free' ? (
              <Button
                onClick={handleSubscribe}
                className="w-full bg-white font-semibold text-purple-600 hover:bg-gray-100"
                size="lg"
              >
                프리미엄 시작하기
              </Button>
            ) : (
              <div className="text-center">
                <p className="text-sm text-purple-100">
                  다음 결제일:{' '}
                  {userProfile?.subscriptionEndDate &&
                    new Date(
                      userProfile.subscriptionEndDate,
                    ).toLocaleDateString('ko-KR')}
                </p>
              </div>
            )}
          </div>

          {/* 프리미엄 기능 목록 */}
          <div className="mb-4 rounded-xl bg-white p-5">
            <h3 className="mb-4 font-semibold text-gray-900">프리미엄 혜택</h3>
            <div className="space-y-3">
              {premiumFeatures.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div
                    className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-full',
                      feature.highlight
                        ? 'bg-gradient-to-br from-purple-100 to-pink-100'
                        : 'bg-gray-100',
                    )}
                  >
                    <feature.icon
                      className={cn(
                        'h-4 w-4',
                        feature.highlight ? 'text-purple-600' : 'text-gray-600',
                      )}
                    />
                  </div>
                  <span
                    className={cn(
                      'text-sm',
                      feature.highlight
                        ? 'font-medium text-gray-900'
                        : 'text-gray-700',
                    )}
                  >
                    {feature.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 무료 vs 프리미엄 비교 */}
          <div className="mb-4 rounded-xl bg-white p-5">
            <h3 className="mb-4 font-semibold text-gray-900">플랜 비교</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div className="font-medium text-gray-600">기능</div>
                <div className="text-center font-medium text-gray-600">
                  무료
                </div>
                <div className="text-center font-medium text-purple-600">
                  프리미엄
                </div>
              </div>

              {[
                { feature: '일기 작성', free: '월 10개', premium: '무제한' },
                { feature: '녹음 시간', free: '3분', premium: '10분' },
                { feature: '감정 분석', free: true, premium: true },
                { feature: '키워드 추출', free: true, premium: true },
                { feature: '고급 인사이트', free: false, premium: true },
                { feature: '일기 내보내기', free: false, premium: true },
                { feature: '백업/복원', free: false, premium: true },
                { feature: '커스텀 테마', free: false, premium: true },
              ].map((item, index) => (
                <div
                  key={index}
                  className="grid grid-cols-3 gap-2 border-t border-gray-100 py-2 text-sm"
                >
                  <div className="text-gray-700">{item.feature}</div>
                  <div className="text-center">
                    {typeof item.free === 'boolean' ? (
                      item.free ? (
                        <Check className="mx-auto h-4 w-4 text-green-500" />
                      ) : (
                        <X className="mx-auto h-4 w-4 text-gray-300" />
                      )
                    ) : (
                      <span className="text-gray-600">{item.free}</span>
                    )}
                  </div>
                  <div className="text-center">
                    {typeof item.premium === 'boolean' ? (
                      item.premium ? (
                        <Check className="mx-auto h-4 w-4 text-purple-500" />
                      ) : (
                        <X className="mx-auto h-4 w-4 text-gray-300" />
                      )
                    ) : (
                      <span className="font-medium text-purple-600">
                        {item.premium}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 구독 취소 */}
          {userProfile?.subscriptionTier === 'premium' && (
            <div className="py-4 text-center">
              <Button
                variant="ghost"
                onClick={handleCancelSubscription}
                className="text-gray-500 hover:text-gray-700"
              >
                구독 취소하기
              </Button>
            </div>
          )}
        </div>
      </div>
    </MobileLayout>
  )
}
