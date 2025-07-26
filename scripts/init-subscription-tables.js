const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Supabase URL 또는 Service Role Key가 설정되지 않았습니다.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function initializeTables() {
  console.log('구독 관련 테이블 초기화 중...')

  try {
    // 1. user_profiles 테이블 생성
    const { error: profileTableError } = await supabase
      .from('user_profiles')
      .select('id')
      .limit(1)

    if (profileTableError && profileTableError.code === '42P01') {
      console.log('user_profiles 테이블이 없습니다. SQL 마이그레이션을 실행하세요.')
      console.log('Supabase 대시보드 > SQL Editor에서 다음 파일의 내용을 실행하세요:')
      console.log('supabase/migrations/20240126_create_subscription_tables.sql')
      return
    }

    // 2. 기존 사용자들의 프로필 생성
    const { data: users } = await supabase.auth.admin.listUsers()
    
    if (users && users.users.length > 0) {
      for (const user of users.users) {
        const { data: existingProfile } = await supabase
          .from('user_profiles')
          .select('id')
          .eq('id', user.id)
          .single()

        if (!existingProfile) {
          const { error } = await supabase
            .from('user_profiles')
            .insert({
              id: user.id,
              email: user.email,
              name: user.user_metadata?.full_name || null,
              avatar_url: user.user_metadata?.avatar_url || null,
              subscription_tier: 'free',
              subscription_status: 'active',
            })

          if (error) {
            console.error(`사용자 ${user.email} 프로필 생성 실패:`, error)
          } else {
            console.log(`사용자 ${user.email} 프로필 생성 완료`)
          }
        }
      }
    }

    console.log('초기화 완료!')
  } catch (error) {
    console.error('초기화 중 오류 발생:', error)
  }
}

initializeTables()