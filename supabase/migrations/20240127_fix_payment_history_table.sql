-- 누락된 컬럼 추가 (이미 존재하면 무시됨)
DO $$ 
BEGIN
  -- tosspayments_payment_key 컬럼 추가
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'payment_history' 
                 AND column_name = 'tosspayments_payment_key') THEN
    ALTER TABLE payment_history ADD COLUMN tosspayments_payment_key TEXT;
  END IF;
  
  -- metadata 컬럼 추가
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'payment_history' 
                 AND column_name = 'metadata') THEN
    ALTER TABLE payment_history ADD COLUMN metadata JSONB;
  END IF;
END $$;

-- RLS가 활성화되어 있는지 확인하고 활성화
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;

-- 기존 정책 삭제 (존재하는 경우)
DROP POLICY IF EXISTS "Users can view own payment history" ON payment_history;
DROP POLICY IF EXISTS "Users can insert own payment history" ON payment_history;
DROP POLICY IF EXISTS "Users can update own payment history" ON payment_history;

-- 새로운 RLS 정책 생성
CREATE POLICY "Users can view own payment history" ON payment_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own payment history" ON payment_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own payment history" ON payment_history
  FOR UPDATE USING (auth.uid() = user_id);

-- 권한 부여
GRANT ALL ON payment_history TO authenticated;
GRANT ALL ON payment_history TO service_role;