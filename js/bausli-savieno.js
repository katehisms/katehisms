
const commandments = [
  "Tev nebūs citus dievus turēt līdzās manim.",
  "Tev nebūs Kunga, sava Dieva, vārdu nelietīgi valkāt.",
  "Tev būs svēto dienu svētīt.",
  "Tev būs godāt savu tēvu un māti.",
  "Tev nebūs nokaut.",
  "Tev nebūs laulību pārkāpt.",
  "Tev nebūs zagt.",
  "Tev nebūs nepatiesu liecību dot pret savu tuvāko.",
  "Tev nebūs iekārot sava sievu.",
  "Tev nebūs iekārot nevienu lietu, kas pieder tavam tuvākam."
];

let selected = null;

const slots = document.getElementById("slots");
const pool = document.getElementById("pool");
const layout = document.querySelector(".match-layout");
const message = document.createElement("div");
message.className = "message";

const checkBtn = document.createElement("button");
checkBtn.className = "check-btn";
checkBtn.innerText = "Pārbaudīt";
checkBtn.disabled = true;

const restartBtn = document.createElement("button");
restartBtn.className = "restart-btn";
restartBtn.innerText = "Spēlēt vēlreiz";

document.body.appendChild(message);
document.body.appendChild(checkBtn);
document.body.appendChild(restartBtn);

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

/* =========================
   POOL
========================= */

function renderPool(list) {
  pool.innerHTML = "";

  list.forEach(text => {
    const el = document.createElement("div");
    el.className = "item";
    el.innerText = text;

    el.onclick = () => {
      selected = { text, el };

      document.querySelectorAll(".item").forEach(i =>
        i.classList.remove("selected")
      );

      el.classList.add("selected");
    };

    pool.appendChild(el);
  });
}

/* =========================
   SLOTS
========================= */

const slotEls = [];

for (let i = 0; i < 10; i++) {
  const slot = document.createElement("div");
  slot.className = "slot";
  slot.dataset.correct = commandments[i];
  slot.dataset.value = "";

  slot.innerHTML = `
    <span class="num">${i + 1}.</span>
    <span class="value">— tukšs —</span>
    <button>×</button>
  `;

  const valueEl = slot.querySelector(".value");
  const removeBtn = slot.querySelector("button");

  slot.onclick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!selected) return;

    if (slot.dataset.value) {
      returnToPool(slot.dataset.value);
    }

    slot.dataset.value = selected.text;
    valueEl.innerText = selected.text;

    slot.classList.add("filled");

    selected.el.remove();
    selected = null;

    updateState();
  };

  removeBtn.onclick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!slot.dataset.value) return;

    returnToPool(slot.dataset.value);

    slot.dataset.value = "";
    valueEl.innerText = "— tukšs —";

    slot.classList.remove("filled", "correct", "wrong");

    updateState();
  };

  slots.appendChild(slot);
  slotEls.push(slot);
}

/* =========================
   RETURN TO POOL
========================= */

function returnToPool(text) {
  const el = document.createElement("div");
  el.className = "item";
  el.innerText = text;

  el.onclick = () => {
    selected = { text, el };

    document.querySelectorAll(".item").forEach(i =>
      i.classList.remove("selected")
    );

    el.classList.add("selected");
  };

  pool.appendChild(el);
}

/* =========================
   STATE CONTROL
========================= */

function updateState() {
  const filled = slotEls.every(s => s.dataset.value !== "");

  if (filled) {
    layout.classList.add("single");
    checkBtn.disabled = false;
    message.innerText = "";
  } else {
    layout.classList.remove("single");
    checkBtn.disabled = true;
  }
}

/* =========================
   CHECK
========================= */

checkBtn.onclick = () => {
  let correct = 0;

  slotEls.forEach((slot, i) => {
    const val = slot.dataset.value;

    if (!val) return;

    if (val === commandments[i]) {
      slot.classList.add("correct");
      slot.classList.remove("wrong");
      correct++;
    } else {
      slot.classList.add("wrong");
      slot.classList.remove("correct");
    }
  });

  if (correct === 10) {
    message.className = "message success";
    message.innerText = "🎉 Tu visu paveici pareizi!";
  } else {
    message.className = "message error";
    message.innerText = "Ir kļūdas — izlabo un mēģini vēlreiz.";
  }
};

/* =========================
   RESTART
========================= */

restartBtn.onclick = () => {
  location.reload();
};

/* INIT */
renderPool(shuffle(commandments));