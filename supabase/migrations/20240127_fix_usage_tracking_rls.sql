-- usage_tracking 테이블이 없는 경우 생성
CREATE TABLE IF NOT EXISTS usage_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month DATE NOT NULL,
  diary_count INTEGER NOT NULL DEFAULT 0,
  total_recording_minutes INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, month)
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_month ON usage_tracking(user_id, month);

-- RLS 활성화
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;

-- 기존 정책 삭제 (있는 경우)
DROP POLICY IF EXISTS "Users can view own usage" ON usage_tracking;
DROP POLICY IF EXISTS "Users can insert own usage" ON usage_tracking;
DROP POLICY IF EXISTS "Users can update own usage" ON usage_tracking;

-- RLS 정책 생성
-- 사용자는 자신의 사용량만 조회 가능
CREATE POLICY "Users can view own usage" ON usage_tracking
  FOR SELECT USING (auth.uid() = user_id);

-- 사용자는 자신의 사용량 기록 추가 가능
CREATE POLICY "Users can insert own usage" ON usage_tracking
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 사용자는 자신의 사용량 업데이트 가능
CREATE POLICY "Users can update own usage" ON usage_tracking
  FOR UPDATE USING (auth.uid() = user_id);

-- 권한 부여
GRANT ALL ON usage_tracking TO authenticated;
GRANT ALL ON usage_tracking TO service_role;

-- updated_at 자동 업데이트 트리거 (이미 있을 수 있으므로 조건부로)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_usage_tracking_updated_at'
  ) THEN
    CREATE TRIGGER update_usage_tracking_updated_at 
    BEFORE UPDATE ON usage_tracking
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;