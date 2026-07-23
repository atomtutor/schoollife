/* 파일 위치: js/flashcard.js */
/* 이 파일이 하는 일: 단어 범위 선택 → 플래시카드 학습(이전/다음, 뜻 보기,
   외웠어요/다시 봐야해요 체크) → 학습 결과 화면까지, flashcard.html의
   화면 전환과 상태 관리를 전부 담당해요. */

var el = function (id) {
  return document.getElementById(id);
};

var startInput = el('startNum');
var endInput = el('endNum');
var countInput = el('countNum');
var setupMsg = el('setupMsg');
var startBtn = el('startBtn');

var progressText = el('progressText');
var progressFill = el('progressFill');
var flashcard = el('flashcard');
var wordEl = el('flashcard-word');
var meaningEl = el('flashcard-meaning');
var prevBtn = el('prevBtn');
var nextBtn = el('nextBtn');
var toggleBtn = el('toggleBtn');
var unsureBtn = el('unsureBtn');
var knownBtn = el('knownBtn');

var resultMessage = el('resultMessage');
var ringOuter = el('ringOuter');
var ringCount = el('ringCount');
var ringPercent = el('ringPercent');
var statKnown = el('statKnown');
var statUnsure = el('statUnsure');
var statSkip = el('statSkip');
var reviewList = el('reviewList');
var retrySameBtn = el('retrySameBtn');
var restartBtn = el('restartBtn');

/* ---------- 전역 상태 ---------- */
var config = { start: 1, end: 1800, count: 10 };
var cards = [];
var statuses = []; // 각 카드마다 null(건너뜀) | 'known'(외웠어요) | 'unsure'(다시 봐야해요)
var current = 0;
var showingMeaning = false;

/* ---------- 공통 유틸 ---------- */
function showScreen(name) {
  var screens = document.querySelectorAll('.screen');
  for (var i = 0; i < screens.length; i += 1) {
    screens[i].classList.remove('active');
  }
  el('screen-' + name).classList.add('active');
  window.scrollTo(0, 0);
}

function showSetupMsg(type, message) {
  if (!setupMsg) return;
  setupMsg.textContent = message;
  setupMsg.className = 'msg show ' + type;
}

function hideSetupMsg() {
  if (setupMsg) setupMsg.className = 'msg';
}

function shuffle(array) {
  var clone = array.slice();
  for (var i = clone.length - 1; i > 0; i -= 1) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = clone[i];
    clone[i] = clone[j];
    clone[j] = temp;
  }
  return clone;
}

/* ---------- 범위 설정 화면 로직 ---------- */
function getSelectedCards() {
  var allWords = window.WORDS_DATA || [];
  var start = Number(startInput.value || 1);
  var end = Number(endInput.value || 1800);
  var count = Number(countInput.value || 10);

  if (!start || !end || start < 1 || end > 1800 || start > end) {
    showSetupMsg('error', '시작 번호는 1 이상, 끝 번호는 1800 이내여야 하고 시작보다 끝이 커야 합니다.');
    return [];
  }

  if (!count || count < 1 || count > 100) {
    showSetupMsg('error', '카드 수는 1 이상 100 이하로 입력해 주세요.');
    return [];
  }

  var filtered = allWords.filter(function (item) {
    return item.num >= start && item.num <= end;
  });

  if (!filtered.length) {
    showSetupMsg('error', '선택한 범위에 단어가 없습니다. 다른 범위를 입력해 주세요.');
    return [];
  }

  var limitedCount = Math.min(count, filtered.length);
  return shuffle(filtered).slice(0, limitedCount);
}

function startSession(selected) {
  hideSetupMsg();
  cards = selected;
  statuses = new Array(cards.length).fill(null);
  current = 0;
  showingMeaning = false;
  showScreen('card');
  renderCard();
}

if (startBtn) {
  startBtn.addEventListener('click', function () {
    var selected = getSelectedCards();
    if (!selected.length) return;

    config = {
      start: Number(startInput.value || 1),
      end: Number(endInput.value || 1800),
      count: Number(countInput.value || 10),
    };

    startSession(selected);
  });
}

/* ---------- 플래시카드 화면 로직 ---------- */
function updateMarkButtons() {
  var status = statuses[current];
  unsureBtn.classList.toggle('active', status === 'unsure');
  knownBtn.classList.toggle('active', status === 'known');
}

function renderCard() {
  var total = cards.length;
  var word = cards[current];

  progressText.textContent = (current + 1) + ' / ' + total;
  progressFill.style.width = (current / total) * 100 + '%';

  wordEl.textContent = word.word;
  meaningEl.textContent = showingMeaning ? word.meaning : '카드를 눌러 뜻을 확인하세요.';
  toggleBtn.textContent = showingMeaning ? '뜻 가리기' : '뜻 보기';

  prevBtn.disabled = current === 0;
  nextBtn.textContent = current === total - 1 ? '결과 보기 →' : '다음 →';

  updateMarkButtons();
}

function onCardClick() {
  if (!cards.length) return;
  showingMeaning = !showingMeaning;
  renderCard();
}

function goPrev() {
  if (current === 0) return;
  current -= 1;
  showingMeaning = false;
  renderCard();
}

function goNext() {
  if (current >= cards.length - 1) {
    finishSession();
    return;
  }
  current += 1;
  showingMeaning = false;
  renderCard();
}

function markCard(status) {
  statuses[current] = status;
  if (current >= cards.length - 1) {
    finishSession();
    return;
  }
  current += 1;
  showingMeaning = false;
  renderCard();
}

if (flashcard) {
  flashcard.addEventListener('click', onCardClick);
  flashcard.addEventListener('keydown', function (event) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onCardClick();
    }
  });
}

if (toggleBtn) toggleBtn.addEventListener('click', onCardClick);
if (prevBtn) prevBtn.addEventListener('click', goPrev);
if (nextBtn) nextBtn.addEventListener('click', goNext);
if (unsureBtn) unsureBtn.addEventListener('click', function () { markCard('unsure'); });
if (knownBtn) knownBtn.addEventListener('click', function () { markCard('known'); });

/* ---------- 결과 화면 로직 ---------- */
function encouragingMessage(percent) {
  if (percent >= 80) return '정말 잘했어요! 완벽에 가까워요 🎉';
  if (percent >= 50) return '좋아요! 조금만 더 연습하면 완벽해요 💪';
  return '다음에는 더 많이 맞출 수 있을 거예요 🌱';
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function renderReviewList(items) {
  if (!items.length) {
    reviewList.innerHTML = '<div class="review-empty">모두 외웠어요! 👏</div>';
    return;
  }

  reviewList.innerHTML = items
    .map(function (item) {
      var cls = item.status === 'unsure' ? 'review-item' : 'review-item skip';
      var tag = item.status === 'unsure' ? '다시 봐야해요' : '건너뜀';
      return (
        '<div class="' + cls + '">' +
        '<div class="eng">' + escapeHtml(item.word.word) +
        ' <span style="font-weight:400;font-size:0.8em;">(' + tag + ')</span></div>' +
        '<div class="kor">' + escapeHtml(item.word.meaning) + '</div>' +
        '</div>'
      );
    })
    .join('');
}

function finishSession() {
  var total = cards.length;
  var known = 0;
  var unsure = 0;
  var skip = 0;
  var reviewItems = [];

  for (var i = 0; i < total; i += 1) {
    var status = statuses[i];
    if (status === 'known') {
      known += 1;
    } else if (status === 'unsure') {
      unsure += 1;
      reviewItems.push({ word: cards[i], status: 'unsure' });
    } else {
      skip += 1;
      reviewItems.push({ word: cards[i], status: 'skip' });
    }
  }

  var percent = total ? Math.round((known / total) * 100) : 0;

  resultMessage.textContent = encouragingMessage(percent);
  ringCount.textContent = known + '/' + total;
  ringPercent.textContent = percent + '%';
  ringOuter.style.background =
    'conic-gradient(var(--accent) ' + percent + '%, rgba(148, 163, 184, 0.28) ' + percent + '% 100%)';

  statKnown.textContent = known + '개';
  statUnsure.textContent = unsure + '개';
  statSkip.textContent = skip + '개';

  renderReviewList(reviewItems);

  showScreen('result');
}

if (retrySameBtn) {
  retrySameBtn.addEventListener('click', function () {
    var allWords = window.WORDS_DATA || [];
    var pool = allWords.filter(function (item) {
      return item.num >= config.start && item.num <= config.end;
    });
    var limitedCount = Math.min(config.count, pool.length);
    startSession(shuffle(pool).slice(0, limitedCount));
  });
}

if (restartBtn) {
  restartBtn.addEventListener('click', function () {
    hideSetupMsg();
    showScreen('setup');
  });
}
