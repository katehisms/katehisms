document.addEventListener("DOMContentLoaded", () => {

  const container = document.getElementById("accordion");

  if (!container) return;

  const file = container.dataset.file;
  const sectionId = container.dataset.section;

  fetch(`/data/${file}`)
    .then(res => res.json())
    .then(data => {

      const section = data.sections.find(
        sec => sec.id === sectionId
      );

      if (!section) {
        container.innerHTML = "<p>Nav atrasti dati.</p>";
        return;
      }

      // 👉 noteikums: kur rādīt numurus
      const showNumbers = sectionId === "dievs";

      section.items.forEach(item => {

        const question = item.question || item.q || "";
        const answer = item.answer || item.a || "";

        const wrapper = document.createElement("div");
        wrapper.className = "accordion-item";

        const button = document.createElement("button");
        button.className = "accordion-question";

        // 👉 NR tikai ja vajag
        button.textContent = showNumbers && item.nr
          ? `${item.nr}. ${question}`
          : question;

        const answerDiv = document.createElement("div");
        answerDiv.className = "accordion-answer";
        answerDiv.textContent = answer;

        button.addEventListener("click", () => {
          answerDiv.classList.toggle("open");
        });

        wrapper.appendChild(button);
        wrapper.appendChild(answerDiv);
        container.appendChild(wrapper);
      });

    })
    .catch(err => {
      console.error("Kļūda ielādējot datus:", err);
      container.innerHTML = "<p>Kļūda ielādējot saturu.</p>";
    });

});