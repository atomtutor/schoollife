/* 파일 위치: js/quiz.js */
const quizWord = document.querySelector('#quiz-word');
const quizOptions = document.querySelector('#quiz-options');
const quizFeedback = document.querySelector('#quiz-feedback');

let currentQuiz = null;

function randomIndex(max) {
  return Math.floor(Math.random() * max);
}

function renderQuiz() {
  const words = window.WORDS_DATA || [];
  if (!words.length) {
    quizWord.textContent = '단어 데이터 없음';
    return;
  }

  const base = words[randomIndex(words.length)];
  const distractors = words
    .filter((item) => item.word !== base.word)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);

  const options = [base, ...distractors]
    .sort(() => Math.random() - 0.5)
    .map((item) => ({
      ...item,
      isCorrect: item.word === base.word,
    }));

  currentQuiz = {
    word: base.word,
    meaning: base.meaning,
    options,
  };

  quizWord.textContent = base.word;
  quizOptions.innerHTML = '';
  quizFeedback.textContent = '정답을 골라 보세요.';

  options.forEach((item) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = item.meaning;
    button.addEventListener('click', () => {
      if (item.isCorrect) {
        quizFeedback.textContent = `정답입니다! ${currentQuiz.meaning}`;
      } else {
        quizFeedback.textContent = `아쉽습니다. 정답은 ${currentQuiz.meaning} 입니다.`;
      }
      setTimeout(renderQuiz, 1200);
    });
    quizOptions.appendChild(button);
  });
}

function waitForWords() {
  if (window.WORDS_DATA && window.WORDS_DATA.length) {
    renderQuiz();
    return;
  }

  setTimeout(waitForWords, 300);
}

waitForWords();
