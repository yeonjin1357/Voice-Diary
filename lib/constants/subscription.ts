export const SUBSCRIPTION_TIERS = {
  FREE: 'free',
  PREMIUM: 'premium',
} as const

export type SubscriptionTier =
  (typeof SUBSCRIPTION_TIERS)[keyof typeof SUBSCRIPTION_TIERS]

export const SUBSCRIPTION_LIMITS = {
  [SUBSCRIPTION_TIERS.FREE]: {
    maxRecordingMinutes: 3,
    maxDiariesPerMonth: 10,
    features: {
      emotionAnalysis: true,
      keywordExtraction: true,
      basicInsights: true,
      exportDiary: false,
      advancedInsights: false,
      backupRestore: false,
      noAds: false,
      prioritySupport: false,
      customThemes: false,
    },
  },
  [SUBSCRIPTION_TIERS.PREMIUM]: {
    maxRecordingMinutes: 10,
    maxDiariesPerMonth: null, // 무제한
    features: {
      emotionAnalysis: true,
      keywordExtraction: true,
      basicInsights: true,
      exportDiary: true,
      advancedInsights: true,
      backupRestore: true,
      noAds: true,
      prioritySupport: true,
      customThemes: true,
    },
  },
} as const

export const SUBSCRIPTION_PRICES = {
  [SUBSCRIPTION_TIERS.PREMIUM]: {
    monthly: 9900,
    yearly: 99000,
  },
} as const

export const formatPrice = (price: number) => {
  return new Intl.NumberFormat('ko-KR').format(price)
}

import { SupabaseClient } from '@supabase/supabase-js'

export const getMonthlyDiaryCount = async (
  userId: string,
  supabase: SupabaseClient,
) => {
  const now = new Date()
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const { count, error } = await supabase
    .from('diary_entries')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', firstDayOfMonth.toISOString())

  if (error) throw error
  return count || 0
}

export const canCreateDiary = async (
  userId: string,
  tier: SubscriptionTier,
  supabase: SupabaseClient,
) => {
  const limit = SUBSCRIPTION_LIMITS[tier].maxDiariesPerMonth
  if (!limit) return true // 무제한

  const currentCount = await getMonthlyDiaryCount(userId, supabase)
  return currentCount < limit
}
