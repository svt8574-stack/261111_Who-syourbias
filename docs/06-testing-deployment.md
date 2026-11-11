# 06. 테스트 및 배포

## 로컬 테스트
1. `npm install` → `npm start` → `http://localhost:3000`.
2. START → 입력 → 분석 → 결과 → 다시 분석하기 정상 동작.
3. 잘못된 날짜, 빈 이름, 미입력 시 ⚠️ 토스트 3초 표시.
4. 분석 중 로딩과 중복 클릭 방지.
5. 오행 테스트: 2000=금, 2001=금, 2002=수, 2004=목, 2006=화, 2008=토.
6. 2004(목)와 2006(화): 상생 90점; 순서 반대도 90점(설명 방향 변경).
7. 2004(목)와 2008(토): 상극 55점.
8. 2000(금)과 2001(금): 동일 오행 80점.
9. 같은 입력 반복 시 오행/점수/등급 동일.
10. AI 연애·결혼 답변 각각 공백 포함 150자 이하.
11. OpenAI 키 누락/호출 실패 시 오류 표시, 기존 입력 보존.
12. 방명록 닉네임/글 등록 → Supabase 테이블 확인 → 최신순 표시.
13. 빈 글, 초과 길이, 빠른 중복 클릭, HTML 태그 입력 방어.
14. 모바일 320px/390px, 데스크톱에서 가로 스크롤 없이 확인.
15. '다시 분석하기' 후 방명록 유지 확인.

## GitHub
- `.gitignore`: `.env`, `node_modules/`, `.vercel/`.
- `git status`로 비밀키가 추적되지 않는지 확인.
- 예시 명령:
```
git init
git add .
git commit -m "feat: bias compatibility MVP"
git branch -M main
git remote add origin <본인 저장소 URL>
git push -u origin main
```
- `origin`이 이미 있으면 `git remote add` 재실행하지 않음.
- 키가 커밋된 적 있으면 파일 삭제만으로 부족하므로 즉시 키 교체.

## Vercel
- GitHub 저장소 연결.
- Framework Preset: `Other`(바닐라 HTML/JS).
- Root Directory: 프로젝트 루트.
- `public/` 정적 파일 및 `api/` 서버리스 함수가 배포되도록 설정/검증.
- `vercel.json`은 필요 최소한으로 작성하고, SPA fallback이 API를 가리지 않도록 주의.
- 환경변수 `OPENAI_API_KEY`, `SUPABASE_URL`, `SUPABASE_SECRET_KEY` 등록.
- 키 등록 후 **Redeploy**.
- 실제 배포 URL에서 분석 API, 방명록 GET/POST, 모바일 UI 확인.
- `Ready`만 보고 완료 판단하지 말고 Visit에서 페이지와 API 확인.

## 배포 완료 기준
- 메인 화면 404 없음.
- API 비밀키가 개발자도구 Network 응답/브라우저 소스에 없음.
- 궁합 점수 고정, AI 문구 출력, 150자 제한.
- 방명록 저장/조회/최신순/더보기 정상.
- 오류 토스트 및 다시 분석하기 정상.
- 테스트 통과 후 수업 단톡방 공유:
`[00팀-이름 : Who’s your bias? I’m Your Bias!]`
`서비스 1줄 소개: 최애와 나의 오행 케미를 확인하는 AI 궁합 테스트`
`URL: https://...`
