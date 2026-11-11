-- ==============================================================================
-- 파일명: 001_create_feedback_table.sql
-- 설명: 아이돌 궁합 테스트 프로젝트의 방명록(한 줄 후기) 저장을 위한 feedback 테이블 생성 스크립트
-- ==============================================================================

-- 1. feedback (방명록) 테이블 생성
-- 사용자가 남긴 닉네임과 한 줄 후기 메시지를 저장하는 테이블입니다.
CREATE TABLE IF NOT EXISTS public.feedback (
  -- id: 각 후기 글의 고유 번호 (자동으로 1씩 증가하는 기본키)
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

  -- nickname: 작성자 닉네임
  -- 앞뒤 공백을 제거(TRIM)한 후 최소 2자 이상, 최대 15자 이하인지 검증(CHECK)합니다.
  nickname TEXT NOT NULL CHECK (char_length(trim(nickname)) BETWEEN 2 AND 15),

  -- message: 방명록 내용(후기)
  -- 앞뒤 공백을 제거(TRIM)한 후 최소 1자 이상, 최대 300자 이하인지 검증(CHECK)합니다.
  message TEXT NOT NULL CHECK (char_length(trim(message)) BETWEEN 1 AND 300),

  -- created_at: 글이 등록된 시간 (기본값: 현재 시간 now())
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. 최신순 정렬 조회를 위한 인덱스(Index) 생성
-- 방명록 목록을 가져올 때 최신 등록순(created_at 내림차순, id 내림차순)으로 빠르게 조회할 수 있도록 도와줍니다.
CREATE INDEX IF NOT EXISTS feedback_created_at_idx
  ON public.feedback (created_at DESC, id DESC);

-- 3. 행 단위 보안 (Row Level Security, RLS) 활성화
-- 보안을 위해 테이블에 RLS를 적용합니다.
-- 정책(Policy)을 별도로 허용하지 않으면, 웹 브라우저의 익명(anon) 사용자가 DB에 직접 데이터를 조회하거나 조작할 수 없습니다.
-- 오직 백엔드 서버에서 비밀키(service_role 키)를 통해서만 안전하게 데이터 조회/추가가 가능합니다.
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

