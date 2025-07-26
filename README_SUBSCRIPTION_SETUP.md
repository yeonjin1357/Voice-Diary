# 구독 기능 설정 가이드

## 1. Supabase 데이터베이스 설정

### 옵션 A: Supabase 대시보드에서 직접 실행
1. [Supabase Dashboard](https://app.supabase.com)에 로그인
2. 프로젝트 선택
3. SQL Editor로 이동
4. `supabase/migrations/20240126_create_subscription_tables.sql` 파일의 내용을 복사하여 실행

### 옵션 B: Supabase CLI 사용 (권장)
```bash
# Supabase CLI 설치 (아직 설치하지 않은 경우)
npm install -g supabase

# 로그인
supabase login

# 프로젝트 연결
supabase link --project-ref [your-project-ref]

# 마이그레이션 실행
supabase db push
```

### 옵션 C: 초기화 스크립트 실행
```bash
# Service Role Key가 필요합니다 (.env.local에 설정)
node scripts/init-subscription-tables.js
```

## 2. 환경 변수 설정

`.env.local` 파일에 다음 변수들이 설정되어 있는지 확인:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Toss Payments (결제 기능 사용 시)
NEXT_PUBLIC_TOSS_CLIENT_KEY=your-toss-client-key
TOSS_SECRET_KEY=your-toss-secret-key
```

## 3. 테이블 구조

### user_profiles
- 사용자 프로필 정보
- 구독 상태 및 티어
- Stripe 고객 ID (향후 사용)

### subscription_plans
- 구독 플랜 정보 (무료/프리미엄)
- 가격 정보
- 기능 제한 설정

### usage_tracking
- 월별 사용량 추적
- 일기 개수, 녹음 시간

## 4. 문제 해결

### "프로필 로드 실패" 에러가 발생하는 경우:
1. 위의 데이터베이스 설정을 완료했는지 확인
2. 로그아웃 후 다시 로그인
3. 브라우저 개발자 도구에서 네트워크 탭 확인

### 기존 사용자 프로필이 생성되지 않는 경우:
```sql
-- SQL Editor에서 직접 실행
INSERT INTO user_profiles (id, email, subscription_tier, subscription_status)
SELECT id, email, 'free', 'active'
FROM auth.users
WHERE id NOT IN (SELECT id FROM user_profiles);
```