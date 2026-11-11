// ==============================================================================
// 파일명: lib/validation.js
// 설명: 서버 및 API 입력 데이터 유효성 검증 유틸리티
// ==============================================================================

/**
 * 날짜 문자열이 유효한 YYYY-MM-DD 형식 및 1900-01-01부터 오늘 사이인지 검증합니다.
 * @param {string} dateStr 
 * @returns {{ valid: boolean, error?: string }}
 */
function validateBirthDate(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') {
    return { valid: false, error: '생년월일을 입력해주세요.' };
  }

  // YYYY-MM-DD 형식 정규식 검사
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateStr)) {
    return { valid: false, error: '날짜 형식이 올바르지 않습니다. (예: 2000-01-01)' };
  }

  const dateObj = new Date(dateStr);
  if (isNaN(dateObj.getTime())) {
    return { valid: false, error: '존재하지 않는 유효하지 않은 날짜입니다.' };
  }

  const [yearStr] = dateStr.split('-');
  const year = parseInt(yearStr, 10);
  if (year < 1900) {
    return { valid: false, error: '1900년 이후의 날짜를 입력해주세요.' };
  }

  // 미래 날짜 방지
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  if (dateObj > today) {
    return { valid: false, error: '미래의 날짜는 선택할 수 없습니다.' };
  }

  return { valid: true };
}

/**
 * 최애 이름의 유효성을 검증합니다. (trim 후 1~40자)
 * @param {string} name 
 * @returns {{ valid: boolean, error?: string, value?: string }}
 */
function validateBiasName(name) {
  if (!name || typeof name !== 'string') {
    return { valid: false, error: '최애의 이름을 입력해주세요.' };
  }

  const trimmed = name.trim();
  if (trimmed.length < 1 || trimmed.length > 40) {
    return { valid: false, error: '최애 이름은 1자 이상 40자 이하로 입력해주세요.' };
  }

  return { valid: true, value: trimmed };
}

/**
 * 궁합 분석 API 요청 본문(body) 전체를 검증합니다.
 * @param {object} body 
 * @returns {{ valid: boolean, error?: string, sanitizedData?: object }}
 */
function validateAnalyzeRequest(body) {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: '요청 본문이 올바르지 않습니다.' };
  }

  const { myBirthDate, biasName, biasBirthDate } = body;

  // 1) 나의 생년월일 검증
  const myDateCheck = validateBirthDate(myBirthDate);
  if (!myDateCheck.valid) {
    return { valid: false, error: `내 생일: ${myDateCheck.error}` };
  }

  // 2) 최애 이름 검증
  const biasNameCheck = validateBiasName(biasName);
  if (!biasNameCheck.valid) {
    return { valid: false, error: biasNameCheck.error };
  }

  // 3) 최애 생년월일 검증
  const biasDateCheck = validateBirthDate(biasBirthDate);
  if (!biasDateCheck.valid) {
    return { valid: false, error: `최애 생일: ${biasDateCheck.error}` };
  }

  return {
    valid: true,
    sanitizedData: {
      myBirthDate,
      biasName: biasNameCheck.value,
      biasBirthDate
    }
  };
}

/**
 * 방명록 등록 요청 본문(body)을 검증합니다.
 * @param {object} body 
 * @returns {{ valid: boolean, error?: string, sanitizedData?: object }}
 */
function validateFeedbackRequest(body) {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: '요청 본문이 올바르지 않습니다.' };
  }

  const { nickname, message } = body;

  if (!nickname || typeof nickname !== 'string') {
    return { valid: false, error: '닉네임을 입력해주세요.' };
  }
  const trimmedNickname = nickname.trim();
  if (trimmedNickname.length < 2 || trimmedNickname.length > 15) {
    return { valid: false, error: '닉네임은 2자 이상 15자 이하로 입력해주세요.' };
  }

  if (!message || typeof message !== 'string') {
    return { valid: false, error: '방명록 내용을 입력해주세요.' };
  }
  const trimmedMessage = message.trim();
  if (trimmedMessage.length < 1 || trimmedMessage.length > 300) {
    return { valid: false, error: '방명록 내용은 1자 이상 300자 이하로 입력해주세요.' };
  }

  return {
    valid: true,
    sanitizedData: {
      nickname: trimmedNickname,
      message: trimmedMessage
    }
  };
}

module.exports = {
  validateBirthDate,
  validateBiasName,
  validateAnalyzeRequest,
  validateFeedbackRequest
};

