const pageLoader = document.getElementById("pageLoader");

if (pageLoader) {
  const previousColor = sessionStorage.getItem("previousPageColor");

  if (previousColor) {
    pageLoader.style.setProperty("--previous-color", previousColor);
  }

  requestAnimationFrame(() => {
    pageLoader.classList.add("is-entered");
  });

  window.addEventListener("load", () => {
    setTimeout(() => {
      pageLoader.classList.add("is-hidden");
      sessionStorage.removeItem("previousPageColor");
    }, 1400);
  });
}

