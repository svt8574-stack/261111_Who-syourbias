// ==============================================================================
// 파일명: lib/supabase.js
// 설명: 서버 전용 Supabase 클라이언트 초기화 모듈
// ==============================================================================

const { createClient } = require('@supabase/supabase-js');

let supabaseInstance = null;

/**
 * 서버 전용 Supabase 클라이언트를 반환합니다.
 * 보안 주의: service_role 비밀키는 절대로 브라우저에 노출되어서는 안 됩니다.
 */
function getSupabaseClient() {
  if (!supabaseInstance) {
    const supabaseUrl = process.env.SUPABASE_URL;
    // SUPABASE_SECRET_KEY 또는 SUPABASE_SERVICE_ROLE_KEY 둘 다 호환 지원
    const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseSecretKey) {
      throw new Error('SUPABASE_URL 또는 SUPABASE_SECRET_KEY (또는 SUPABASE_SERVICE_ROLE_KEY) 환경변수가 설정되지 않았습니다.');
    }

    supabaseInstance = createClient(supabaseUrl, supabaseSecretKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });
  }

  return supabaseInstance;
}

module.exports = {
  getSupabaseClient
};
