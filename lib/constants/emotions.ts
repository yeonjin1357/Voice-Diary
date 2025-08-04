export const EMOTION_TYPES = ['기쁨', '슬픔', '불안', '분노', '평온', '기대', '놀람'] as const
export type EmotionType = (typeof EMOTION_TYPES)[number]

// Tailwind CSS classes for emotion badges
export const EMOTION_COLORS = {
  기쁨: 'bg-amber-50 text-amber-700 border-amber-200',
  슬픔: 'bg-blue-50 text-blue-700 border-blue-200',
  불안: 'bg-red-50 text-red-700 border-red-200',
  분노: 'bg-orange-50 text-orange-700 border-orange-200',
  평온: 'bg-green-50 text-green-700 border-green-200',
  기대: 'bg-purple-50 text-purple-700 border-purple-200',
  놀람: 'bg-yellow-50 text-yellow-700 border-yellow-200',
} as const

// Chart colors for emotion visualization
export const EMOTION_CHART_COLORS = {
  기쁨: '#fbbf24',
  슬픔: '#60a5fa',
  불안: '#f87171',
  분노: '#fb923c',
  평온: '#86efac',
  기대: '#c084fc',
  놀람: '#fde047',
} as const

// Dark mode colors for emotion badges
export const EMOTION_COLORS_DARK = {
  기쁨: 'dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800',
  슬픔: 'dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800',
  불안: 'dark:bg-red-900/20 dark:text-red-300 dark:border-red-800',
  분노: 'dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800',
  평온: 'dark:bg-green-900/20 dark:text-green-300 dark:border-green-800',
  기대: 'dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800',
  놀람: 'dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800',
} as const

// Emotion icons (optional)
export const EMOTION_ICONS = {
  기쁨: '😊',
  슬픔: '😢',
  불안: '😰',
  분노: '😡',
  평온: '😌',
  기대: '🤗',
  놀람: '😮',
} as const