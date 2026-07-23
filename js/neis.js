/* 파일 위치: js/neis.js */
/* 이 파일이 하는 일: NEIS 급식 정보 API에서 선택한 날짜(기본값: 오늘)의
   중식(점심) 메뉴를 가져와 화면에 보여줘요. 실패하거나(주말/방학/공휴일/
   서버 오류/CORS 오류) 데이터가 없으면 예시 데이터나 안내 문구로
   자연스럽게 대체해요. */

const mealStatus = document.querySelector('#meal-status');
const mealList = document.querySelector('#meal-list');
const mealCalorie = document.querySelector('#meal-calorie');
const mealDateInput = document.querySelector('#mealDateInput');

/* 요리명에 어울리는 이모지를 골라주는 규칙이에요. 위에서부터 순서대로
   검사해서 먼저 맞는 것을 사용해요. */
const DISH_EMOJI_RULES = [
  [/밥/, '🍚'],
  [/면|국수|당면/, '🍜'],
  [/국|찌개|탕/, '🍲'],
  [/김치/, '🥬'],
  [/치킨|후라이드/, '🍗'],
  [/생선|고등어|갈치|조기|가자미|오징어|낙지/, '🐟'],
  [/돈육|소고기|쇠고기|불고기|스테이크|함박|폭립/, '🥩'],
  [/닭/, '🍗'],
  [/두부/, '🧈'],
  [/계란|달걀/, '🥚'],
  [/우유/, '🥛'],
  [/빵|케이크|과자/, '🍞'],
  [/떡/, '🍡'],
  [/샐러드/, '🥗'],
  [/아이스크림|푸딩/, '🍨'],
  [/사과|귤|배|딸기|바나나|자두|파인애플|과일|토마토/, '🍎'],
];

function getDishEmoji(name) {
  const rule = DISH_EMOJI_RULES.find(([pattern]) => pattern.test(name));
  return rule ? rule[1] : '🍽️';
}

/* message: 상단 안내 문구, items: 메뉴 목록,
   emptyText: items가 비어 있을 때 목록 자리에 보여줄 문구예요.
   (상단 문구와 목록 문구를 따로 받아서, "연결은 실패했는데 예시 데이터도
   없는" 것처럼 서로 다른 두 안내가 섞여 보이지 않도록 해요.) */
function renderMeal(message, items = [], emptyText = '급식이 없어요 🍙') {
  if (mealStatus) {
    mealStatus.textContent = message;
  }

  if (mealCalorie) {
    mealCalorie.textContent = '';
  }

  if (mealList) {
    mealList.innerHTML = '';

    if (!items.length) {
      const emptyItem = document.createElement('div');
      emptyItem.className = 'meal-item';
      emptyItem.textContent = emptyText;
      mealList.appendChild(emptyItem);
      return;
    }

    items.forEach((item) => {
      const card = document.createElement('div');
      card.className = 'meal-item';
      card.textContent = `${getDishEmoji(item)} ${item}`;
      mealList.appendChild(card);
    });
  }
}

async function loadFallbackMealData() {
  try {
    const response = await fetch(window.SCHOOL_CONFIG?.fallbackMealFile || 'data/fallback-meal.json');
    if (!response.ok) {
      throw new Error('fallback file load failed');
    }
    const data = await response.json();
    return data.meals || [];
  } catch (error) {
    return [];
  }
}

/* Date 객체 → <input type="date">에 넣을 "YYYY-MM-DD" 문자열 */
function toDateInputValue(date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/* "YYYY-MM-DD" → NEIS API가 요구하는 "YYYYMMDD" */
function toApiYmd(dateInputValue) {
  return dateInputValue.replace(/-/g, '');
}

/* "YYYYMMDD" → 화면에 보여줄 "2026년 7월 24일" 형태 */
function formatYmdForDisplay(ymd) {
  const yyyy = ymd.slice(0, 4);
  const mm = Number(ymd.slice(4, 6));
  const dd = Number(ymd.slice(6, 8));
  return `${yyyy}년 ${mm}월 ${dd}일`;
}

function getSelectedYmd() {
  if (mealDateInput && mealDateInput.value) {
    return toApiYmd(mealDateInput.value);
  }
  return toApiYmd(toDateInputValue(new Date()));
}

function buildMealApiUrl(ymd) {
  const config = window.SCHOOL_CONFIG || {};

  const targetUrl =
    `${config.neisApiBaseUrl}?KEY=${config.neisApiKey}&Type=json` +
    `&ATPT_OFCDC_SC_CODE=${config.officeCode}&SD_SCHUL_CODE=${config.schoolCode}` +
    `&MLSV_YMD=${ymd}&MMEAL_SC_CODE=2`; // MMEAL_SC_CODE=2 → 중식(점심)만 조회

  // corsProxyUrl이 설정돼 있으면 그 앞에 붙여서 CORS 우회 호출로 전환해요.
  // (config.js의 corsProxyUrl 값만 바꾸면 프록시를 껐다 켰다 할 수 있어요.)
  // corsproxy.io는 대상 주소를 반드시 URL 인코딩해서 "?url=" 뒤에 붙여야 하므로
  // encodeURIComponent로 감싸줘요. (그냥 이어붙이면 targetUrl 안의 "&"가
  // corsproxy.io 자신의 파라미터로 잘못 쪼개져서 요청이 실패해요.)
  return config.corsProxyUrl ? `${config.corsProxyUrl}${encodeURIComponent(targetUrl)}` : targetUrl;
}

/* NEIS API 응답에서 요리명 목록과 칼로리 정보만 뽑아내요.
   급식이 없는 날(주말/방학/공휴일)에는 데이터 자체가 없어서 null을 돌려줘요. */
function extractMealInfo(payload) {
  const rows = payload?.mealServiceDietInfo?.[1]?.row;

  if (!Array.isArray(rows) || !rows.length) {
    return null;
  }

  const row = rows[0];
  const items = (row.DDISH_NM || '')
    .split('<br/>')
    .map((item) => item.replace(/\s*\([0-9.]+\)\s*$/, '').trim())
    .filter(Boolean);

  return {
    items,
    calorie: (row.CAL_INFO || '').trim(),
  };
}

async function loadMealData() {
  const config = window.SCHOOL_CONFIG || {};

  if (!config.neisApiKey || !config.officeCode || !config.schoolCode) {
    const fallbackMeals = await loadFallbackMealData();
    renderMeal('학교 정보(config.js)가 아직 비어 있어 예시 데이터로 표시합니다.', fallbackMeals);
    return;
  }

  const ymd = getSelectedYmd();
  const displayDate = formatYmdForDisplay(ymd);
  const url = buildMealApiUrl(ymd);

  try {
    const response = await fetch(url, {
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      throw new Error('network error');
    }

    const data = await response.json();
    const mealInfo = extractMealInfo(data);

    if (!mealInfo || !mealInfo.items.length) {
      renderMeal(
        `${displayDate}에는 급식 정보가 없어요. 주말이거나 방학・공휴일일 수 있어요.`,
        [],
        `${displayDate}에는 급식이 없어요 🍙`
      );
      return;
    }

    renderMeal(`${displayDate} 급식이에요!`, mealInfo.items);

    if (mealCalorie && mealInfo.calorie) {
      mealCalorie.textContent = `총 칼로리: ${mealInfo.calorie}`;
    }
  } catch (error) {
    // 네트워크 오류, 서버 오류, CORS 오류가 모두 여기로 모여요.
    // 화면에는 원인을 드러내지 않고 예시 데이터로 자연스럽게 대체해요.
    console.warn('NEIS 급식 API 호출 실패:', error);
    const fallbackMeals = await loadFallbackMealData();

    if (fallbackMeals.length) {
      renderMeal('급식 정보 연결에 실패해서 예시 데이터로 보여드립니다. 잠시 후 다시 시도해 주세요.', fallbackMeals);
    } else {
      // fallback-meal.json마저 못 불러온 경우예요. 이때는 "예시 데이터로
      // 보여드립니다"라고 말해놓고 목록이 비어 보이면 혼란스러우니,
      // 아예 다른 문구로 상황을 정확히 알려줘요.
      renderMeal(
        '급식 정보 연결에 실패했고, 예시 데이터도 준비되어 있지 않아요. 잠시 후 다시 시도해 주세요.',
        [],
        '표시할 급식 정보가 없어요 🍙'
      );
    }
  }
}

if (mealDateInput) {
  mealDateInput.value = toDateInputValue(new Date());
  mealDateInput.addEventListener('change', () => {
    loadMealData();
  });
}

loadMealData();
