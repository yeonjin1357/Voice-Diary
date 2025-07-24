# Voice Diary - 음성 일기 인사이트

매일의 음성 일기를 녹음하고, AI를 통해 감정 분석과 인사이트를 제공하는 PWA 애플리케이션

## 핵심 기능

- 🎙️ **음성 녹음**: PWA의 MediaRecorder API를 활용한 최대 5분 녹음
- 🔄 **음성→텍스트 변환**: OpenAI Whisper API로 정확한 텍스트 변환
- 🤖 **AI 감정 분석**: GPT-4를 통한 7가지 감정 분석 및 키워드 추출
- 📊 **데이터 시각화**: 월간 감정 변화 그래프 및 워드클라우드
- 📱 **PWA 지원**: 오프라인 사용 가능, 푸시 알림, 홈 화면 추가

## 기술 스택

- **Frontend:** Next.js 15.4, TypeScript 5.8.3, Tailwind CSS 4.1
- **UI Components:** shadcn/ui
- **상태 관리:** React Query (TanStack)
- **PWA:** next-pwa
- **데이터베이스:** Supabase
- **AI API:** OpenAI (Whisper, GPT-4)
- **배포:** Vercel

## Getting Started

### Prerequisites

- Node.js 18.17 or later
- pnpm installed globally

### 설치 및 환경 설정

```bash
# 의존성 설치
pnpm install

# 환경 변수 설정
cp .env.example .env.local
# .env.local 파일에 API 키 입력

# 개발 서버 실행
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 사용 가능한 스크립트

- `pnpm dev` - 개발 서버 시작
- `pnpm build` - 프로덕션 빌드
- `pnpm start` - 프로덕션 서버 시작
- `pnpm lint` - ESLint 실행
- `pnpm format` - Prettier로 코드 포맷팅
- `pnpm test` - 테스트 실행 (watch 모드)
- `pnpm test:ci` - CI용 테스트 실행

## Project Structure

```
.
├── app/                     # App Router structure
│   ├── layout.tsx
│   ├── page.tsx
│   └── api/
├── components/              # UI components (shadcn or custom)
│   └── ui/
├── hooks/                   # Custom React hooks
├── lib/                     # Client helpers, API wrappers, etc.
├── styles/                  # Tailwind customizations
├── tests/                   # Unit and integration tests
├── public/
├── .eslintrc.js
├── tailwind.config.ts
├── tsconfig.json
├── postcss.config.js
├── next.config.js
├── package.json
└── README.md
```

## Development

This project uses Claude Code for development assistance. See CLAUDE.md for specific development guidelines.

## License

ISC