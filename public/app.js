// ==============================================================================
// 파일명: public/app.js
// 설명: 아이돌 궁합 테스트 프론트엔드 제어 스크립트 (바닐라 자바스크립트)
// ==============================================================================

document.addEventListener('DOMContentLoaded', () => {
  // ----------------------------------------------------------------------------
  // 1. 주요 DOM 엘리먼트 가져오기
  // ----------------------------------------------------------------------------
  
  // 화면 뷰 섹션들
  const startView = document.getElementById('start-view');
  const formView = document.getElementById('form-view');
  const loadingView = document.getElementById('loading-view');
  const resultView = document.getElementById('result-view');

  // 버튼들
  const btnStart = document.getElementById('btn-start');
  const btnSubmit = document.getElementById('btn-submit');
  const btnRestart = document.getElementById('btn-restart');

  // 폼 및 입력 필드
  const compatForm = document.getElementById('compatibility-form');
  const myBirthDateInput = document.getElementById('my-birthdate');
  const biasNameInput = document.getElementById('bias-name');
  const biasBirthDateInput = document.getElementById('bias-birthdate');

  // 에러 메시지 영역
  const myBirthError = document.getElementById('my-birthdate-error');
  const biasNameError = document.getElementById('bias-name-error');
  const biasBirthError = document.getElementById('bias-birthdate-error');

  // 결과 화면 엘리먼트들 (메인 케미 궁합 및 오행 카드)
  const resMyName = document.getElementById('res-my-name');
  const resBiasName = document.getElementById('res-bias-name');
  
  const myElementCard = document.getElementById('my-element-card');
  const myElementIcon = document.getElementById('my-element-icon');
  const myElementName = document.getElementById('my-element-name');
  const myElementSymbol = document.getElementById('my-element-symbol');

  const biasElementCard = document.getElementById('bias-element-card');
  const biasElementIcon = document.getElementById('bias-element-icon');
  const biasElementName = document.getElementById('bias-element-name');
  const biasElementSymbol = document.getElementById('bias-element-symbol');

  const resRelationName = document.getElementById('res-relation-name');
  const resScoreNumber = document.getElementById('res-score-number');
  const resScoreGrade = document.getElementById('res-score-grade');
  const resSummary = document.getElementById('res-summary');
  const resDetail = document.getElementById('res-detail');
  const resDating = document.getElementById('res-dating');
  const resMarriage = document.getElementById('res-marriage');

  // 우정 궁합 엘리먼트들
  const resFriendshipScore = document.getElementById('res-friendship-score');
  const resFriendshipGauge = document.getElementById('res-friendship-gauge');
  const resFriendshipComment = document.getElementById('res-friendship-comment');

  // 방명록 관련 엘리먼트들
  const feedbackForm = document.getElementById('feedback-form');
  const feedbackNickname = document.getElementById('feedback-nickname');
  const feedbackMessage = document.getElementById('feedback-message');
  const btnFeedbackSubmit = document.getElementById('btn-feedback-submit');
  const feedbackList = document.getElementById('feedback-list');
  const btnFeedbackMore = document.getElementById('btn-feedback-more');

  // 방명록 페이징 상태 변수
  let feedbackOffset = 0;
  const FEEDBACK_LIMIT = 50;

  // 토스트 알림창
  const toast = document.getElementById('toast');
  let toastTimer = null;

  // ----------------------------------------------------------------------------
  // 2. 생년월일 숫자 입력 제어 (숫자만 허용, 최대 8자리)
  // ----------------------------------------------------------------------------
  function setupNumericOnlyInput(inputElement) {
    inputElement.addEventListener('input', (e) => {
      const cleaned = e.target.value.replace(/[^0-9]/g, '').slice(0, 8);
      if (e.target.value !== cleaned) {
        e.target.value = cleaned;
      }
    });
  }

  setupNumericOnlyInput(myBirthDateInput);
  setupNumericOnlyInput(biasBirthDateInput);

  // ----------------------------------------------------------------------------
  // 3. 8자리 생년월일 유효성 검증 및 YYYY-MM-DD 변환 함수
  // ----------------------------------------------------------------------------
  /**
   * YYYYMMDD 형식의 8자리 숫자 생년월일을 검증하고 YYYY-MM-DD로 변환합니다.
   * @param {string} dateStr8 - 8자리 숫자 문자열
   * @param {string} fieldLabel - 에러 메시지에 표시할 필드명
   * @returns {{ valid: boolean, error?: string, formatted?: string }}
   */
  function validateAndParseDate8(dateStr8, fieldLabel) {
    if (!dateStr8 || dateStr8.length !== 8) {
      return { valid: false, error: `${fieldLabel}을 8자리 숫자로 입력해주세요. (예: 20030923)` };
    }

    const year = parseInt(dateStr8.slice(0, 4), 10);
    const month = parseInt(dateStr8.slice(4, 6), 10);
    const day = parseInt(dateStr8.slice(6, 8), 10);

    // 1900년 이전 출생 검증
    if (year < 1900) {
      return { valid: false, error: `${fieldLabel}: 1900년 이후의 연도를 입력해주세요.` };
    }

    // 월(1~12) 검증
    if (month < 1 || month > 12) {
      return { valid: false, error: `${fieldLabel}: 올바른 월(01~12)을 입력해주세요.` };
    }

    // 해당 월의 마지막 일자 계산 (윤년 2월 29일 등 완벽 검증)
    const lastDayOfMonth = new Date(year, month, 0).getDate();
    if (day < 1 || day > lastDayOfMonth) {
      return { valid: false, error: `${fieldLabel}: ${month}월에는 ${day}일이 존재하지 않습니다.` };
    }

    // 미래 날짜 방지 검증
    const inputDate = new Date(year, month - 1, day);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    if (inputDate > today) {
      return { valid: false, error: `${fieldLabel}: 미래의 날짜는 입력할 수 없습니다.` };
    }

    // 서버 API용 YYYY-MM-DD 포맷 변환
    const formatted = `${dateStr8.slice(0, 4)}-${dateStr8.slice(4, 6)}-${dateStr8.slice(6, 8)}`;
    return { valid: true, formatted };
  }

  // ----------------------------------------------------------------------------
  // 4. 토스트 알림 표시 함수
  // ----------------------------------------------------------------------------
  /**
   * 상단에 알림 메시지를 표시합니다.
   * @param {string} message - 표시할 안내 문구
   * @param {'error' | 'success'} type - 알림 종류 (에러 또는 성공)
   */
  function showToast(message, type = 'error') {
    if (!toast) return;

    if (toastTimer) {
      clearTimeout(toastTimer);
    }

    toast.className = 'toast';
    toast.classList.add(type === 'success' ? 'toast-success' : 'toast-error');
    
    const icon = type === 'success' ? '✓ ' : '⚠️ ';
    toast.textContent = icon + message;

    toastTimer = setTimeout(() => {
      toast.classList.add('hidden');
    }, 3000);
  }

  // ----------------------------------------------------------------------------
  // 5. 화면 전환 (State Navigation) 관리 함수
  // ----------------------------------------------------------------------------
  /**
   * 원하는 화면만 보이게 하고 나머지는 숨깁니다.
   * @param {'start' | 'form' | 'loading' | 'result'} targetView 
   */
  function switchView(targetView) {
    startView.classList.add('hidden');
    formView.classList.add('hidden');
    loadingView.classList.add('hidden');
    resultView.classList.add('hidden');

    if (targetView === 'start') {
      startView.classList.remove('hidden');
    } else if (targetView === 'form') {
      formView.classList.remove('hidden');
    } else if (targetView === 'loading') {
      loadingView.classList.remove('hidden');
    } else if (targetView === 'result') {
      resultView.classList.remove('hidden');
    }
  }

  // ----------------------------------------------------------------------------
  // 6. 에러 메시지 초기화
  // ----------------------------------------------------------------------------
  function clearErrors() {
    myBirthError.textContent = '';
    biasNameError.textContent = '';
    biasBirthError.textContent = '';
  }

  // ----------------------------------------------------------------------------
  // 7. 날짜 포맷팅 헬퍼 (방명록 시간 표시용)
  // ----------------------------------------------------------------------------
  function formatKoreanDate(isoString) {
    if (!isoString) return '';
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '';

    const now = new Date();
    const diffSec = Math.floor((now - date) / 1000);

    if (diffSec < 60) return '방금 전';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}분 전`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}시간 전`;

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
  }

  // ----------------------------------------------------------------------------
  // 8. 방명록 DOM 아이템 생성 헬퍼 (XSS 보안: 반드시 textContent 사용)
  // ----------------------------------------------------------------------------
  function createFeedbackItemElement(item) {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'feedback-item';

    const avatar = document.createElement('div');
    avatar.className = 'feedback-avatar';
    avatar.textContent = '💖';

    const body = document.createElement('div');
    body.className = 'feedback-body';

    const meta = document.createElement('div');
    meta.className = 'feedback-meta';

    const author = document.createElement('span');
    author.className = 'feedback-author';
    author.textContent = item.nickname || '익명';

    const time = document.createElement('span');
    time.className = 'feedback-time';
    time.textContent = formatKoreanDate(item.created_at);

    meta.appendChild(author);
    meta.appendChild(time);

    const text = document.createElement('p');
    text.className = 'feedback-text';
    text.textContent = item.message || '';

    body.appendChild(meta);
    body.appendChild(text);

    itemDiv.appendChild(avatar);
    itemDiv.appendChild(body);

    return itemDiv;
  }

  // ----------------------------------------------------------------------------
  // 9. 방명록 API 연동 함수 (조회 및 페이징)
  // ----------------------------------------------------------------------------
  /**
   * 방명록 목록을 서버에서 불러옵니다.
   * @param {boolean} isInitial - 처음 로드인지(기존 목록 초기화), 더보기인지 여부
   */
  async function loadFeedbackList(isInitial = false) {
    if (isInitial) {
      feedbackOffset = 0;
    }

    try {
      const response = await fetch(`/api/feedback?limit=${FEEDBACK_LIMIT}&offset=${feedbackOffset}`, {
        headers: {
          'Accept': 'application/json; charset=utf-8'
        }
      });
      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(data.error || '방명록을 불러오지 못했습니다.');
      }

      if (isInitial) {
        feedbackList.innerHTML = '';
      }

      const items = data.items || [];

      if (items.length === 0 && feedbackOffset === 0) {
        feedbackList.innerHTML = '<div class="feedback-empty">등록된 방명록이 없습니다. 첫 번째 글을 남겨보세요!</div>';
        btnFeedbackMore.classList.add('hidden');
        return;
      }

      items.forEach(item => {
        const itemElem = createFeedbackItemElement(item);
        feedbackList.appendChild(itemElem);
      });

      feedbackOffset += items.length;

      if (data.hasMore) {
        btnFeedbackMore.classList.remove('hidden');
      } else {
        btnFeedbackMore.classList.add('hidden');
      }

    } catch (err) {
      console.error('방명록 조회 오류:', err.message);
      if (isInitial) {
        feedbackList.innerHTML = '<div class="feedback-empty">방명록을 불러오지 못했습니다. 잠시 후 새로고침 해주세요.</div>';
      }
    }
  }

  // ----------------------------------------------------------------------------
  // 10. 결과 화면 데이터 렌더링 함수 (메인 케미 궁합 + 우정 궁합 렌더링)
  // ----------------------------------------------------------------------------
  /**
   * 서버로부터 받은 궁합 데이터를 화면에 안전하게 출력합니다.
   * @param {object} data - /api/analyze 응답 data 객체
   * @param {string} biasName - 최애 이름
   */
  function renderAnalysisResult(data, biasName) {
    resMyName.textContent = '나';
    resBiasName.textContent = biasName;

    // 1) 내 오행 카드 렌더링
    myElementCard.className = `element-card element-${data.myElement.key}`;
    myElementIcon.textContent = data.myElement.icon || '⭐';
    myElementName.textContent = `${data.myElement.name} (${data.myElement.hanja})`;
    myElementSymbol.textContent = `${data.myElement.symbol}의 기운`;

    // 2) 최애 오행 카드 렌더링
    biasElementCard.className = `element-card element-${data.biasElement.key}`;
    biasElementIcon.textContent = data.biasElement.icon || '⭐';
    biasElementName.textContent = `${data.biasElement.name} (${data.biasElement.hanja})`;
    biasElementSymbol.textContent = `${data.biasElement.symbol}의 기운`;

    // 3) 메인 케미 점수 및 관계
    resRelationName.textContent = data.relation;
    resScoreNumber.textContent = data.score;
    resScoreGrade.textContent = data.grade;

    // 4) AI 해설 렌더링 (보안을 위해 반드시 textContent 사용)
    resSummary.textContent = data.headline;
    resDetail.textContent = data.description;
    resDating.textContent = data.datingScenario;
    resMarriage.textContent = data.marriageScenario;

    // 5) 우정 궁합 점수, 게이지 바, 해설 렌더링
    if (data.friendship) {
      const friendshipScore = data.friendship.score || 80;
      resFriendshipScore.textContent = friendshipScore;
      resFriendshipComment.textContent = data.friendship.comment || '';
      
      // 레트로 게이지 바 너비 애니메이션 적용
      setTimeout(() => {
        if (resFriendshipGauge) {
          resFriendshipGauge.style.width = `${friendshipScore}%`;
        }
      }, 100);
    }
  }

  // ----------------------------------------------------------------------------
  // 11. 이벤트 리스너 등록
  // ----------------------------------------------------------------------------

  // [START GAME] 버튼 클릭
  btnStart.addEventListener('click', () => {
    switchView('form');
    myBirthDateInput.focus();
  });

  // [다시 분석하기] 버튼 클릭
  btnRestart.addEventListener('click', () => {
    compatForm.reset();
    clearErrors();
    if (resFriendshipGauge) {
      resFriendshipGauge.style.width = '0%';
    }
    switchView('form');
    myBirthDateInput.focus();
  });

  // 폼 제출 이벤트 -> 백엔드 API (/api/analyze) 연동
  compatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();

    const myBirthRaw = myBirthDateInput.value.trim();
    const biasName = biasNameInput.value.trim();
    const biasBirthRaw = biasBirthDateInput.value.trim();

    let hasError = false;

    // 1) 나의 생년월일 검증
    const myDateValidation = validateAndParseDate8(myBirthRaw, '나의 생년월일');
    if (!myDateValidation.valid) {
      myBirthError.textContent = myDateValidation.error;
      hasError = true;
    }

    // 2) 최애 이름 검증
    if (!biasName) {
      biasNameError.textContent = '최애의 이름을 입력해주세요.';
      hasError = true;
    } else if (biasName.length < 1 || biasName.length > 40) {
      biasNameError.textContent = '이름은 1자 이상 40자 이내로 입력해주세요.';
      hasError = true;
    }

    // 3) 최애 생년월일 검증
    const biasDateValidation = validateAndParseDate8(biasBirthRaw, '최애의 생년월일');
    if (!biasDateValidation.valid) {
      biasBirthError.textContent = biasDateValidation.error;
      hasError = true;
    }

    if (hasError) {
      showToast('입력 항목을 확인해주세요.', 'error');
      return;
    }

    btnSubmit.disabled = true;
    switchView('loading');

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Accept': 'application/json; charset=utf-8'
        },
        body: JSON.stringify({
          myBirthDate: myDateValidation.formatted,
          biasName: biasName,
          biasBirthDate: biasDateValidation.formatted
        })
      });

      const result = await response.json();

      if (!response.ok || !result.ok) {
        throw new Error(result.error || '분석 중 오류가 발생했습니다.');
      }

      renderAnalysisResult(result.data, biasName);
      switchView('result');
      showToast('궁합 분석이 완료되었습니다!', 'success');

    } catch (err) {
      switchView('form');
      showToast(err.message, 'error');
    } finally {
      btnSubmit.disabled = false;
    }
  });

  // 방명록 등록 이벤트 (POST /api/feedback)
  if (feedbackForm) {
    feedbackForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const nickname = feedbackNickname.value.trim();
      const message = feedbackMessage.value.trim();

      if (nickname.length < 2 || nickname.length > 15) {
        showToast('닉네임은 2자 이상 15자 이하로 입력해주세요.', 'error');
        return;
      }

      if (message.length < 1 || message.length > 300) {
        showToast('내용은 1자 이상 300자 이하로 입력해주세요.', 'error');
        return;
      }

      btnFeedbackSubmit.disabled = true;

      try {
        const response = await fetch('/api/feedback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Accept': 'application/json; charset=utf-8'
          },
          body: JSON.stringify({ nickname, message })
        });

        const result = await response.json();

        if (!response.ok || !result.ok) {
          throw new Error(result.error || '방명록 등록에 실패했습니다.');
        }

        feedbackNickname.value = '';
        feedbackMessage.value = '';

        await loadFeedbackList(true);
        showToast('방명록이 등록되었습니다! 💖', 'success');

      } catch (err) {
        showToast(err.message, 'error');
      } finally {
        btnFeedbackSubmit.disabled = false;
      }
    });
  }

  // 방명록 '더 보기' 버튼 클릭 이벤트
  if (btnFeedbackMore) {
    btnFeedbackMore.addEventListener('click', () => {
      loadFeedbackList(false);
    });
  }

  // ----------------------------------------------------------------------------
  // 12. 초기 데이터 로드 (페이지 열릴 때 방명록 목록 불러오기)
  // ----------------------------------------------------------------------------
  loadFeedbackList(true);
});
