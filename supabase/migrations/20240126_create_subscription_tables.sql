-- User profiles 테이블 생성
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  avatar_url TEXT,
  subscription_tier TEXT NOT NULL DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium')),
  subscription_status TEXT NOT NULL DEFAULT 'active' CHECK (subscription_status IN ('active', 'canceled', 'past_due')),
  subscription_end_date TIMESTAMP WITH TIME ZONE,
  stripe_customer_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscription plans 테이블 생성
CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  tier TEXT NOT NULL UNIQUE CHECK (tier IN ('free', 'premium')),
  price_monthly INTEGER NOT NULL,
  price_yearly INTEGER NOT NULL,
  max_recording_minutes INTEGER,
  max_diaries_per_month INTEGER,
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  stripe_price_id_monthly TEXT,
  stripe_price_id_yearly TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Usage tracking 테이블 생성
CREATE TABLE IF NOT EXISTS usage_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month DATE NOT NULL,
  diary_count INTEGER NOT NULL DEFAULT 0,
  total_recording_minutes REAL NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, month)
);

-- 기본 구독 플랜 데이터 삽입 (이미 존재하면 무시)
INSERT INTO subscription_plans (name, tier, price_monthly, price_yearly, max_recording_minutes, max_diaries_per_month, features)
VALUES 
  ('무료', 'free', 0, 0, 3, 10, '["음성 일기 작성", "감정 분석", "키워드 추출", "기본 인사이트"]'::jsonb),
  ('프리미엄', 'premium', 9900, 99000, 10, NULL, '["음성 일기 작성", "감정 분석", "키워드 추출", "기본 인사이트", "일기 내보내기", "고급 인사이트", "백업 및 복원", "광고 제거", "우선 지원", "커스텀 테마"]'::jsonb)
ON CONFLICT (tier) DO UPDATE SET
  price_monthly = EXCLUDED.price_monthly,
  price_yearly = EXCLUDED.price_yearly,
  max_recording_minutes = EXCLUDED.max_recording_minutes,
  max_diaries_per_month = EXCLUDED.max_diaries_per_month,
  features = EXCLUDED.features,
  updated_at = NOW();

-- 새로운 사용자가 가입할 때 자동으로 프로필 생성하는 트리거
CREATE OR REPLACE FUNCTION handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id, email, subscription_tier, subscription_status)
  VALUES (NEW.id, NEW.email, 'free', 'active');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 트리거 생성
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 기존 사용자들을 위한 프로필 생성 (이미 가입한 사용자가 있다면)
INSERT INTO user_profiles (id, email, subscription_tier, subscription_status)
SELECT id, email, 'free', 'active'
FROM auth.users
WHERE id NOT IN (SELECT id FROM user_profiles);

-- RLS (Row Level Security) 정책 설정
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 프로필만 볼 수 있음
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

-- 사용자는 자신의 프로필만 업데이트할 수 있음
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- 사용자는 자신의 사용량만 볼 수 있음
CREATE POLICY "Users can view own usage" ON usage_tracking
  FOR SELECT USING (auth.uid() = user_id);

-- 사용자는 자신의 사용량만 생성/업데이트할 수 있음
CREATE POLICY "Users can insert own usage" ON usage_tracking
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own usage" ON usage_tracking
  FOR UPDATE USING (auth.uid() = user_id);

-- 모든 사용자가 구독 플랜을 볼 수 있음
CREATE POLICY "Anyone can view subscription plans" ON subscription_plans
  FOR SELECT TO PUBLIC USING (true);