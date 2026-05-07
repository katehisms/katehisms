console.log("Katehisma app ielādēts");

fetch("/header.html")
  .then(res => res.text())
  .then(html => {
    document.getElementById("header").innerHTML = html;

    // pēc ielādes atzīmē aktīvo lapu
    setActivePage();
  });

function setActivePage() {
  const path = window.location.pathname;

  let page = "";

  if (path.includes("index")) page = "home";
  if (path.includes("topics")) page = "topics";
  if (path.includes("game")) page = "games";
  if (path.includes("quiz")) page = "quiz";

  const links = document.querySelectorAll(".nav-grid a");

  links.forEach(link => {
    if (link.dataset.page === page) {
      link.classList.add("active");
    }
  });
}