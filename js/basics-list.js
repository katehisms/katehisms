document.addEventListener("DOMContentLoaded", () => {

  const list = document.getElementById("basicsList");
  if (!list) return;

  fetch("/data/basics.json")
    .then(res => {
      if (!res.ok) {
        throw new Error("Neizdevās ielādēt JSON");
      }
      return res.json();
    })
    .then(data => {

      list.innerHTML = ""; // drošībai

      data.sections.forEach(section => {
        const a = document.createElement("a");

        a.href = `page.html?section=${section.id}`;
        a.textContent = section.title;

        list.appendChild(a);
      });

    })
    .catch(err => {
      console.error("Kļūda:", err);
      list.innerHTML = "<p>Neizdevās ielādēt saturu</p>";
    });

});