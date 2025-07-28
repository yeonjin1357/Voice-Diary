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

