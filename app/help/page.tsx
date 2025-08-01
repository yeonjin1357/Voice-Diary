'use client'

import { useState } from 'react'
import { MobileLayout } from '@/components/layout/mobile-layout'
import { Input } from '@/components/ui/input'
import {
  Search,
  ChevronRight,
  ChevronLeft,
  Mic,
  FileText,
  Shield,
  Bell,
  HelpCircle,
  LucideIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

interface FAQItem {
  id: string
  question: string
  answer: string
  category: string
}

interface FAQCategory {
  id: string
  title: string
  icon: LucideIcon
  items: FAQItem[]
}

const faqData: FAQCategory[] = [
  {
    id: 'basic',
    title: '기본 사용법',
    icon: HelpCircle,
    items: [
      {
        id: 'basic-1',
        question: '울림은 어떤 서비스인가요?',
        answer:
          '울림은 음성으로 일기를 기록하고, AI가 감정을 분석해주는 서비스입니다. 음성 녹음으로 쉽게 일기를 작성하고, 감정 변화를 시각적으로 확인할 수 있습니다.',
        category: 'basic',
      },
      {
        id: 'basic-2',
        question: '일기는 어떻게 작성하나요?',
        answer:
          '하단 네비게이션의 녹음 버튼을 누르거나 홈 화면의 "오늘의 일기 녹음하기"를 탭하세요. 마이크 버튼을 누르고 자유롭게 이야기하면 AI가 자동으로 텍스트로 변환해줍니다.',
        category: 'basic',
      },
      {
        id: 'basic-3',
        question: '작성한 일기는 어디서 볼 수 있나요?',
        answer:
          '하단 네비게이션의 "일기" 탭에서 모든 일기를 확인할 수 있습니다. 날짜별, 감정별로 필터링하여 원하는 일기를 쉽게 찾을 수 있습니다.',
        category: 'basic',
      },
    ],
  },
  {
    id: 'voice',
    title: '음성 녹음',
    icon: Mic,
    items: [
      {
        id: 'voice-1',
        question: '녹음 시간 제한이 있나요?',
        answer:
          '한 번에 최대 3분까지 녹음할 수 있습니다. 더 긴 내용은 여러 번 나누어 녹음하거나, 텍스트로 직접 입력할 수 있습니다.',
        category: 'voice',
      },
      {
        id: 'voice-2',
        question: '녹음이 안 되는데 어떻게 하나요?',
        answer:
          '먼저 마이크 권한을 확인해주세요. 설정 > 앱 권한에서 울림 앱의 마이크 권한이 허용되어 있는지 확인하세요. 브라우저를 사용 중이라면 브라우저 설정에서도 마이크 권한을 확인해주세요.',
        category: 'voice',
      },
      {
        id: 'voice-3',
        question: '녹음한 음성 파일은 저장되나요?',
        answer:
          '네, 녹음한 음성 파일은 안전하게 서버에 저장됩니다. 일기 상세 페이지에서 언제든지 다시 들을 수 있으며, 필요시 다운로드도 가능합니다.',
        category: 'voice',
      },
    ],
  },
  {
    id: 'emotion',
    title: '감정 분석',
    icon: FileText,
    items: [
      {
        id: 'emotion-1',
        question: '감정 분석은 어떻게 이루어지나요?',
        answer:
          'OpenAI의 GPT-4 모델을 사용하여 일기 내용을 분석합니다. 텍스트에서 감정 표현, 문맥, 단어 선택 등을 종합적으로 고려하여 7가지 감정(기쁨, 슬픔, 불안, 분노, 평온, 기대, 놀람)으로 분류합니다.',
        category: 'emotion',
      },
      {
        id: 'emotion-2',
        question: '감정 점수는 무엇을 의미하나요?',
        answer:
          '감정 점수는 0-100점으로 표시되며, 해당 감정의 강도를 나타냅니다. 점수가 높을수록 그 감정이 강하게 나타난 것입니다. 한 일기에 여러 감정이 함께 나타날 수 있습니다.',
        category: 'emotion',
      },
      {
        id: 'emotion-3',
        question: '감정 분석이 정확하지 않은 것 같아요',
        answer:
          'AI 분석은 완벽하지 않을 수 있습니다. 일기를 수정하거나 더 구체적으로 감정을 표현하면 더 정확한 분석이 가능합니다. 지속적으로 서비스를 개선하고 있으니 양해 부탁드립니다.',
        category: 'emotion',
      },
    ],
  },
  {
    id: 'privacy',
    title: '개인정보 보호',
    icon: Shield,
    items: [
      {
        id: 'privacy-1',
        question: '내 일기는 안전하게 보호되나요?',
        answer:
          '모든 데이터는 암호화되어 안전하게 저장됩니다. 다른 사용자는 절대 회원님의 일기를 볼 수 없으며, 직원들도 기술적 문제 해결을 위한 경우를 제외하고는 접근할 수 없습니다.',
        category: 'privacy',
      },
      {
        id: 'privacy-2',
        question: '데이터를 백업하거나 내보낼 수 있나요?',
        answer:
          '현재 개발 중인 기능입니다. 곧 일기를 PDF나 텍스트 파일로 내보내기, 클라우드 백업 기능을 제공할 예정입니다.',
        category: 'privacy',
      },
      {
        id: 'privacy-3',
        question: '회원 탈퇴하면 데이터는 어떻게 되나요?',
        answer:
          '회원 탈퇴 시 모든 일기, 음성 파일, 감정 분석 데이터가 즉시 삭제되며 복구할 수 없습니다. 중요한 일기는 탈퇴 전에 별도로 저장해주세요.',
        category: 'privacy',
      },
    ],
  },
  {
    id: 'notification',
    title: '알림 설정',
    icon: Bell,
    items: [
      {
        id: 'notification-1',
        question: '일기 작성 리마인더를 받을 수 있나요?',
        answer:
          '프로필 > 알림 설정에서 원하는 시간에 푸시 알림을 받을 수 있습니다. 매일, 주 3회, 주말만 등 다양한 옵션을 제공합니다.',
        category: 'notification',
      },
      {
        id: 'notification-2',
        question: '주간 리포트는 무엇인가요?',
        answer:
          '매주 일요일, 한 주 동안의 감정 변화와 주요 키워드를 정리한 리포트를 받을 수 있습니다. 자신의 감정 패턴을 이해하는 데 도움이 됩니다.',
        category: 'notification',
      },
    ],
  },
]

export default function HelpPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const filteredData = selectedCategory
    ? faqData.filter((category) => category.id === selectedCategory)
    : searchQuery
      ? faqData
          .map((category) => ({
            ...category,
            items: category.items.filter(
              (item) =>
                item.question
                  .toLowerCase()
                  .includes(searchQuery.toLowerCase()) ||
                item.answer.toLowerCase().includes(searchQuery.toLowerCase()),
            ),
          }))
          .filter((category) => category.items.length > 0)
      : faqData

  const toggleExpanded = (itemId: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId],
    )
  }

  const header = (
    <div>
      <div className="flex items-center bg-white px-4 py-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="mr-3 h-9 w-9"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold text-gray-900">도움말</h1>
      </div>
      <div className="border-gray-100 bg-white px-4 pb-3">
        <div className="relative">
          <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <Input
            type="search"
            placeholder="궁금한 내용을 검색하세요"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-12 pr-4 pl-10 text-base"
          />
        </div>
      </div>
    </div>
  )

  return (
    <MobileLayout header={header} className="bg-gray-50">
      <div className="pb-8">
        {/* 카테고리 필터 */}
        {!searchQuery && !selectedCategory && (
          <div className="mb-6 px-5 pt-4">
            <div className="grid grid-cols-2 gap-3">
              {faqData.map((category) => {
                const Icon = category.icon
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className="flex items-center space-x-3 rounded-xl bg-white p-4 text-left shadow-sm transition-transform active:scale-[0.98]"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                      <Icon className="h-5 w-5 text-gray-700" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {category.title}
                      </p>
                      <p className="text-sm text-gray-500">
                        {category.items.length}개 항목
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* 선택된 카테고리 표시 */}
        {selectedCategory && (
          <div className="my-4 px-5">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedCategory(null)}
              className="h-8 pl-2"
            >
              ← 전체 카테고리
            </Button>
          </div>
        )}

        {/* FAQ 목록 */}
        {filteredData.map((category) => (
          <div key={category.id} className="mb-6">
            {!selectedCategory && (
              <div className="mb-3 px-5">
                <h2 className="text-sm font-medium text-gray-700">
                  {category.title}
                </h2>
              </div>
            )}
            <div className="bg-white">
              {category.items.map((item, index) => {
                const isExpanded = expandedItems.includes(item.id)
                return (
                  <div
                    key={item.id}
                    className={
                      index !== category.items.length - 1
                        ? 'border-b border-gray-100'
                        : ''
                    }
                  >
                    <button
                      onClick={() => toggleExpanded(item.id)}
                      className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors active:bg-gray-50"
                    >
                      <p className="flex-1 pr-3 text-base font-medium text-gray-900">
                        {item.question}
                      </p>
                      <ChevronRight
                        className={`h-5 w-5 text-gray-400 transition-transform ${
                          isExpanded ? 'rotate-90' : ''
                        }`}
                      />
                    </button>
                    {isExpanded && (
                      <div className="border-t border-gray-100 bg-gray-50 px-5 py-4">
                        <p className="text-sm leading-relaxed text-gray-700">
                          {item.answer}
                        </p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}

        {/* 검색 결과 없음 */}
        {searchQuery && filteredData.length === 0 && (
          <div className="px-5 py-12 text-center">
            <div className="mb-4 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
            </div>
            <p className="text-lg font-medium text-gray-900">
              검색 결과가 없습니다
            </p>
            <p className="mt-2 text-sm text-gray-500">
              다른 키워드로 검색해보세요
            </p>
          </div>
        )}

        {/* 추가 도움 섹션 */}
        <div className="mt-8 px-5">
          <div className="rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 p-6 text-white">
            <h3 className="mb-2 text-lg font-semibold">
              원하는 답변을 찾지 못하셨나요?
            </h3>
            <p className="mb-4 text-sm opacity-90">
              1:1 문의하기를 통해 직접 질문해주세요
            </p>
            <Button
              onClick={() => router.push('/contact')}
              className="bg-white text-purple-600 hover:bg-gray-100"
            >
              문의하기 →
            </Button>
          </div>
        </div>
      </div>
    </MobileLayout>
  )
}
