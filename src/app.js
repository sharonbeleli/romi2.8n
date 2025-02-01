document.addEventListener("DOMContentLoaded", () => {
  const root = document.getElementById("root");

  // משתנים גלובליים
  let userName = "";
  let maxNumber = 10; // ברירת מחדל – עד 10
  let examType = "open"; // "open" או "american"
  let currentQuestionIndex = 0;
  let score = 0;
  let attempts = 0;
  const answers = [];
  let questions = [];

  // קטעי סאונד (ודאו שהקבצים קיימים בתיקייה)
  const correctSound = new Audio("src/sounds/correct.mp3");
  const wrongSound = new Audio("src/sounds/wrong.mp3");
  const clickSound = new Audio("src/sounds/click.mp3");

  // שחרור סאונד במכשירים ניידים (ברגע שהמשתמש מבצע אינטראקציה)
  function unlockAudio() {
    [correctSound, wrongSound, clickSound].forEach(sound => {
      sound.play().then(() => {
        sound.pause();
        sound.currentTime = 0;
      }).catch(() => {});
    });
    document.removeEventListener('touchstart', unlockAudio);
  }
  document.addEventListener('touchstart', unlockAudio);

  // הצגת מסך פתיחה – שם הילד, בחירת קושי ובחירת סוג מבחן
  renderStartScreen();

  function renderStartScreen() {
    root.innerHTML = `
      <div class="container fade-in">
        <h1 class="title">ברוכים הבאים לתרגילי חשבון</h1>
        <p>אנא הכנס את שמך כדי להתחיל:</p>
        <input type="text" id="child-name" class="input" placeholder="שם הילד" />
        <p>בחר רמת קושי:</p>
        <select id="difficulty" class="input">
          <option value="10">עד 10</option>
          <option value="20">עד 20</option>
          <option value="30">עד 30</option>
        </select>
        <p>בחר סוג מבחן:</p>
        <div>
          <label>
            <input type="radio" name="examType" value="open" checked>
            מבחן פתוח
          </label>
          <label>
            <input type="radio" name="examType" value="american">
            מבחן אמריקאי
          </label>
        </div>
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
      maxNumber = parseInt(document.getElementById("difficulty").value, 10);
      examType = document.querySelector('input[name="examType"]:checked').value;
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

    // יצירת 6 שאלות מספריות (חיבור/חיסור) בהתאם לרמת הקושי הנבחרת
    while (questionsSet.size < 6) {
      let num1 = generateRandomNumber(maxNumber);
      let num2 = generateRandomNumber(maxNumber);
      const operation = Math.random() < 0.5 ? "+" : "-";
      let answer, questionText;
      if (operation === "-") {
        // ודא שהתוצאה לא שלילית
        if(num1 < num2) [num1, num2] = [num2, num1];
        answer = num1 - num2;
      } else {
        answer = num1 + num2;
      }
      questionText = `${num1} ${operation} ${num2}`;
      questionsSet.add(JSON.stringify({ question: questionText, answer }));
    }

    // הוספת 4 בעיות מילוליות – תפוחים (חיסור) וכדורים (חיבור)
    while (questionsSet.size < 10) {
      const type = Math.random() < 0.5 ? "apples" : "balls";
      if (type === "apples") {
        // בעיית תפוחים – לדוגמה: "לדנה היו X תפוחים. היא נתנה Y לחברתה. כמה נשארו לה?"
        // נבחר X בטווח [Math.floor(maxNumber/2), maxNumber] כדי לקבל מספרים מתאימים
        const total = generateRandomNumber(Math.max(1, Math.floor(maxNumber/2))) + Math.floor(maxNumber/2);
        const given = generateRandomNumber(total);
        questionsSet.add(JSON.stringify({
          question: `לדנה היו ${total} תפוחים. היא נתנה ${given} לחברתה. כמה נשארו לה?`,
          answer: total - given,
          type: "apples",
          total, 
          given
        }));
      } else {
        // בעיית כדורים – "ליוסי יש X כדורים. חברו נתן לו Y נוספים. כמה יש לו עכשיו?"
        const initial = generateRandomNumber(maxNumber) + 1;
        const added = generateRandomNumber(maxNumber);
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
    let choicesHTML = "";
    let inputHTML = "";
    // במבחן פתוח – מציגים שדה קלט וכפתור בדיקה; במבחן אמריקאי – מציגים כפתורי בחירה
    if (examType === "american") {
      // יצירת אפשרויות בחירה (נבנה מערך אפשרויות הכולל את התשובה הנכונה ועוד 2 תשובות מטעות)
      const options = generateChoices(currentQuestion.answer);
      choicesHTML = `
        <div class="choices-container">
          ${options.map(opt => `<button class="choice-btn" data-answer="${opt}">${opt}</button>`).join('')}
        </div>
      `;
    } else {
      inputHTML = `
        <input type="number" id="answer" class="input" placeholder="הקלד תשובה כאן" inputmode="numeric" pattern="[0-9]*">
        <button id="check-btn" class="btn">בדוק תשובה</button>
      `;
    }

    root.innerHTML = `
      <div class="container fade-in">
        <h1 class="title">תרגילי חשבון</h1>
        ${renderProgressBar()}
        <div class="card">
          <h2 class="question">${currentQuestion.question}</h2>
          <!-- קונטיינר להצגת האנימציה לבעיות מילוליות -->
          <div id="animation-container"></div>
          ${choicesHTML}
          ${inputHTML}
          <p id="feedback" class="feedback"></p>
        </div>
      </div>
    `;

    // אם זו בעיה מילולית – מפעילים אנימציה מתאימה
    if (currentQuestion.type) {
      animateWordProblem(currentQuestion);
    }
    updateProgressBar();

    // טיפול במבחן פתוח – הגשת תשובה באמצעות לחיצה על כפתור או לחיצה במקש Enter
    if (examType === "open") {
      const checkBtn = document.getElementById("check-btn");
      checkBtn.addEventListener("click", checkAnswerOpen);
      const answerInput = document.getElementById("answer");
      answerInput.addEventListener("keydown", (e) => {
        if(e.key === "Enter") {
          e.preventDefault();
          checkBtn.click();
        }
      });
    } else {
      // טיפול במבחן אמריקאי – לחיצה על כפתור הבחירה
      const choiceButtons = document.querySelectorAll(".choice-btn");
      choiceButtons.forEach(btn => {
        btn.addEventListener("click", () => {
          checkAnswerAmerican(parseInt(btn.getAttribute("data-answer"), 10));
        });
      });
    }
  }

  // פונקציה לבניית אפשרויות מבחן אמריקאי
  function generateChoices(correctAnswer) {
    const choices = new Set();
    choices.add(correctAnswer);
    while (choices.size < 3) {
      // בוחרים תשובות מטעות בטווח [correctAnswer-5, correctAnswer+5]
      const offset = Math.floor(Math.random() * 11) - 5; // -5 עד 5
      const choice = correctAnswer + offset;
      if (choice !== correctAnswer && choice >= 0) {
        choices.add(choice);
      }
    }
    // ערבוב אפשרויות
    return Array.from(choices).sort(() => Math.random() - 0.5);
  }

  // טיפול במבחן פתוח – בדיקת התשובה שהוזנה
  function checkAnswerOpen() {
    const answerInput = document.getElementById("answer");
    const feedbackEl = document.getElementById("feedback");
    const userAnswer = parseInt(answerInput.value, 10);
    if (isNaN(userAnswer)) {
      feedbackEl.textContent = "נא להקליד מספר.";
      feedbackEl.style.color = "orange";
      return;
    }
    processAnswer(userAnswer);
  }

  // טיפול במבחן אמריקאי – בדיקת התשובה שנבחרה
  function checkAnswerAmerican(selectedAnswer) {
    processAnswer(selectedAnswer);
  }

  // עיבוד התשובה – משווה את התשובה שניתנה לתשובה הנכונה
  function processAnswer(userAnswer) {
    const currentQuestion = questions[currentQuestionIndex];
    const feedbackEl = document.getElementById("feedback");
    const card = document.querySelector(".card");

    if (userAnswer === currentQuestion.answer) {
      feedbackEl.textContent = `${userName}, תשובה נכונה! כל הכבוד!`;
      feedbackEl.style.color = "green";
      correctSound.play();
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
      renderStartScreen();
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

  // הפעלת אנימציה לבעיות מילוליות – הפנייה לפונקציות לפי סוג הבעיה
  function animateWordProblem(question) {
    if (question.type === "apples") {
      animateApples(question.total, question.given);
    } else if (question.type === "balls") {
      animateBalls(question.initial, question.added);
    }
  }

  // אנימציה לבעיית תפוחים (חיסור):  
  // מוצגים שני חלקים – "בהתחלה" עם כל התפוחים וסימן ❌ שמסמן את התפוחים שהוסרו, ובסוף מוצגים התפוחים שנותרו.
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

    // לאחר השהייה – מסירים את מספר התפוחים הנתון (given) עם אנימציית הסרה,
    // ומציגים את התפוחים שנותרו (total - given)
    setTimeout(() => {
      for (let i = 0; i < given; i++) {
        const apple = initialDiv.lastElementChild;
        if (apple) {
          apple.classList.add("remove-apple");
          apple.addEventListener("animationend", () => {
            apple.remove();
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
  // מוצגים שני חלקים – "בהתחלה" עם הכדורים ההתחלתיים, סימן + ובסוף מוצגים הכדורים שנוספו.
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
