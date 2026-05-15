// =========================
// GLOBAL STATE
// =========================
window.state = window.state || {
  firstConfession: false,
  saveDuration: 0,
  answers: {},
  notes: {},
  customSins: []
};

// =========================
// INIT
// =========================
document.addEventListener("DOMContentLoaded", async () => {
  await loadJSON();

  renderIntro();
  bindUI();
});

// =========================
// LOAD JSON
// =========================
async function loadJSON() {
  const res = await fetch("../data/sirdsapzinas-izmeklesana.json");

  if (!res.ok) {
    console.error("JSON load failed");
    return;
  }

  window.appData = await res.json();

  console.log("✔ appData ielādēts");
}

// =========================
// INTRO
// =========================
function renderIntro() {

  if (!window.appData?.content?.intro) {
    setTimeout(renderIntro, 100);
    return;
  }

  const intro = window.appData.content.intro;

  document.getElementById("intro-title").innerText = intro.title;

  const box = document.getElementById("intro-text");
  box.innerHTML = "";

  intro.text.forEach(t => {
    const p = document.createElement("p");
    p.innerText = t;
    box.appendChild(p);
  });
}

// =========================
// UI BINDINGS
// =========================
function bindUI() {

  document.getElementById("btnStart").addEventListener("click", () => {

    window.state.firstConfession =
      document.getElementById("firstConfession").checked;

    window.state.saveDuration =
      document.getElementById("saveDuration").value;

    goToPrayer();
  });

  document.getElementById("btnToQuestions")
    .addEventListener("click", goToQuestions);

  document.getElementById("btnGeneratePDF")
    .addEventListener("click", generatePDFData);

  document.getElementById("btnAddCustom")
    .addEventListener("click", addCustomSin);

  document.getElementById("btnClear")
    .addEventListener("click", () => {
      document.getElementById("clearModal").classList.remove("hidden");
    });

  document.getElementById("clearCancel")
    .addEventListener("click", () => {
      document.getElementById("clearModal").classList.add("hidden");
    });

  document.getElementById("clearContent")
    .addEventListener("click", () => {
      resetOnlyContent();
      document.getElementById("clearModal").classList.add("hidden");
    });

  document.getElementById("clearAll")
    .addEventListener("click", () => {
      resetAll();
      document.getElementById("clearModal").classList.add("hidden");
      goToIntro();
    });
}

// =========================
// RESET
// =========================
function resetOnlyContent() {
  window.state.answers = {};
  window.state.notes = {};
  window.state.customSins = [];
  renderQuestions();
}

function resetAll() {
  resetOnlyContent();

  window.state.firstConfession = false;
  window.state.saveDuration = 0;

  document.getElementById("firstConfession").checked = false;
  document.getElementById("saveDuration").value = "0";
}

// =========================
// NAVIGATION
// =========================
function goToPrayer() {

  if (!window.appData?.content?.preparation_prayer) return;

  show("screen-intro", false);
  show("screen-prayer", true);

  const block = window.appData.content.preparation_prayer;

  document.getElementById("prayer-title").innerText = block.title;

  const box = document.getElementById("prayer-text");
  box.innerHTML = "";

  block.text.forEach(t => {
    const p = document.createElement("p");
    p.innerText = t;
    box.appendChild(p);
  });

  box.appendChild(document.createElement("hr"));

  const prayer = block.prayer;

  const title = document.createElement("h3");
  title.innerText = prayer.title;
  box.appendChild(title);

  prayer.text.forEach(t => {
    const p = document.createElement("p");
    p.innerText = t;
    box.appendChild(p);
  });
}

function goToQuestions() {
  show("screen-prayer", false);
  show("screen-questions", true);
  renderQuestions();
}

function goToIntro() {
  show("screen-intro", true);
  show("screen-prayer", false);
  show("screen-questions", false);
}

function show(id, visible) {
  document.getElementById(id).style.display = visible ? "block" : "none";
}

// =========================
// QUESTIONS
// =========================
function renderQuestions() {

  if (!window.appData?.content?.commandments) return;

  const container = document.getElementById("questions-container");
  container.innerHTML = "";

  window.appData.content.commandments.forEach(cmd => {

    const section = document.createElement("div");
    section.className = "commandment";

    const h = document.createElement("h3");
    h.innerText = cmd.title;
    section.appendChild(h);

    cmd.questions.forEach(q => {

      const row = document.createElement("div");
      row.className = "question-row";

      const top = document.createElement("div");
      top.className = "question-top";

      const cb = document.createElement("input");
      cb.type = "checkbox";

      const label = document.createElement("span");
      label.innerText = " " + q.text;

      top.appendChild(cb);
      top.appendChild(label);

      const commentWrap = document.createElement("div");
      commentWrap.className = "comment-wrap";
      commentWrap.style.display = "none";

      const commentBox = document.createElement("textarea");
      commentBox.placeholder = "Komentārs...";

      const closeBtn = document.createElement("button");
      closeBtn.innerText = "✕";
      closeBtn.type = "button";

      commentWrap.appendChild(commentBox);
      commentWrap.appendChild(closeBtn);

      cb.addEventListener("change", (e) => {
        const checked = e.target.checked;

        window.state.answers[q.id] = checked;

        commentWrap.style.display = checked ? "flex" : "none";

        if (!checked) {
          commentBox.value = "";
          delete window.state.notes[q.id];
        }
      });

      commentBox.addEventListener("input", (e) => {
        window.state.notes[q.id] = e.target.value;
      });

      closeBtn.addEventListener("click", () => {
        commentBox.value = "";
        commentWrap.style.display = "none";
        delete window.state.notes[q.id];
      });

      row.appendChild(top);
      row.appendChild(commentWrap);
      section.appendChild(row);
    });

    container.appendChild(section);
  });
}

// =========================
// CUSTOM SIN
// =========================
function addCustomSin() {

  const container = document.getElementById("questions-container");

  const id = "custom_" + Date.now();

  const wrapper = document.createElement("div");
  wrapper.className = "question-row custom-sin";
  wrapper.dataset.id = id;

  const top = document.createElement("div");
  top.className = "question-top";

  const label = document.createElement("div");
  label.innerText = "Cits grēks:";
  label.style.fontWeight = "bold";

  const closeBtn = document.createElement("button");
  closeBtn.innerText = "✕";
  closeBtn.type = "button";

  const textarea = document.createElement("textarea");
  textarea.placeholder = "Apraksti grēku...";

  // 👉 SAVE TO STATE
  window.state.customSins.push({
    id,
    text: ""
  });

  textarea.addEventListener("input", (e) => {
    const item = window.state.customSins.find(s => s.id === id);
    if (item) item.text = e.target.value;
  });

  closeBtn.addEventListener("click", () => {
    wrapper.remove();
    window.state.customSins =
      window.state.customSins.filter(s => s.id !== id);
  });

  top.appendChild(label);
  top.appendChild(closeBtn);

  wrapper.appendChild(top);
  wrapper.appendChild(textarea);

  container.appendChild(wrapper);
}