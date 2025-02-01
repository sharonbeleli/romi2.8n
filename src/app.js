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

    // יצירת שאלות חיבור וחיסור (המספרים מוגבלים כך שהתוצאה תהיה חיובית)
    while (questionsSet.size < 6) {
      const num1 = generateRandomNumber(22);
      const num2 = generateRandomNumber(22 - num1);
      const operation = Math.random() < 0.5 ? "+" : "-";
      // לשמור תוצאה חיובית – נשתמש ב- abs גם בחיבור (למרות שזה לא הכרחי)
      const answer = operation === "+" ? num1 + num2 : Math.abs(num1 - num2);
      const questionText = `${num1} ${operation} ${num2}`;
      questionsSet.add(JSON.stringify({ question: questionText, answer }));
    }

    // הוספת בעיות מילוליות
    while (questionsSet.size < 10) {
      const type = Math.random() < 0.5 ? "apples" : "balls";
      if (type === "apples") {
        const numApples = generateRandomNumber(10) + 10;
        const givenApples = generateRandomNumber(Math.min(10, numApples));
        questionsSet.add(JSON.stringify({
          question: `לדנה היו ${numApples} תפוחים. היא נתנה ${givenApples} לחברתה. כמה נשארו לה?`,
          answer: Math.abs(numApples - givenApples)
        }));
      } else {
        const numBalls = generateRandomNumber(10) + 1;
        const extraBalls = generateRandomNumber(10);
        questionsSet.add(JSON.stringify({
          question: `ליוסי יש ${numBalls} כדורים. חברו נתן לו ${extraBalls} נוספים. כמה יש לו עכשיו?`,
          answer: numBalls + extraBalls
        }));
      }
    }

    return Array.from(questionsSet).map((q) => JSON.parse(q));
  }

  function renderQuestion() {
    // אם נגמרו השאלות, מציגים סיכום
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
          <input type="number" id="answer" class="input" placeholder="הקלד תשובה כאן" inputmode="numeric" pattern="[0-9]*">
          <button id="check-btn" class="btn">בדוק תשובה</button>
          <p id="feedback" class="feedback"></p>
        </div>
      </div>
    `;

    // עדכון פס ההתקדמות
    updateProgressBar();

    const checkBtn = document.getElementById("check-btn");
    checkBtn.addEventListener("click", () => {
      const answerInput = document.getElementById("answer");
      const feedbackEl = document.getElementById("feedback");
      const userAnswer = parseInt(answerInput.value);
      
      // בדיקה אם הוקלדה תשובה תקינה
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
        // אפקט fade-out לפני המעבר לשאלה הבאה
        card.classList.add("fade-out");
        setTimeout(() => {
          currentQuestionIndex++;
          renderQuestion();
        }, 500);
      } else {
        feedbackEl.textContent = "✖ תשובה שגויה. נסה שוב.";
        feedbackEl.style.color = "red";
        attempts++;
        // אפקט רעידה כדי להדגיש את הטעות
        card.classList.add("shake");
        setTimeout(() => card.classList.remove("shake"), 500);

        if (attempts >= 2) {
          answers.push({ question: currentQuestion.question, userAnswer, isCorrect: false });
          attempts = 0;
          // מוסיף השהייה קלה עם fade-out לפני המעבר
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

  // אפקט קונפטי לתשובה נכונה
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
});
