document.addEventListener("DOMContentLoaded", () => {

  const container = document.getElementById("accordion");
  if (!container) return;

  const file = container.dataset.file;
  const sectionId = container.dataset.section;

  fetch(`/data/${file}`)
    .then(res => res.json())
    .then(data => {

      const page = data.sections.find(sec => sec.id === sectionId);

      if (!page) {
        container.innerHTML = "<p>Nav datu</p>";
        return;
      }

      page.sections.forEach(block => {

        const wrapper = document.createElement("div");
        wrapper.className = "main-block";

        const button = document.createElement("button");
        button.className = "main-title";
        button.textContent = block.title;

        const content = document.createElement("div");
        content.className = "main-content";
        content.style.display = "none";

        // =========================
        // LINES
        // =========================
        if (block.lines) {
          const wrap = document.createElement("div");

          block.lines.forEach(line => {
            const p = document.createElement("p");
            p.textContent = line;
            wrap.appendChild(p);
          });

          content.appendChild(wrap);
        }

        // =========================
        // CONTENT (viens teksts)
        // =========================
        if (block.content) {
          const p = document.createElement("p");
          p.textContent = block.content;
          content.appendChild(p);
        }

        // =========================
        // PARAGRAPHS
        // =========================
        if (block.paragraphs) {
          block.paragraphs.forEach(par => {
            const h = document.createElement("strong");
            h.textContent = par.title;

            const p = document.createElement("p");
            p.textContent = par.text;

            content.appendChild(h);
            content.appendChild(p);
          });
        }

        // =========================
        // QA
        // =========================
        if (block.qa && block.qa.length > 0) {

          const qaWrap = document.createElement("div");
          qaWrap.className = "qa-wrap";

          block.qa.forEach(item => {

            const itemWrap = document.createElement("div");
            itemWrap.className = "qa-item";

            const q = document.createElement("button");
            q.className = "qa-question";
            q.textContent = item.question;

            const a = document.createElement("div");
            a.className = "qa-answer";
            a.textContent = item.answer;

            q.addEventListener("click", () => {
              a.classList.toggle("open");
            });

            itemWrap.appendChild(q);
            itemWrap.appendChild(a);
            qaWrap.appendChild(itemWrap);
          });

          content.appendChild(qaWrap);
        }

        // =========================
        // OPEN/CLOSE
        // =========================
        button.addEventListener("click", () => {
          content.style.display =
            content.style.display === "none" ? "block" : "none";
        });

        wrapper.appendChild(button);
        wrapper.appendChild(content);
        container.appendChild(wrapper);
      });

    });

});