-- update_subscription 함수 생성
CREATE OR REPLACE FUNCTION update_subscription(
  p_user_id UUID,
  p_subscription_tier TEXT,
  p_subscription_end_date TIMESTAMP WITH TIME ZONE,
  p_payment_id TEXT,
  p_amount INTEGER,
  p_billing_cycle TEXT
)
RETURNS VOID AS $$
BEGIN
  -- 사용자 프로필 업데이트
  UPDATE user_profiles
  SET 
    subscription_tier = p_subscription_tier,
    subscription_status = 'active',
    subscription_end_date = p_subscription_end_date,
    updated_at = NOW()
  WHERE id = p_user_id;

  -- 구독 내역 추가 (옵션)
  INSERT INTO user_subscriptions (
    user_id,
    plan_id,
    billing_cycle,
    status,
    current_period_start,
    current_period_end,
    created_at,
    updated_at
  )
  SELECT
    p_user_id,
    sp.id,
    p_billing_cycle,
    'active',
    NOW(),
    p_subscription_end_date,
    NOW(),
    NOW()
  FROM subscription_plans sp
  WHERE sp.tier = p_subscription_tier;

  -- 결제 내역은 이미 API에서 처리하므로 여기서는 생략
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;