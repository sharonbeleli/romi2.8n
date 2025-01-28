import React, { useState } from "react";

const generateRandomNumber = (max) => Math.floor(Math.random() * (max + 1));

const generateQuestions = () => {
  const questions = [];
  for (let i = 0; i < 3; i++) {
    let num1 = generateRandomNumber(25);
    let num2 = generateRandomNumber(25);
    questions.push({ question: `${num1} + ${num2}`, answer: num1 + num2, type: "addition" });
  }
  for (let i = 0; i < 3; i++) {
    let num1 = generateRandomNumber(25);
    let num2 = generateRandomNumber(25);
    questions.push({ question: `${num1} - ${num2}`, answer: num1 - num2, type: "subtraction" });
  }
  let numApples = generateRandomNumber(10) + 10;
  let givenApples = generateRandomNumber(5) + 1;
  questions.push({
    question: `לדנה היו ${numApples} תפוחים. היא נתנה ${givenApples} לחברתה. כמה נשארו לה?`,
    answer: numApples - givenApples,
    type: "word"
  });
  let numBalls = generateRandomNumber(10) + 1;
  let extraBalls = generateRandomNumber(10) + 1;
  questions.push({
    question: `ליוסי יש ${numBalls} כדורים. חברו נתן לו ${extraBalls} נוספים. כמה יש לו עכשיו?`,
    answer: numBalls + extraBalls,
    type: "word"
  });
  return questions.slice(0, 10);
};

export default function App() {
  const [questions, setQuestions] = useState(generateQuestions());
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [isFinished, setIsFinished] = useState(false);
  const [feedback, setFeedback] = useState("");

  const handleAnswerSubmit = () => {
    if (currentQuestionIndex >= questions.length) {
      setIsFinished(true);
      return;
    }

    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = parseInt(currentAnswer) === currentQuestion.answer;

    setFeedback(isCorrect ? "✔ תשובה נכונה! כל הכבוד!" : "✖ תשובה שגויה. נסה שוב.");

    setAnswers([...answers, { question: currentQuestion.question, userAnswer: currentAnswer, isCorrect }]);
    setCurrentAnswer("");

    if (isCorrect || feedback === "✖ תשובה שגויה. נסה שוב.") {
      if (currentQuestionIndex + 1 < questions.length) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setFeedback("");
      } else {
        setIsFinished(true);
      }
    }
  };

  if (isFinished) {
    const correctAnswers = answers.filter((ans) => ans.isCorrect).length;
    return (
      <div className="p-5 rtl text-center">
        <h1 className="text-3xl font-bold mb-6">סיכום התוצאות</h1>
        <table className="table-auto w-full border-collapse border border-gray-500 mx-auto">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-500 px-4 py-2">שאלה</th>
              <th className="border border-gray-500 px-4 py-2">תשובה שלך</th>
              <th className="border border-gray-500 px-4 py-2">נכון/שגוי</th>
            </tr>
          </thead>
          <tbody>
            {answers.map((ans, index) => (
              <tr key={index} className={ans.isCorrect ? "bg-green-100" : "bg-red-100"}>
                <td className="border border-gray-500 px-4 py-2 break-words">{ans.question}</td>
                <td className="border border-gray-500 px-4 py-2">{ans.userAnswer}</td>
                <td className="border border-gray-500 px-4 py-2">{ans.isCorrect ? "✔ נכון" : "✖ שגוי"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-6 text-lg font-bold">
          סיימת את המבחן! {correctAnswers} מתוך {questions.length} תשובות נכונות.
        </p>
        <button onClick={() => window.location.reload()} className="mt-4 p-2 bg-green-500 text-white rounded">
          התחל מחדש
        </button>
      </div>
    );
  }

  return (
    <div className="p-5 rtl text-center bg-gradient-to-r from-blue-500 via-green-500 to-blue-500 min-h-screen">
      <h1 className="text-4xl font-bold mb-6 text-white">אפליקציית תרגילי חשבון</h1>
      <div className="max-w-lg mx-auto bg-white p-5 shadow-2xl rounded-lg">
        <h2 className="text-2xl font-bold mb-4">שאלה {currentQuestionIndex + 1} מתוך {questions.length}</h2>
        <p className="mb-4 text-lg text-gray-700">{questions[currentQuestionIndex]?.question}</p>
        <input
          type="number"
          className="p-2 border w-full rounded-lg text-center text-xl"
          value={currentAnswer}
          onChange={(e) => setCurrentAnswer(e.target.value)}
          inputMode="numeric"
          placeholder="הקלד תשובה כאן"
        />
        <button
          onClick={handleAnswerSubmit}
          className="mt-4 p-3 bg-blue-600 text-white w-full rounded-lg hover:bg-blue-700"
        >
          בדוק תשובה
        </button>
        {feedback && (
          <p
            className="mt-4 font-bold text-lg"
            style={{ color: feedback.includes("✔") ? "green" : "red" }}
          >
            {feedback}
          </p>
        )}
      </div>
    </div>
  );
}
