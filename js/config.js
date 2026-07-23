/* 파일 위치: js/config.js */
/* 이 파일이 하는 일: 학교 정보, 시간표, NEIS API 접속 정보처럼
   "설정값"만 모아두는 곳이에요. 다른 학교에서 이 사이트를 쓰려면
   이 파일의 값들만 바꾸면 돼요. */
window.SCHOOL_CONFIG = {
  // 학교 기본 정보
  officeCode: "J10", // 시도교육청코드 (NEIS: ATPT_OFCDC_SC_CODE)
  schoolCode: "7679119", // 표준학교코드 (NEIS: SD_SCHUL_CODE)
  schoolName: "운암중학교",

  // 시간표
  lunchTime: "12:30",
  departureTime: "16:30",

  // ⚠️ 주의: 이 파일은 브라우저가 그대로 내려받는 공개 파일이에요.
  // GitHub Pages처럼 공개 저장소에 올리면 이 API 키도 누구나 볼 수 있어요.
  // 그래서 원래는 서버 뒤에 숨겨야 하지만, 이 프로젝트는 "순수 정적 프론트엔드"
  // 원칙이라 서버가 없어요. NEIS 급식 API는 공공데이터라 키가 노출돼도
  // 큰 문제는 없지만, 다른 민감한 키는 절대 이런 식으로 넣지 마세요.
  neisApiKey: "5b8a275ec36c4ec3819dea22cc6dc9cc",

  // NEIS 급식 정보 API 기본 주소 (open.neis.go.kr). 날짜(MLSV_YMD)는
  // js/neis.js가 매일 자동으로 "오늘 날짜"를 채워 넣어서 요청해요.
  neisApiBaseUrl: "https://open.neis.go.kr/hub/mealServiceDietInfo",

  // 브라우저 콘솔에서 직접 테스트해 본 결과, 이 학교(NEIS)는 CORS 오류 없이
  // 브라우저에서 바로 호출이 잘 됐어요! 그래서 프록시 없이 빈 문자열로 둬요.
  // 값은 그냥 두면 돼요.
  //
  // 혹시 다른 학교로 바꿔서 썼는데 브라우저 콘솔에 CORS 에러가 뜨면,
  // 아래처럼 무료 프록시 주소를 다시 넣어서 켤 수 있어요.
  // (단, corsproxy.io는 반드시 "?url=인코딩된주소" 형식만 지원하고,
  // localhost·*.github.io 같은 제한된 주소에서만 무료로 동작해요.)
  //   corsProxyUrl: "https://corsproxy.io/?url=",
  corsProxyUrl: "",

  // API 호출 실패(주말/방학/공휴일/서버 오류/CORS 오류) 시 보여줄 예시 데이터
  fallbackMealFile: "data/fallback-meal.json"
};
