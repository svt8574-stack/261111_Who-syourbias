# 05. Supabase 방명록 설계

## 테이블
```sql
create table if not exists public.feedback (
  id bigint generated always as identity primary key,
  nickname text not null check (char_length(trim(nickname)) between 2 and 15),
  message text not null check (char_length(trim(message)) between 1 and 300),
  created_at timestamptz not null default now()
);
create index if not exists feedback_created_at_idx
  on public.feedback (created_at desc, id desc);
alter table public.feedback enable row level security;
```
- 브라우저가 Supabase에 직접 접속하지 않는다.
- **anon/authenticated 공개 읽기/쓰기 RLS 정책을 만들지 않는다.**
- 서버의 비밀키(service role/secret)를 이용해 서버 API에서만 삽입·조회한다.
- 키는 `.env`/Vercel Environment Variables에만 저장한다.

## API
### GET /api/feedback?limit=50&offset=0
- `limit`은 1~50, `offset`은 0 이상 정수.
- `created_at DESC, id DESC` 정렬.
- 응답: `{"ok":true,"items":[{"id":1,"nickname":"별빛","message":"재미있어요","created_at":"..."}],"hasMore":false}`.
- 전체 글은 '더 보기' 페이지네이션으로 계속 조회 가능.

### POST /api/feedback
- 요청: `{"nickname":"별빛","message":"재미있어요!"}`.
- trim 처리, 닉네임 2~15자, 내용 1~300자 재검증.
- id/created_at은 DB가 생성; 클라이언트가 지정할 수 없음.
- 응답: `201` + 등록 글 또는 명확한 오류 JSON.
- 등록 성공 후 클라이언트 목록 재조회.

## 악용 방지
- 서버에서 요청 제한 구현(예: IP 기준 분당 5회 쓰기). **Vercel 서버리스의 메모리 기반 카운터는 인스턴스 간 공유되지 않으므로 충분하지 않음**.
- MVP는 외부 공유 전에 관리형 rate limit/캡차 등 실효성 있는 제한을 적용하거나 공개 범위를 제한한다.
- 내용 길이 제한, 입력 타입 검증, 과도한 요청 시 HTTP 429.
- Supabase 프로젝트 쿼터·사용량 모니터링.
- 방명록은 공개 게시물임을 폼에 안내하고 개인정보 입력 자제 문구 추가.
- 모든 글은 DOM의 `textContent`로 출력.
- IP 주소를 DB에 저장하지 않는다.
