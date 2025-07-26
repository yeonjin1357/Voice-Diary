export interface DiaryEntry {
  id: string;
  userId: string;
  date: Date;
  audioUrl?: string;
  transcript: string;
  emotions: Emotion[];
  keywords: string[];
  summary: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Emotion {
  type: '기쁨' | '슬픔' | '불안' | '분노' | '평온' | '기대' | '놀람';
  score: number; // 0-100
}

export interface AnalysisResult {
  emotions: Emotion[];
  keywords: string[];
  summary: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
  subscriptionTier: 'free' | 'premium';
  subscriptionStatus: 'active' | 'canceled' | 'expired';
  subscriptionEndDate?: Date;
  stripeCustomerId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  tier: 'free' | 'premium';
  priceMonthly: number;
  priceYearly: number;
  maxRecordingMinutes: number;
  maxDiariesPerMonth: number | null;
  features: {
    emotionAnalysis: boolean;
    keywordExtraction: boolean;
    basicInsights: boolean;
    exportDiary: boolean;
    advancedInsights: boolean;
    backupRestore: boolean;
    noAds: boolean;
    prioritySupport?: boolean;
    customThemes?: boolean;
  };
  stripePriceIdMonthly?: string;
  stripePriceIdYearly?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserSubscription {
  id: string;
  userId: string;
  planId: string;
  stripeSubscriptionId?: string;
  billingCycle: 'monthly' | 'yearly';
  status: 'active' | 'canceled' | 'expired' | 'past_due';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAt?: Date;
  canceledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface UsageTracking {
  id: string;
  userId: string;
  month: Date;
  diaryCount: number;
  totalRecordingMinutes: number;
  createdAt: Date;
  updatedAt: Date;
}