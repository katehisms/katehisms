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
  const res = await fetch("../data/bausli-skaidrojumi.json");
  data = await res.json();

  shuffled = [...data].sort(() => Math.random() - 0.5);

  document.getElementById("setup").classList.add("flashcards__hidden");
  document.getElementById("result").classList.add("flashcards__hidden");
  document.getElementById("game").classList.remove("flashcards__hidden");

  current = 0;
  score = 0;

  showQuestion();
}

/* =========================
   QUESTION RENDER
========================= */
function showQuestion() {
  selected = null;
  answered = false;

  const q = shuffled[current];

  document.getElementById("question").innerText = q.commandment;
  document.getElementById("counter").innerText = `${current + 1} / ${shuffled.length}`;
  document.getElementById("percent").innerText =
    `${Math.round((score / shuffled.length) * 100)}%`;

  document.getElementById("feedback")?.remove();

  const optionsDiv = document.getElementById("options");
  optionsDiv.innerHTML = "";

  const opts = [...q.options].sort(() => Math.random() - 0.5);

  opts.forEach(opt => {
    const btn = document.createElement("button");
    btn.className = "flashcards__btn flashcards__btn--option";
    btn.innerText = opt;

    btn.onclick = () => selectOption(btn, opt);

    optionsDiv.appendChild(btn);
  });

  renderActionRow("idle");
}

/* =========================
   ACTION ROW (ONE ONLY)
========================= */
function getActionRow() {
  let row = document.getElementById("actionRow");

  if (!row) {
    row = document.createElement("div");
    row.className = "flashcards__action-row";
    row.id = "actionRow";
    document.getElementById("game").appendChild(row);
  }

  return row;
}

function renderActionRow(state) {
  const row = getActionRow();
  row.innerHTML = "";

  const checkBtn = document.createElement("button");
  checkBtn.className = "flashcards__btn flashcards__btn--primary";
  checkBtn.innerText = "Pārbaudīt";
  checkBtn.onclick = checkAnswer;

  const nextBtn = document.createElement("button");
  nextBtn.className = "flashcards__btn flashcards__btn--secondary";
  nextBtn.innerHTML = `Tālāk <span style="margin-left:6px;">➜</span>`;
  nextBtn.onclick = nextQuestion;

  if (state === "idle") {
    checkBtn.disabled = !selected;
    nextBtn.style.display = "none";
  }

  if (state === "checked") {
    checkBtn.style.display = "none";
    nextBtn.style.display = "block";
  }

  row.appendChild(checkBtn);
  row.appendChild(nextBtn);
}

/* =========================
   SELECT ANSWER
========================= */
function selectOption(btn, opt) {
  if (answered) return;

  selected = { btn, opt };

  document.querySelectorAll("#options button")
    .forEach(b => b.classList.remove("flashcards__btn--selected"));

  btn.classList.add("flashcards__btn--selected");

  renderActionRow("idle");
}

/* =========================
   CHECK ANSWER
========================= */
function checkAnswer() {
  if (!selected || answered) return;

  const q = shuffled[current];
  const buttons = document.querySelectorAll("#options button");

  answered = true;

  buttons.forEach(b => (b.disabled = true));

  const isCorrect = selected.opt === q.correct;

  buttons.forEach(b => {
    if (b.innerText === q.correct) {
      b.classList.add("flashcards__btn--correct");
    }
  });

  if (isCorrect) {
    selected.btn.classList.add("flashcards__btn--correct");
    score++;
  } else {
    selected.btn.classList.add("flashcards__btn--wrong");
  }

  const feedback = document.createElement("div");
  feedback.id = "feedback";
  feedback.className = "flashcards__feedback";
  feedback.innerText = isCorrect ? "✔ Pareizi!" : "✖ Nepareizi!";

  const row = getActionRow();
  document.getElementById("game").insertBefore(
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
   RESULT SCREEN
========================= */
function showResult() {
  document.getElementById("game").classList.add("flashcards__hidden");
  document.getElementById("result").classList.remove("flashcards__hidden");

  document.getElementById("finalScore").innerText =
    `Rezultāts: ${score} / ${shuffled.length}`;
}

/* =========================
   RESTART
========================= */
function restartSame() {
  startGame();
}

function goHome() {
  document.getElementById("result").classList.add("flashcards__hidden");
  document.getElementById("setup").classList.remove("flashcards__hidden");
}