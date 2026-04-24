const text = "Hello, My name is";
const el = document.getElementById("typing");

let i = 0;
let isDeleting = false;

function typeEffect() {
  if (!isDeleting) {
    el.textContent = text.slice(0, i++);
    if (i > text.length) {
      isDeleting = true;
      setTimeout(typeEffect, 1000);
      return;
    }
  } else {
    el.textContent = text.slice(0, i--);
    if (i === 0) { 
      isDeleting = false;
      setTimeout(typeEffect, 300);
      return;
    }
  }

  setTimeout(typeEffect, isDeleting ? 70 : 120);
}

typeEffect();