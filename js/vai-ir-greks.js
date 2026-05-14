let data = [];
let shuffled = [];
let current = 0;

let score = 0;

let selectedA = null;
let selectedB = new Set();

let answered = false;

/* =========================
   START GAME
========================= */
async function startGame() {
  console.log("▶ startGame clicked");

  try {
    const res = await fetch("../data/vai-ir-greks.json");

    if (!res.ok) {
      throw new Error("Nevar ielādēt JSON failu: " + res.status);
    }

    const json = await res.json();

    // ✔️ atbalsta 2 formātus:
    // 1) [ ... ]
    // 2) { questions: [ ... ] }
    data = Array.isArray(json)
      ? json
      : json?.questions;

    if (!Array.isArray(data) || data.length === 0) {
      console.error("❌ JSON struktūra nav pareiza vai tukša:", json);
      return;
    }

    // ✔️ sajaucam jautājumus
    shuffled = data
      .slice()
      .sort(() => Math.random() - 0.5)
      .slice(0, 15);

    current = 0;
    score = 0;

    // ✔️ UI reset
    const setup = document.getElementById("setup");
    const result = document.getElementById("result");
    const game = document.getElementById("game");

    if (setup) setup.classList.add("flashcards__hidden");
    if (result) result.classList.add("flashcards__hidden");
    if (game) game.classList.remove("flashcards__hidden");

    // drošības fallback
    if (!game) {
      console.error("❌ #game elements nav atrasts HTML");
      return;
    }

    showQuestion();

  } catch (err) {
    console.error("❌ startGame kļūda:", err);
  }
}
/* =========================
   SHOW QUESTION
========================= */
function showQuestion() {
  answered = false;
  selectedA = null;
  selectedB = new Set();

  const q = shuffled[current];

  const game = document.getElementById("game");

  game.innerHTML = `
  <div class="flashcards__card">

    <div class="flashcards__topbar">
      <span id="counter">${current + 1} / ${shuffled.length}</span>
      <span id="percent">
        ${Math.round((score / (shuffled.length * 2)) * 100)}%
      </span>
    </div>

    <div class="flashcards__question">${q.situation}</div>

    <div class="flashcards__section">
      <div class="flashcards__title">A. Vai tas ir grēks?</div>
      <div id="aOptions" class="flashcards__yesno"></div>
    </div>

    <div class="flashcards__section">
      <div class="flashcards__title">B. Kāda ir pareizā rīcība?</div>
      <div id="bOptions" class="flashcards__answers"></div>
    </div>

  </div>

  <div id="feedbackArea"></div>

  <div id="actionRow" class="flashcards__action-row"></div>
`;

  setTimeout(() => {
    renderA(q);
    renderB(q);
    renderButton();
  }, 0);
}

/* =========================
   A (JĀ / NĒ)
========================= */
function renderA() {
  const aDiv = document.getElementById("aOptions");

  ["Jā", "Nē"].forEach(val => {
    const btn = document.createElement("button");
    btn.className = "flashcards__btn flashcards__yesno-btn";
    btn.innerText = val;

    btn.onclick = () => {
      if (answered) return;

      selectedA = val;

      document.querySelectorAll("#aOptions button")
        .forEach(b => b.classList.remove("flashcards__btn--selected"));

      btn.classList.add("flashcards__btn--selected");

      renderButton();
    };

    aDiv.appendChild(btn);
  });
}

/* =========================
   B OPTIONS
========================= */
function renderB(q) {
  const bDiv = document.getElementById("bOptions");

  const opts = [...q.actions].sort(() => Math.random() - 0.5);

  opts.forEach(opt => {
    const btn = document.createElement("button");
    btn.className = "flashcards__btn flashcards__btn--option";
    btn.innerText = opt.text;
    btn.dataset.text = opt.text;

    btn.onclick = () => {
      if (answered) return;

      if (selectedB.has(opt.text)) {
        selectedB.delete(opt.text);
        btn.classList.remove("flashcards__btn--selected");
      } else {
        selectedB.add(opt.text);
        btn.classList.add("flashcards__btn--selected");
      }

      renderButton();
    };

    bDiv.appendChild(btn);
  });
}

/* =========================
   BUTTON
========================= */
function renderButton() {
  const row = document.getElementById("actionRow");
  row.innerHTML = "";

  const btn = document.createElement("button");
  btn.className = "flashcards__btn flashcards__btn--primary";

  btn.innerText = answered ? "Tālāk" : "Pārbaudīt";

  btn.disabled = !answered && !(selectedA && selectedB.size > 0);

  btn.onclick = answered ? next : check;

  row.appendChild(btn);
}

/* =========================
   CHECK + COLORS FIX
========================= */
function check() {
  answered = true;

  const q = shuffled[current];

  const isSin = q.correctSin === "grēks";
  const userA = selectedA === "Jā";

  const allA = document.querySelectorAll("#aOptions button");
  const allB = document.querySelectorAll("#bOptions button");

  // A
  allA.forEach(btn => {
    const correct =
      (btn.innerText === "Jā" && isSin) ||
      (btn.innerText === "Nē" && !isSin);

    btn.classList.remove("flashcards__btn--selected");

    if (correct) {
      btn.classList.add("flashcards__btn--correct");
    } else if (btn.innerText === selectedA) {
      btn.classList.add("flashcards__btn--wrong");
    }
  });

  if (userA === isSin) score++;

  // B
  const correctTexts = q.actions
    .filter(a => a.correct)
    .map(a => a.text);

  allB.forEach(btn => {
    const text = btn.innerText;

    btn.classList.remove("flashcards__btn--selected");

    if (correctTexts.includes(text)) {
      btn.classList.add("flashcards__btn--correct");

      if (selectedB.has(text)) score++;
    } else if (selectedB.has(text)) {
      btn.classList.add("flashcards__btn--wrong");
    }
  });

  showExplanation(q);
  renderButton();
}

/* =========================
   EXPLANATION
========================= */
function showExplanation(q) {
  const area = document.getElementById("feedbackArea");

  area.innerHTML = `
    <div class="flashcards__feedback">
      <div class="flashcards__feedback-commandment">
        <strong>Grēka skaidrojums:</strong><br>
        ${q.sinExplanation}
      </div>

      <div class="flashcards__feedback-commandment">
        <strong>Rīcības skaidrojums:</strong><br>
        ${q.actionExplanation}
      </div>
    </div>
  `;
}

/* =========================
   NEXT
========================= */
function next() {
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
  document.getElementById("game").classList.add("flashcards__hidden");
  document.getElementById("result").classList.remove("flashcards__hidden");

  document.getElementById("finalScore").innerText =
  `Tavi punkti: ${score} no ${shuffled.length * 2}`;
}

/* =========================
   RESTART
========================= */
function restartSame() {
  startGame();
}

window.startGame = startGame;
window.restartSame = restartSame;

document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("startBtn");
  if (btn) btn.addEventListener("click", startGame);
});