// User types
export interface User {
  id: string
  email: string
  name?: string
  avatarUrl?: string
  createdAt: string
  updatedAt: string
}

// Base DiaryEntry type
export interface DiaryEntry {
  id: string
  userId: string
  date: string
  audioUrl?: string
  audioDuration?: number
  transcript?: string
  summary?: string
  images?: string[]
  createdAt: string
  updatedAt: string
}

// Emotion type
export interface Emotion {
  id?: string
  diaryEntryId?: string
  type: '기쁨' | '슬픔' | '불안' | '분노' | '평온' | '기대' | '놀람'
  score: number // 0-100
  createdAt?: string
}

// Keyword type
export interface Keyword {
  id?: string
  diaryEntryId?: string
  keyword: string
  createdAt?: string
}

// DiaryEntry with relations
export interface DiaryEntryWithRelations extends DiaryEntry {
  emotions: Emotion[]
  keywords: Keyword[]
}

// Analysis result type
export interface AnalysisResult {
  emotions: Emotion[]
  keywords: string[]
  summary: string
}

// Contact type
export interface Contact {
  id: string
  userId?: string
  email: string
  inquiryType: 'bug' | 'feature' | 'question' | 'other'
  subject: string
  message: string
  createdAt: string
}

