let questions = [];
let currentIndex = 0;
let score = 0;
let selectedThemes = [];
let selectedCount = 10;

// ---------- HELPERS ----------
function extractQuestions(data) {
  let q = [];
  data.sections.forEach(s =>
    s.groups.forEach(g =>
      g.items.forEach(i =>
        q.push({ q: i.q, a: i.a })
      )
    )
  );
  return q;
}

function shuffle(arr) {
  return arr.sort(() => Math.random() - 0.5);
}

// ---------- LOAD ----------
async function loadThemes() {
  let all = [];

  if (selectedThemes.includes("dievs")) {
    const d = await fetch("../data/Dievs.json").then(r => r.json());
    all.push(...extractQuestions(d));
  }

  if (selectedThemes.includes("bausli")) {
    const b = await fetch("../data/bausli.json").then(r => r.json());
    all.push(...extractQuestions(b));
  }

  if (selectedThemes.includes("sakramenti")) {
    const s = await fetch("../data/sakramenti.json").then(r => r.json());
    all.push(...extractQuestions(s));
  }

  return all;
}

// ---------- START ----------
async function startGame() {
  selectedThemes = [];

  document.querySelectorAll("#setup input[type=checkbox]:checked")
    .forEach(cb => {
      if (cb.value) selectedThemes.push(cb.value);
    });

  if (document.getElementById("all").checked) {
    selectedThemes = ["dievs", "bausli", "sakramenti"];
  }

  if (selectedThemes.length === 0) {
    alert("Lūdzu izvēlies vismaz vienu tēmu!");
    return;
  }

  let countValue = document.getElementById("count").value;

  let all = await loadThemes();

  // 👉 "Visi" režīms
  if (countValue === "all") {
    questions = shuffle(all);
  } else {
    selectedCount = parseInt(countValue);
    questions = shuffle(all).slice(0, Math.min(selectedCount, all.length));
  }

  currentIndex = 0;
  score = 0;

  // 👉 RESET UI
  document.getElementById("answer").innerText = "";
  document.getElementById("answerCard").classList.add("flashcards__hidden");

  document.getElementById("intro").classList.add("flashcards__hidden");
  document.getElementById("setup").classList.add("flashcards__hidden");
  document.getElementById("game").classList.remove("flashcards__hidden");

  showQuestion();
}

// ---------- GAME ----------
function showQuestion() {
  // 👉 paslēp atbildi
  document.getElementById("answerCard").classList.add("flashcards__hidden");

  // 👉 iztīra veco atbildi
  document.getElementById("answer").innerText = "";

  // 👉 pogu stāvoklis
  document.getElementById("answerButtons").classList.add("flashcards__hidden");
  document.getElementById("showBtn").classList.remove("flashcards__hidden");

  let q = questions[currentIndex];

  document.getElementById("counter").innerText =
    `Jautājums ${currentIndex + 1}/${questions.length}`;

  document.getElementById("question").innerText = q.q;

  updateProgress();
}

// ---------- SHOW ANSWER ----------
function showAnswer() {
  document.getElementById("answer").innerText =
    questions[currentIndex].a;

  document.getElementById("answerCard").classList.remove("flashcards__hidden");
  document.getElementById("showBtn").classList.add("flashcards__hidden");
  document.getElementById("answerButtons").classList.remove("flashcards__hidden");
}

// ---------- ANSWER ----------
function answer(type) {
  if (type === "zinaju") score += 1;
  if (type === "dalēji") score += 0.5;

  currentIndex++;

  if (currentIndex >= questions.length) {
    endGame();
  } else {
    showQuestion();
  }
}

// ---------- PROGRESS ----------
function updateProgress() {
  let percent = (currentIndex / questions.length) * 100;

  document.getElementById("progressBar").style.width = percent + "%";
  document.getElementById("percent").innerText =
    Math.round(percent) + "%";
}

// ---------- END ----------
function endGame() {
  document.getElementById("game").classList.add("flashcards__hidden");
  document.getElementById("result").classList.remove("flashcards__hidden");

  let percent = Math.round((score / questions.length) * 100);

  document.getElementById("finalScore").innerText =
    `Rezultāts: ${score}/${questions.length} (${percent}%)`;
}

// ---------- RESTART ----------
function restartSame() {
  currentIndex = 0;
  score = 0;

  questions = shuffle(questions);

  document.getElementById("result").classList.add("flashcards__hidden");
  document.getElementById("game").classList.remove("flashcards__hidden");

  showQuestion();
}

// ---------- HOME ----------
function goHome() {
  document.getElementById("result").classList.add("flashcards__hidden");
  document.getElementById("setup").classList.remove("flashcards__hidden");
}