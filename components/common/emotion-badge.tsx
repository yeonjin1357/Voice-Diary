import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface EmotionBadgeProps {
  type: '기쁨' | '슬픔' | '불안' | '분노' | '평온' | '기대' | '놀람'
  score?: number
  size?: 'sm' | 'md' | 'lg'
  showScore?: boolean
}

const emotionColors = {
  기쁨: 'bg-yellow-100 text-yellow-800',
  슬픔: 'bg-blue-100 text-blue-800',
  불안: 'bg-red-100 text-red-800',
  분노: 'bg-orange-100 text-orange-800',
  평온: 'bg-green-100 text-green-800',
  기대: 'bg-purple-100 text-purple-800',
  놀람: 'bg-pink-100 text-pink-800',
}

const sizeClasses = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-2.5 py-0.5',
  lg: 'text-base px-3 py-1',
}

export function EmotionBadge({ type, score, size = 'md', showScore = false }: EmotionBadgeProps) {
  return (
    <Badge 
      variant="secondary" 
      className={cn(
        emotionColors[type],
        sizeClasses[size],
        'font-medium'
      )}
    >
      {type}
      {showScore && score !== undefined && (
        <span className="ml-1 opacity-75">{score}%</span>
      )}
    </Badge>
  )
}