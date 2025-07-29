'use client'

import { useState, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Home } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { toast } from 'sonner'

export default function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectedFrom = searchParams.get('redirectedFrom') || '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [name, setName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [emailError, setEmailError] = useState(false)
  const [passwordError, setPasswordError] = useState(false)
  const [confirmPasswordError, setConfirmPasswordError] = useState(false)
  const [isCheckingEmail, setIsCheckingEmail] = useState(false)

  const emailRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)
  const confirmPasswordRef = useRef<HTMLInputElement>(null)

  const supabase = createClient()

  const handleGoogleLogin = async () => {
    setIsLoading(true)

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })

      if (error) throw error
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : '구글 로그인 중 오류가 발생했습니다.',
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleKakaoLogin = async () => {
    setIsLoading(true)

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'kakao' as 'google', // Supabase 타입 호환성을 위해 google로 타입 쮤팅
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : '카카오 로그인 중 오류가 발생했습니다.',
      )
    } finally {
      setIsLoading(false)
    }
  }

  const clearErrors = () => {
    setEmailError(false)
    setPasswordError(false)
    setConfirmPasswordError(false)
  }

  const checkEmailExists = async (email: string): Promise<boolean> => {
    setIsCheckingEmail(true)
    try {
      const { data } = await supabase.rpc('check_email_exists', {
        email_input: email,
      })

      return data === true
    } catch {
      // 처리하지 않음 - false 반환
      return false
    } finally {
      setIsCheckingEmail(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    clearErrors()

    try {
      if (isSignUp) {
        // 이메일 중복 확인
        const emailExists = await checkEmailExists(email)
        if (emailExists) {
          toast.error('이미 가입된 이메일입니다.')
          setEmailError(true)
          emailRef.current?.focus()
          return
        }

        // 비밀번호 확인 체크
        if (password !== confirmPassword) {
          toast.error('비밀번호가 일치하지 않습니다.')
          setConfirmPasswordError(true)
          confirmPasswordRef.current?.focus()
          return
        }

        // 비밀번호 길이 체크
        if (password.length < 6) {
          toast.error('비밀번호는 최소 6자 이상이어야 합니다.')
          setPasswordError(true)
          passwordRef.current?.focus()
          return
        }

        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: name.trim(),
            },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        })
        if (error) throw error

        toast.success('인증 이메일을 발송했습니다! 이메일을 확인해주세요.')
        setIsSignUp(false)
        setPassword('')
        setConfirmPassword('')
        setName('')
        return
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error

        toast.success('로그인되었습니다!')

        // 로그인 성공 후 바로 리다이렉트
        router.push(redirectedFrom)
        router.refresh()
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : '오류가 발생했습니다.'

      // Supabase 영문 에러 메시지를 한글로 변환 및 적절한 필드에 포커스
      if (errorMessage.includes('Invalid login credentials')) {
        // 로그인 시 잘못된 인증 정보
        if (!isSignUp) {
          // 먼저 이메일이 존재하는지 확인
          const emailExists = await checkEmailExists(email)

          if (!emailExists) {
            toast.error('등록되지 않은 이메일입니다.')
            setEmailError(true)
            emailRef.current?.focus()
          } else {
            toast.error('비밀번호가 일치하지 않습니다.')
            setPasswordError(true)
            passwordRef.current?.focus()
          }
        }
      } else if (errorMessage.includes('User already registered')) {
        toast.error('이미 가입된 이메일입니다.')
        setEmailError(true)
        emailRef.current?.focus()
      } else if (errorMessage.includes('Email not confirmed')) {
        toast.error('이메일 인증이 완료되지 않았습니다. 이메일을 확인해주세요.')
      } else if (errorMessage.includes('Password should be at least')) {
        toast.error('비밀번호는 최소 6자 이상이어야 합니다.')
        setPasswordError(true)
        passwordRef.current?.focus()
      } else {
        toast.error(errorMessage)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col bg-white dark:bg-neutral-900">
      {/* 홈 버튼 */}
      <Link href="/" className="absolute top-4 left-4 z-10">
        <Button variant="ghost" size="icon" className="rounded-full">
          <Home className="h-5 w-5" />
        </Button>
      </Link>

      {/* 상단 로고 및 타이틀 섹션 */}
      <div className="mt-20 mb-12 text-center px-8">
        <div className="flex justify-center mb-6">
          <Image
            src="/logo.svg"
            alt="울림 로고"
            width={80}
            height={80}
            priority
            className="dark:invert"
          />
        </div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
          울림
        </h1>
        <p className="text-base text-neutral-600 dark:text-neutral-400">
          {isSignUp
            ? '새로운 계정을 만들어주세요'
            : '로그인하여 일기를 작성해보세요'}
        </p>
      </div>

      {/* 메인 컨텐츠 - 스크롤 가능 영역 */}
      <div className="flex-1 px-6 pb-8 overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div className="space-y-3">
                <Label htmlFor="name" className="text-base font-medium">이름</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="홍길동"
                  value={name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setName(e.target.value)
                  }
                  className="h-12 text-base"
                  required
                />
              </div>
            )}

            <div className="space-y-3">
              <Label htmlFor="email" className="text-base font-medium">이메일</Label>
              <Input
                ref={emailRef}
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setEmail(e.target.value)
                  setEmailError(false)
                }}
                className={`h-12 text-base ${
                  emailError ? 'border-red-500 focus:ring-red-500' : ''
                }`}
                required
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="password" className="text-base font-medium">비밀번호</Label>
              <Input
                ref={passwordRef}
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setPassword(e.target.value)
                  setPasswordError(false)
                }}
                className={`h-12 text-base ${
                  passwordError ? 'border-red-500 focus:ring-red-500' : ''
                }`}
                required
              />
              {isSignUp && (
                <p className="text-sm text-neutral-500">
                  최소 6자 이상 입력해주세요
                </p>
              )}
            </div>

            {isSignUp && (
              <div className="space-y-3">
                <Label htmlFor="confirmPassword" className="text-base font-medium">비밀번호 확인</Label>
                <Input
                  ref={confirmPasswordRef}
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setConfirmPassword(e.target.value)
                    setConfirmPasswordError(false)
                  }}
                  className={`h-12 text-base ${
                    confirmPasswordError
                      ? 'border-red-500 focus:ring-red-500'
                      : ''
                  }`}
                  required
                />
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-14 text-base font-medium bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 mt-6"
              disabled={isLoading || isCheckingEmail}
            >
              {isLoading ? '처리 중...' : isSignUp ? '회원가입' : '로그인'}
            </Button>
          </form>

          {/* 소셜 로그인 구분선 */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-200 dark:border-neutral-700" />
            </div>
            <div className="relative flex justify-center text-sm uppercase">
              <span className="text-muted-foreground bg-white dark:bg-neutral-900 px-3">
                또는
              </span>
            </div>
          </div>

          {/* 소셜 로그인 버튼들 */}
          <div className="space-y-4">
            <Button
              type="button"
              variant="outline"
              className="relative w-full h-14 text-base"
              onClick={handleGoogleLogin}
              disabled={isLoading}
            >
              <svg className="absolute left-3 h-5 w-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              구글로 계속하기
            </Button>

            <Button
              type="button"
              variant="outline"
              className="relative w-full h-14 text-base border-[#FEE500] bg-[#FEE500] text-black hover:border-[#FEE500]/90 hover:bg-[#FEE500]/90"
              onClick={handleKakaoLogin}
              disabled={isLoading}
            >
              <svg className="absolute left-3 h-5 w-5" viewBox="0 0 24 24">
                <path
                  d="M12 2C6.477 2 2 5.478 2 9.5c0 2.532 1.776 4.775 4.471 6.085l-.954 3.484a.5.5 0 0 0 .783.458l3.869-2.559c.605.083 1.217.132 1.831.132 5.523 0 10-3.478 10-7.5S17.523 2 12 2z"
                  fill="#000000"
                  opacity="0.9"
                />
              </svg>
              카카오로 계속하기
            </Button>
          </div>

          <div className="mt-8 text-center text-base">
            {isSignUp ? (
              <>
                이미 계정이 있으신가요?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(false)
                    setName('')
                    setConfirmPassword('')
                    clearErrors()
                  }}
                  className="cursor-pointer font-medium text-purple-600 hover:text-purple-700 hover:underline"
                >
                  로그인
                </button>
              </>
            ) : (
              <>
                계정이 없으신가요?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(true)
                    setPassword('')
                    clearErrors()
                  }}
                  className="cursor-pointer font-medium text-purple-600 hover:text-purple-700 hover:underline"
                >
                  회원가입
                </button>
              </>
            )}
          </div>
      </div>
    </div>
  )
}
