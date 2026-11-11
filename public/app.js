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

  // 결과 화면 엘리먼트들
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

  // 토스트 알림창
  const toast = document.getElementById('toast');
  let toastTimer = null;

  // 오늘 날짜 계산 (미래 날짜 선택 방지용 max 속성 설정)
  const today = new Date().toISOString().split('T')[0];
  myBirthDateInput.setAttribute('max', today);
  biasBirthDateInput.setAttribute('max', today);

  // ----------------------------------------------------------------------------
  // 2. 토스트 알림 표시 함수
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
  // 3. 화면 전환 (State Navigation) 관리 함수
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
  // 4. 에러 메시지 초기화
  // ----------------------------------------------------------------------------
  function clearErrors() {
    myBirthError.textContent = '';
    biasNameError.textContent = '';
    biasBirthError.textContent = '';
  }

  // ----------------------------------------------------------------------------
  // 5. 결과 화면 데이터 렌더링 함수
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

    // 3) 점수 및 관계
    resRelationName.textContent = data.relation;
    resScoreNumber.textContent = data.score;
    resScoreGrade.textContent = data.grade;

    // 4) AI 해설 렌더링 (보안을 위해 반드시 textContent 사용)
    resSummary.textContent = data.headline;
    resDetail.textContent = data.description;
    resDating.textContent = data.datingScenario;
    resMarriage.textContent = data.marriageScenario;
  }

  // ----------------------------------------------------------------------------
  // 6. 이벤트 리스너 등록
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
    switchView('form');
    myBirthDateInput.focus();
  });

  // 폼 제출 이벤트 -> 백엔드 API (/api/analyze) 연동
  compatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();

    // 입력값 가져오기
    const myBirth = myBirthDateInput.value.trim();
    const biasName = biasNameInput.value.trim();
    const biasBirth = biasBirthDateInput.value.trim();

    // 유효성 검사
    let hasError = false;
    if (!myBirth) {
      myBirthError.textContent = '나의 생년월일을 선택해주세요.';
      hasError = true;
    }
    if (!biasName) {
      biasNameError.textContent = '최애의 이름을 입력해주세요.';
      hasError = true;
    } else if (biasName.length < 1 || biasName.length > 40) {
      biasNameError.textContent = '이름은 1자 이상 40자 이내로 입력해주세요.';
      hasError = true;
    }
    if (!biasBirth) {
      biasBirthError.textContent = '최애의 생년월일을 선택해주세요.';
      hasError = true;
    }

    if (hasError) {
      showToast('입력 항목을 확인해주세요.', 'error');
      return;
    }

    // 중복 전송 방지: 버튼 비활성화 및 로딩 화면 전환
    btnSubmit.disabled = true;
    switchView('loading');

    try {
      // 서버 API 호출
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          myBirthDate: myBirth,
          biasName: biasName,
          biasBirthDate: biasBirth
        })
      });

      const result = await response.json();

      if (!response.ok || !result.ok) {
        throw new Error(result.error || '분석 중 오류가 발생했습니다.');
      }

      // 결과 화면 렌더링 후 화면 전환
      renderAnalysisResult(result.data, biasName);
      switchView('result');
      showToast('궁합 분석이 완료되었습니다!', 'success');

    } catch (err) {
      // 오류 발생 시 폼 화면 유지 및 입력값 보존
      switchView('form');
      showToast(err.message, 'error');
    } finally {
      // 버튼 다시 활성화
      btnSubmit.disabled = false;
    }
  });

  // ----------------------------------------------------------------------------
  // 7. 방명록 로컬 UI 이벤트 (4단계에서 Supabase 연동 예정)
  // ----------------------------------------------------------------------------
  const feedbackForm = document.getElementById('feedback-form');
  const feedbackList = document.getElementById('feedback-list');

  if (feedbackForm) {
    feedbackForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const nicknameInput = document.getElementById('feedback-nickname');
      const messageInput = document.getElementById('feedback-message');
      
      const nickname = nicknameInput.value.trim();
      const message = messageInput.value.trim();

      if (nickname.length < 2 || nickname.length > 15) {
        showToast('닉네임은 2자 이상 15자 이하로 입력해주세요.', 'error');
        return;
      }

      if (message.length < 1 || message.length > 300) {
        showToast('내용은 1자 이상 300자 이하로 입력해주세요.', 'error');
        return;
      }

      const emptyMsg = feedbackList.querySelector('.feedback-empty');
      if (emptyMsg) {
        emptyMsg.remove();
      }

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
      author.textContent = nickname;

      const time = document.createElement('span');
      time.className = 'feedback-time';
      time.textContent = '방금 전';

      meta.appendChild(author);
      meta.appendChild(time);

      const text = document.createElement('p');
      text.className = 'feedback-text';
      text.textContent = message;

      body.appendChild(meta);
      body.appendChild(text);

      itemDiv.appendChild(avatar);
      itemDiv.appendChild(body);

      feedbackList.prepend(itemDiv);

      nicknameInput.value = '';
      messageInput.value = '';
      showToast('방명록이 등록되었습니다!', 'success');
    });
  }
});
