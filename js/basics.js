document.addEventListener("DOMContentLoaded", () => {

  const content = document.getElementById("content");
  const titleEl = document.getElementById("title");
  const pageTitle = document.getElementById("page-title");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");

  // 👉 paņem section no URL
  const params = new URLSearchParams(window.location.search);
  const sectionId = params.get("section");

  // 👉 ja nav section (piemēram index lapā), NEKO nedari
  if (!sectionId) return;

  fetch("/data/basics.json")
    .then(res => res.json())
    .then(data => {

      const index = data.sections.findIndex(s => s.id === sectionId);
      const section = data.sections[index];

      if (!section) {
        content.innerHTML = "<p>Dati nav atrasti</p>";
        return;
      }

      // 👉 TITLE
      titleEl.textContent = section.title;
      pageTitle.textContent = section.title;

      // 👉 SATURS
      content.innerHTML = "";

      if (section.lines) {
        section.lines.forEach(line => {
          const p = document.createElement("p");
          p.textContent = line;
          content.appendChild(p);
        });
      }

      if (section.content) {
        const p = document.createElement("p");
        p.textContent = section.content;
        content.appendChild(p);
      }

      // 👉 NAVIGĀCIJA
      const prev = data.sections[index - 1];
      const next = data.sections[index + 1];

      if (prev) {
        prevBtn.href = `page.html?section=${prev.id}`;
        prevBtn.textContent = "← " + prev.title;
      } else {
        prevBtn.style.display = "none";
      }

      if (next) {
        nextBtn.href = `page.html?section=${next.id}`;
        nextBtn.textContent = next.title + " →";
      } else {
        nextBtn.style.display = "none";
      }

    })
    .catch(err => console.error(err));

});