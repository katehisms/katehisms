document.addEventListener("DOMContentLoaded", () => {

  const container = document.getElementById("accordion");
  const sectionTitle = document.getElementById("section-title");
  const groupTitle = document.getElementById("group-title");
  const nav = document.getElementById("lesson-nav");

  const params = new URLSearchParams(window.location.search);

  const sectionId = params.get("section");
  const groupId = params.get("group");

  const path = window.location.pathname;

  let jsonFile = "/data/dievs.json";

  if (path.includes("commandments")) {
    jsonFile = "/data/bausli.json";
  }

  if (path.includes("sacraments")) {
  jsonFile = "/data/sakramenti.json";
  }


  fetch(jsonFile)
    .then(res => res.json())
    .then(data => {

      console.log("Loaded:", jsonFile);

      const section = data.sections.find(s => s.id === sectionId);

      if (!section) {
        container.innerHTML = "<p>Sadaļa nav atrasta</p>";
        return;
      }

      const sectionIndex = data.sections.findIndex(s => s.id === sectionId);

      const groupIndex = section.groups.findIndex(g => g.id === groupId);

      if (groupIndex === -1) {
        container.innerHTML = "<p>Apakšsadaļa nav atrasta</p>";
        return;
      }

      const group = section.groups[groupIndex];

      // TITLES
      sectionTitle.textContent = section.title;
      groupTitle.textContent = group.title;

      // QUESTIONS
      container.innerHTML = "";

      group.items.forEach(item => {

        const wrapper = document.createElement("div");
        wrapper.className = "accordion-item";

        const button = document.createElement("button");
        button.className = "accordion-question";
        button.textContent = `${item.nr}. ${item.q}`;

        const answer = document.createElement("div");
        answer.className = "accordion-answer";
        // normalize (array vai string)
const answerLines = Array.isArray(item.a)
  ? item.a
  : [item.a];

// iztīra (ja gadījumā atkārtoti renderē)
answer.innerHTML = "";

// izveido <p> katrai rindai
answerLines.forEach(line => {
  const p = document.createElement("p");
  p.textContent = line;
  answer.appendChild(p);
});

        button.addEventListener("click", () => {
          answer.classList.toggle("open");
        });

        wrapper.appendChild(button);
        wrapper.appendChild(answer);

        container.appendChild(wrapper);
      });

      // =========================
      // NAVIGATION
      // =========================

      nav.innerHTML = "";

      const prevGroup = groupIndex > 0
        ? section.groups[groupIndex - 1]
        : null;

      const nextGroup = groupIndex < section.groups.length - 1
        ? section.groups[groupIndex + 1]
        : null;

      let prevSectionLastGroup = null;
      let nextSectionFirstGroup = null;

      // 🔥 prev section last group
      if (!prevGroup && sectionIndex > 0) {
        const prevSection = data.sections[sectionIndex - 1];
        const lastGroup = prevSection.groups[prevSection.groups.length - 1];

        prevSectionLastGroup = {
          sectionId: prevSection.id,
          group: lastGroup
        };
      }

      // 🔥 next section first group
      if (!nextGroup && sectionIndex < data.sections.length - 1) {
        const nextSection = data.sections[sectionIndex + 1];

        nextSectionFirstGroup = {
          sectionId: nextSection.id,
          group: nextSection.groups[0]
        };
      }

      // =========================
      // PREV BUTTON
      // =========================

      if (prevGroup) {
        const a = document.createElement("a");
        a.className = "nav-btn prev";
        a.href = `questions.html?section=${section.id}&group=${prevGroup.id}`;
        a.textContent = `← ${prevGroup.title}`;
        nav.appendChild(a);
      } 
      else if (prevSectionLastGroup) {
        const a = document.createElement("a");
        a.className = "nav-btn prev";
        a.href = `questions.html?section=${prevSectionLastGroup.sectionId}&group=${prevSectionLastGroup.group.id}`;
        a.textContent = `← ${prevSectionLastGroup.group.title}`;
        nav.appendChild(a);
      }

      // =========================
      // NEXT BUTTON
      // =========================

      if (nextGroup) {
        const a = document.createElement("a");
        a.className = "nav-btn next";
        a.href = `questions.html?section=${section.id}&group=${nextGroup.id}`;
        a.textContent = `${nextGroup.title} →`;
        nav.appendChild(a);
      } 
      else if (nextSectionFirstGroup) {
        const a = document.createElement("a");
        a.className = "nav-btn next";
        a.href = `questions.html?section=${nextSectionFirstGroup.sectionId}&group=${nextSectionFirstGroup.group.id}`;
        a.textContent = `${nextSectionFirstGroup.group.title} →`;
        nav.appendChild(a);
      }

    })
    .catch(err => {
      console.error(err);
      container.innerHTML = "<p>Kļūda ielādējot datus</p>";
    });

});