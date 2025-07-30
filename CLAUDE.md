# 🛠️ Development Environment

## Tech Stack

- **Language:** TypeScript 5.8.3
- **Framework:** Next.js 15.4 (App Router)
- **Styling:** Tailwind CSS v4.1
- **Component Library:** shadcn/ui
- **Data Fetching:** React Query (TanStack)
- **Database:** Supabase (PostgreSQL)
- **AI APIs:** OpenAI (Whisper, GPT-4)
- **Charts:** Recharts
- **Icons:** Lucide React
- **Testing:** Jest + React Testing Library
- **Linting:** ESLint with @typescript-eslint
- **Formatting:** Prettier
- **Package Manager:** pnpm (preferred)
- **Deploy:** Vercel
- **Mobile:** PWA (Progressive Web App)

---

## 📂 Recommended Project Structure

```
.
├── app/                     # App Router structure
│   ├── layout.tsx
│   ├── page.tsx          # 홈/대시보드
│   ├── record/           # 음성 녹음 페이지
│   ├── diary/            # 일기 목록/상세
│   ├── insights/         # 감정 분석 인사이트
│   ├── api/
│   │   ├── whisper/      # 음성→텍스트 변환
│   │   ├── analyze/      # GPT-4 감정 분석
│   │   └── diary/        # 일기 CRUD
├── components/              # UI components
│   ├── ui/               # shadcn/ui
│   ├── recorder/         # 음성 녹음 컴포넌트
│   ├── charts/           # 감정 그래프
│   └── diary/            # 일기 관련
├── hooks/                   # Custom React hooks
│   ├── useRecorder.ts    # 음성 녹음
│   ├── useAudioAnalysis.ts
│   └── useDiary.ts
├── lib/                     # Client helpers, API wrappers
│   ├── openai/           # OpenAI API 클라이언트
│   ├── supabase/         # Supabase 클라이언트
│   └── utils/
├── types/                   # TypeScript types
├── styles/                  # Tailwind customizations
├── tests/                   # Unit and integration tests
├── public/
│   ├── manifest.json
│   └── icons/
├── .env.local              # API keys
├── .eslintrc.js
├── tailwind.config.ts
├── tsconfig.json
├── postcss.config.js
├── next.config.js
├── package.json
└── README.md
```

---

## 📦 Installation Notes

- Tailwind setup with postcss
- shadcn/ui installed with `npx shadcn-ui@latest init`
- React Query initialized with `<QueryClientProvider>`

---

## 📱 PWA Configuration

### Why PWA for Voice Diary?

- **Offline Access:** 오프라인에서도 일기 작성 및 조회 가능
- **Push Notifications:** 일기 작성 리마인더, 주간 인사이트 알림
- **App-like Experience:** 홈 화면 추가, 전체화면 모드
- **Background Sync:** 인터넷 연결 시 자동 동기화
- **Media Recording:** PWA의 MediaRecorder API로 음성 녹음

### Setup Instructions

```bash
# Install PWA dependencies
pnpm add -D next-pwa
pnpm add workbox-window
```

### Key Features to Implement

- **Service Worker:** 오프라인 캐싱 전략 (일기 데이터, 감정 분석 결과)
- **Web App Manifest:** 앱 아이콘, 다크 테마, standalone 모드
- **Push Notifications:** 일기 작성 리마인더, 주간/월간 리포트
- **Offline Storage:** IndexedDB로 음성 파일 및 일기 로컬 저장
- **Install Prompt:** 커스텀 "홈 화면에 추가" UI
- **Background Sync:** 오프라인 작성 일기 자동 업로드

### Configuration Files

- `public/manifest.json` - Web app manifest
- `next.config.js` - PWA plugin configuration
- `public/sw.js` - Service worker (auto-generated)

---

## ⚙️ Dev Commands

- **Dev server:** `pnpm dev`
- **Build:** `pnpm build`
- **Start:** `pnpm start`
- **Lint:** `pnpm lint`
- **Format:** `pnpm format`
- **Test:** `pnpm test`

---

## 🧠 Claude Code Usage

- Use `claude /init` to create this file
- Run claude in the root of the repo
- Prompt with: `think hard`, `ultrathink` for deep plans
- Compact with `claude /compact`
- Use `claude /permissions` to whitelist safe tools

---

## 📌 Prompt Examples

```
Claude, implement the voice recorder component with MediaRecorder API
Claude, create the API route for Whisper transcription at /api/whisper
Claude, build the emotion analysis function using GPT-4 API
Claude, implement the monthly emotion chart using Recharts
Claude, create a word cloud component for keyword visualization
Claude, set up Supabase schema for diary entries and emotions
Claude, implement offline storage with IndexedDB for voice recordings
Claude, create the calendar view component showing diary entries
Claude, build the emotion trends analysis page
Claude, implement push notifications for daily diary reminders
```

---

## 🧪 Testing Practices

- **Testing Library:** @testing-library/react
- **Mocking:** msw, vi.mock()
- **Test command:** `pnpm test`
- **Organization:** Tests in `/tests` or co-located with components

---

## 🧱 Component Guidelines

- Use shadcn/ui components by default for form elements, cards, dialogs, etc.
- Style components with Tailwind utility classes
- Co-locate CSS modules or component-specific styling in the same directory

---

## ⚛️ React Query Patterns

- Set up QueryClient in `lib/providers.tsx`
- Use `useQuery`, `useMutation`, `useInfiniteQuery` from @tanstack/react-query
- Place API logic in `/lib/api/` and call via hooks
- Query key patterns:
  - `['diary', id]` - 개별 일기
  - `['diaries', { month, year }]` - 월별 일기 목록
  - `['emotions', { month, year }]` - 월별 감정 데이터
  - `['keywords', { period }]` - 키워드 통계

---

## 📝 Code Style Standards

- Prefer arrow functions
- Annotate return types
- Always destructure props
- Avoid `any` type, use `unknown` or strict generics
- Group imports: react → next → libraries → local

---

## 🔍 Documentation & Onboarding

- Each component and hook should include a short comment on usage
- Document top-level files (like `app/layout.tsx`) and configs
- Keep README.md up to date with getting started, design tokens, and component usage notes

---

## 🔐 Security

- Validate all server-side inputs (API routes)
- Use HTTPS-only cookies and CSRF tokens when applicable
- Protect sensitive routes with middleware or session logic
- Store API keys securely in environment variables
- Implement rate limiting for AI API calls
- Encrypt sensitive diary content in database
- Use Supabase RLS (Row Level Security) for user data isolation

---

## 🎯 Voice Diary Specific Guidelines

### 음성 녹음 구현

- MediaRecorder API 사용 (브라우저 호환성 체크)
- 최대 3분 녹음 제한
- 녹음 중 실시간 오디오 레벨 표시
- 녹음 파일 포맷: webm/opus (크기 최적화)

### AI API 사용

- Whisper API: 음성→텍스트 변환
- GPT-4 API: 감정 분석, 키워드 추출, 요약
- API 응답 캐싱으로 비용 절감
- 에러 핸들링 및 재시도 로직

### 데이터 구조

```typescript
interface DiaryEntry {
  id: string
  userId: string
  date: Date
  audioUrl?: string
  transcript: string
  emotions: Emotion[]
  keywords: string[]
  summary: string
  createdAt: Date
  updatedAt: Date
}

interface Emotion {
  type: '기쁨' | '슬픔' | '불안' | '분노' | '평온' | '기대' | '놀람'
  score: number // 0-100
}
```

### 성능 최적화

- 음성 파일 압축 및 최적화
- 이미지/아이콘 lazy loading
- React Query로 데이터 캐싱
- 무한 스크롤로 일기 목록 로드

---

## 🎨 Design System & Guidelines

### 📱 Mobile-First Design

이 앱은 **모바일이 주 타겟**입니다. 모든 디자인 결정은 모바일 우선으로 합니다.

- 최소 터치 영역: 44x44px
- 엄지손가락으로 쉽게 닿는 하단 영역에 주요 액션 배치
- 세로 모드 최적화 (가로 모드는 기본 대응만)
- 모바일 제스처 고려 (스와이프, 길게 누르기 등)

### 🎨 Design Principles

1. **일관성**: 모든 페이지에서 동일한 디자인 언어 사용
2. **심플함**: 과도한 장식이나 화려한 효과 배제
3. **집중**: 핵심 기능(음성 녹음, 감정 확인)에 포커스
4. **접근성**: 큰 글씨, 명확한 대비, 간단한 인터랙션

### 🌈 Color Palette

```css
:root {
  /* Primary - 차분한 보라색 계열 */
  --primary: #6366f1; /* indigo-500 */
  --primary-dark: #4f46e5; /* indigo-600 */
  --primary-light: #818cf8; /* indigo-400 */

  /* Neutral - 회색 계열 */
  --background: #fafafa; /* neutral-50 */
  --surface: #ffffff; /* white */
  --text-primary: #18181b; /* neutral-900 */
  --text-secondary: #71717a; /* neutral-500 */
  --border: #e4e4e7; /* neutral-200 */

  /* Emotions - 부드러운 파스텔톤 */
  --emotion-joy: #fbbf24; /* amber-400 */
  --emotion-sadness: #60a5fa; /* blue-400 */
  --emotion-anxiety: #f87171; /* red-400 */
  --emotion-anger: #fb923c; /* orange-400 */
  --emotion-peace: #86efac; /* green-300 */
  --emotion-hope: #c084fc; /* purple-400 */
  --emotion-surprise: #fde047; /* yellow-300 */
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  :root {
    --background: #0a0a0a;
    --surface: #18181b;
    --text-primary: #fafafa;
    --text-secondary: #a1a1aa;
    --border: #27272a;
  }
}
```

### 📐 Typography

```css
/* Mobile Typography Scale */
--text-xs: 0.75rem; /* 12px - 보조 텍스트 */
--text-sm: 0.875rem; /* 14px - 본문 */
--text-base: 1rem; /* 16px - 기본 본문 */
--text-lg: 1.125rem; /* 18px - 부제목 */
--text-xl: 1.25rem; /* 20px - 제목 */
--text-2xl: 1.5rem; /* 24px - 페이지 제목 */

/* Font Weight */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

### 📏 Spacing System

```css
/* 8px 기반 간격 시스템 */
--space-1: 0.25rem; /* 4px */
--space-2: 0.5rem; /* 8px */
--space-3: 0.75rem; /* 12px */
--space-4: 1rem; /* 16px */
--space-5: 1.25rem; /* 20px */
--space-6: 1.5rem; /* 24px */
--space-8: 2rem; /* 32px */
--space-10: 2.5rem; /* 40px */
--space-12: 3rem; /* 48px */
--space-16: 4rem; /* 64px */
```

### 🧩 Component Guidelines

#### Bottom Navigation

```tsx
// 모바일 하단 네비게이션 (항상 표시)
<nav className="bg-surface border-border fixed bottom-0 left-0 right-0 border-t">
  <div className="flex justify-around py-2">
    <NavItem icon={Home} label="홈" href="/" />
    <NavItem icon={Mic} label="녹음" href="/record" />
    <NavItem icon={BookOpen} label="일기" href="/diary" />
    <NavItem icon={BarChart} label="인사이트" href="/insights" />
  </div>
</nav>
```

#### Floating Action Button (FAB)

```tsx
// 음성 녹음 시작을 위한 FAB
<button className="bg-primary fixed bottom-20 right-4 h-14 w-14 rounded-full text-white shadow-lg">
  <Mic className="h-6 w-6" />
</button>
```

#### Cards

```tsx
// 일관된 카드 스타일
<div className="bg-surface border-border rounded-lg border p-4 shadow-sm">
  {/* content */}
</div>
```

### 📱 Mobile Layout Structure

```
┌─────────────────────────┐
│      Status Bar         │ <- System UI
├─────────────────────────┤
│      App Header         │ <- 최소화, 필요시만 표시
├─────────────────────────┤
│                         │
│                         │
│      Main Content       │ <- 스크롤 가능 영역
│                         │
│                         │
├─────────────────────────┤
│   Bottom Navigation     │ <- 항상 고정
└─────────────────────────┘
```

### 🎯 UI/UX Best Practices

1. **대화형 요소 크기**: 최소 44x44px
2. **여백**: 충분한 여백으로 답답하지 않게
3. **애니메이션**: 부드럽지만 빠르게 (200-300ms)
4. **피드백**: 모든 인터랙션에 즉각적인 피드백
5. **로딩 상태**: 스켈레톤 UI 또는 스피너
6. **에러 처리**: 친근하고 도움이 되는 에러 메시지

### 🚫 Design Don'ts

- ❌ 그라디언트 남용
- ❌ 과도한 그림자 효과
- ❌ 너무 많은 색상 사용 (주요 색상 2-3개로 제한)
- ❌ 작은 글씨 (최소 13px)
- ❌ 복잡한 레이아웃
- ❌ 불필요한 애니메이션
