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
        const questions = [];
        for (let i = 0; i < 3; i++) {
            let num1 = generateRandomNumber(22);
            let num2 = generateRandomNumber(22 - num1);
            questions.push({ question: `${num1} + ${num2}`, answer: num1 + num2 });
        }
        for (let i = 0; i < 3; i++) {
            let num1 = generateRandomNumber(22);
            let num2 = generateRandomNumber(num1);
            questions.push({ question: `${num1} - ${num2}`, answer: Math.abs(num1 - num2) });
        }
        let numApples = generateRandomNumber(10) + 10;
        let givenApples = generateRandomNumber(Math.min(10, numApples));
        questions.push({
            question: `לדנה היו ${numApples} תפוחים. היא נתנה ${givenApples} לחברתה. כמה נשארו לה?`,
            answer: Math.abs(numApples - givenApples)
        });
        let numBalls = generateRandomNumber(10) + 1;
        let extraBalls = generateRandomNumber(10);
        questions.push({
            question: `ליוסי יש ${numBalls} כדורים. חברו נתן לו ${extraBalls} נוספים. כמה יש לו עכשיו?`,
            answer: numBalls + extraBalls
        });
        return questions.slice(0, 10);
    }

    function renderQuestion() {
        if (currentQuestionIndex >= questions.length) {
            renderSummary();
            return;
        }

        const currentQuestion = questions[currentQuestionIndex];
        root.innerHTML = `
            <div class="container">
                <h1 class="title">אפליקציית תרגילי חשבון</h1>
                <div class="card">
                    <h2 class="question">${currentQuestion.question}</h2>
                    <input type="number" id="answer" class="input" placeholder="הקלד תשובה כאן">
                    <button id="check-btn" class="btn">בדוק תשובה</button>
                    <p id="feedback" class="feedback"></p>
                </div>
            </div>
        `;

        const checkBtn = document.getElementById("check-btn");
        checkBtn.addEventListener("click", () => {
            const answerInput = document.getElementById("answer");
            const feedbackEl = document.getElementById("feedback");
            const userAnswer = Math.abs(parseInt(answerInput.value)); // Absolute value for answer

            if (userAnswer === currentQuestion.answer) {
                feedbackEl.textContent = "✔ תשובה נכונה! כל הכבוד!";
                feedbackEl.style.color = "green";
                score++;
                answers.push({ question: currentQuestion.question, userAnswer, isCorrect: true });
                attempts = 0;
                setTimeout(() => {
                    currentQuestionIndex++;
                    renderQuestion();
                }, 1000);
            } else {
                feedbackEl.textContent = "✖ תשובה שגויה. נסה שוב.";
                feedbackEl.style.color = "red";
                attempts++;
                if (attempts >= 2) {
                    answers.push({ question: currentQuestion.question, userAnswer, isCorrect: false });
                    attempts = 0;
                    setTimeout(() => {
                        currentQuestionIndex++;
                        renderQuestion();
                    }, 1000);
                }
            }
        });
    }

    function renderSummary() {
        root.innerHTML = `
            <div class="container">
                <h1 class="title">סיכום התוצאות</h1>
                <p class="summary">ענית נכון על ${score} מתוך ${questions.length} שאלות.</p>
                <table class="summary-table">
                    <thead>
                        <tr>
                            <th>שאלה</th>
                            <th>תשובה שלך</th>
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
});
