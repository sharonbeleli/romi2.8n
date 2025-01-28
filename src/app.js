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
        const questions = new Set();

        // יצירת שאלות חיבור וחיסור
        while (questions.size < 6) {
            const num1 = generateRandomNumber(22);
            const num2 = generateRandomNumber(22 - num1);

            const operation = Math.random() < 0.5 ? "+" : "-";
            const answer = operation === "+" ? num1 + num2 : Math.abs(num1 - num2);

            const questionText = operation === "+"
                ? `${num1} + ${num2}`
                : `${num1} - ${num2}`;

            questions.add(JSON.stringify({ question: questionText, answer }));
        }

        // הוספת בעיות מילוליות
        while (questions.size < 10) {
            const type = Math.random() < 0.5 ? "apples" : "balls";
            if (type === "apples") {
                const numApples = generateRandomNumber(10) + 10;
                const givenApples = generateRandomNumber(Math.min(10, numApples));
                questions.add(JSON.stringify({
                    question: `לדנה היו ${numApples} תפוחים. היא נתנה ${givenApples} לחברתה. כמה נשארו לה?`,
                    answer: Math.abs(numApples - givenApples)
                }));
            } else {
                const numBalls = generateRandomNumber(10) + 1;
                const extraBalls = generateRandomNumber(10);
                questions.add(JSON.stringify({
                    question: `ליוסי יש ${numBalls} כדורים. חברו נתן לו ${extraBalls} נוספים. כמה יש לו עכשיו?`,
                    answer: numBalls + extraBalls
                }));
            }
        }

        return Array.from(questions).map((q) => JSON.parse(q));
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
