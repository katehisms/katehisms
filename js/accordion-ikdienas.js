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

      // 👉 tikai galvenie bloki (Tēvs mūsu utt.)
      page.sections.forEach(block => {

        // =========================
        // 🔵 GALVENAIS BLOKS
        // =========================
        const wrapper = document.createElement("div");
        wrapper.className = "main-block";

        const button = document.createElement("button");
        button.className = "main-title";
        button.textContent = block.title;

        const content = document.createElement("div");
        content.className = "main-content";

        // =========================
        // 🟡 TEKSTS (LINES / CONTENT)
        // =========================
        if (block.content || block.lines) {

          const textWrap = document.createElement("div");
          textWrap.className = "prayer-text";

          if (block.lines) {
            block.lines.forEach(line => {
              const p = document.createElement("p");
              p.textContent = line;
              textWrap.appendChild(p);
            });
          }

          if (block.content) {
            const p = document.createElement("p");
            p.textContent = block.content;
            textWrap.appendChild(p);
          }

          content.appendChild(textWrap);
        }

        // =========================
        // 🟢 QA AKORDEONS (IEKŠĀ)
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
        // 🔵 OPEN/CLOSE GALVENAIS BLOKS
        // =========================
        content.style.display = "none";

        button.addEventListener("click", () => {
          content.style.display =
            content.style.display === "none" ? "block" : "none";
        });

        wrapper.appendChild(button);
        wrapper.appendChild(content);

        container.appendChild(wrapper);
      });

    })
    .catch(err => {
      console.error("Kļūda:", err);
      container.innerHTML = "<p>Kļūda ielādējot saturu</p>";
    });

});