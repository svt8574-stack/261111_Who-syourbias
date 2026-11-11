// ==============================================================================
// 파일명: lib/elements.js
// 설명: 양력 출생연도 기반 간이 오행 분류 및 궁합 계산 결정론적 알고리즘
// ==============================================================================

/**
 * 1. 출생연도 끝자리(0~9)와 천간/오행/상징 매핑 테이블
 * 규칙:
 * 0: 경(庚) - 금(金)
 * 1: 신(辛) - 금(金)
 * 2: 임(壬) - 수(水)
 * 3: 계(癸) - 수(水)
 * 4: 갑(甲) - 목(木)
 * 5: 을(乙) - 목(木)
 * 6: 병(丙) - 화(火)
 * 7: 정(丁) - 화(火)
 * 8: 무(戊) - 토(土)
 * 9: 기(己) - 토(土)
 */
const YEAR_DIGIT_MAP = {
  0: { key: 'metal', name: '금', hanja: '金', symbol: '결단', icon: '⚔️' },
  1: { key: 'metal', name: '금', hanja: '金', symbol: '결단', icon: '⚔️' },
  2: { key: 'water', name: '수', hanja: '水', symbol: '유연', icon: '💧' },
  3: { key: 'water', name: '수', hanja: '水', symbol: '유연', icon: '💧' },
  4: { key: 'wood',  name: '목', hanja: '木', symbol: '성장', icon: '🌱' },
  5: { key: 'wood',  name: '목', hanja: '木', symbol: '성장', icon: '🌱' },
  6: { key: 'fire',  name: '화', hanja: '火', symbol: '열정', icon: '🔥' },
  7: { key: 'fire',  name: '화', hanja: '火', symbol: '열정', icon: '🔥' },
  8: { key: 'earth', name: '토', hanja: '土', symbol: '안정', icon: '🏔️' },
  9: { key: 'earth', name: '토', hanja: '土', symbol: '안정', icon: '🏔️' }
};

/**
 * 2. 오행 상생/상극 순환 정의
 * 상생 순환: 목(wood) -> 화(fire) -> 토(earth) -> 금(metal) -> 수(water) -> 목(wood)
 * 상극 순환: 목(wood) -> 토(earth) -> 수(water) -> 화(fire) -> 금(metal) -> 목(wood)
 */
const GENERATION_CYCLE = {
  wood: 'fire',
  fire: 'earth',
  earth: 'metal',
  metal: 'water',
  water: 'wood'
};

const OVERCOMING_CYCLE = {
  wood: 'earth',
  earth: 'water',
  water: 'fire',
  fire: 'metal',
  metal: 'wood'
};

/**
 * 양력 생년월일(YYYY-MM-DD)에서 연도 끝자리를 추출하여 오행 정보를 반환합니다.
 * @param {string} birthDateStr - "YYYY-MM-DD" 형식의 날짜 문자열
 * @returns {object} { key, name, hanja, symbol, icon }
 */
function calculateElement(birthDateStr) {
  const year = parseInt(birthDateStr.split('-')[0], 10);
  const lastDigit = Math.abs(year % 10);
  return { ...YEAR_DIGIT_MAP[lastDigit] };
}

/**
 * 궁합 점수에 따라 등급을 결정합니다.
 * @param {number} score - 궁합 점수 (0~100)
 * @returns {string} 등급 명칭
 */
function calculateGrade(score) {
  if (score >= 90) return '환상의 케미';
  if (score >= 75) return '반짝이는 케미';
  if (score >= 60) return '서로 다른 매력';
  if (score >= 40) return '색다른 케미';
  return '새로운 발견';
}

/**
 * 나와 최애의 오행을 비교하여 관계와 점수, 등급을 계산합니다.
 * @param {object} myElement - 나의 오행 객체
 * @param {object} biasElement - 최애의 오행 객체
 * @returns {object} { relation, score, grade }
 */
function calculateCompatibility(myElement, biasElement) {
  const myKey = myElement.key;
  const biasKey = biasElement.key;

  // 1) 동일 오행인 경우
  if (myKey === biasKey) {
    const score = 80;
    return {
      relation: '동일 오행',
      score: score,
      grade: calculateGrade(score)
    };
  }

  // 2) 내가 최애를 돕는 상생인 경우 (나 -> 최애)
  if (GENERATION_CYCLE[myKey] === biasKey) {
    const score = 90;
    return {
      relation: '내가 최애를 돕는 상생',
      score: score,
      grade: calculateGrade(score)
    };
  }

  // 3) 최애가 나를 돕는 상생인 경우 (최애 -> 나)
  if (GENERATION_CYCLE[biasKey] === myKey) {
    const score = 90;
    return {
      relation: '최애가 나를 돕는 상생',
      score: score,
      grade: calculateGrade(score)
    };
  }

  // 4) 내가 최애를 제어하는 상극인 경우 (나 -> 최애)
  if (OVERCOMING_CYCLE[myKey] === biasKey) {
    const score = 55;
    return {
      relation: '내가 최애를 제어하는 상극',
      score: score,
      grade: calculateGrade(score)
    };
  }

  // 5) 최애가 나를 제어하는 상극인 경우 (최애 -> 나)
  if (OVERCOMING_CYCLE[biasKey] === myKey) {
    const score = 55;
    return {
      relation: '최애가 나를 제어하는 상극',
      score: score,
      grade: calculateGrade(score)
    };
  }

  // 기본 fallback 점수
  const fallbackScore = 70;
  return {
    relation: '조화로운 인연',
    score: fallbackScore,
    grade: calculateGrade(fallbackScore)
  };
}

/**
 * 오행 관계에 따른 고정된 '우정 궁합' 점수 및 해설을 산출합니다. (JavaScript 고정 규칙)
 * - 동일 오행: 95점 — 취향과 관심사가 비슷해 쉽게 친해질 수 있는 절친 케미!
 * - 상생 관계: 90점 — 서로를 응원하고 부족한 부분을 채워주는 든든한 친구 케미!
 * - 상극 관계: 75점 — 서로 다른 매력 덕분에 새로운 즐거움을 발견하는 친구 케미!
 * @param {string} relation - 오행 관계 문자열
 * @returns {{ score: number, comment: string }}
 */
function calculateFriendshipCompatibility(relation) {
  if (relation === '동일 오행') {
    return {
      score: 95,
      comment: '취향과 관심사가 비슷해 쉽게 친해질 수 있는 절친 케미!'
    };
  }

  if (relation.includes('상생')) {
    return {
      score: 90,
      comment: '서로를 응원하고 부족한 부분을 채워주는 든든한 친구 케미!'
    };
  }

  if (relation.includes('상극')) {
    return {
      score: 75,
      comment: '서로 다른 매력 덕분에 새로운 즐거움을 발견하는 친구 케미!'
    };
  }

  // 기본 fallback
  return {
    score: 80,
    comment: '서로 다른 매력 덕분에 새로운 즐거움을 발견하는 친구 케미!'
  };
}

module.exports = {
  calculateElement,
  calculateCompatibility,
  calculateGrade,
  calculateFriendshipCompatibility
};
