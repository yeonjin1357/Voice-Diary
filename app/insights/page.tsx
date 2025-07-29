'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line } from 'recharts'
import { TrendingUp, Hash, Heart } from 'lucide-react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { toast } from 'sonner'
import { MobileLayout } from '@/components/layout/mobile-layout'

interface EmotionData {
  type: string
  score: number
  color: string
}

interface DailyEmotionData {
  date: string
  emotions: {
    [key: string]: number
  }
}

interface KeywordData {
  word: string
  count: number
}

const EMOTION_COLORS = {
  '기쁨': '#f59e0b',
  '슬픔': '#3b82f6',
  '불안': '#ef4444',
  '분노': '#f97316',
  '평온': '#10b981',
  '기대': '#8b5cf6',
  '놀람': '#eab308',
}

export default function InsightsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month')
  const [emotionData, setEmotionData] = useState<EmotionData[]>([])
  const [dailyEmotionData, setDailyEmotionData] = useState<DailyEmotionData[]>([])
  const [keywordData, setKeywordData] = useState<KeywordData[]>([])
  const [totalEntries, setTotalEntries] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    fetchInsightsData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPeriod])

  const fetchInsightsData = async () => {
    setIsLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // 날짜 범위 계산
      const endDate = new Date()
      const startDate = new Date()
      
      switch (selectedPeriod) {
        case 'week':
          startDate.setDate(startDate.getDate() - 7)
          break
        case 'month':
          startDate.setMonth(startDate.getMonth() - 1)
          break
        case 'year':
          startDate.setFullYear(startDate.getFullYear() - 1)
          break
      }

      // 감정 데이터 가져오기
      const emotionsResponse = await fetch(`/api/emotions?period=${selectedPeriod}&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`)
      if (emotionsResponse.ok) {
        const data = await emotionsResponse.json()
        setEmotionData(data.summary)
        setDailyEmotionData(data.daily)
        setTotalEntries(data.totalEntries)
      }

      // 키워드 데이터 가져오기
      const keywordsResponse = await fetch(`/api/keywords?period=${selectedPeriod}&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`)
      if (keywordsResponse.ok) {
        const data = await keywordsResponse.json()
        setKeywordData(data.keywords)
      }
    } catch {
      toast.error('인사이트 데이터를 불러오는데 실패했습니다.')
      // Error fetching insights: error
    } finally {
      setIsLoading(false)
    }
  }

  const formatEmotionDataForPieChart = () => {
    return emotionData.map(emotion => ({
      name: emotion.type,
      value: emotion.score,
      fill: emotion.color
    }))
  }

  const formatDailyEmotionDataForLineChart = () => {
    return dailyEmotionData.map(day => ({
      date: format(new Date(day.date), 'MM/dd', { locale: ko }),
      ...day.emotions
    }))
  }

  if (isLoading) {
    return (
      <MobileLayout>
        <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
            <p className="text-sm text-neutral-500">인사이트를 분석하고 있습니다...</p>
          </div>
        </div>
      </MobileLayout>
    )
  }

  return (
    <MobileLayout>
      <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-6 pb-20 max-w-4xl">
          <div className="mb-6">
            <h1 className="text-xl font-medium text-gray-900">감정 인사이트</h1>
            <p className="text-sm text-gray-500 mt-1">당신의 감정 패턴을 분석해보세요</p>
          </div>

          {/* 기간 선택 */}
          <div className="mb-5">
            <Select value={selectedPeriod} onValueChange={(value: 'week' | 'month' | 'year') => setSelectedPeriod(value)}>
              <SelectTrigger className="w-[180px] bg-white border-gray-200 hover:border-gray-300">
                <SelectValue placeholder="기간 선택" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="week">최근 1주일</SelectItem>
                <SelectItem value="month">최근 1개월</SelectItem>
                <SelectItem value="year">최근 1년</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 통계 카드 */}
          <div className="grid gap-3 mb-5 grid-cols-2 md:grid-cols-4">
            <div className="bg-white rounded-2xl p-4 border border-gray-100">
              <p className="text-xs text-gray-500 mb-1">작성한 일기</p>
              <p className="text-2xl font-semibold text-gray-900">{totalEntries}<span className="text-base font-normal text-gray-500 ml-1">개</span></p>
            </div>
            
            <div className="bg-white rounded-2xl p-4 border border-gray-100">
              <p className="text-xs text-gray-500 mb-1">주요 감정</p>
              <p className="text-2xl font-semibold text-gray-900">
                {emotionData[0]?.type || '-'}
              </p>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-gray-100">
              <p className="text-xs text-gray-500 mb-1">감정 점수 평균</p>
              <p className="text-2xl font-semibold text-gray-900">
                {emotionData.length > 0 
                  ? Math.round(emotionData.reduce((acc, e) => acc + e.score, 0) / emotionData.length)
                  : 0}<span className="text-base font-normal text-gray-500 ml-1">점</span>
              </p>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-gray-100">
              <p className="text-xs text-gray-500 mb-1">자주 쓴 단어</p>
              <p className="text-2xl font-semibold text-gray-900">
                {keywordData[0]?.word || '-'}
              </p>
            </div>
          </div>

          {/* 감정 분포 차트 */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 mb-5 outline-none focus:outline-none">
            <div className="mb-4">
              <h3 className="flex items-center gap-2 text-base font-medium text-gray-900">
                <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center">
                  <Heart className="h-4 w-4 text-red-600" />
                </div>
                감정 분포
              </h3>
              <p className="text-sm text-gray-500 mt-1">기간 동안의 감정 비율</p>
            </div>
            {emotionData.length > 0 ? (
              <div className="h-[300px] select-none [&_svg]:outline-none [&_*]:outline-none">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={formatEmotionDataForPieChart()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {formatEmotionDataForPieChart().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                데이터가 없습니다
              </div>
            )}
          </div>

          {/* 감정 추세 차트 */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 mb-5 outline-none focus:outline-none">
            <div className="mb-4">
              <h3 className="flex items-center gap-2 text-base font-medium text-gray-900">
                <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </div>
                감정 변화 추세
              </h3>
              <p className="text-sm text-gray-500 mt-1">날짜별 감정 변화</p>
            </div>
            {dailyEmotionData.length > 0 ? (
              <div className="h-[300px] select-none [&_svg]:outline-none [&_*]:outline-none">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={formatDailyEmotionDataForLineChart()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} tickLine={false} />
                    <YAxis tick={{ fontSize: 12 }} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb' }} />
                    <Legend iconType="circle" />
                    {Object.keys(EMOTION_COLORS).map(emotion => (
                      <Line
                        key={emotion}
                        type="monotone"
                        dataKey={emotion}
                        stroke={EMOTION_COLORS[emotion as keyof typeof EMOTION_COLORS]}
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        activeDot={{ r: 5 }}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                데이터가 없습니다
              </div>
            )}
          </div>

          {/* 키워드 차트 */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 outline-none focus:outline-none">
            <div className="mb-4">
              <h3 className="flex items-center gap-2 text-base font-medium text-gray-900">
                <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
                  <Hash className="h-4 w-4 text-purple-600" />
                </div>
                자주 언급한 키워드
              </h3>
              <p className="text-sm text-gray-500 mt-1">일기에서 자주 나타난 단어들</p>
            </div>
            {keywordData.length > 0 ? (
              <div className="h-[300px] select-none [&_svg]:outline-none [&_*]:outline-none">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={keywordData.slice(0, 10)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis dataKey="word" tick={{ fontSize: 12 }} tickLine={false} />
                    <YAxis tick={{ fontSize: 12 }} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb' }} />
                    <Bar dataKey="count" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                데이터가 없습니다
              </div>
            )}
          </div>
        </div>
      </div>
    </MobileLayout>
  )
}