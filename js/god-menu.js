document.addEventListener("DOMContentLoaded", () => {

  const container = document.getElementById("sections");

  const path = window.location.pathname;

  // 🔥 JSON izvēle
  let jsonFile = "/data/dievs.json";
  let base = "/topics/god/questions.html";

  if (path.includes("commandments")) {
    jsonFile = "/data/bausli.json";
    base = "/topics/commandments/questions.html";
  }

  if (path.includes("sacraments")) {
    jsonFile = "/data/sakramenti.json";
    base = "/topics/sacraments/questions.html";
  }

  fetch(jsonFile)
    .then(res => res.json())
    .then(data => {

      container.innerHTML = "";

      data.sections.forEach(section => {

        const sectionDiv = document.createElement("div");
        sectionDiv.className = "section-block";

        const titleBtn = document.createElement("button");
        titleBtn.className = "section-title";
        titleBtn.textContent = section.title;

        const groupsDiv = document.createElement("div");
        groupsDiv.className = "groups hidden";

        section.groups.forEach(group => {

          const link = document.createElement("a");
          link.className = "group-link";

          link.href = `${base}?section=${section.id}&group=${group.id}`;
          link.textContent = group.title;

          groupsDiv.appendChild(link);
        });

        titleBtn.addEventListener("click", () => {
          groupsDiv.classList.toggle("hidden");
        });

        sectionDiv.appendChild(titleBtn);
        sectionDiv.appendChild(groupsDiv);
        container.appendChild(sectionDiv);
      });

    });

});