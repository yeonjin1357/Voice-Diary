'use client'

import { useState } from 'react'
import { Plus, X, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Emotion } from '@/types'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface EmotionEditorProps {
  emotions: Emotion[]
  onEmotionsChange: (emotions: Emotion[]) => void
  disabled?: boolean
}

const EMOTION_TYPES = [
  '기쁨',
  '슬픔',
  '불안',
  '분노',
  '평온',
  '기대',
  '놀람',
] as const

const emotionEmojis = {
  기쁨: '😊',
  슬픔: '😢',
  불안: '😰',
  분노: '😠',
  평온: '😌',
  기대: '🤗',
  놀람: '😲',
}

const emotionColors = {
  기쁨: { bg: '#FFF3E0', text: '#F57C00', bar: '#FFB74D' },
  슬픔: { bg: '#E3F2FD', text: '#1976D2', bar: '#64B5F6' },
  불안: { bg: '#FFEBEE', text: '#D32F2F', bar: '#E57373' },
  분노: { bg: '#FFF3E0', text: '#E65100', bar: '#FF8A65' },
  평온: { bg: '#E8F5E9', text: '#388E3C', bar: '#81C784' },
  기대: { bg: '#F3E5F5', text: '#7B1FA2', bar: '#BA68C8' },
  놀람: { bg: '#FFFDE7', text: '#F9A825', bar: '#FFD54F' },
}

export function EmotionEditor({
  emotions,
  onEmotionsChange,
  disabled = false,
}: EmotionEditorProps) {
  const [isAddingEmotion, setIsAddingEmotion] = useState(false)

  const handleEmotionScoreChange = (type: Emotion['type'], score: number) => {
    const updatedEmotions = emotions.map((emotion) =>
      emotion.type === type ? { ...emotion, score } : emotion
    )
    onEmotionsChange(updatedEmotions)
  }

  const handleRemoveEmotion = (type: Emotion['type']) => {
    const updatedEmotions = emotions.filter((emotion) => emotion.type !== type)
    onEmotionsChange(updatedEmotions)
  }

  const handleAddEmotion = (type: Emotion['type']) => {
    if (emotions.some((e) => e.type === type)) {
      return
    }

    const newEmotion: Emotion = {
      type,
      score: 50,
    }

    onEmotionsChange([...emotions, newEmotion])
    setIsAddingEmotion(false)
  }

  const handleIncrement = (type: Emotion['type'], currentScore: number) => {
    const newScore = Math.min(100, currentScore + 10)
    handleEmotionScoreChange(type, newScore)
  }

  const handleDecrement = (type: Emotion['type'], currentScore: number) => {
    const newScore = Math.max(0, currentScore - 10)
    handleEmotionScoreChange(type, newScore)
  }

  const availableEmotions = EMOTION_TYPES.filter(
    (type) => !emotions.some((e) => e.type === type)
  )

  return (
    <div className="space-y-3">
      {/* 감정 목록 */}
      {emotions.map((emotion) => (
        <div
          key={emotion.type}
          className="relative rounded-2xl p-4"
          style={{ backgroundColor: emotionColors[emotion.type].bg }}
        >
          {/* 삭제 버튼 */}
          <button
            onClick={() => handleRemoveEmotion(emotion.type)}
            disabled={disabled}
            className="absolute right-3 top-3 rounded-full bg-white/80 p-1.5 shadow-sm transition-all hover:bg-white hover:shadow-md disabled:opacity-50"
          >
            <X className="h-4 w-4 text-gray-600" />
          </button>

          {/* 감정 헤더 */}
          <div className="mb-4 flex items-center gap-3">
            <span className="text-2xl">{emotionEmojis[emotion.type]}</span>
            <div>
              <h3 
                className="text-lg font-semibold"
                style={{ color: emotionColors[emotion.type].text }}
              >
                {emotion.type}
              </h3>
              <p className="text-sm text-gray-600">{emotion.score}%</p>
            </div>
          </div>

          {/* 감정 강도 조절 */}
          <div className="space-y-3">
            {/* 프로그레스 바 */}
            <div className="relative h-8 rounded-full bg-white/50 overflow-hidden">
              <div
                className="absolute left-0 top-0 h-full rounded-full transition-all duration-300 ease-out"
                style={{ 
                  width: `${emotion.score}%`,
                  backgroundColor: emotionColors[emotion.type].bar
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-medium text-gray-700">
                  {emotion.score}%
                </span>
              </div>
            </div>

            {/* +/- 버튼 */}
            <div className="flex items-center justify-between gap-3">
              <button
                onClick={() => handleDecrement(emotion.type, emotion.score)}
                disabled={disabled || emotion.score === 0}
                className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm transition-all",
                  disabled || emotion.score === 0
                    ? "opacity-50"
                    : "hover:shadow-md active:scale-95"
                )}
              >
                <Minus className="h-5 w-5 text-gray-600" />
              </button>

              <div className="flex-1">
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="10"
                  value={emotion.score}
                  onChange={(e) => handleEmotionScoreChange(emotion.type, parseInt(e.target.value))}
                  disabled={disabled}
                  className="w-full appearance-none bg-transparent focus:outline-none"
                  style={{
                    background: `linear-gradient(to right, ${emotionColors[emotion.type].bar} 0%, ${emotionColors[emotion.type].bar} ${emotion.score}%, #e5e7eb ${emotion.score}%, #e5e7eb 100%)`,
                    height: '4px',
                    borderRadius: '2px',
                  }}
                />
              </div>

              <button
                onClick={() => handleIncrement(emotion.type, emotion.score)}
                disabled={disabled || emotion.score === 100}
                className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm transition-all",
                  disabled || emotion.score === 100
                    ? "opacity-50"
                    : "hover:shadow-md active:scale-95"
                )}
              >
                <Plus className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* 감정 추가 버튼 */}
      {availableEmotions.length > 0 && (
        <DropdownMenu open={isAddingEmotion} onOpenChange={setIsAddingEmotion}>
          <DropdownMenuTrigger asChild>
            <button
              disabled={disabled}
              className={cn(
                'flex w-full items-center justify-center gap-2 rounded-2xl bg-gray-100 py-4 text-base font-medium transition-all',
                disabled
                  ? 'opacity-50'
                  : 'hover:bg-gray-200 active:scale-[0.98]'
              )}
            >
              <Plus className="h-5 w-5" />
              감정 추가
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" className="w-56 bg-white p-2">
            {availableEmotions.map((type) => (
              <DropdownMenuItem
                key={type}
                onClick={() => handleAddEmotion(type)}
                className="cursor-pointer rounded-xl p-3 transition-colors hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{emotionEmojis[type]}</span>
                  <span className="text-base font-medium">{type}</span>
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  )
}