// ==============================================================================
// 파일명: server.js
// 설명: 아이돌 궁합 테스트 로컬 웹 서버 (Express 기반)
// ==============================================================================

// 1. 필요한 외부 모듈 가져오기
const express = require('express');
const path = require('path');
const dotenv = require('dotenv');

// 2. .env 파일의 환경 변수 로드하기
dotenv.config();

// 3. Express 앱 생성 및 설정
const app = express();
const PORT = process.env.PORT || 3000;

// 4. 요청 본문(JSON) 파싱 미들웨어 등록
app.use(express.json());

// 5. public 폴더의 정적 파일(HTML, CSS, JS, 이미지 등)을 웹에 제공
app.use(express.static(path.join(__dirname, 'public')));

// 6. 기본 헬스 체크 엔드포인트
app.get('/api/health', (req, res) => {
  res.status(200).json({ ok: true, message: '서버가 정상적으로 동작 중입니다.' });
});

// 7. 서버 시작
app.listen(PORT, () => {
  console.log('==================================================');
  console.log(`[서버 시작] 아이돌 궁합 테스트 서버가 실행되었습니다!`);
  console.log(`브라우저 접속 주소: http://localhost:${PORT}`);
  console.log('==================================================');
});
