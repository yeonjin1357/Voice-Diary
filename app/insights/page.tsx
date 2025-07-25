'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
  '기쁨': '#fbbf24',
  '슬픔': '#60a5fa',
  '불안': '#f87171',
  '분노': '#fb923c',
  '평온': '#86efac',
  '기대': '#c084fc',
  '놀람': '#fde047',
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
    } catch (error) {
      toast.error('인사이트 데이터를 불러오는데 실패했습니다.')
      console.error('Error fetching insights:', error)
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
      <div className="container mx-auto px-4 py-6 pb-20 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">감정 인사이트</h1>
        <p className="text-neutral-500">당신의 감정 패턴을 분석해보세요</p>
      </div>

      {/* 기간 선택 */}
      <div className="mb-6">
        <Select value={selectedPeriod} onValueChange={(value: 'week' | 'month' | 'year') => setSelectedPeriod(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="기간 선택" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">최근 1주일</SelectItem>
            <SelectItem value="month">최근 1개월</SelectItem>
            <SelectItem value="year">최근 1년</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 통계 카드 */}
      <div className="grid gap-4 mb-6 grid-cols-2 md:grid-cols-4">
        <Card>
          <CardHeader className="p-4">
            <CardDescription className="text-xs">작성한 일기</CardDescription>
            <CardTitle className="text-xl">{totalEntries}개</CardTitle>
          </CardHeader>
        </Card>
        
        <Card>
          <CardHeader className="p-4">
            <CardDescription className="text-xs">주요 감정</CardDescription>
            <CardTitle className="text-xl">
              {emotionData[0]?.type || '-'}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="p-4">
            <CardDescription className="text-xs">감정 점수 평균</CardDescription>
            <CardTitle className="text-xl">
              {emotionData.length > 0 
                ? Math.round(emotionData.reduce((acc, e) => acc + e.score, 0) / emotionData.length)
                : 0}점
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="p-4">
            <CardDescription className="text-xs">자주 쓴 단어</CardDescription>
            <CardTitle className="text-xl">
              {keywordData[0]?.word || '-'}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* 감정 분포 차트 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            감정 분포
          </CardTitle>
          <CardDescription>기간 동안의 감정 비율</CardDescription>
        </CardHeader>
        <CardContent>
          {emotionData.length > 0 ? (
            <div className="h-[300px]">
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
            <div className="h-[300px] flex items-center justify-center text-neutral-500">
              데이터가 없습니다
            </div>
          )}
        </CardContent>
      </Card>

      {/* 감정 추세 차트 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            감정 변화 추세
          </CardTitle>
          <CardDescription>날짜별 감정 변화</CardDescription>
        </CardHeader>
        <CardContent>
          {dailyEmotionData.length > 0 ? (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={formatDailyEmotionDataForLineChart()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {Object.keys(EMOTION_COLORS).map(emotion => (
                    <Line
                      key={emotion}
                      type="monotone"
                      dataKey={emotion}
                      stroke={EMOTION_COLORS[emotion as keyof typeof EMOTION_COLORS]}
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-neutral-500">
              데이터가 없습니다
            </div>
          )}
        </CardContent>
      </Card>

      {/* 키워드 차트 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Hash className="h-5 w-5" />
            자주 언급한 키워드
          </CardTitle>
          <CardDescription>일기에서 자주 나타난 단어들</CardDescription>
        </CardHeader>
        <CardContent>
          {keywordData.length > 0 ? (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={keywordData.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="word" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-neutral-500">
              데이터가 없습니다
            </div>
          )}
        </CardContent>
      </Card>
    </div>
    </MobileLayout>
  )
}