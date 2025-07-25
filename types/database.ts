export interface User {
  id: string
  email: string
  name?: string
  avatarUrl?: string
  createdAt: string
  updatedAt: string
}

export interface DiaryEntry {
  id: string
  userId: string
  date: string
  audioUrl?: string
  audioDuration?: number
  transcript?: string
  summary?: string
  createdAt: string
  updatedAt: string
}

export interface Emotion {
  id: string
  diaryEntryId: string
  type: '기쁨' | '슬픔' | '불안' | '분노' | '평온' | '기대' | '놀람'
  score: number
  createdAt: string
}

export interface Keyword {
  id: string
  diaryEntryId: string
  keyword: string
  createdAt: string
}

export interface DiaryEntryWithRelations extends DiaryEntry {
  emotions: Emotion[]
  keywords: Keyword[]
}