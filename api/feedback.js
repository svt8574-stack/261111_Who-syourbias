// ==============================================================================
// 파일명: api/feedback.js
// 설명: 방명록(피드백) 조회 및 등록 API 핸들러 (로컬 Express 및 Vercel 겸용)
// ==============================================================================

const { getSupabaseClient } = require('../lib/supabase');
const { validateFeedbackRequest } = require('../lib/validation');

// IP별 요청 제한(Rate Limit)을 위한 메모리 저장소 (1분당 최대 5회)
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1분
const MAX_REQUESTS_PER_WINDOW = 5;      // 최대 5회

/**
 * 간단한 IP 기반 쓰기 요청 제한 함수
 * @param {string} ip 
 * @returns {boolean} 허용 여부
 */
function isRateLimited(ip) {
  const now = Date.now();
  const record = rateLimitMap.get(ip) || { count: 0, resetTime: now + RATE_LIMIT_WINDOW_MS };

  if (now > record.resetTime) {
    record.count = 1;
    record.resetTime = now + RATE_LIMIT_WINDOW_MS;
    rateLimitMap.set(ip, record);
    return false;
  }

  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return true;
  }

  record.count += 1;
  rateLimitMap.set(ip, record);
  return false;
}

/**
 * 방명록 API 통합 핸들러
 */
async function handler(req, res) {
  let supabase;
  try {
    supabase = getSupabaseClient();
  } catch (initErr) {
    console.error('[Supabase 초기화 오류]:', initErr.message);
    return res.status(500).json({
      ok: false,
      error: '데이터베이스 설정이 올바르지 않습니다. 관리자에게 문의해주세요.'
    });
  }

  // ----------------------------------------------------------------------------
  // 1. 방명록 목록 조회 (GET /api/feedback)
  // ----------------------------------------------------------------------------
  if (req.method === 'GET') {
    try {
      // 쿼리 파라미터 파싱 및 기본값 설정
      const limitParam = parseInt(req.query.limit, 10);
      const offsetParam = parseInt(req.query.offset, 10);

      const limit = (!isNaN(limitParam) && limitParam > 0 && limitParam <= 50) ? limitParam : 50;
      const offset = (!isNaN(offsetParam) && offsetParam >= 0) ? offsetParam : 0;

      // 다음 페이지 존재 여부(hasMore) 확인을 위해 limit + 1개를 조회합니다.
      const { data, error } = await supabase
        .from('feedback')
        .select('id, nickname, message, created_at')
        .order('created_at', { ascending: false })
        .order('id', { ascending: false })
        .range(offset, offset + limit);

      if (error) {
        console.error('[Supabase 조회 오류]:', error.message);
        return res.status(500).json({
          ok: false,
          error: '방명록 목록을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.'
        });
      }

      const hasMore = (data && data.length > limit);
      const items = hasMore ? data.slice(0, limit) : (data || []);

      return res.status(200).json({
        ok: true,
        items,
        hasMore
      });

    } catch (err) {
      console.error('[방명록 GET 오류]:', err.message);
      return res.status(500).json({
        ok: false,
        error: '서버 오류로 방명록을 가져오지 못했습니다.'
      });
    }
  }

  // ----------------------------------------------------------------------------
  // 2. 방명록 글 등록 (POST /api/feedback)
  // ----------------------------------------------------------------------------
  if (req.method === 'POST') {
    try {
      // 클라이언트 IP 확인 (Vercel 프록시 헤더 고려)
      const clientIp = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket.remoteAddress || 'unknown';

      // 1분당 5회 쓰기 제한 검사
      if (isRateLimited(clientIp)) {
        return res.status(429).json({
          ok: false,
          error: '작성 요청이 너무 많습니다. 1분 후에 다시 시도해주세요.'
        });
      }

      // 입력 데이터 유효성 검증 (닉네임 2~15자, 내용 1~300자)
      const validation = validateFeedbackRequest(req.body);
      if (!validation.valid) {
        return res.status(400).json({
          ok: false,
          error: validation.error
        });
      }

      const { nickname, message } = validation.sanitizedData;

      // Supabase feedback 테이블에 삽입 (보안: IP는 DB에 저장하지 않음)
      const { data, error } = await supabase
        .from('feedback')
        .insert([{ nickname, message }])
        .select('id, nickname, message, created_at')
        .single();

      if (error) {
        console.error('[Supabase 등록 오류]:', error.message);
        return res.status(500).json({
          ok: false,
          error: '방명록을 저장하지 못했습니다. 잠시 후 다시 시도해주세요.'
        });
      }

      return res.status(201).json({
        ok: true,
        item: data
      });

    } catch (err) {
      console.error('[방명록 POST 오류]:', err.message);
      return res.status(500).json({
        ok: false,
        error: '서버 오류로 방명록을 등록하지 못했습니다.'
      });
    }
  }

  // 허용되지 않은 HTTP 메서드
  return res.status(405).json({
    ok: false,
    error: '허용되지 않는 HTTP 메서드입니다. GET 또는 POST만 지원합니다.'
  });
}

module.exports = handler;

