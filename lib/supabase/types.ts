export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      diary_entries: {
        Row: {
          id: string
          user_id: string
          date: string
          audio_url: string | null
          transcript: string
          summary: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          audio_url?: string | null
          transcript: string
          summary: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          audio_url?: string | null
          transcript?: string
          summary?: string
          created_at?: string
          updated_at?: string
        }
      }
      emotions: {
        Row: {
          id: string
          diary_entry_id: string
          type: '기쁨' | '슬픔' | '불안' | '분노' | '평온' | '기대' | '놀람'
          score: number
          created_at: string
        }
        Insert: {
          id?: string
          diary_entry_id: string
          type: '기쁨' | '슬픔' | '불안' | '분노' | '평온' | '기대' | '놀람'
          score: number
          created_at?: string
        }
        Update: {
          id?: string
          diary_entry_id?: string
          type?: '기쁨' | '슬픔' | '불안' | '분노' | '평온' | '기대' | '놀람'
          score?: number
          created_at?: string
        }
      }
      keywords: {
        Row: {
          id: string
          diary_entry_id: string
          keyword: string
          created_at: string
        }
        Insert: {
          id?: string
          diary_entry_id: string
          keyword: string
          created_at?: string
        }
        Update: {
          id?: string
          diary_entry_id?: string
          keyword?: string
          created_at?: string
        }
      }
    }
  }
}