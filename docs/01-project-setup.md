# 01. 프로젝트 생성 및 환경설정

## 기술 스택
- HTML/CSS/바닐라 JavaScript
- Node.js 20 이상 권장, npm
- OpenAI API (`gpt-4o-mini`)
- Supabase PostgreSQL
- Vercel

## 권장 파일 구조
```
project/
├── AGENTS.md
├── PRD.md
├── docs/ (설계 문서 6개)
├── assets/ui-reference.jpg (디자인 참고 이미지)
├── public/
│   ├── index.html
│   ├── styles.css
│   └── app.js
├── api/
│   ├── analyze.js
│   └── feedback.js
├── lib/
│   ├── elements.js
│   ├── validation.js
│   └── services.js
├── server.js
├── package.json
├── vercel.json
├── .env.example
└── .gitignore
```
- `server.js`는 로컬에서 `public/` 정적 파일과 `/api/*`를 제공한다.
- Vercel에서는 `public/` 정적 파일과 `api/` 서버리스 함수를 배포한다.
- 로컬/배포 모두 동일한 요청·응답 계약 사용.

## 환경변수 (.env)
```
OPENAI_API_KEY=...
SUPABASE_URL=...
SUPABASE_SECRET_KEY=...
PORT=3000
```
- 프로젝트 설정에 따라 Supabase의 서버용 `service_role` 키를 `SUPABASE_SECRET_KEY`로 사용 가능. **서버 전용**.
- `.env.example`은 위 변수 이름만 남기고 값은 비운다.
- `.env`, `node_modules/`는 `.gitignore`에 추가.
- `.env`는 GitHub 업로드 금지. 유출되면 즉시 키 폐기/재발급.

## 로컬 실행
- `npm install`
- `npm start`
- 브라우저에서 `http://localhost:3000`
- 키 누락 시 서버가 이해하기 쉬운 오류를 반환하도록 한다.

## API
- `POST /api/analyze`: 입력 → 고정 오행/점수 계산 → GPT 해설 → 결과 JSON
- `GET /api/feedback`: 방명록 최신순 목록
- `POST /api/feedback`: 닉네임·피드백 저장
