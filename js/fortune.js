/* 파일 위치: js/fortune.js */
/* 이 파일이 하는 일: "오늘의 운세" 카드의 로직을 담당해요. NEIS 급식 API 대신
   들어간 기능이라 외부 서버 없이, 미리 만들어둔 문구 목록에서 오늘 날짜를
   기준으로 하나를 골라 보여줘요. 같은 날에는 누가 봐도 같은 운세가 나오고,
   날짜가 바뀌면 자동으로 다른 운세가 나와요. */

const FORTUNE_MESSAGES = [
  { emoji: '🍚', text: '오늘은 급식 리필해도 절대 안 걸리는 날! 마음껏 드세요' },
  { emoji: '👀', text: '짝사랑 상대와 눈 마주칠 확률이 평소보다 쑥 올라가는 날' },
  { emoji: '😴', text: '수업 시간에 살짝 졸아도 선생님이 눈치 못 채는 신비한 하루' },
  { emoji: '🙅', text: '발표 순서에 절대 안 걸리는 완벽한 하루예요' },
  { emoji: '🔋', text: '폰 배터리가 유난히 오래가는 날! 쉬는 시간에 마음껏 보세요' },
  { emoji: '🍪', text: '친구가 매점에서 몰래 간식 나눠줄 확률이 높은 날' },
  { emoji: '✨', text: '오늘은 찍신이 강림하는 날! 헷갈리는 문제는 믿고 찍어도 좋아요' },
  { emoji: '😇', text: '짜증나는 일이 생겨도 금방 웃어넘기게 되는 관대한 하루' },
  { emoji: '🏃', text: '체육 시간에 유난히 컨디션 좋은 날! 자신 있게 뛰어보세요' },
  { emoji: '🌶️', text: '떡볶이가 3번 이상 생각나는 날' },
  { emoji: '📢', text: '선생님이 갑자기 좋은 소식을 전해줄 것 같은 예감' },
  { emoji: '💰', text: '주머니나 가방에서 잊고 있던 돈을 발견할 확률 UP' },
  { emoji: '💬', text: '기다리던 카톡 답장이 평소보다 빨리 오는 날' },
  { emoji: '🎮', text: '게임에서 랭크 올리기 딱 좋은 절호의 기회' },
  { emoji: '💇', text: '오늘따라 헤어스타일 잘 됐다고 칭찬받을 수도 있는 날' },
  { emoji: '⏳', text: '쉬는 시간이 평소보다 길게 느껴지는 신비한 하루' },
  { emoji: '🥤', text: '매점 품절 직전, 마지막 하나를 낚아채는 행운의 날' },
  { emoji: '👍', text: '생각지도 못한 곳에서 칭찬을 듣게 될 확률 UP' },
  { emoji: '⏰', text: '알람이 딱 맞춰 울리는, 아침부터 타이밍이 완벽한 하루' },
  { emoji: '🗣️', text: '짝꿍이 오늘따라 재밌는 이야기를 해줄 것 같은 날' },
  { emoji: '🚌', text: '버스나 지하철에서 바로 자리에 앉게 되는 행운의 하루' },
  { emoji: '😋', text: '급식 반찬 중 제일 좋아하는 게 두 번 나올 것 같은 예감' },
  { emoji: '🎨', text: '오늘은 뭘 해도 손이 잘 풀리는 날! 미술・만들기 시간을 기대해요' },
  { emoji: '🤝', text: '누군가 몰래 내 편이 되어주는 든든한 하루' },
  { emoji: '💤', text: '오늘 밤 유난히 꿀잠을 잘 것 같은 날' },
  { emoji: '🎵', text: '우연히 좋아하는 노래가 흘러나올 확률이 높은 날' },
  { emoji: '📚', text: '생각보다 숙제가 금방 끝나버리는 신기한 하루' },
  { emoji: '🤗', text: '친구와 다투다가도 금방 화해하게 되는 날' },
  { emoji: '❤️', text: 'SNS에 올린 글에 평소보다 반응이 많이 붙는 날' },
  { emoji: '😄', text: '사소한 것에도 웃음이 많이 나는, 기분 좋은 하루예요' },
  { emoji: '🏫', text: '예상치 못하게 일찍 마치는 행운이 따를지도 모르는 날' },
  { emoji: '📝', text: '어려웠던 수학 문제가 갑자기 술술 풀리는 짜릿한 하루' },
  { emoji: '🌂', text: '비 오는 날, 누군가 우산을 씌워주거나 우산을 줍게 되는 날' },
  { emoji: '🥪', text: '점심시간 전에 배고플 때, 가방에서 우연히 간식을 발견할 예감' },
  { emoji: '💡', text: '모둠 활동에서 낸 아이디어가 친구들에게 큰 호응을 얻는 날' },
  { emoji: '🏅', text: '체육 수행평가에서 생각보다 훨씬 좋은 기록이 나오는 하루' },
  { emoji: '😎', text: '선생님의 갑작스러운 질문에 완벽하게 대답해서 뿌듯한 날' },
  { emoji: '🎧', text: '쉬는 시간에 듣는 노동요가 오늘따라 유난히 신나게 들리는 날' },
  { emoji: '🧹', text: '청소 구역 제비뽑기에서 가장 편한 자리에 당첨될 확률 UP' },
  { emoji: '🍀', text: '오늘은 뭘 해도 운이 따라주는 날! 하고 싶었던 일을 도전해 보세요' }
];

const LUCKY_COLORS = [
  { name: '빨강', hex: '#ef4444' },
  { name: '주황', hex: '#f97316' },
  { name: '노랑', hex: '#facc15' },
  { name: '연두', hex: '#84cc16' },
  { name: '초록', hex: '#22c55e' },
  { name: '민트', hex: '#14b8a6' },
  { name: '파랑', hex: '#3b82f6' },
  { name: '남색', hex: '#6366f1' },
  { name: '보라', hex: '#a855f7' },
  { name: '분홍', hex: '#ec4899' },
  { name: '하양', hex: '#f8fafc' },
  { name: '검정', hex: '#1f2937' },
];

const LUCKY_ITEMS = [
  '샤프', '지우개', '이어폰', '손거울', '사탕', '머리끈', '열쇠고리', '젤리','틴트','헤어롤','L자 화일',
  '마스크', '우산', '볼펜', '스티커', '텀블러', '슬리퍼', '핸드크림','책','삼선 슬리퍼', '핸드크림','형광펜',
];

const fortuneIdle = document.querySelector('#fortune-idle');
const fortuneResult = document.querySelector('#fortune-result');
const revealBtn = document.querySelector('#fortune-reveal-btn');
const rerollBtn = document.querySelector('#fortune-reroll-btn');
const fortuneEmoji = document.querySelector('#fortune-emoji');
const fortuneText = document.querySelector('#fortune-text');
const fortuneColorDot = document.querySelector('#fortune-color-dot');
const fortuneColorName = document.querySelector('#fortune-color-name');
const fortuneItem = document.querySelector('#fortune-item');

const STORAGE_KEY = 'wsl-fortune-date';

/* 문자열을 숫자로 바꿔주는 간단한 해시 함수예요. 같은 글자를 넣으면
   항상 같은 숫자가 나오기 때문에, "오늘 날짜"를 넣으면 오늘 하루 동안은
   항상 같은 운세가 나오도록 만들 수 있어요. */
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i += 1) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function getTodayYmd() {
  const date = new Date();
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}${mm}${dd}`;
}

function renderFortune(seed) {
  const messageIndex = hashString(`${seed}:message`) % FORTUNE_MESSAGES.length;
  const colorIndex = hashString(`${seed}:color`) % LUCKY_COLORS.length;
  const itemIndex = hashString(`${seed}:item`) % LUCKY_ITEMS.length;

  const message = FORTUNE_MESSAGES[messageIndex];
  const color = LUCKY_COLORS[colorIndex];
  const item = LUCKY_ITEMS[itemIndex];

  if (fortuneEmoji) fortuneEmoji.textContent = message.emoji;
  if (fortuneText) fortuneText.textContent = message.text;
  if (fortuneColorDot) fortuneColorDot.style.backgroundColor = color.hex;
  if (fortuneColorName) fortuneColorName.textContent = color.name;
  if (fortuneItem) fortuneItem.textContent = item;

  if (fortuneIdle) {
    fortuneIdle.hidden = true;
  }

  if (fortuneResult) {
    fortuneResult.hidden = false;
    // 클래스를 껐다 켜서, 다시 뽑기를 눌러도 등장 애니메이션이 매번 재생되게 해요.
    fortuneResult.classList.remove('show');
    void fortuneResult.offsetWidth; // 강제로 리플로우를 일으켜 애니메이션을 재시작해요.
    fortuneResult.classList.add('show');
  }
}

if (revealBtn) {
  revealBtn.addEventListener('click', () => {
    const today = getTodayYmd();
    localStorage.setItem(STORAGE_KEY, today);
    renderFortune(today);
  });
}

if (rerollBtn) {
  rerollBtn.addEventListener('click', () => {
    // "재미로 다시 뽑기"는 오늘의 공식 운세를 바꾸는 게 아니라
    // 그냥 매번 새로운 문구를 랜덤으로 보여주기만 해요. (localStorage에 저장 안 함)
    renderFortune(`reroll-${Math.random()}`);
  });
}

// 오늘 이미 운세를 뽑아본 적이 있으면, 페이지를 다시 열었을 때
// 버튼을 또 누르지 않아도 바로 오늘의 운세를 보여줘요.
if (fortuneIdle && fortuneResult) {
  const today = getTodayYmd();
  if (localStorage.getItem(STORAGE_KEY) === today) {
    renderFortune(today);
  }
}
