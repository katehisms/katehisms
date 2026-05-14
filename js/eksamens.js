let questions = [];
let currentIndex = 0;
let score = 0;

// ---------- LOAD ALL DATA ----------
async function loadAllData() {
  const eksamens = await fetch("../data/eksamens.json").then(r => r.json());
  const dievs = await fetch("../data/Dievs.json").then(r => r.json());
  const bausli = await fetch("../data/bausli.json").then(r => r.json());
  const sakramenti = await fetch("../data/sakramenti.json").then(r => r.json());

  // 👉 savāc VISAS atbildes vienā mapē pēc ID
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

// ---------- START ----------
async function startGame() {

  let countValue = document.getElementById("count").value;

  const { eksamens, answerMap } = await loadAllData();

  let selected;

  if (countValue === "all") {
    selected = shuffle(eksamens);
  } else {
    let count = parseInt(countValue);
    selected = shuffle(eksamens).slice(0, count);
  }

  // 👉 uzģenerē jautājumus ar atbildēm
  questions = selected.map(q => ({
    q: q.q,
    a: buildAnswer(q, answerMap)
  }));

  currentIndex = 0;
  score = 0;

  document.getElementById("intro").classList.add("flashcards__hidden");
  document.getElementById("setup").classList.add("flashcards__hidden");
  document.getElementById("game").classList.remove("flashcards__hidden");

  showQuestion();
}

// ---------- SHOW QUESTION ----------
function showQuestion() {

  document.getElementById("answerCard").classList.add("flashcards__hidden");
  document.getElementById("answer").innerText = "";

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