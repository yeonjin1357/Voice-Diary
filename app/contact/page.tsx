'use client'

import { useState } from 'react'
import { MobileLayout } from '@/components/layout/mobile-layout'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { 
  ArrowLeft, 
  Mail, 
  MessageSquare, 
  Bug, 
  Lightbulb,
  HelpCircle,
  Check
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface ContactType {
  id: string
  icon: React.ElementType
  title: string
  description: string
}

const contactTypes: ContactType[] = [
  {
    id: 'general',
    icon: MessageSquare,
    title: '일반 문의',
    description: '서비스 이용에 대한 일반적인 질문'
  },
  {
    id: 'bug',
    icon: Bug,
    title: '버그 신고',
    description: '오류나 작동하지 않는 기능 신고'
  },
  {
    id: 'feature',
    icon: Lightbulb,
    title: '기능 제안',
    description: '새로운 기능이나 개선사항 제안'
  },
  {
    id: 'other',
    icon: HelpCircle,
    title: '기타 문의',
    description: '위 항목에 해당하지 않는 문의'
  }
]

export default function ContactPage() {
  const router = useRouter()
  const [selectedType, setSelectedType] = useState<string>('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const header = (
    <div className="flex items-center bg-white px-4 py-3">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => router.back()}
        className="mr-3 h-9 w-9"
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>
      <h1 className="text-xl font-bold text-gray-900">문의하기</h1>
    </div>
  )

  const handleSubmit = async () => {
    if (!selectedType || !email || !subject || !message) {
      toast.error('모든 항목을 입력해주세요')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: selectedType,
          email,
          subject,
          message,
        }),
      })

      if (!response.ok) {
        throw new Error('문의 전송에 실패했습니다')
      }

      toast.success('문의가 성공적으로 전송되었습니다')
      router.push('/profile')
    } catch {
      toast.error('문의 전송 중 오류가 발생했습니다')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <MobileLayout header={header} className="bg-gray-50">
      <div className="px-4 py-6 space-y-6">
        {/* 문의 유형 선택 */}
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-gray-700">문의 유형</h2>
          <div className="grid grid-cols-2 gap-3">
            {contactTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className={cn(
                  "relative p-4 rounded-2xl border-2 transition-all",
                  "hover:shadow-md active:scale-[0.98]",
                  selectedType === type.id
                    ? "border-purple-500 bg-purple-50"
                    : "border-gray-200 bg-white"
                )}
              >
                {selectedType === type.id && (
                  <div className="absolute top-2 right-2">
                    <div className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  </div>
                )}
                <div className="flex flex-col items-center space-y-2">
                  <div className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center",
                    selectedType === type.id
                      ? "bg-purple-100"
                      : "bg-gray-100"
                  )}>
                    <type.icon className={cn(
                      "w-6 h-6",
                      selectedType === type.id
                        ? "text-purple-600"
                        : "text-gray-600"
                    )} />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-900">
                      {type.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {type.description}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 연락처 정보 */}
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-gray-700">답변 받으실 이메일</h2>
          <Input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-white border-gray-200 focus:border-purple-400 focus:ring-purple-400"
          />
        </div>

        {/* 제목 */}
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-gray-700">제목</h2>
          <Input
            placeholder="문의 제목을 입력해주세요"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="bg-white border-gray-200 focus:border-purple-400 focus:ring-purple-400"
          />
        </div>

        {/* 문의 내용 */}
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-gray-700">문의 내용</h2>
          <Textarea
            placeholder="문의하실 내용을 자세히 작성해주세요"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="min-h-[200px] bg-white border-gray-200 focus:border-purple-400 focus:ring-purple-400 resize-none"
          />
        </div>

        {/* 안내 메시지 */}
        <div className="bg-purple-50 rounded-xl p-4 flex items-start space-x-3">
          <Mail className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-purple-700">
            <p className="font-medium">답변 안내</p>
            <p className="mt-1 text-purple-600">
              문의하신 내용은 영업일 기준 1-2일 내에 입력하신 이메일로 답변 드립니다.
            </p>
          </div>
        </div>

        {/* 전송 버튼 */}
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || !selectedType || !email || !subject || !message}
          className="w-full h-12 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium rounded-xl shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? '전송 중...' : '문의하기'}
        </Button>
      </div>
    </MobileLayout>
  )
}