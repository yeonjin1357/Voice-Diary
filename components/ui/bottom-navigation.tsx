'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Home, Mic, BookOpen, BarChart3, LogIn, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import { toast } from 'sonner'

interface NavItem {
  href: string
  icon: React.ElementType
  label: string
}

const navItems: NavItem[] = [
  { href: '/', icon: Home, label: '홈' },
  { href: '/record', icon: Mic, label: '녹음' },
  { href: '/diary', icon: BookOpen, label: '일기' },
  { href: '/insights', icon: BarChart3, label: '인사이트' },
]

export function BottomNavigation() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // 현재 사용자 정보 가져오기
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    
    getUser()

    // 인증 상태 변경 감지
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const handleLogout = async () => {
    setIsLoading(true)
    
    try {
      const { error } = await supabase.auth.signOut()
      
      if (error) throw error
      
      toast.success('로그아웃되었습니다')
      router.push('/')
      router.refresh()
    } catch (error) {
      toast.error('로그아웃 중 오류가 발생했습니다')
      console.error('Logout error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUserMenuClick = () => {
    if (user) {
      handleLogout()
    } else {
      router.push('/auth/login')
    }
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 dark:bg-neutral-900 dark:border-neutral-800">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center w-full h-full px-2 py-1 transition-colors',
                isActive
                  ? 'text-indigo-500 dark:text-indigo-400'
                  : 'text-neutral-500 dark:text-neutral-400'
              )}
            >
              <Icon className="w-5 h-5 mb-1" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          )
        })}
        
        {/* 사용자 메뉴 */}
        <button
          onClick={handleUserMenuClick}
          disabled={isLoading}
          className={cn(
            'flex flex-col items-center justify-center w-full h-full px-2 py-1 transition-colors',
            'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300'
          )}
        >
          {user ? (
            <>
              <LogOut className="w-5 h-5 mb-1" />
              <span className="text-xs font-medium">로그아웃</span>
            </>
          ) : (
            <>
              <LogIn className="w-5 h-5 mb-1" />
              <span className="text-xs font-medium">로그인</span>
            </>
          )}
        </button>
      </div>
    </nav>
  )
}