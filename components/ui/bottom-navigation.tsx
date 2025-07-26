'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Mic, BookOpen, BarChart3, User } from 'lucide-react'
import { cn } from '@/lib/utils'

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
  { href: '/profile', icon: User, label: '내정보' },
]

export function BottomNavigation() {
  const pathname = usePathname()

  return (
    <nav className="fixed right-0 bottom-0 left-0 border-t border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex h-16 items-center justify-around">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex h-full w-full flex-col items-center justify-center px-2 py-1 transition-colors',
                isActive
                  ? 'text-indigo-500 dark:text-indigo-400'
                  : 'text-neutral-500 dark:text-neutral-400',
              )}
            >
              <Icon className="mb-1 h-5 w-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
