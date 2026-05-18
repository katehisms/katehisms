let questions = [];
let currentIndex = 0;
let score = 0;

// ---------- UNIQUE SAVE KEY ----------
const SAVE_KEY =
  "flashcards_" + window.location.pathname;

// ---------- LOAD ALL DATA ----------
async function loadAllData() {

  const eksamens =
    await fetch("../data/eksamens.json")
      .then(r => r.json());

  const dievs =
    await fetch("../data/dievs.json")
      .then(r => r.json());

  const bausli =
    await fetch("../data/bausli.json")
      .then(r => r.json());

  const sakramenti =
    await fetch("../data/sakramenti.json")
      .then(r => r.json());

  let answerMap = {};

  function collect(data) {
    data.sections.forEach(s =>
      s.groups.forEach(g =>
        g.items.forEach(i => {
          answerMap[i.nr] = i.a;
        })
      )
    );
  }

  collect(dievs);
  collect(bausli);
  collect(sakramenti);

  return { eksamens, answerMap };
}

// ---------- GENERATE ANSWER ----------
function buildAnswer(q, map) {

  let parts = [];

  if (q.answerNrs && q.answerNrs.length > 0) {

    q.answerNrs.forEach(id => {
      if (map[id]) {
        parts.push(map[id]);
      }
    });
  }

  if (q.extraAnswer) {
    parts.push(q.extraAnswer);
  }

  return parts.join("\n\n");
}

// ---------- SHUFFLE ----------
function shuffle(arr) {
  return arr.sort(() => Math.random() - 0.5);
}

// ---------- SAVE GAME ----------
function saveGame() {

  const saveData = {
    questions,
    currentIndex,
    score
  };

  localStorage.setItem(
    SAVE_KEY,
    JSON.stringify(saveData)
  );
}

// ---------- LOAD GAME ----------
function loadGame() {

  const raw =
    localStorage.getItem(SAVE_KEY);

  if (!raw) return;

  const saveData = JSON.parse(raw);

  questions = saveData.questions;
  currentIndex = saveData.currentIndex;
  score = saveData.score;

  hideAllScreens();

  document
    .getElementById("game")
    .classList.remove("flashcards__hidden");

  showQuestion();
}

// ---------- CLEAR SAVE ----------
function clearSave() {
  localStorage.removeItem(SAVE_KEY);
}

// ---------- HIDE ALL ----------
function hideAllScreens() {

  document
    .getElementById("intro")
    .classList.add("flashcards__hidden");

  document
    .getElementById("setup")
    .classList.add("flashcards__hidden");

  document
    .getElementById("game")
    .classList.add("flashcards__hidden");

  document
    .getElementById("result")
    .classList.add("flashcards__hidden");
}

// ---------- START ----------
async function startGame() {

  let countValue =
    document.getElementById("count").value;

  const { eksamens, answerMap } =
    await loadAllData();

  let selected;

  if (countValue === "all") {

    selected = shuffle(eksamens);

  } else {

    let count = parseInt(countValue);

    selected =
      shuffle(eksamens).slice(0, count);
  }

  questions = selected.map(q => ({
    q: q.q,
    a: buildAnswer(q, answerMap)
  }));

  currentIndex = 0;
  score = 0;

  saveGame();

  hideAllScreens();

  document
    .getElementById("game")
    .classList.remove("flashcards__hidden");

  showQuestion();
}

// ---------- SHOW QUESTION ----------
function showQuestion() {

  document
    .getElementById("answerCard")
    .classList.add("flashcards__hidden");

  document
    .getElementById("answer")
    .innerText = "";

  document
    .getElementById("answerButtons")
    .classList.add("flashcards__hidden");

  document
    .getElementById("showBtn")
    .classList.remove("flashcards__hidden");

  let q = questions[currentIndex];

  document
    .getElementById("counter")
    .innerText =
      `Jautājums ${currentIndex + 1}/${questions.length}`;

  document
    .getElementById("question")
    .innerText = q.q;

  updateProgress();
}

// ---------- SHOW ANSWER ----------
function showAnswer() {

  document
    .getElementById("answer")
    .innerText =
      questions[currentIndex].a;

  document
    .getElementById("answerCard")
    .classList.remove("flashcards__hidden");

  document
    .getElementById("showBtn")
    .classList.add("flashcards__hidden");

  document
    .getElementById("answerButtons")
    .classList.remove("flashcards__hidden");
}

// ---------- ANSWER ----------
function answer(type) {

  if (type === "zinaju") {
    score += 1;
  }

  if (type === "dalēji") {
    score += 0.5;
  }

  currentIndex++;

  saveGame();

  if (currentIndex >= questions.length) {
    endGame();
  } else {
    showQuestion();
  }
}

// ---------- PROGRESS ----------
function updateProgress() {

  let percent =
    (currentIndex / questions.length) * 100;

  document
    .getElementById("progressBar")
    .style.width = percent + "%";

  document
    .getElementById("percent")
    .innerText =
      Math.round(percent) + "%";
}

// ---------- END ----------
function endGame() {

  clearSave();

  hideAllScreens();

  document
    .getElementById("result")
    .classList.remove("flashcards__hidden");

  let percent =
    Math.round((score / questions.length) * 100);

  document
    .getElementById("finalScore")
    .innerText =
      `Rezultāts: ${score}/${questions.length} (${percent}%)`;
}

// ---------- RESTART ----------
function restartSame() {

  currentIndex = 0;
  score = 0;

  questions = shuffle(questions);

  saveGame();

  hideAllScreens();

  document
    .getElementById("game")
    .classList.remove("flashcards__hidden");

  showQuestion();
}

// ---------- HOME ----------
function goHome() {

  clearSave();

  hideAllScreens();

  document
    .getElementById("intro")
    .classList.remove("flashcards__hidden");

  document
    .getElementById("setup")
    .classList.remove("flashcards__hidden");
}

// ---------- SHOW CONTINUE MODAL ----------
function showContinueModal() {

  const modal = document.createElement("div");

  modal.innerHTML = `
    <div class="save-modal-overlay">

      <div class="save-modal">

        <h2>Turpināt spēli?</h2>

        <p>
          Atrasta nepabeigta spēle.
        </p>

        <div class="save-modal-buttons">

          <button id="continueGameBtn">
            Turpināt
          </button>

          <button id="newGameBtn">
            Jauna spēle
          </button>

        </div>

      </div>

    </div>
  `;

  document.body.appendChild(modal);

  document
    .getElementById("continueGameBtn")
    .addEventListener("click", () => {

      modal.remove();

      loadGame();
    });

  document
    .getElementById("newGameBtn")
    .addEventListener("click", () => {

      clearSave();

      modal.remove();
    });
}

// ---------- CHECK SAVED GAME ----------
window.addEventListener("load", () => {

  const raw =
    localStorage.getItem(SAVE_KEY);

  if (raw) {
    showContinueModal();
  }
});