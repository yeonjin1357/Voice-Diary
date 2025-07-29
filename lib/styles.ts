// 공통으로 사용되는 스타일 클래스
export const styles = {
  // 버튼 스타일
  button: {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
    danger: 'bg-red-500 text-white hover:bg-red-600',
  },
  
  // 카드 스타일
  card: {
    base: 'bg-white rounded-lg border border-gray-200 shadow-sm',
    hover: 'hover:shadow-md transition-shadow',
    gradient: 'bg-gradient-to-br from-purple-50 to-pink-50',
  },
  
  // 텍스트 스타일
  text: {
    muted: 'text-muted-foreground',
    error: 'text-red-500',
    success: 'text-green-500',
    heading: 'text-lg font-semibold',
    subheading: 'text-sm font-medium',
  },
  
  // 레이아웃 스타일
  layout: {
    container: 'container mx-auto px-4',
    section: 'py-6 space-y-4',
    flexCenter: 'flex items-center justify-center',
    flexBetween: 'flex items-center justify-between',
  },
  
  // 애니메이션 스타일
  animation: {
    spin: 'animate-spin',
    pulse: 'animate-pulse',
    bounce: 'animate-bounce',
    fadeIn: 'animate-in fade-in duration-300',
  },
  
  // 그라디언트 팔레트
  gradient: {
    purple: 'bg-gradient-to-r from-purple-400 to-pink-400',
    blue: 'bg-gradient-to-r from-blue-400 to-cyan-400',
    green: 'bg-gradient-to-r from-green-400 to-emerald-400',
  },
}