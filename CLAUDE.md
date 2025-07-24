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
- 최대 5분 녹음 제한
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