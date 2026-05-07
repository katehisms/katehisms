let current = 0;
let score = 0;

let data = [];
let shuffled = [];

let selected = null;
let answered = false;

/* =========================
   START GAME
========================= */

async function startGame() {
  const res = await fetch("../data/kas-greko.json");
  data = await res.json();

  shuffled = [...data].sort(() => Math.random() - 0.5);

  current = 0;
  score = 0;

  document.getElementById("setup").classList.add("flashcards__hidden");
  document.getElementById("result").classList.add("flashcards__hidden");
  document.getElementById("game").classList.remove("flashcards__hidden");

  showQuestion();
}

/* =========================
   SHOW QUESTION
========================= */

function showQuestion() {
  selected = null;
  answered = false;

  const q = shuffled[current];

  document.getElementById("question").innerText = q.question;

  document.getElementById("counter").innerText =
    `${current + 1} / ${shuffled.length}`;

  document.getElementById("percent").innerText =
    `${Math.round((score / shuffled.length) * 100)}%`;

  document.getElementById("feedback")?.remove();

  const optionsDiv = document.getElementById("options");
  optionsDiv.innerHTML = "";

  const opts = [...q.options].sort(() => Math.random() - 0.5);

  opts.forEach(opt => {
    const btn = document.createElement("button");

    btn.className =
      "flashcards__btn flashcards__btn--option";

    btn.innerText = opt;

    btn.onclick = () => selectOption(btn, opt);

    optionsDiv.appendChild(btn);
  });

  renderActionRow("idle");
}

/* =========================
   ACTION ROW
========================= */

function getActionRow() {
  let row = document.getElementById("actionRow");

  if (!row) {
    row = document.createElement("div");

    row.id = "actionRow";
    row.className = "flashcards__action-row";

    document.getElementById("game").appendChild(row);
  }

  return row;
}

function renderActionRow(state) {
  const row = getActionRow();

  row.innerHTML = "";

  /* CHECK BUTTON */

  if (state === "idle") {
    const checkBtn = document.createElement("button");

    checkBtn.className =
      "flashcards__btn flashcards__btn--primary";

    checkBtn.innerText = "Pārbaudīt";

    checkBtn.disabled = !selected;

    checkBtn.onclick = checkAnswer;

    row.appendChild(checkBtn);
  }

  /* NEXT BUTTON */

  if (state === "checked") {
    const nextBtn = document.createElement("button");

    nextBtn.className =
      "flashcards__btn flashcards__btn--secondary";

    nextBtn.innerHTML =
      `Tālāk <span style="margin-left:6px;">➜</span>`;

    nextBtn.onclick = nextQuestion;

    row.appendChild(nextBtn);
  }
}

/* =========================
   SELECT OPTION
========================= */

function selectOption(btn, opt) {
  if (answered) return;

  selected = { btn, opt };

  document.querySelectorAll("#options button")
    .forEach(b =>
      b.classList.remove("flashcards__btn--selected")
    );

  btn.classList.add("flashcards__btn--selected");

  renderActionRow("idle");
}

/* =========================
   CHECK ANSWER
========================= */

function checkAnswer() {
  if (!selected || answered) return;

  answered = true;

  const q = shuffled[current];

  const buttons =
    document.querySelectorAll("#options button");

  buttons.forEach(btn => {
    btn.disabled = true;

    if (btn.innerText === q.correct) {
      btn.classList.add("flashcards__btn--correct");
    }
  });

  const isCorrect =
    selected.opt === q.correct;

  if (isCorrect) {
    score++;

    selected.btn.classList.add(
      "flashcards__btn--correct"
    );
  } else {
    selected.btn.classList.add(
      "flashcards__btn--wrong"
    );
  }

  /* FEEDBACK */

  const feedback = document.createElement("div");

  feedback.id = "feedback";

  feedback.className =
  `flashcards__feedback ${
    isCorrect
      ? "flashcards__feedback--correct"
      : "flashcards__feedback--wrong"
  }`;

  feedback.innerHTML = `
    <div class="
  flashcards__feedback-result
  ${
    isCorrect
      ? "flashcards__feedback-result--correct"
      : "flashcards__feedback-result--wrong"
  }
">
  ${isCorrect ? "✔ Pareizi!" : "✖ Nepareizi!"}
</div>

    <div class="flashcards__feedback-commandment">
      <strong>${q.id}. bauslis:</strong>
      ${q.commandment}
    </div>

    <div class="flashcards__feedback-meaning">
      ${q.meaning}
    </div>
  `;

  document.getElementById("game")
    .insertBefore(
      feedback,
      document.getElementById("actionRow")
    );

  renderActionRow("checked");
}

/* =========================
   NEXT QUESTION
========================= */

function nextQuestion() {
  current++;

  if (current >= shuffled.length) {
    showResult();
    return;
  }

  showQuestion();
}

/* =========================
   RESULT
========================= */

function showResult() {
  document.getElementById("game")
    .classList.add("flashcards__hidden");

  document.getElementById("result")
    .classList.remove("flashcards__hidden");

  document.getElementById("finalScore")
    .innerText =
      `Rezultāts: ${score} / ${shuffled.length}`;
}

/* =========================
   RESTART
========================= */

function restartSame() {
  startGame();
}

function goHome() {
  document.getElementById("result")
    .classList.add("flashcards__hidden");

  document.getElementById("setup")
    .classList.remove("flashcards__hidden");
}