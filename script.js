const questions = [
  {
    question: "Công thức tính OEE đúng là gì?",
    options: [
      "Availability × Performance × Quality",
      "MTBF × MTTR × Quality",
      "Accuracy × Precision",
      "Reliability × Failure"
    ],
    answer: 0
  },
  {
    question: "MTBF có ý nghĩa là gì?",
    options: [
      "Thời gian sửa chữa trung bình",
      "Thời gian trung bình giữa các lần hỏng",
      "Tỷ lệ sản phẩm đạt",
      "Thời gian dừng máy"
    ],
    answer: 1
  },
  {
    question: "MTTR có ý nghĩa là gì?",
    options: [
      "Thời gian sửa chữa trung bình",
      "Thời gian giữa các lần hỏng",
      "Hiệu suất thiết bị",
      "Tỷ lệ sản phẩm lỗi"
    ],
    answer: 0
  },
  {
    question: "Mối quan hệ đúng giữa R(t) và F(t) là gì?",
    options: [
      "R(t) × F(t) = 1",
      "R(t) + F(t) = 1",
      "R(t) − F(t) = 1",
      "R(t) = F(t)"
    ],
    answer: 1
  },
  {
    question: "Gage R&R nhỏ hơn mức nào thường được xem là tốt?",
    options: [
      "5%",
      "10%",
      "20%",
      "30%"
    ],
    answer: 1
  }
];

let currentQuestion = 0;
let userAnswers = new Array(questions.length).fill(null);

let timeLeft = 300;
let timerInterval;

function startQuiz() {
  document.getElementById("start-screen").classList.add("hidden");
  document.getElementById("quiz-screen").classList.remove("hidden");

  showQuestion();

  timerInterval = setInterval(updateTimer, 1000);
}

function showQuestion() {
  const question = questions[currentQuestion];

  document.getElementById("question-number").textContent =
    `Câu ${currentQuestion + 1}/${questions.length}`;

  document.getElementById("question-text").textContent =
    question.question;

  document.getElementById("progress-bar").style.width =
    `${((currentQuestion + 1) / questions.length) * 100}%`;

  const answerOptions = document.getElementById("answer-options");

  answerOptions.innerHTML = "";

  question.options.forEach((option, index) => {
    const label = document.createElement("label");

    label.className = "option";

    label.innerHTML = `
      <input
        type="radio"
        name="answer"
        value="${index}"
        ${userAnswers[currentQuestion] === index ? "checked" : ""}
      >

      ${String.fromCharCode(65 + index)}. ${option}
    `;

    label.querySelector("input").addEventListener("change", function () {
      userAnswers[currentQuestion] = index;
    });

    answerOptions.appendChild(label);
  });

  document.getElementById("submit-button").classList.toggle(
    "hidden",
    currentQuestion !== questions.length - 1
  );
}

function nextQuestion() {
  saveAnswer();

  if (currentQuestion < questions.length - 1) {
    currentQuestion++;
    showQuestion();
  }
}

function previousQuestion() {
  saveAnswer();

  if (currentQuestion > 0) {
    currentQuestion--;
    showQuestion();
  }
}

function saveAnswer() {
  const selectedAnswer = document.querySelector(
    'input[name="answer"]:checked'
  );

  if (selectedAnswer) {
    userAnswers[currentQuestion] = Number(selectedAnswer.value);
  }
}

function updateTimer() {
  timeLeft--;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  document.getElementById("timer").textContent =
    `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  if (timeLeft <= 0) {
    submitQuiz();
  }
}

function submitQuiz() {
  saveAnswer();

  clearInterval(timerInterval);

  let correctAnswers = 0;

  questions.forEach((question, index) => {
    if (userAnswers[index] === question.answer) {
      correctAnswers++;
    }
  });

  document.getElementById("quiz-screen").classList.add("hidden");
  document.getElementById("result-screen").classList.remove("hidden");

  document.getElementById("score").textContent =
    `${correctAnswers}/${questions.length}`;

  const percentage = Math.round(
    correctAnswers / questions.length * 100
  );

  document.getElementById("result-message").textContent =
    `Bạn trả lời đúng ${percentage}% số câu hỏi.`;

  showReview();
}

function showReview() {
  const review = document.getElementById("review");

  review.innerHTML = "<h3>Xem lại đáp án</h3>";

  questions.forEach((question, index) => {
    const item = document.createElement("div");

    item.className = "review-item";

    const isCorrect =
      userAnswers[index] === question.answer;

    const selectedText =
      userAnswers[index] === null
        ? "Chưa trả lời"
        : question.options[userAnswers[index]];

    item.innerHTML = `
      <b>Câu ${index + 1}: ${question.question}</b>

      <p class="${isCorrect ? "correct" : "wrong"}">
        ${isCorrect ? "✅ Đúng" : "❌ Sai"}
      </p>

      <p>Bạn chọn: ${selectedText}</p>

      <p>
        Đáp án đúng:
        <b>${question.options[question.answer]}</b>
      </p>
    `;

    review.appendChild(item);
  });
}
