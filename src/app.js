document.addEventListener("DOMContentLoaded", () => {
  const root = document.getElementById("root");

  // משתנים גלובליים
  let userName = "";
  let currentQuestionIndex = 0;
  let score = 0;
  let attempts = 0;
  const answers = [];
  let questions = [];

  // קטעי סאונד (וודאו שהקבצים קיימים בתיקייה)
  const correctSound = new Audio("src/sounds/correct.mp3");
  const wrongSound = new Audio("src/sounds/wrong.mp3");
  const clickSound = new Audio("src/sounds/click.mp3");

  // הצגת מסך פתיחה – הכנס את השם
  renderNameInput();

  function renderNameInput() {
    root.innerHTML = `
      <div class="container fade-in">
        <h1 class="title">ברוכים הבאים לתרגילי חשבון</h1>
        <p>אנא הכנס את שמך כדי להתחיל:</p>
        <input type="text" id="child-name" class="input" placeholder="שם הילד" />
        <button id="start-btn" class="btn">התחל</button>
      </div>
    `;
    const startBtn = document.getElementById("start-btn");
    startBtn.addEventListener("click", () => {
      const nameInput = document.getElementById("child-name");
      const name = nameInput.value.trim();
      if (name === "") {
        alert("אנא הכנס שם");
        return;
      }
      userName = name;
      clickSound.play();
      initQuiz();
    });
  }

  function initQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    attempts = 0;
    answers.length = 0;
    questions = generateQuestions();
    renderQuestion();
  }

  function generateRandomNumber(max) {
    return Math.floor(Math.random() * (max + 1));
  }

  function generateQuestions() {
    const questionsSet = new Set();

    // יצירת שאלות חיבור וחיסור (6 שאלות מספריות בסיסיות)
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
        // בעיית תפוחים – חיסור: לדנה היו X תפוחים, נתנה Y, כמה נשארו?
        const total = generateRandomNumber(10) + 10;
        const given = generateRandomNumber(Math.min(10, total));
        questionsSet.add(JSON.stringify({
          question: `לדנה היו ${total} תפוחים. היא נתנה ${given} לחברתה. כמה נשארו לה?`,
          answer: total - given,
          type: "apples",
          total, 
          given
        }));
      } else {
        // בעיית כדורים – חיבור: ליוסי יש X כדורים, חברו נתן לו Y, כמה יש לו עכשיו?
        const initial = generateRandomNumber(10) + 1;
        const added = generateRandomNumber(10);
        questionsSet.add(JSON.stringify({
          question: `ליוסי יש ${initial} כדורים. חברו נתן לו ${added} נוספים. כמה יש לו עכשיו?`,
          answer: initial + added,
          type: "balls",
          initial,
          added
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
        <h1 class="title">תרגילי חשבון</h1>
        ${renderProgressBar()}
        <div class="card">
          <h2 class="question">${currentQuestion.question}</h2>
          <!-- קונטיינר להצגת האנימציה לבעיות מילוליות -->
          <div id="animation-container"></div>
          <input type="number" id="answer" class="input" placeholder="הקלד תשובה כאן" inputmode="numeric" pattern="[0-9]*">
          <button id="check-btn" class="btn">בדוק תשובה</button>
          <p id="feedback" class="feedback"></p>
        </div>
      </div>
    `;

    // במידה וזו בעיה מילולית – מפעילים אנימציה מתאימה
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
        feedbackEl.textContent = `${userName}, תשובה נכונה! כל הכבוד!`;
        feedbackEl.style.color = "green";
        correctSound.play();
        answers.push({ question: currentQuestion.question, userAnswer, isCorrect: true });
        attempts = 0;
        launchConfetti();
        card.classList.add("fade-out");
        setTimeout(() => {
          currentQuestionIndex++;
          renderQuestion();
        }, 500);
      } else {
        feedbackEl.textContent = `${userName}, תשובה שגויה. נסה שוב.`;
        feedbackEl.style.color = "red";
        wrongSound.play();
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
        <p class="summary">${userName}, ענית נכון על ${score} מתוך ${questions.length} שאלות.</p>
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
      initQuiz();
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

  // אפקט קונפטי לתשובות נכונות
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

  // הפעלת אנימציה לבעיות מילוליות – הפנייה לפונקציות לפי סוג
  function animateWordProblem(question) {
    if (question.type === "apples") {
      animateApples(question.total, question.given);
    } else if (question.type === "balls") {
      animateBalls(question.initial, question.added);
    }
  }

  // אנימציה לבעיית תפוחים (חיסור):
  // מוצגים שני חלקים: "בהתחלה" עם כל התפוחים, וסימן ❌ המפריד ובו מוצגים מה שנשאר לאחר הסרת התפוחים (total - given)
  function animateApples(total, given) {
    const container = document.getElementById("animation-container");
    container.innerHTML = `
      <div class="apples-animation">
        <div class="apples-initial">
          <div class="group-label">בהתחלה</div>
          <div id="apples-initial" class="group-apples"></div>
        </div>
        <div class="separator separator-sub">❌</div>
        <div class="apples-remaining">
          <div class="group-label">נותרו</div>
          <div id="apples-remaining" class="group-apples"></div>
        </div>
      </div>
    `;
    const initialDiv = container.querySelector("#apples-initial");
    const remainingDiv = container.querySelector("#apples-remaining");

    // מציגים את כל התפוחים בהתחלה
    for (let i = 0; i < total; i++) {
      const appleSpan = document.createElement("span");
      appleSpan.classList.add("apple");
      appleSpan.textContent = "🍎";
      initialDiv.appendChild(appleSpan);
    }

    // לאחר השהייה – מסמנים את מספר התפוחים שיש להסיר (given) עם אנימציית הסרה, ומיד לאחר מכן מציגים את התפוחים שנותרו
    setTimeout(() => {
      for (let i = 0; i < given; i++) {
        const apple = initialDiv.lastElementChild;
        if (apple) {
          apple.classList.add("remove-apple");
          apple.addEventListener("animationend", () => {
            apple.remove();
            // לאחר הסרת כל התפוחים הנדרשים, מעדכנים את ה"נותרו" (אם לא נעשה כבר)
            remainingDiv.innerHTML = "";
            const remainingCount = total - given;
            for (let j = 0; j < remainingCount; j++) {
              const remApple = document.createElement("span");
              remApple.classList.add("apple");
              remApple.textContent = "🍎";
              remainingDiv.appendChild(remApple);
            }
          }, { once: true });
        }
      }
    }, 1000);
  }

  // אנימציה לבעיית כדורים (חיבור):
  // מוצגים שני חלקים: "בהתחלה" עם הכדורים ההתחלתיים, וביניהם סימן + שמפריד והצגה של הכדורים שנוספו.
  function animateBalls(initial, added) {
    const container = document.getElementById("animation-container");
    container.innerHTML = `
      <div class="balls-animation">
        <div class="balls-initial">
          <div class="group-label">בהתחלה</div>
          <div id="balls-initial" class="group-balls"></div>
        </div>
        <div class="separator separator-add">+</div>
        <div class="balls-added">
          <div class="group-label">נוספו</div>
          <div id="balls-added" class="group-balls"></div>
        </div>
      </div>
    `;
    const initialDiv = container.querySelector("#balls-initial");
    const addedDiv = container.querySelector("#balls-added");

    // מציגים את הכדורים ההתחלתיים
    for (let i = 0; i < initial; i++) {
      const ballSpan = document.createElement("span");
      ballSpan.classList.add("ball");
      ballSpan.textContent = "⚽";
      initialDiv.appendChild(ballSpan);
    }

    // לאחר השהייה – מוסיפים את הכדורים שנוספו עם אפקט fade-in
    setTimeout(() => {
      for (let i = 0; i < added; i++) {
        const ballSpan = document.createElement("span");
        ballSpan.classList.add("ball", "fade-in-ball");
        ballSpan.textContent = "⚽";
        addedDiv.appendChild(ballSpan);
      }
    }, 1000);
  }
});
