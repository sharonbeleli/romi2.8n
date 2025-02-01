document.addEventListener("DOMContentLoaded", () => {
  const root = document.getElementById("root");
  let currentQuestionIndex = 0;
  let score = 0;
  let attempts = 0;
  const answers = [];

  const questions = generateQuestions();
  renderQuestion();

  function generateRandomNumber(max) {
    return Math.floor(Math.random() * (max + 1));
  }

  function generateQuestions() {
    const questionsSet = new Set();

    // יצירת שאלות חיבור וחיסור
    while (questionsSet.size < 6) {
      const num1 = generateRandomNumber(22);
      const num2 = generateRandomNumber(22 - num1);
      const operation = Math.random() < 0.5 ? "+" : "-";
      const answer = operation === "+" ? num1 + num2 : Math.abs(num1 - num2);
      const questionText = `${num1} ${operation} ${num2}`;
      questionsSet.add(JSON.stringify({ question: questionText, answer }));
    }

    // הוספת בעיות מילוליות עם נתונים לצורך אנימציה
    while (questionsSet.size < 10) {
      const type = Math.random() < 0.5 ? "apples" : "balls";
      if (type === "apples") {
        const numApples = generateRandomNumber(10) + 10;
        const givenApples = generateRandomNumber(Math.min(10, numApples));
        questionsSet.add(JSON.stringify({
          question: `לדנה היו ${numApples} תפוחים. היא נתנה ${givenApples} לחברתה. כמה נשארו לה?`,
          answer: Math.abs(numApples - givenApples),
          type: "apples",
          total: numApples,
          given: givenApples,
          remaining: Math.abs(numApples - givenApples)
        }));
      } else {
        const numBalls = generateRandomNumber(10) + 1;
        const extraBalls = generateRandomNumber(10);
        questionsSet.add(JSON.stringify({
          question: `ליוסי יש ${numBalls} כדורים. חברו נתן לו ${extraBalls} נוספים. כמה יש לו עכשיו?`,
          answer: numBalls + extraBalls,
          type: "balls",
          initial: numBalls,
          added: extraBalls,
          final: numBalls + extraBalls
        }));
      }
    }

    return Array.from(questionsSet).map((q) => JSON.parse(q));
  }

  function renderQuestion() {
    if (currentQuestionIndex >= questions.length) {
      renderSummary();
      return;
    }

    const currentQuestion = questions[currentQuestionIndex];
    root.innerHTML = `
      <div class="container fade-in">
        <h1 class="title">אפליקציית תרגילי חשבון</h1>
        ${renderProgressBar()}
        <div class="card">
          <h2 class="question">${currentQuestion.question}</h2>
          <!-- כאן נוסף קונטיינר להצגת האנימציה של הבעיה -->
          <div id="animation-container"></div>
          <input type="number" id="answer" class="input" placeholder="הקלד תשובה כאן" inputmode="numeric" pattern="[0-9]*">
          <button id="check-btn" class="btn">בדוק תשובה</button>
          <p id="feedback" class="feedback"></p>
        </div>
      </div>
    `;

    // במידה ומדובר בבעיה מילולית, מפעילים אנימציה מתאימה
    if (currentQuestion.type) {
      animateWordProblem(currentQuestion);
    }

    updateProgressBar();

    const checkBtn = document.getElementById("check-btn");
    checkBtn.addEventListener("click", () => {
      const answerInput = document.getElementById("answer");
      const feedbackEl = document.getElementById("feedback");
      const userAnswer = parseInt(answerInput.value);

      if (isNaN(userAnswer)) {
        feedbackEl.textContent = "נא להקליד מספר.";
        feedbackEl.style.color = "orange";
        return;
      }

      const card = document.querySelector(".card");

      if (userAnswer === currentQuestion.answer) {
        feedbackEl.textContent = "✔ תשובה נכונה! כל הכבוד!";
        feedbackEl.style.color = "green";
        score++;
        answers.push({ question: currentQuestion.question, userAnswer, isCorrect: true });
        attempts = 0;
        launchConfetti();
        card.classList.add("fade-out");
        setTimeout(() => {
          currentQuestionIndex++;
          renderQuestion();
        }, 500);
      } else {
        feedbackEl.textContent = "✖ תשובה שגויה. נסה שוב.";
        feedbackEl.style.color = "red";
        attempts++;
        card.classList.add("shake");
        setTimeout(() => card.classList.remove("shake"), 500);

        if (attempts >= 2) {
          answers.push({ question: currentQuestion.question, userAnswer, isCorrect: false });
          attempts = 0;
          card.classList.add("fade-out");
          setTimeout(() => {
            currentQuestionIndex++;
            renderQuestion();
          }, 500);
        }
      }
    });
  }

  function renderSummary() {
    root.innerHTML = `
      <div class="container fade-in">
        <h1 class="title">סיכום התוצאות</h1>
        <p class="summary">ענית נכון על ${score} מתוך ${questions.length} שאלות.</p>
        <table class="summary-table">
          <thead>
            <tr>
              <th>שאלה</th>
              <th>תשובתך</th>
              <th>נכון/שגוי</th>
            </tr>
          </thead>
          <tbody>
            ${answers.map((ans) => `
              <tr>
                <td>${ans.question}</td>
                <td>${ans.userAnswer}</td>
                <td>${ans.isCorrect ? "✔" : "✖"}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
        <button id="restart-btn" class="btn">התחל מחדש</button>
      </div>
    `;

    const restartBtn = document.getElementById("restart-btn");
    restartBtn.addEventListener("click", () => {
      currentQuestionIndex = 0;
      score = 0;
      attempts = 0;
      answers.length = 0;
      renderQuestion();
    });
  }

  function renderProgressBar() {
    return `
      <div class="progress-bar">
        <div class="progress" id="progress" style="width: ${((currentQuestionIndex) / questions.length) * 100}%"></div>
      </div>
    `;
  }

  function updateProgressBar() {
    const progressEl = document.getElementById("progress");
    if (progressEl) {
      progressEl.style.width = `${((currentQuestionIndex) / questions.length) * 100}%`;
    }
  }

  // אנימציה לתשובה נכונה
  function launchConfetti() {
    const confettiCount = 30;
    for (let i = 0; i < confettiCount; i++) {
      const confetti = document.createElement("div");
      confetti.className = "confetti";
      confetti.style.left = Math.random() * 100 + "vw";
      confetti.style.backgroundColor = randomColor();
      confetti.style.animationDelay = Math.random() * 1 + "s";
      document.body.appendChild(confetti);
      setTimeout(() => confetti.remove(), 3000);
    }
  }

  function randomColor() {
    const colors = ["#FFC700", "#FF0000", "#2E3192", "#41BBC7"];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  // הפעלת אנימציה עבור בעיות מילוליות
  function animateWordProblem(question) {
    if (question.type === "apples") {
      animateApples(question.total, question.given);
    } else if (question.type === "balls") {
      animateBalls(question.initial, question.added);
    }
  }

  // אנימציה לבעיית תפוחים: מציג שתי קבוצות – "לדנה" ו"לחברתה" – כאשר לאחר השהייה, כמה תפוחים "מעוברים"
  function animateApples(total, given) {
    const container = document.getElementById("animation-container");
    container.innerHTML = `
      <div class="apples-container">
        <div class="apples-group">
          <div class="group-label">לדנה</div>
          <div id="apples-start" class="group-apples"></div>
        </div>
        <div class="apples-group">
          <div class="group-label">לחברתה</div>
          <div id="apples-end" class="group-apples"></div>
        </div>
      </div>
    `;
    const startDiv = container.querySelector("#apples-start");
    const endDiv = container.querySelector("#apples-end");

    // מציגים את כל התפוחים בהתחלה
    for (let i = 0; i < total; i++) {
      const appleSpan = document.createElement("span");
      appleSpan.classList.add("apple");
      appleSpan.textContent = "🍎";
      startDiv.appendChild(appleSpan);
    }

    // לאחר השהייה, מעבירים את מספר התפוחים הנתון
    setTimeout(() => {
      for (let i = 0; i < given; i++) {
        const apple = startDiv.lastElementChild;
        if (apple) {
          apple.classList.add("move-apple");
          apple.addEventListener("transitionend", () => {
            apple.classList.remove("move-apple");
            apple.classList.add("fade-in-apple");
            endDiv.insertBefore(apple, endDiv.firstChild);
          }, { once: true });
        }
      }
    }, 1000);
  }

  // אנימציה לבעיית כדורים: מציגים את הכדורים ההתחלתיים ולאחר מכן מוסיפים את החדשים עם אפקט fade-in
  function animateBalls(initial, added) {
    const container = document.getElementById("animation-container");
    container.innerHTML = `
      <div class="balls-container">
        <div class="balls-group">
          <div class="group-label">התחלתית</div>
          <div id="balls-start" class="group-balls"></div>
        </div>
      </div>
    `;
    const startDiv = container.querySelector("#balls-start");

    for (let i = 0; i < initial; i++) {
      const ballSpan = document.createElement("span");
      ballSpan.classList.add("ball");
      ballSpan.textContent = "⚽";
      startDiv.appendChild(ballSpan);
    }

    setTimeout(() => {
      for (let i = 0; i < added; i++) {
        const ballSpan = document.createElement("span");
        ballSpan.classList.add("ball", "fade-in-ball");
        ballSpan.textContent = "⚽";
        startDiv.appendChild(ballSpan);
      }
    }, 1000);
  }
});
