// =========================
let fontPromise = null;// STATE
// =========================
window.state = window.state || {
  firstConfession: false,
  saveDuration: 0,
  answers: {},
  notes: {},
  customSins: []
};

window.pdfData = null;   // greksudze.json
window.fontReady = false;

// =========================
// LOAD PDF STRUCTURE (greksudze.json)
// =========================
const pdfDataPromise = fetch("../data/greksudze.json")
  .then(r => r.json())
  .then(data => {
    window.pdfData = data;
    console.log("✔ greksudze.json ielādēts (PDF)");
  })
  .catch(err => console.error("❌ PDF JSON error", err));


// =========================
// FONT LOADER (ROBOTO)
// =========================
async function loadFontOnce() {
  if (fontPromise) return fontPromise;

  fontPromise = (async () => {
  const { jsPDF } = window.jspdf;

  const url =
    "https://raw.githubusercontent.com/googlefonts/noto-fonts/main/hinted/ttf/NotoSans/NotoSans-Regular.ttf";

  const res = await fetch(url);
  const buffer = await res.arrayBuffer();

  const bytes = new Uint8Array(buffer);

  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }

  const base64 = btoa(binary);

  window.pdfFontBase64 = base64;
  window.pdfFontName = "NotoSans";

  console.log("✔ font base64 gatavs");
})();

  return fontPromise;
}
// =========================
// MAIN PDF FUNCTION
// =========================
async function generatePDFData() {

  // =========================
  // WAIT FOR RESOURCES
  // =========================
await loadFontOnce();

  // drošs variants (ja eksistē)
  if (window.pdfDataPromise) {
await pdfDataPromise;  
}

  const pdfData = window.pdfData;
  const uiData = window.appData; // sirdsapzinas JSON
  const state = window.state;

  if (!pdfData?.content?.steps) {
    alert("PDF struktūra nav ielādēta");
    return;
  }

  if (!uiData?.content?.commandments) {
    alert("UI dati nav ielādēti");
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.addFileToVFS("NotoSans.ttf", window.pdfFontBase64);
doc.addFont("NotoSans.ttf", "NotoSans", "normal");
doc.setFont("NotoSans");

  // =========================
  // FONT (SVARĪGI - TIKAI VIENU REIZI)
  // =========================
  const font = window.pdfFontName || "helvetica";
  doc.setFont(font);
  doc.setFontSize(11);

  let y = 22;
  const left = 20;
  const indent = 28;

  // =========================
  // PAGE CONTROL
  // =========================
  function checkPage(space = 10) {
    if (y > 280 - space) {
      doc.addPage();
      y = 22;

      // obligāti turpini to pašu fontu jaunā lapā
      doc.setFont(font);
      doc.setFontSize(11);
    }
  }

  // =========================
  // HEADER
  // =========================
  doc.setFontSize(16);
  doc.text("Špikeris grēksūdzei", left, y);
  doc.text("Špikeris grēksūdzei", left + 0.2, y);
  y += 12;

  doc.setFontSize(11);

  // =========================
  // STEP RENDER HELPERS
  // =========================
  function renderStep(step) {
    if (!step) return;

    checkPage(15);

    doc.setFontSize(13);
    doc.text(step.title || "", left, y);
    doc.text(step.title || "", left + 0.1, y);
    y += 8;

    doc.setFontSize(11);

    (step.text || []).forEach(t => {
      checkPage(10);
      doc.text(t || "", left, y);
      y += 6;
    });

    y += 5;
  }

  const steps = pdfData.content.steps;

  // =========================
  // STEP 1–2
  // =========================
  renderStep(steps[0]);
  renderStep(steps[1]);

  // =========================
  // STEP 3 (conditional)
  // =========================
  const step3 = steps.find(s => s.type === "conditional");

  if (step3) {
    checkPage(15);

    doc.setFontSize(11);
    doc.text(step3.title || "", left, y);
    y += 8;

    const key = state.firstConfession
      ? "first_confession"
      : "not_first_confession";

    (step3.cases?.[key] || []).forEach(t => {
      checkPage(10);
      doc.text(t || "", left, y);
      y += 6;
    });

    y += 5;
  }

  // =========================
  // STEP 4 (USER ANSWERS)
  // =========================
  const step4 = steps.find(s => s.type === "dynamic_sins");

  if (step4) {
    checkPage(15);

    doc.setFontSize(13);
    doc.text(step4.title || "", left, y);
    doc.text(step4.title || "", left + 0.1, y);
    y += 8;

    doc.setFontSize(11);
    doc.text(step4.intro || "", left, y);
    y += 8;

    const commandments = uiData.content.commandments;

    commandments.forEach(cmd => {
      cmd.questions.forEach(q => {

        if (!state.answers[q.id]) return;

        checkPage(10);

        const qText = doc.splitTextToSize("• " + q.text, 165);
        doc.text(qText, left, y);
        y += qText.length * 6;

        const note = state.notes?.[q.id];
        if (note?.trim()) {
          const n = doc.splitTextToSize("Piezīme: " + note, 150);
          doc.text(n, indent, y);
          y += n.length * 5;
        }

        y += 3;
      });
    });

    y += 5;
  }

  // =========================
// CUSTOM SINS (USER ADDED)
// =========================
(window.state.customSins || []).forEach(sin => {

  if (!sin.text?.trim()) return;

  checkPage(10);

  const text = doc.splitTextToSize("• " + sin.text, 165);
  doc.text(text, left, y);
  y += text.length * 6;

  y += 3;
});

  // =========================
  // STEP 5–10
  // =========================
  steps.slice(4).forEach(renderStep);

  // =========================
  // SAVE
  // =========================
  doc.save("sirdsapzinas-izmeklesana.pdf");
}

// export
window.generatePDFData = generatePDFData;