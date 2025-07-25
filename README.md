# 울림(ULLIM) - 마음을 담는 음성 일기

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

### 소셜 로그인 설정

본 프로젝트는 Google과 Kakao 소셜 로그인을 지원합니다.

#### 1. Google OAuth 설정

1. [Google Cloud Console](https://console.cloud.google.com/)에서 새 프로젝트 생성
2. APIs & Services > Credentials에서 OAuth 2.0 Client ID 생성
3. Authorized redirect URIs에 다음 추가:
   - `https://YOUR_SUPABASE_PROJECT_ID.supabase.co/auth/v1/callback`
   - 로컬 개발시: `http://localhost:3000/auth/callback`
4. Client ID와 Client Secret 복사

#### 2. Kakao OAuth 설정

1. [Kakao Developers](https://developers.kakao.com/)에서 애플리케이션 생성
2. 앱 설정 > 플랫폼에서 Web 플랫폼 등록
3. 사이트 도메인에 다음 추가:
   - `https://YOUR_SUPABASE_PROJECT_ID.supabase.co`
   - 로컬 개발시: `http://localhost:3000`
4. 카카오 로그인 > Redirect URI에 다음 추가:
   - `https://YOUR_SUPABASE_PROJECT_ID.supabase.co/auth/v1/callback`
5. REST API 키 복사

#### 3. Supabase 대시보드 설정

1. [Supabase Dashboard](https://app.supabase.com/)에서 프로젝트 선택
2. Authentication > Providers 메뉴로 이동
3. Google Provider 활성화:
   - Google Client ID와 Client Secret 입력
   - Authorized Client IDs에 Google Client ID 추가
4. Kakao Provider 활성화:
   - 커스텀 provider로 추가 (이름: `kakao`)
   - Client ID: Kakao REST API 키
   - Authorization URL: `https://kauth.kakao.com/oauth/authorize`
   - Token URL: `https://kauth.kakao.com/oauth/token`
   - User Info URL: `https://kapi.kakao.com/v2/user/me`
   - Scope: `profile_nickname profile_image account_email`

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

## OAuth 설정 가이드

### Google OAuth 설정

1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택
3. **APIs & Services** → **Credentials** 메뉴로 이동
4. **Create Credentials** → **OAuth client ID** 클릭
5. 애플리케이션 유형: **Web application** 선택
6. 설정:
   - **Authorized JavaScript origins**: `https://ntpdwicwvjfzgjpabknc.supabase.co`
   - **Authorized redirect URIs**: `https://ntpdwicwvjfzgjpabknc.supabase.co/auth/v1/callback`
7. 생성된 **Client ID**와 **Client Secret** 복사

### Kakao OAuth 설정

1. [Kakao Developers](https://developers.kakao.com/) 접속
2. 애플리케이션 생성 또는 선택
3. **앱 설정** → **플랫폼** → **Web 플랫폼 등록**
   - 사이트 도메인: `https://ntpdwicwvjfzgjpabknc.supabase.co`
4. **제품 설정** → **카카오 로그인** 활성화
5. **Redirect URI 등록**: `https://ntpdwicwvjfzgjpabknc.supabase.co/auth/v1/callback`
6. **보안** → **Client Secret** 생성 및 복사
7. **REST API 키**와 **Client Secret** 복사

### Supabase 설정

1. Supabase 대시보드에서 **Authentication** → **Providers** 메뉴로 이동
2. **Google** 프로바이더 활성화:
   - Client ID와 Client Secret 입력
3. **Kakao** 프로바이더 활성화:
   - Client ID (REST API 키)와 Client Secret 입력

### 이메일 인증 설정

1. Supabase 대시보드에서 **Authentication** → **Email Templates** 메뉴로 이동
2. **Confirm signup** 템플릿 수정:
   - Subject: `울림 - 이메일 인증`
   - Body: 한글 메시지로 수정
3. **Authentication** → **Settings** → **Email Auth**에서:
   - **Enable email confirmations**: ON
   - **Enable email change confirmations**: ON

⚠️ **중요**: Supabase는 기본적으로 이메일 발송을 지원하지만, 대량 발송이나 커스텀 도메인을 원한다면 외부 SMTP 서버 설정이 필요합니다.

#### 외부 SMTP 설정 (선택사항)

Gmail SMTP를 사용하는 경우:
1. Gmail 계정에서 2단계 인증 활성화
2. [앱 비밀번호 생성](https://myaccount.google.com/apppasswords)
3. Supabase **Settings** → **SMTP Settings**:
   - Host: `smtp.gmail.com`
   - Port: `587`
   - Username: `your-email@gmail.com`  
   - Password: `생성한 앱 비밀번호`
   - Sender email: `your-email@gmail.com`
   - Sender name: `울림`

## License

ISC