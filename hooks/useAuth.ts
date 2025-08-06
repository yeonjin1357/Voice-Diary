'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import { toast } from 'sonner'

interface UseAuthOptions {
  redirectTo?: string
  showError?: boolean
  requireAuth?: boolean
}

export function useAuth(options: UseAuthOptions = {}) {
  const { redirectTo = '/auth/login', showError = true, requireAuth = true } = options
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        
        if (error || !user) {
          if (requireAuth) {
            if (showError) {
              toast.error('로그인이 필요합니다')
            }
            router.push(redirectTo)
          }
        } else {
          setUser(user)
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        if (showError) {
          toast.error('인증 확인 중 오류가 발생했습니다')
        }
      } finally {
        setLoading(false)
      }
    }

    checkUser()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (!session?.user && requireAuth && redirectTo) {
        router.push(redirectTo)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase.auth, router, redirectTo, showError, requireAuth])

  return { user, loading, isAuthenticated: !!user }
}