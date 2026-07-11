// ===============================
// CẤU HÌNH BÀI THI
// ===============================

// Hiện tại dùng 8 câu để kiểm tra.
// Sau này muốn thi 80 câu thì đổi thành 80.
const NUMBER_OF_QUESTIONS = 8;

// Thời gian thi tính bằng giây.
// 5 phút = 5 × 60 = 300 giây.
const QUIZ_TIME = 5 * 60;

// Danh sách 4 file dữ liệu câu hỏi.
const DATA_FILES = [
  "data/chapter1.json",
];

// ===============================
// BIẾN DÙNG TRONG BÀI THI
// ===============================

let allQuestions = [];
let questions = [];

let currentQuestion = 0;
let userAnswers = [];

let timeLeft = QUIZ_TIME;
let timerInterval = null;

let quizStarted = false;
let quizSubmitted = false;


// ===============================
// BẮT ĐẦU BÀI THI
// ===============================

async function startQuiz() {
  if (quizStarted) {
    return;
  }

  quizStarted = true;
  quizSubmitted = false;

  const startButton = document.querySelector(
    '#start-screen button'
  );

  if (startButton) {
    startButton.disabled = true;
    startButton.textContent = "Đang tải câu hỏi...";
  }

  try {
    // Đọc toàn bộ dữ liệu từ 4 chương.
    allQuestions = await loadAllQuestions();

    if (allQuestions.length === 0) {
      throw new Error("Không tìm thấy câu hỏi trong các file JSON.");
    }

    // Kiểm tra dữ liệu câu hỏi.
    allQuestions = allQuestions.filter(isValidQuestion);

    if (allQuestions.length === 0) {
      throw new Error("Dữ liệu câu hỏi không đúng định dạng.");
    }

    // Random câu hỏi.
    questions = getRandomQuestions(
      allQuestions,
      NUMBER_OF_QUESTIONS
    );

    // Tạo mảng đáp án người dùng.
    userAnswers = new Array(questions.length).fill(null);

    currentQuestion = 0;
    timeLeft = QUIZ_TIME;

    // Ẩn màn hình bắt đầu.
    document
      .getElementById("start-screen")
      .classList.add("hidden");

    // Hiện màn hình làm bài.
    document
      .getElementById("quiz-screen")
      .classList.remove("hidden");

    // Cập nhật tổng số câu trên giao diện.
    updateQuizInformation();

    // Hiển thị câu đầu tiên.
    showQuestion();

    // Hiển thị thời gian ban đầu.
    displayTime();

    // Bắt đầu đồng hồ.
    timerInterval = setInterval(updateTimer, 1000);

  } catch (error) {
    console.error(error);

    alert(
      "Không tải được dữ liệu câu hỏi.\n\n" +
      "Kiểm tra lại 4 file trong thư mục data:\n" +
      "- chapter1.json\n" +
      "- chapter2.json\n" +
      "- chapter3.json\n" +
      "- chapter4.json\n\n" +
      "Chi tiết lỗi: " +
      error.message
    );

    quizStarted = false;

    if (startButton) {
      startButton.disabled = false;
      startButton.textContent = "Bắt đầu làm bài";
    }
  }
}


// ===============================
// ĐỌC DỮ LIỆU TỪ 4 FILE JSON
// ===============================

async function loadAllQuestions() {
  const requests = DATA_FILES.map(async function (file) {
    const response = await fetch(file, {
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(
        `Không đọc được file ${file}. Mã lỗi: ${response.status}`
      );
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      throw new Error(
        `File ${file} phải chứa một mảng câu hỏi JSON.`
      );
    }

    return data;
  });

  const chapterData = await Promise.all(requests);

  // Gộp câu hỏi của 4 chương thành 1 mảng.
  return chapterData.flat();
}


// ===============================
// KIỂM TRA ĐỊNH DẠNG CÂU HỎI
// ===============================

function isValidQuestion(item) {
  return (
    item &&
    typeof item.question === "string" &&
    item.question.trim() !== "" &&
    Array.isArray(item.options) &&
    item.options.length >= 2 &&
    Number.isInteger(item.answer) &&
    item.answer >= 0 &&
    item.answer < item.options.length
  );
}


// ===============================
// RANDOM CÂU HỎI
// ===============================

function getRandomQuestions(questionList, numberOfQuestions) {
  const shuffledQuestions = shuffleArray([...questionList]);

  const actualNumber = Math.min(
    numberOfQuestions,
    shuffledQuestions.length
  );

  return shuffledQuestions.slice(0, actualNumber);
}


// Trộn mảng bằng thuật toán Fisher-Yates.
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const randomIndex = Math.floor(
      Math.random() * (i + 1)
    );

    [array[i], array[randomIndex]] =
      [array[randomIndex], array[i]];
  }

  return array;
}


// ===============================
// CẬP NHẬT THÔNG TIN BÀI THI
// ===============================

function updateQuizInformation() {
  const startScreen = document.getElementById("start-screen");

  if (startScreen) {
    const paragraph = startScreen.querySelector("p");

    if (paragraph) {
      paragraph.innerHTML = `
        Số câu: <b>${NUMBER_OF_QUESTIONS} câu</b><br>
        Thời gian: <b>${Math.floor(QUIZ_TIME / 60)} phút</b>
      `;
    }
  }
}


// ===============================
// HIỂN THỊ CÂU HỎI
// ===============================

function showQuestion() {
  if (
    questions.length === 0 ||
    currentQuestion < 0 ||
    currentQuestion >= questions.length
  ) {
    return;
  }

  const question = questions[currentQuestion];

  // Hiển thị số thứ tự câu.
  document.getElementById("question-number").textContent =
    `Câu ${currentQuestion + 1}/${questions.length}`;

  // Hiển thị nội dung câu hỏi.
  document.getElementById("question-text").textContent =
    question.question;

  // Cập nhật thanh tiến trình.
  const progressPercent =
    ((currentQuestion + 1) / questions.length) * 100;

  document.getElementById("progress-bar").style.width =
    `${progressPercent}%`;

  // Hiển thị đáp án.
  const answerOptions =
    document.getElementById("answer-options");

  answerOptions.innerHTML = "";

  question.options.forEach(function (option, index) {
    const label = document.createElement("label");

    label.className = "option";

    const input = document.createElement("input");

    input.type = "radio";
    input.name = "answer";
    input.value = index;

    if (userAnswers[currentQuestion] === index) {
      input.checked = true;
    }

    input.addEventListener("change", function () {
      userAnswers[currentQuestion] = index;
    });

    const optionText = document.createElement("span");

    optionText.textContent =
      `${String.fromCharCode(65 + index)}. ${option}`;

    label.appendChild(input);
    label.appendChild(optionText);

    answerOptions.appendChild(label);
  });

  // Hiện nút nộp bài ở câu cuối.
  const submitButton =
    document.getElementById("submit-button");

  if (currentQuestion === questions.length - 1) {
    submitButton.classList.remove("hidden");
  } else {
    submitButton.classList.add("hidden");
  }

  updateNavigationButtons();
}


// ===============================
// NÚT CÂU TRƯỚC VÀ CÂU TIẾP
// ===============================

function updateNavigationButtons() {
  const buttons = document.querySelectorAll(
    "#quiz-screen .buttons button"
  );

  const previousButton = buttons[0];
  const nextButton = buttons[1];

  if (previousButton) {
    previousButton.disabled = currentQuestion === 0;
  }

  if (nextButton) {
    nextButton.disabled =
      currentQuestion === questions.length - 1;
  }
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


// ===============================
// LƯU ĐÁP ÁN ĐANG CHỌN
// ===============================

function saveAnswer() {
  const selectedAnswer = document.querySelector(
    'input[name="answer"]:checked'
  );

  if (selectedAnswer) {
    userAnswers[currentQuestion] =
      Number(selectedAnswer.value);
  }
}


// ===============================
// ĐỒNG HỒ ĐẾM NGƯỢC
// ===============================

function updateTimer() {
  timeLeft--;

  displayTime();

  if (timeLeft <= 0) {
    clearInterval(timerInterval);
    timerInterval = null;

    alert("Đã hết thời gian. Hệ thống sẽ tự động nộp bài.");

    submitQuiz(true);
  }
}


function displayTime() {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  document.getElementById("timer").textContent =
    `${String(minutes).padStart(2, "0")}:` +
    `${String(seconds).padStart(2, "0")}`;
}


// ===============================
// NỘP BÀI
// ===============================

function submitQuiz(autoSubmit = false) {
  if (quizSubmitted) {
    return;
  }

  saveAnswer();

  if (!autoSubmit) {
    const unansweredQuestions =
      userAnswers.filter(function (answer) {
        return answer === null;
      }).length;

    if (unansweredQuestions > 0) {
      const confirmSubmit = confirm(
        `Bạn còn ${unansweredQuestions} câu chưa trả lời.\n` +
        "Bạn vẫn muốn nộp bài?"
      );

      if (!confirmSubmit) {
        return;
      }
    }
  }

  quizSubmitted = true;

  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }

  let correctAnswers = 0;

  questions.forEach(function (question, index) {
    if (userAnswers[index] === question.answer) {
      correctAnswers++;
    }
  });

  const percentage = Math.round(
    (correctAnswers / questions.length) * 100
  );

  document
    .getElementById("quiz-screen")
    .classList.add("hidden");

  document
    .getElementById("result-screen")
    .classList.remove("hidden");

  document.getElementById("score").textContent =
    `${correctAnswers}/${questions.length}`;

  document.getElementById("result-message").textContent =
    getResultMessage(
      correctAnswers,
      questions.length,
      percentage
    );

  showReview();
}


// ===============================
// THÔNG BÁO KẾT QUẢ
// ===============================

function getResultMessage(
  correctAnswers,
  totalQuestions,
  percentage
) {
  let evaluation = "";

  if (percentage >= 90) {
    evaluation = "Xuất sắc!";
  } else if (percentage >= 80) {
    evaluation = "Rất tốt!";
  } else if (percentage >= 70) {
    evaluation = "Khá tốt.";
  } else if (percentage >= 50) {
    evaluation = "Đạt mức trung bình.";
  } else {
    evaluation = "Bạn nên ôn tập thêm.";
  }

  return (
    `Bạn trả lời đúng ${correctAnswers}/${totalQuestions} câu, ` +
    `đạt ${percentage}%. ${evaluation}`
  );
}


// ===============================
// XEM LẠI ĐÁP ÁN
// ===============================

function showReview() {
  const review = document.getElementById("review");

  review.innerHTML = "<h3>Xem lại đáp án</h3>";

  questions.forEach(function (question, index) {
    const item = document.createElement("div");

    item.className = "review-item";

    const selectedAnswerIndex = userAnswers[index];

    const isCorrect =
      selectedAnswerIndex === question.answer;

    const selectedText =
      selectedAnswerIndex === null
        ? "Chưa trả lời"
        : question.options[selectedAnswerIndex];

    const correctText =
      question.options[question.answer];

    const title = document.createElement("b");

    title.textContent =
      `Câu ${index + 1}: ${question.question}`;

    const result = document.createElement("p");

    result.className =
      isCorrect ? "correct" : "wrong";

    result.textContent =
      isCorrect ? "✅ Đúng" : "❌ Sai";

    const selected = document.createElement("p");

    selected.textContent =
      `Bạn chọn: ${selectedText}`;

    const correct = document.createElement("p");

    correct.innerHTML =
      `Đáp án đúng: <b>${escapeHtml(correctText)}</b>`;

    item.appendChild(title);
    item.appendChild(result);
    item.appendChild(selected);
    item.appendChild(correct);

    review.appendChild(item);
  });
}


// ===============================
// BẢO VỆ NỘI DUNG HIỂN THỊ
// ===============================

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
