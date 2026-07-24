/* 파일 위치: js/main.js */
const currentPage = location.pathname.split('/').pop() || 'index.html';
const navLinks = document.querySelectorAll('.nav-link');

navLinks.forEach((link) => {
  const pageName = link.getAttribute('data-page');
  const linkPage = link.getAttribute('href');

  if (currentPage === linkPage || (currentPage === '' && pageName === 'index')) {
    link.classList.add('active');
  } else {
    link.classList.remove('active');
  }
});

/* 점심/하교 카운트다운: index.html에만 있는 요소들이라
   다른 페이지에서는 timeTarget이 null이라 아래 블록이 통째로 건너뛰어져요. */
const timeTarget = document.querySelector('#countdown');
const countdownLabel = document.querySelector('#countdownLabel');
const targetTimeInput = document.querySelector('#targetTimeInput');
const modeButtons = document.querySelectorAll('.timer-mode-btn');

function parseTimeToSeconds(value) {
  const [hour, minute] = value.split(':').map(Number);
  return hour * 3600 + minute * 60;
}

if (timeTarget && targetTimeInput) {
  const schoolConfig = window.SCHOOL_CONFIG || {};

  // 사용자가 시각을 아직 입력하지 않았을 때 보여줄 기본값 (학교마다 다르면 config.js에서 바꿔요)
  const DEFAULT_TIMES = {
    lunch: schoolConfig.lunchTime || '12:30',
    dismissal: schoolConfig.departureTime || '16:30',
  };
  const MODE_LABELS = {
    lunch: '점심까지 남은 시간',
    dismissal: '하교까지 남은 시간',
  };

  // 로그인 없이도 다음에 다시 왔을 때 같은 설정이 남아있도록 localStorage에만 저장해요.
  const STORAGE_MODE_KEY = 'wsl-timer-mode';
  const STORAGE_TIME_PREFIX = 'wsl-timer-time-';

  let mode = localStorage.getItem(STORAGE_MODE_KEY);
  if (mode !== 'lunch' && mode !== 'dismissal') {
    mode = 'dismissal';
  }

  function getSavedTime(targetMode) {
    return localStorage.getItem(STORAGE_TIME_PREFIX + targetMode) || DEFAULT_TIMES[targetMode];
  }

  function applyMode(nextMode) {
    mode = nextMode;
    localStorage.setItem(STORAGE_MODE_KEY, mode);
    targetTimeInput.value = getSavedTime(mode);

    if (countdownLabel) {
      countdownLabel.textContent = MODE_LABELS[mode];
    }

    modeButtons.forEach((button) => {
      const isActive = button.dataset.mode === mode;
      button.classList.toggle('active', isActive);
      button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
  }

  modeButtons.forEach((button) => {
    button.addEventListener('click', () => applyMode(button.dataset.mode));
  });

  targetTimeInput.addEventListener('change', () => {
    if (!targetTimeInput.value) return;
    localStorage.setItem(STORAGE_TIME_PREFIX + mode, targetTimeInput.value);
  });

  applyMode(mode);

  function update() {
    const value = targetTimeInput.value || DEFAULT_TIMES[mode];
    const targetSeconds = parseTimeToSeconds(value);
    const now = new Date();
    const nowSeconds = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
    let remaining = targetSeconds - nowSeconds;

    if (remaining < 0) {
      remaining += 24 * 3600;
    }

    const hours = String(Math.floor(remaining / 3600)).padStart(2, '0');
    const minutes = String(Math.floor((remaining % 3600) / 60)).padStart(2, '0');
    const seconds = String(remaining % 60).padStart(2, '0');

    timeTarget.textContent = `${hours}:${minutes}:${seconds}`;
  }

  update();
  setInterval(update, 1000);
}

/* AI 영어 튜터 버튼: 누르면 Dify 챗봇이 담긴 패널이 열리고,
   X 버튼 / 어두운 배경 클릭 / ESC 키를 누르면 닫혀요.
   무료 사용량 초과 시 안내 메시지 필요
   크레딧이 빨리 소진될 경우, Dify에 Google Gemini 등 자체 무료 API 키를 연결하는 방식으로 전환 가능 */
const floatingTutor = document.querySelector('.floating-tutor');
const tutorPanel = document.querySelector('#tutor-panel');
const tutorCloseBtn = document.querySelector('#tutor-close-btn');

if (floatingTutor && tutorPanel && tutorCloseBtn) {
  floatingTutor.addEventListener('click', () => {
    tutorPanel.hidden = false;
  });

  tutorCloseBtn.addEventListener('click', () => {
    tutorPanel.hidden = true;
  });

  // 챗봇 창 바깥(어두운 배경)을 누르면 닫히게 해요
  tutorPanel.addEventListener('click', (event) => {
    if (event.target === tutorPanel) {
      tutorPanel.hidden = true;
    }
  });

  // 키보드로 ESC를 누르면 닫히게 해요 (접근성)
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !tutorPanel.hidden) {
      tutorPanel.hidden = true;
    }
  });
}
