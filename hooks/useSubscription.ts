'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { UserProfile, SubscriptionPlan } from '@/types'
import { SUBSCRIPTION_LIMITS, SUBSCRIPTION_TIERS } from '@/lib/constants/subscription'

export function useSubscription() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [subscriptionPlan, setSubscriptionPlan] = useState<SubscriptionPlan | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchUserProfile()
  }, [])

  const fetchUserProfile = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setError('로그인이 필요합니다')
        return
      }

      // 사용자 프로필 가져오기
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileError) {
        // 프로필이 없으면 기본값으로 생성
        if (profileError.code === 'PGRST116') {
          const newProfile = {
            id: user.id,
            email: user.email || '',
            name: user.user_metadata?.full_name || null,
            avatar_url: user.user_metadata?.avatar_url || null,
            subscription_tier: 'free',
            subscription_status: 'active',
            subscription_end_date: null,
            stripe_customer_id: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
          
          // 프로필 생성 시도
          const { error: insertError } = await supabase
            .from('user_profiles')
            .insert(newProfile)
          
          if (!insertError) {
            setUserProfile({
              ...newProfile,
              subscriptionEndDate: undefined,
              createdAt: new Date(newProfile.created_at),
              updatedAt: new Date(newProfile.updated_at),
            })
            return
          }
        }
        throw profileError
      }

      setUserProfile({
        id: profile.id,
        email: profile.email,
        name: profile.name,
        avatarUrl: profile.avatar_url,
        subscriptionTier: profile.subscription_tier,
        subscriptionStatus: profile.subscription_status,
        subscriptionEndDate: profile.subscription_end_date ? new Date(profile.subscription_end_date) : undefined,
        stripeCustomerId: profile.stripe_customer_id,
        createdAt: new Date(profile.created_at),
        updatedAt: new Date(profile.updated_at),
      })

      // 구독 플랜 정보 가져오기 (옵셔널)
      if (profile) {
        const { data: plan, error: planError } = await supabase
          .from('subscription_plans')
          .select('*')
          .eq('tier', profile.subscription_tier)
          .single()

        if (!planError && plan) {
          setSubscriptionPlan({
            id: plan.id,
            name: plan.name,
            tier: plan.tier,
            priceMonthly: plan.price_monthly,
            priceYearly: plan.price_yearly,
            maxRecordingMinutes: plan.max_recording_minutes,
            maxDiariesPerMonth: plan.max_diaries_per_month,
            features: plan.features,
            stripePriceIdMonthly: plan.stripe_price_id_monthly,
            stripePriceIdYearly: plan.stripe_price_id_yearly,
            isActive: plan.is_active,
            createdAt: new Date(plan.created_at),
            updatedAt: new Date(plan.updated_at),
          })
        }
      }
    } catch (err) {
      console.error('프로필 로드 실패:', err)
      setError('프로필을 불러오는데 실패했습니다')
    } finally {
      setLoading(false)
    }
  }

  const checkRecordingLimit = (recordingSeconds: number): boolean => {
    if (!userProfile) return false
    const limit = SUBSCRIPTION_LIMITS[userProfile.subscriptionTier].maxRecordingMinutes
    return recordingSeconds <= limit * 60
  }

  const getUsageInfo = async () => {
    if (!userProfile) return null

    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    const { data, error } = await supabase
      .from('usage_tracking')
      .select('*')
      .eq('user_id', userProfile.id)
      .eq('month', monthStart.toISOString().split('T')[0])
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('사용량 조회 실패:', error)
      return null
    }

    return data || { diary_count: 0, total_recording_minutes: 0 }
  }

  const canCreateDiary = async (): Promise<boolean> => {
    if (!userProfile) return false
    
    const limit = SUBSCRIPTION_LIMITS[userProfile.subscriptionTier].maxDiariesPerMonth
    if (!limit) return true // 무제한
    
    const usage = await getUsageInfo()
    if (!usage) return false
    
    return usage.diary_count < limit
  }

  const updateUsage = async (recordingMinutes: number) => {
    if (!userProfile) return

    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const monthKey = monthStart.toISOString().split('T')[0]

    // 현재 사용량 가져오기
    const { data: existing } = await supabase
      .from('usage_tracking')
      .select('*')
      .eq('user_id', userProfile.id)
      .eq('month', monthKey)
      .single()

    if (existing) {
      // 업데이트
      await supabase
        .from('usage_tracking')
        .update({
          diary_count: existing.diary_count + 1,
          total_recording_minutes: existing.total_recording_minutes + recordingMinutes,
        })
        .eq('id', existing.id)
    } else {
      // 새로 생성
      await supabase
        .from('usage_tracking')
        .insert({
          user_id: userProfile.id,
          month: monthKey,
          diary_count: 1,
          total_recording_minutes: recordingMinutes,
        })
    }
  }

  return {
    userProfile,
    subscriptionPlan,
    loading,
    error,
    checkRecordingLimit,
    canCreateDiary,
    getUsageInfo,
    updateUsage,
    refetch: fetchUserProfile,
  }
}