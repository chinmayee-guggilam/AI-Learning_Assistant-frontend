import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function QuizPage() {
  const { id } = useParams(); // chatId
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const API = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchQuiz = async () => {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/quiz/${id}`, {
        headers: { Authorization: token },
      });
      const data = await res.json();
      setQuestions(data.questions || []);
    };
    fetchQuiz();
  }, [id]);

  const handleSelect = (qIndex, option) => {
    setAnswers((prev) => ({ ...prev, [qIndex]: option }));
  };

  const handleSubmit = async () => {
  const score = getScore();
  setSubmitted(true);

  try {
    const token = localStorage.getItem("token");
    await fetch(`${API}/api/user/update-quiz`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
      body: JSON.stringify({ score }),
    });
  } catch (error) {
    console.error("Error updating quiz stats:", error);
  }
};

  const getCorrectAnswer = (q) => {
    const map = { A: 0, B: 1, C: 2, D: 3 };
    if (["A", "B", "C", "D"].includes(q.answer)) {
      return q.options[map[q.answer]];
    }
    return q.answer;
  };

  const getScore = () => {
    let score = 0;
    questions.forEach((q, idx) => {
      if (answers[idx] === getCorrectAnswer(q)) score++;
    });
    return score;
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">📝 Quiz Time!</h1>

      {questions.length === 0 && (
        <p className="text-gray-500">No quiz questions available.</p>
      )}

      {questions.map((q, i) => (
        <div key={i} className="mb-6 border-b pb-4">
          <p className="font-semibold mb-2">
            {i + 1}. {q.question}
          </p>
          {q.options.map((opt, j) => (
            <label key={j} className="block cursor-pointer">
              <input
                type="radio"
                name={`q${i}`}
                disabled={submitted}
                checked={answers[i] === opt}
                onChange={() => handleSelect(i, opt)}
                className="mr-2"
              />
              {opt}
            </label>
          ))}
          {submitted && (
            <p
              className={`mt-2 text-sm ${
                answers[i] === getCorrectAnswer(q)
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {answers[i] === getCorrectAnswer(q)
                ? "✅ Correct"
                : `❌ Incorrect (Correct: ${getCorrectAnswer(q)})`}
            </p>
          )}
        </div>
      ))}

      {questions.length > 0 && !submitted && (
        <button
          onClick={handleSubmit}
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded"
        >
          Submit Quiz
        </button>
      )}

      {submitted && (
        <div className="mt-4 space-y-4">
          <p className="text-lg font-bold">
            Your Score: {getScore()} / {questions.length}
          </p>
          <button
            onClick={() => navigate("/chat")}
            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded"
          >
            🔙 Go Back to Chat
          </button>
        </div>
      )}
    </div>
  );
}
